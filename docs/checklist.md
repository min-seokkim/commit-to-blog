# Checklist — 스마트 블로그

> 작성일: 2026-05-19
> 상태: 초안 (v0.1)
>
> 원칙
> - 각 체크박스는 **하나의 의미 있는 단위**. 끝나면 commit 한다.
> - 너무 큰 항목이 보이면 막상 시작할 때 더 쪼갠다.
> - main 브랜치는 항상 동작 가능한 상태 유지. 기능 단위로 feature branch.
> - 모르는 게 있으면 spec.md, CLAUDE.md, design.md를 먼저 읽는다.

---

## 1주차 — 설계 마무리 (2026-05-19 ~ 25)

### 1.1 설계 산출물

- [x] `docs/spec.md` 초안
- [x] `CLAUDE.md` 초안
- [x] `docs/design.md` 초안
- [ ] `docs/data-flow.md` — 데이터 흐름 다이어그램
- [ ] 12주차 강의(5.18–22) 듣고 멀티 에이전트 chain 결정 → `spec.md`의 Open Questions 해소

### 1.2 프로젝트 셋업

- [ ] git 저장소 초기화, `.gitignore` 작성 (`.env`, `node_modules`, `db.json` 포함)
- [ ] 모노레포 구조 잡기 (`/client`, `/server`, `/docs`)
- [ ] `client/`: React + Vite + TypeScript 초기화, `strict: true`
- [ ] `server/`: Express + TypeScript 초기화, `tsx` 또는 `ts-node-dev` 셋업
- [ ] `.env.example` 작성 (GitHub PAT, OpenAI key, 포트 명세)
- [ ] README 초안 (실행 방법, 환경 변수 설정 안내)

---

## 2주차 — 구현 (2026-05-26 ~ 06-01)

### 2.1 서버 기반

- [ ] CORS·json 미들웨어 셋업
- [ ] 환경 변수 로딩 모듈 (`config.ts`) — 토큰을 한 곳에서 관리
- [ ] Octokit 클라이언트 wrapper (`services/github.ts`)
- [ ] OpenAI 클라이언트 wrapper (`services/openai.ts`)
- [ ] lowdb 초기화 + `Post` 타입 정의 (`data/db.ts`)
- [ ] 글로벌 에러 처리 미들웨어 (rate limit·인증·LLM 오류를 분리해 메시지화)

### 2.2 서버 라우트 — GitHub 연동

- [ ] `GET /api/repos` — 본인 저장소 리스트
- [ ] `GET /api/branches?repo=:repo` — 브랜치 리스트
- [ ] `GET /api/commits?repo=:repo&branch=:branch` — 커밋 리스트 (기본 30개)
- [ ] `GET /api/commits/:sha?repo=:repo` — 커밋 상세 (메시지 + stats + diff)

엣지케이스: 401(잘못된 토큰), 404(없는 repo), 403(rate limit), 빈 결과.

### 2.3 서버 라우트 — LLM 요약

- [ ] `POST /api/summary` — 커밋 정보 받아 `{ title, summary, body }` 반환
- [ ] 프롬프트 구조화 (system + user 메시지 분리)
- [ ] `response_format: { type: "json_object" }` 강제
- [ ] 응답 스키마 검증 (`title`/`summary`/`body` 존재 + 타입)
- [ ] diff 크기 cap 정책 적용 (8KB 또는 라인 수 기준)
- [ ] 토큰 사용량 서버 로그 기록
- [ ] (12주차 강의 결과 반영) 멀티 에이전트 chain 적용

엣지케이스: LLM 5xx, 토큰 한도 초과, JSON 파싱 실패, 응답 스키마 위반.

### 2.4 서버 라우트 — Posts CRUD

- [ ] `GET /api/posts` — 저장된 포스트 리스트
- [ ] `GET /api/posts/:id` — 단건 조회
- [ ] `POST /api/posts` — 신규 저장 (status: "draft")
- [ ] `PATCH /api/posts/:id` — 편집 또는 status 변경
- [x] `DELETE /api/posts/:id` — 삭제 (Phase 3a부터 main scope)

