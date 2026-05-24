# 스마트 블로그 — Specification

> 작성일: 2026-05-19
> 상태: 초안 (v0.1)

---

## 1. 정의

GitHub 저장소의 커밋을 LLM으로 분석해 기술 블로그 초안을 자동 생성하고, 사용자가 편집·발행할 수 있는 서비스.

## 2. 대상 사용자 / 사용 맥락

- 1차 사용자: 본인 (싱글 유저 가정)
- 가정: 사용자는 본인 GitHub 계정의 저장소를 분석 대상으로 함
- 가정: 본인 머신에서 로컬로 구동 (배포는 선택사항)

## 3. 기능 범위 (In-Scope)

### 3.1 인증 / 설정

- GitHub Personal Access Token (PAT)을 서버 `.env`로 관리
- OpenAI API Key를 서버 `.env`로 관리
- 클라이언트는 토큰을 직접 다루지 않음

### 3.2 저장소 / 브랜치 / 커밋 선택

- 본인 저장소 리스트 조회 (`GET /user/repos`)
- 선택 저장소의 브랜치 리스트 조회 (`GET /repos/{owner}/{repo}/branches`)
- 선택 브랜치의 최근 커밋 리스트 조회 (`GET /repos/{owner}/{repo}/commits`, 기본 30개)
- 커밋 한 개 선택 → 상세 정보 조회 (`GET /repos/{owner}/{repo}/commits/{sha}`)

### 3.3 AI 요약 / 블로그 초안 생성

- 입력
  - 커밋 메시지
  - 변경 통계 (files changed, additions, deletions)
  - diff (전체 또는 size-capped)
- 출력 (구조화 JSON)
  - `title`: 짧은 제목 (1줄)
  - `summary`: 1–2문장, 카드 미리보기용
  - `body`: 본문 (Markdown, 200–500자, 기능 설명형 톤)
- 호출 방식: Express 서버에서 OpenAI SDK 호출. 클라이언트는 서버를 경유.
- 응답 형식: JSON mode / structured output 사용
- 멀티 에이전트 패턴 적용 예정 (정확한 chain은 12주차 강의 후 확정 — Open Questions 참조)

### 3.4 편집기

- 생성된 `title / summary / body` 사용자 편집 가능
- 본문은 Markdown 편집 + 프리뷰
- 저장 시 `status = "draft"`로 새 Post 생성

### 3.5 저장된 포스트 목록

- 저장된 Post들을 카드 형태로 표시
- 카드 표시 요소: 브랜치 태그, 제목, summary, 커밋 날짜, (선택) 썸네일 placeholder
- 카드 클릭 → 수정 화면으로 진입
- "발행" 액션 → `status = "published"`로 토글

### 3.6 화면 구조

- `/my-blog` — 새 포스트 작성 (저장소·브랜치·커밋 선택 + AI 요약 + 편집)
- `/saved` — 저장된 포스트 카드 목록
- `/post/:id/edit` — 저장된 포스트 재편집
- `/settings` — 환경 정보 / 토큰 상태 확인 (실제 토큰은 .env)

## 4. 기능 범위 외 (Out-of-Scope)

- GitHub OAuth (PAT으로 충분)
- 사용자 계정 시스템 (싱글 유저 가정)
- 외부 블로그 플랫폼(Medium, Velog 등) 실제 발행
- 이미지 자동 생성
- 실시간 협업
- 배포 (선택사항, 시간 여유 시 Vercel + Render 분리)

## 5. 데이터 모델

### Post

```ts
{
  id: string              // uuid v4
  title: string
  summary: string
  body: string            // Markdown
  
  // 출처 (커밋 메타데이터)
  repoName: string        // "owner/repo"
  branch: string          // "main", "feature/api-sync"
  commitSha: string       // 짧은 hash 또는 전체
  commitAuthor: string
  commitDate: string      // ISO 8601
  
  // 상태
  status: "draft" | "published"
  createdAt: string       // ISO 8601
  updatedAt: string       // ISO 8601
}
```

### 저장 매체

- lowdb (단일 JSON 파일)
- 파일 위치: `server/data/db.json`
- 스키마: `{ posts: Post[] }`

## 6. 외부 의존성

### GitHub API
- 인증: Personal Access Token (PAT)
- 클라이언트: Octokit (`@octokit/rest`)
- 사용 엔드포인트:
  - `GET /user/repos` — 저장소 리스트
  - `GET /repos/{owner}/{repo}/branches` — 브랜치 리스트
  - `GET /repos/{owner}/{repo}/commits?sha={branch}&per_page=30` — 커밋 리스트
  - `GET /repos/{owner}/{repo}/commits/{sha}` — 커밋 상세 (stats + files + patch)
- Rate limit: 인증된 사용자 시 5000 req/hour

### OpenAI API
- 인증: API Key
- 클라이언트: `openai` 공식 SDK
- 엔드포인트: `POST /v1/chat/completions`
- 응답 형식: JSON mode / `response_format: { type: "json_object" }`

## 7. 시스템 구조

