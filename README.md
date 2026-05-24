# Smart Blog

GitHub 저장소의 커밋을 LLM으로 분석해 기술 블로그 초안을 생성하고, 사용자가 편집해 저장하거나 발행 상태로 관리할 수 있는 서비스입니다.

현재는 모노레포 구조와 React/Vite 클라이언트, Express 서버의 기본 스캐폴드가 준비된 초기 단계입니다. 상세 기능 명세는 [docs/spec.md](docs/spec.md), 작업 체크리스트는 [docs/checklist.md](docs/checklist.md)를 참고하세요.

## Tech Stack

- Client: React 19, TypeScript, Vite, React Router v7
- Server: Node.js, Express, TypeScript
- External APIs: GitHub API via Octokit, OpenAI SDK
- Storage: lowdb JSON file
- Styling: CSS Modules, CSS variables, primitive/semantic design tokens
- Tests: Vitest, React Testing Library, MSW

## Project Structure

```text
.
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── types/
│   │   └── main.tsx
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── data/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   └── tsconfig.json
├── docs/
├── AGENTS.md
└── package.json
```

## Getting Started

```bash
npm install
```

서버 환경변수 파일을 준비합니다.

```bash
cp .env.example server/.env
```

`server/.env`에 필요한 값을 채웁니다.

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
GITHUB_TOKEN=your_github_pat
OPENAI_API_KEY=your_openai_api_key
LLM_MODEL=gpt-4o-mini
DIFF_SIZE_CAP_BYTES=8192
LLM_REQUEST_TIMEOUT_MS=30000
```

클라이언트에서 다른 API 주소를 써야 한다면 `client/.env.local`에 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev:client
npm run dev:server
npm run build
npm run test
```

- Client dev server: `http://localhost:5173`
- Server: `http://localhost:3000`
- Health check: `GET http://localhost:3000/api/health`

## Development Notes

- GitHub/OpenAI 호출은 반드시 Express 서버를 경유합니다.
- API 토큰은 `server/.env`에만 보관하고 클라이언트 번들에 포함하지 않습니다.
- 색상, 간격, 폰트는 `client/src/styles/primitive.css`와 `semantic.css`의 디자인 토큰을 통해 사용합니다.
- TypeScript는 strict 모드를 기준으로 개발합니다.