엣지케이스: 없는 id 404, 잘못된 payload 400.

### 2.5 클라이언트 기반

- [ ] Vite config, TypeScript paths, 환경 변수 (`VITE_API_BASE_URL`)
- [ ] 디자인 토큰 셋업 — `styles/primitive.css` + `styles/semantic.css` 작성, `main.tsx`에 import
- [ ] Google Fonts 로드 (Lora, Noto Serif KR, Courier Prime, Caveat, 나눔손글씨 펜체)
- [ ] React Router v7 셋업 — `Layout` + 4개 라우트 (`/saved`, `/my-blog`, `/post/:id/edit`, `/settings`)
- [ ] 루트 redirect (`/` → `/saved`)

### 2.6 공통 컴포넌트

- [ ] `<Header>` — 워드마크 + 톱니바퀴 ornament + nav (NavLink)
- [ ] `<PageDivider>` — double border
- [ ] `<Fleuron>` — `✦ ❦ ✦` 푸터/섹션 ornament
- [ ] `<Footer>` — small-caps 푸터
- [ ] `<WaxSealButton>` — 발행, 저장, 새 글 쓰기 공용
- [ ] `<BrassPin>` — 압정 SVG/CSS 컴포넌트
- [ ] `<PinnedSurface>` — 회전 + 압정 + 그림자 wrapper

### 2.7 데이터 hook

- [ ] `useFetch<T>` — 공통 페치 훅 (`{ data, loading, error }`)
- [ ] `useRepos()`
- [ ] `useBranches(repo)`
- [ ] `useCommits(repo, branch)`
- [ ] `useCommitDetail(repo, sha)`
- [ ] `useGenerateSummary()` — mutation 결, `{ generate, summary, loading, error }`
- [ ] `usePosts()` / `usePost(id)` / `useSavePost()` / `useUpdatePost()`

### 2.8 My Blog 페이지 (`/my-blog`)

- [ ] 저장소 select 드롭다운 (전체 repo 목록 + 스크롤, fullName 표시)
- [ ] 브랜치 select (선택된 저장소 기준)
- [ ] 최근 커밋 리스트 — `PinnedMemo` 컴포넌트로 표시
- [ ] 커밋 클릭 시 우측 상세 패널 갱신
- [ ] "생성하기" 버튼 → AI summary 호출
- [ ] AI summary 결과 표시 — ruled paper 결의 textarea
- [ ] `{ title, summary, body }` 각 필드 사용자 편집 가능
- [ ] body는 Markdown 입력 + 프리뷰 (라이브러리 선택은 spec Open Question 해소 후)
- [ ] "취소" / "저장" 액션
- [ ] 저장 성공 시 `/saved`로 navigate

엣지케이스: 저장소 없음, 커밋 0개, summary 생성 실패, 저장 실패.

### 2.9 Saved Posts 페이지 (`/saved`)

- [ ] 카드 그리드 (2열, gap 충분히)
- [ ] `<PostCard>` 컴포넌트 — Pinned card 패턴
  - branch tag (semantic 색)
  - 제목 (italic serif)
  - 썸네일 placeholder
  - summary 미리보기 (3-4줄 clamp)
  - 날짜 (mono small-caps)
  - 압정 위치 카드마다 변주
  - rotate angle 카드마다 변주 (seed 고정)
- [ ] "편집" → `/post/:id/edit`로 이동
- [ ] "삭제" → window.confirm 후 DELETE 호출 + 토스트 "삭제됨" + 목록 즉시 갱신
- [ ] "발행" 토글 → status 변경 + 시각 표시 (status stamp cursive, "발행됨")
- [ ] 빈 상태 메시지 — cursive 폰트로 "아직 저장된 포스트가 없습니다…"
- [ ] "New blog" 버튼 → `/my-blog`로 이동

