# AGENTS.md

---

## 1. 프로젝트

**스마트 블로그** — GitHub 저장소의 커밋을 LLM으로 분석해 기술 블로그 초안을 자동 생성하고, 사용자가 편집·발행할 수 있는 서비스.

상세 기능 명세는 `docs/spec.md` 참조.

## 2. 기술 스택

- **클라이언트**: React 19 + TypeScript + Vite, React Router v7
- **서버**: Node.js + Express + TypeScript
- **외부 API**: Octokit (GitHub), openai SDK (LLM)
- **저장 매체**: lowdb (단일 JSON 파일, `server/data/db.json`)
- **스타일**: CSS Modules + CSS Variables (primitive + semantic 2층 토큰)
- **테스트**: Vitest + React Testing Library + MSW
- **번들 진입점**: 클라이언트 port 5173, 서버 port 3000

## 3. 디렉토리 구조

```
/
├── client/
│   ├── src/
│   │   ├── components/      # 재사용 UI 컴포넌트 (PascalCase)
│   │   ├── pages/           # 라우트별 페이지 컴포넌트
│   │   ├── hooks/           # 커스텀 훅 (use* 접두)
│   │   ├── api/             # 서버 호출 함수 묶음
│   │   ├── types/           # 공유 타입
│   │   ├── styles/          # primitive.css, semantic.css
│   │   └── main.tsx
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── routes/          # Express 라우터
│   │   ├── services/        # GitHub·OpenAI 클라이언트 래퍼
│   │   ├── data/            # db.json (gitignore)
│   │   ├── types/
│   │   └── index.ts
│   └── tsconfig.json
├── docs/
│   ├── spec.md              # 기능 명세
│   ├── design.md            # 디자인 토큰·시각 시스템
│   └── checklist.md         # 주차별 작업 체크리스트
├── CLAUDE.md
├── .env.example
└── .gitignore
```

## 4. 핵심 원칙

1. **외부 API는 모두 Express 서버를 경유.** 클라이언트가 GitHub·OpenAI에 직접 요청 금지.
2. **토큰은 `server/.env`에만 존재.** 클라이언트 번들에 포함 절대 금지.
3. **디자인 토큰을 통해서만 색상·간격·폰트 사용.** 컴포넌트에서 raw 값(예: `#FAF6EE`, `16px`) 직접 하드코딩 금지.
4. **컴포넌트는 함수형 + Hooks.** 클래스 컴포넌트 X.
5. **상태 관리는 React 기본부터.** Redux·Zustand 같은 라이브러리는 필요가 명확해질 때만 도입.
6. **컴포넌트는 View 책임에 집중.** 데이터 페칭·로직은 커스텀 훅으로 분리.
7. **main 브랜치는 항상 동작 가능한 상태 유지.** 기능 개발은 feature 브랜치.

## 5. 코드 컨벤션

- **TypeScript strict** 모드. `any` 사용 금지.
- **파일·컴포넌트**: PascalCase (`PostCard.tsx`, `EditPage.tsx`)
- **훅**: `use` 접두 + camelCase (`useCommits.ts`, `useGenerateSummary.ts`)
- **일반 함수·변수**: camelCase
- **타입·인터페이스**: PascalCase (`Post`, `CommitMeta`)
- **CSS 클래스**: kebab-case (CSS Modules 안에서)
- **상수**: SCREAMING_SNAKE_CASE
- **import 순서**: 외부 라이브러리 → 내부 모듈 → 상대 경로 → 스타일

## 6. 커밋 메시지

형식: `type: 짧은 설명`

타입: `feat` / `fix` / `refactor` / `docs` / `test` / `chore` / `style`

예: `feat: 커밋 리스트 조회 API 연동`

기능 하나 + 거기 딸린 리팩토링까지가 한 커밋 단위. "조금만 더 하고 커밋" 금지.

## 7. 금지 패턴

- 토큰을 클라이언트 코드에 노출 (env 변수든 응답이든)
- 클라이언트에서 외부 API(GitHub·OpenAI) 직접 호출
- fetch URL 하드코딩 (모든 서버 URL은 환경변수 또는 상수 모듈에서)
- `any` 타입
- 디자인 토큰 우회 (raw 색상값·픽셀값을 컴포넌트에 직접)
- 인라인 스타일 남발 (특수한 동적 값 외)
- console.log 커밋 (디버그용은 작업 종료 시 제거)
- 외부 API 응답을 클라이언트에 그대로 echo (필요한 필드만 추려서)

## 8. LLM 호출 규칙

- `response_format: { type: "json_object" }` 강제.
- 응답을 받으면 스키마(`title` / `summary` / `body` 존재 여부) 검증 후 사용.
- 스키마 위반 시 에러로 처리. 절대 임의 보정 금지.
- 토큰 사용량(prompt/completion)을 서버 로그에 기록.
- 사용자에겐 의미 있는 에러 메시지로 변환 ("요약 생성에 실패했습니다" 등).

## 9. 디자인

- 컨셉: **작가의 원고 노트**. 시각·분위기에만 적용.
- 내부 명명(변수·파일·LLM enum값·git 컨벤션)은 영어 dev 관례 유지 (`draft` / `published` / `main` / `develop` / `feat:` 등).
- 사용자 표시 UI 텍스트는 한국어 (워드마크·페이지 제목·버튼·폼 라벨·status 표시·토스트). 내부 enum은 표시 지점에서 한국어로 매핑.
- LLM 본문 출력도 한국어. 시스템 프롬프트에 명시.
- 디자인 토큰 정의는 `docs/design.md` 참조.

## 10. 개발 워크플로우

체크리스트 항목 단위로 다음 루프 반복:

1. **설계** — 해당 기능에 필요한 컴포넌트·상태·데이터 흐름을 먼저 그림 (메모로 충분).
2. **구현** — AI 보조 가능, 단 명확한 컨텍스트와 함께 요청.
3. **리뷰** — 생성된 코드의 의도·복잡도·요청 외 추가 사항 확인.
4. **확인** — 브라우저 또는 테스트로 동작 직접 검증.
5. **커밋** — 기능 하나 단위로 즉시 커밋.

## 11. 보안 / 개인정보

- `.env`, `db.json`은 `.gitignore`에 포함.
- 커밋 전에 토큰이나 비밀이 코드에 남아있지 않은지 확인.
- 외부에 공유 가능한 부분은 `.env.example`로 명세.

## 12. 변경 이력

- v0.1 (2026-05-19): 초안