```
[Browser]
    ↕ UI events / 렌더링
[React Client]   (Vite, port 5173)
    ↕ HTTP (fetch / axios)
[Express Server] (port 3000)
    ↕                ↕
[GitHub API]    [OpenAI API]
```

- 클라이언트: React + TypeScript + Vite
- 서버: Express + TypeScript
- 통신: 클라이언트 → Express → 외부 API (모든 외부 호출은 서버 경유)
- 토큰: 서버 `.env`에만 존재

## 8. 디자인 컨셉

### 분위기 — "작가의 원고 노트" (시각만 적용)
내부 식별자(변수명·파일명·LLM enum값·git 컨벤션 등)는 영어 dev 관례 유지. 사용자에게 보이는 UI 텍스트(워드마크·페이지 제목·버튼·폼 라벨·status 표시·토스트)는 한국어로 작성 (Phase 3a부터). LLM 본문 출력도 한국어.

### Visual System (요지, 토큰은 `docs/design.md`에 정리)
- 색상: cream paper + ink 팔레트 (warm off-white 배경, sepia/midnight blue 잉크, 빨간 잉크 강조)
- 폰트: serif 본문 (Lora / Noto Serif KR), typewriter monospace (iA Writer Mono 결)
- 질감: subtle paper grain, warm cast shadow
- 카드: 인덱스 카드 결, hover 시 미세 raise
- border-radius: 0–4px

## 9. 주요 UX Flow

### Flow A — 새 포스트 작성
1. 사용자가 `/my-blog` 진입
2. 저장소 선택 (드롭다운, 본인 repo 리스트)
3. 브랜치 선택 (드롭다운, 기본 main/default branch)
4. 최근 커밋 리스트 표시 → 1개 선택
5. "요약 생성" 클릭 → 서버에 요청 → LLM 호출 → 결과 표시 (수 초 로딩)
6. 사용자가 title/summary/body 편집
7. "저장" 클릭 → Post 생성 (`status: draft`) → `/saved`로 이동

### Flow B — 저장된 포스트 재편집
1. `/saved`에서 카드 클릭
2. `/post/:id/edit` 진입, 편집기에 기존 내용 로드
3. 수정 후 저장 → `updatedAt` 갱신

### Flow C — 발행
1. `/saved`에서 카드의 "발행" 버튼 클릭
2. `status: draft → published` 토글
3. 카드에 발행 상태 표시 ("발행됨" 도장 — 내부 enum은 `published` 유지)

## 10. 비기능 요구사항

### 보안
- GitHub PAT, OpenAI API Key는 서버 `.env`에만 존재
- 클라이언트 번들에 절대 포함 금지
- `.gitignore`에 `.env` 추가
- 서버 응답에 토큰을 echo하지 않음

### 에러 처리
- GitHub API: rate limit (403), 401 (잘못된 토큰), 404 (repo 없음), 네트워크 실패
- LLM API: 5xx, 토큰 한도 초과, JSON 파싱 실패, timeout
- 사용자에게 의미 있는 에러 메시지 전달 ("토큰을 확인해주세요", "요약 생성에 실패했습니다" 등)

### 성능
- LLM 호출은 수 초 소요 → 명확한 로딩 인디케이터
- GitHub API 응답은 클라이언트에서 짧게 캐싱 (선택)
- 스트리밍 응답은 Stretch

### 토큰 / 비용 운영
- diff 크기에 상한 (예: 8KB 또는 라인 수 기준 cap)
- diff가 상한 초과 시 처리 정책 (truncate vs LLM 사전 요약 vs 거부) — Open Questions 참조

## 11. 완료 조건

별도 문서 `docs/checklist.md`에서 관리.

## 12. Open Questions / 결정 보류

- [ ] **멀티 에이전트 chain 구조** — 12주차 강의(5.18–22) 듣고 확정. 후보: (a) 커밋 분류기 → 분류별 글 작성자, (b) 요약자 → 글 작성자 → 톤 검수자, (c) diff 사전 요약자 → 통합 작성자.
- [ ] **diff 크기 상한 정책** — truncate / 사전 요약 / 거부 중 어느 결.
- [ ] **카드 썸네일** — placeholder vs LLM이 키워드 추출 후 Unsplash API. MVP는 placeholder 가정.
- [ ] **Settings 화면 실내용** — 현재 토큰은 .env라 거의 빈 화면이 됨. 표시할 정보(현재 사용 중인 모델, 토큰 상태 등) 정의 필요.
- [ ] **"발행"의 정확한 의미** — 현재는 status toggle만. 외부로 export(파일 다운로드/markdown 복사 등) 여부.
- [ ] **Markdown 편집기 라이브러리** — `@uiw/react-md-editor`, Tiptap, Lexical, 또는 textarea + react-markdown 프리뷰 분리. 가벼운 결로 갈지 풍부한 결로 갈지.
- [ ] **최근 커밋 N개** — 기본 30개로 잡았는데 페이지네이션 필요 여부.
- [ ] **TypeScript strict 수준** — `strict: true` 가정 중. 결정 확정 필요.

## 13. 변경 이력

- v0.1 (2026-05-19): 초안 작성
