# Smart Blog

GitHub 저장소의 커밋을 LLM으로 분석해 기술 블로그 초안을 자동 생성하고, 사용자가 편집·발행할 수 있는 서비스입니다.

Tech stack: React 19 + TypeScript + Vite client, React Router v7, Node.js + Express + TypeScript server, Octokit, OpenAI SDK, lowdb, CSS Modules/CSS variables, Vitest + React Testing Library + MSW.

## Setup

Install workspace dependencies from the repository root.

```bash
npm install
```

Create the server environment file.

```bash
cp server/.env.example server/.env
```

Fill `server/.env`.

```env
GITHUB_TOKEN=
OPENAI_API_KEY=
LLM_MODEL=gpt-4o-mini
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DIFF_SIZE_CAP_BYTES=8192
LLM_REQUEST_TIMEOUT_MS=30000
```

Optional client API override:

```env
# client/.env.local
VITE_API_BASE_URL=http://localhost:3000
```

## Development

Run the server and client in separate terminals.

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Default URLs:

- Client: `http://localhost:5173`
- Server: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

Root workspace scripts are also available.

```bash
npm run dev:server
npm run dev:client
npm run build
npm test
```

## Project Structure

```text
.
├── client/   # React UI, routes, hooks, API client, CSS token system
├── server/   # Express routes, GitHub/OpenAI services, lowdb storage
├── docs/     # specification, data flow, design system, checklist
├── AGENTS.md
└── package.json
```

## Docs

- [Functional spec](docs/spec.md)
- [Data flow](docs/data-flow.md)
- [Design system](docs/design.md)
- [Skill notes](docs/skill.md)