### 2.10 포스트 재편집 페이지 (`/post/:id/edit`)

- [ ] `usePost(id)`로 로드
- [ ] 편집기 재사용 (My Blog 페이지의 컴포넌트 분리)
- [ ] 저장 → PATCH
- [ ] 삭제 액션

### 2.11 Settings 페이지 (`/settings`) — 선택

- [ ] 현재 사용 중인 model 표시
- [ ] GitHub PAT 존재 여부 (값은 노출 X, "configured" / "missing"만)
- [ ] OpenAI key 존재 여부
- [ ] 환경 정보 (서버 포트 등)

### 2.12 상태 UI

- [ ] 전역 로딩 인디케이터 (LLM 호출 중)
- [ ] 토스트 알림 ("저장했습니다", "발행했습니다", 에러 메시지 한국어) — cursive 폰트
- [ ] 에러 상태 UI (페이지 단위, 컴포넌트 단위)
- [ ] 빈 상태 UI (저장소 없음, 커밋 없음, 포스트 없음)

### 2.13 테스트

- [ ] Vitest + RTL + MSW 셋업
- [ ] `useFetch` 단위 테스트 (성공, 에러, 로딩)
- [ ] `useGenerateSummary` 단위 테스트 (mutation 패턴)
- [ ] `<PostCard>` 통합 테스트 (props 렌더, 액션 호출)
- [ ] My Blog 페이지 통합 테스트 (저장소 선택 → 커밋 선택 → summary 생성 → 저장 flow)
- [ ] MSW handlers — GitHub API, LLM API mocking

### 2.14 마무리

- [ ] 종합 검수 — 보안 (토큰 노출 검사), 에러 처리 (의도된 메시지), UX flow (4개 화면)
- [ ] CLAUDE.md 컨벤션 위반 검사 (any 검색, console.log 검색, 토큰 echo 검사)
- [ ] README 최종화 (실행 방법, 환경 변수, 스크린샷)
- [ ] 본인만의 Skill 산출물 정리 (`docs/skill.md`)

---

## Stretch — 시간 여유 시

- [ ] 멀티 에이전트 chain 고도화 (12주차 강의 결 활용)
- [ ] diff 크기 cap 시 사전 요약 패턴
- [ ] 토큰 사용량 UI 표시 (현재 세션, 누적)
- [ ] 카드 hover interaction — 살짝 흔들림, raise
- [ ] masking tape 디테일 일부 카드에
- [ ] 잉크 splash 디테일
- [ ] SVG noise paper grain
- [ ] E2E 테스트 1-2개 (Playwright)
- [ ] 배포 — Render(서버) + Vercel(클라이언트)
- [ ] Markdown 편집기 풍부화 (Tiptap 또는 @uiw/react-md-editor)

---

## Out-of-Scope (이번 2주에 안 함)

- GitHub OAuth (PAT으로 충분)
- 사용자 계정 시스템
- 외부 블로그 플랫폼 (Medium, Velog 등) 실제 발행
- 이미지 자동 생성
- 실시간 협업
- 다크 모드 (메타포와 충돌, Open Question)

---

## 검수 기준 (Definition of Done)

각 sprint 끝에 다음을 확인:

1. **기능** — 의도한 동작이 브라우저에서 직접 확인됨
2. **컨벤션** — `any` 없음, console.log 제거됨, 토큰 클라이언트 노출 없음
3. **에러 처리** — 외부 API 실패 시 의미 있는 메시지
4. **디자인 토큰 사용** — raw 색상값/픽셀값 컴포넌트에 직접 박혀있지 않음
5. **테스트** — 핵심 경로에 최소 1개 테스트
6. **커밋** — `feat:` `fix:` `refactor:` 등 타입 + 짧은 설명, 기능 단위로 분리됨

---

## 변경 이력

- v0.1 (2026-05-19): 초안 작성
