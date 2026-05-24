# Data Flow — 스마트 블로그

> 작성일: 2026-05-19
> 상태: 초안 (v0.1)
>
> 본 문서는 시스템 내·외 데이터가 어디서 출발해 어떤 변환을 거쳐 어디에 도달하는지를 정리한다. 시각화는 별도 두 다이어그램(시스템 토폴로지 / 데이터 변환 파이프라인) 참조.

---

## 1. 시스템 토폴로지

```
[Browser + React Client] ── HTTP/JSON ──> [Express Server]
                                              │
                            ┌─────────────────┼─────────────────┐
                       Octokit             lowdb            OpenAI SDK
                            │                 │                 │
                            ▼                 ▼                 ▼
                       GitHub API       posts JSON file     LLM API
```

- 클라이언트는 외부 API(GitHub·OpenAI)에 직접 접근하지 않는다. 모든 외부 호출은 서버 경유.
- 토큰은 `server/.env`에만 존재한다.
- 데이터 영속화는 lowdb 단일 JSON 파일(`server/data/db.json`).

---

## 2. 주요 데이터 흐름

### Flow A — 새 포스트 작성 (메인 시나리오)

1. 사용자가 `/my-blog` 진입.
2. 클라이언트가 `useRepos()` 훅으로 `GET /api/repos` 요청.
3. 서버가 Octokit으로 `GET /user/repos` 호출 → 저장소 리스트 응답.
4. 사용자가 저장소 선택 → `useBranches(repo)` → `GET /api/branches?repo=X` → `GET /repos/{owner}/{repo}/branches`.
5. 사용자가 브랜치 선택 → `useCommits(repo, branch)` → `GET /api/commits?repo=X&branch=Y` → `GET /repos/{owner}/{repo}/commits?sha=Y`.
6. 사용자가 커밋 선택 → `useCommitDetail(repo, sha)` → `GET /api/commits/:sha?repo=X` → `GET /repos/{owner}/{repo}/commits/{sha}` (메시지 + stats + files + patch 포함).
7. 사용자가 "Generate" → `useGenerateSummary().generate(commit)` → `POST /api/summary` with normalized `CommitNormalized` payload.
8. 서버가 커밋 데이터를 LLM 프롬프트로 구조화 (다음 섹션 3 참조).
9. 서버가 OpenAI SDK로 `chat.completions.create()` 호출, `response_format: { type: "json_object" }` 강제.
10. LLM 응답을 받아 스키마 검증(`title`/`summary`/`body` 존재 + 타입). 실패 시 에러 반환.
11. 검증 통과한 `{ title, summary, body }`를 클라이언트에 반환.
12. 사용자가 편집기에서 수정.
13. "Save and publish" → `useSavePost().save({...})` → `POST /api/posts` with 편집된 `{ title, summary, body }` + 출처 메타데이터(`repoName`, `branch`, `commitSha`, `commitAuthor`, `commitDate`).
14. 서버가 `id` + `status: "draft"` + `createdAt` + `updatedAt`를 추가해 lowdb에 append.
15. 저장된 Post 반환, 클라이언트가 `/saved`로 navigate.

### Flow B — 저장된 포스트 목록 조회

1. 사용자가 `/saved` 진입.
2. `usePosts()` → `GET /api/posts` → lowdb 전체 읽기 → `Post[]` 반환.
3. 클라이언트가 카드 그리드로 렌더.

### Flow C — 저장된 포스트 재편집

1. 사용자가 카드의 "Edit" 클릭 → `/post/:id/edit`로 이동.
2. `usePost(id)` → `GET /api/posts/:id` → 단건 반환.
3. 사용자가 편집기에서 수정.
4. 저장 → `useUpdatePost().update(id, patch)` → `PATCH /api/posts/:id` → lowdb 업데이트 (`updatedAt` 갱신).

### Flow D — 발행 상태 토글

1. 사용자가 카드의 "Publish" 클릭.
2. `useUpdatePost().update(id, { status: "published" })` → `PATCH /api/posts/:id` → status만 변경.
3. 카드에 published 표시 (status stamp cursive).

### Flow E — 삭제 (선택, Stretch)

1. `DELETE /api/posts/:id` → lowdb에서 제거.

---

## 3. 데이터 변환 파이프라인

LLM 호출을 중심으로 한 데이터의 모양 변천. 4단계.

### 3.1 GitHub raw commit

GitHub API가 반환하는 원본 객체에서 필요한 필드만 추림.

```ts
type CommitRaw = {
  sha: string;
  commit: {
    message: string;
    author: { name: string; email: string; date: string };
  };
  stats: { additions: number; deletions: number; total: number };
  files: Array<{
    filename: string;
    status: "added" | "modified" | "removed" | "renamed";
    additions: number;
    deletions: number;
    patch?: string;  // diff 텍스트, 큰 파일은 누락될 수 있음
  }>;
};
```

서버에서 사용 시 필요한 필드만 정규화:

```ts
type CommitNormalized = {
  sha: string;
  shortSha: string;        // sha.slice(0, 7)
  message: string;
  author: string;
  date: string;            // ISO 8601
  stats: { additions: number; deletions: number; total: number };
  files: Array<{ filename: string; patch: string }>;
};
```

### 3.2 LLM 체인

`CommitNormalized`를 바로 글로 쓰지 않고 2단계 체인으로 처리한다.

#### Stage 1 — Extract

커밋 메시지, stats, capped diff를 분석해 기술적 의도를 구조화한다.

```ts
type CommitAnalysis = {
  intent: string;
  key_changes: string[];
  affected_areas: string[];
};
```

호출 규칙:
- `response_format: { type: "json_object" }` 강제.
- system prompt는 분석 전용으로 짧고 엄격하게 유지.
- 응답은 JSON 파싱 후 `intent` / `key_changes` / `affected_areas` 타입을 수동 검증.
- Stage 1 토큰 사용량은 `extract` stage 이름으로 서버 로그에 기록.

#### Stage 2 — Write

Stage 1 결과와 원본 커밋 메시지, author, date, stats를 입력으로 받아 블로그 초안을 작성한다.

```ts
type LLMDraft = {
  title: string;
  summary: string;
  body: string;
};
```

호출 규칙:
- `response_format: { type: "json_object" }` 강제.
- 한국어 출력.
- `body`는 Markdown 가능, 200-500자 목표.
- 응답은 JSON 파싱 후 `title` / `summary` / `body`가 모두 string인지 수동 검증.
- Stage 2 토큰 사용량은 `write` stage 이름으로 서버 로그에 기록.

Fallback:
- Stage 1 응답이 JSON 파싱 또는 스키마 검증에 실패하면 기존 single-shot 프롬프트로 즉시 fallback한다.
- fallback 호출도 `response_format: { type: "json_object" }`를 유지하고 `single-shot` stage 이름으로 토큰 사용량을 기록한다.

`formatCommitForPrompt` 내부 처리:
- diff 크기 cap 정책 적용 (예: 8KB 또는 200줄 초과 시 truncate).
- truncate 시 명시적 마커 삽입: `... (diff truncated at 8KB) ...`.

### 3.3 LLM 출력 JSON

```ts
type LLMDraft = {
  title: string;
  summary: string;
  body: string;
};
```

검증 단계:
- JSON 파싱 성공 여부.
- 세 필드 모두 존재하고 string인지.
- body 길이가 합리적 범위(50-2000자) 안인지 (cap 강제 X, 경고만).
- 통과 못 하면 에러로 처리. 임의 보정 금지.

### 3.4 Post 엔티티

LLM 출력 + 메타데이터 결합.

```ts
type Post = LLMDraft & {
  id: string;                          // uuid v4
  repoName: string;                    // "owner/repo"
  branch: string;
  commitSha: string;
  commitAuthor: string;
  commitDate: string;                  // ISO 8601
  status: "draft" | "published";       // 초기 "draft"
  createdAt: string;                   // ISO 8601
  updatedAt: string;                   // ISO 8601
};
```

lowdb 스키마:

```ts
type DBSchema = {
  posts: Post[];
};
```

---

## 4. API endpoint 요약

| Method | Path | 설명 | 외부 호출 |
|---|---|---|---|
| GET | `/api/repos` | 본인 저장소 리스트 | GitHub |
| GET | `/api/branches?repo=:repo` | 브랜치 리스트 | GitHub |
| GET | `/api/commits?repo=:repo&branch=:branch` | 커밋 리스트 (기본 30) | GitHub |
| GET | `/api/commits/:sha?repo=:repo` | 커밋 상세 (diff 포함) | GitHub |
| POST | `/api/summary` | LLM 요약 생성 | OpenAI |
| GET | `/api/posts` | 저장된 포스트 리스트 | — |
| GET | `/api/posts/:id` | 단건 조회 | — |
| POST | `/api/posts` | 신규 저장 | — |
| PATCH | `/api/posts/:id` | 편집 또는 status 변경 | — |
| DELETE | `/api/posts/:id` | 삭제 (Stretch) | — |

응답 형식 통일: 성공 시 `{ data: T }`, 실패 시 `{ error: { code: string, message: string } }`.

---

## 5. 에러 흐름

외부 API 호출 실패는 서버에서 catch하고 의미 있는 에러로 변환해 클라이언트에 전달.

### GitHub API
- `401` (잘못된 PAT) → 서버 응답 `500 { error: { code: "GITHUB_AUTH", message: "GitHub 토큰을 확인해주세요" } }`.
- `403` (rate limit) → `429 { error: { code: "GITHUB_RATE_LIMIT", message: "GitHub API 요청 한도 초과. 잠시 후 다시 시도해주세요" } }`. `Retry-After` 헤더 forward.
- `404` (없는 repo / branch / sha) → `404 { error: { code: "NOT_FOUND", message: "..." } }`.
- 네트워크 실패 → `503 { error: { code: "GITHUB_UNAVAILABLE", ... } }`.

### LLM API
- `5xx` → `502 { error: { code: "LLM_UPSTREAM", message: "요약 생성에 실패했습니다" } }`.
- 토큰 한도 초과 → `413 { error: { code: "PROMPT_TOO_LARGE", message: "커밋이 너무 큽니다. diff 크기를 줄여보세요" } }`.
- JSON 파싱 실패 → `500 { error: { code: "LLM_INVALID_JSON", message: "응답 형식 오류" } }`.
- 스키마 검증 실패 → `500 { error: { code: "LLM_SCHEMA_MISMATCH", message: "응답 스키마 불일치" } }`.
- timeout (예: 30초 초과) → `504`.

### 클라이언트 측 처리
- 모든 에러는 사용자에게 토스트 또는 에러 패널로 표시.
- 토스트 메시지는 cursive 폰트 ("저장 실패", "토큰을 확인해주세요" 등).
- 인증 오류는 Settings 페이지로 안내.

---

## 6. 데이터 영속성

- **로컬 파일** `server/data/db.json` (lowdb).
- 서버 재시작에 영향 없음.
- 동시 쓰기 충돌은 lowdb의 직렬화로 처리 (싱글 사용자 가정).
- 백업·마이그레이션은 out-of-scope.
- 파일 시스템 권한: 서버 프로세스 user가 쓰기 권한 보유 필요.

---

## 7. 환경 변수

```bash
# server/.env (.gitignore)
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxx
LLM_MODEL=gpt-4o-mini
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DIFF_SIZE_CAP_BYTES=8192
LLM_REQUEST_TIMEOUT_MS=30000
```

```bash
# client/.env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 8. 변경 이력

- v0.1 (2026-05-19): 초안 작성
