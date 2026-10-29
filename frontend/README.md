# frontend

React UI for [InBrowserMcp](../README.md). The root README has the full run order. This package does not choose the API host from an environment variable.

## Scripts

From `package.json`:

| Script | Command |
| --- | --- |
| `npm run dev` | `vite` (default `http://localhost:5173`) |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | `eslint .` |
| `npm run preview` | `vite preview` |

There is no `test` script. There is no `VITE_MCP_SERVER_URL`. `src/service/index.ts` sets `API_BASE_URL` to `http://localhost:3000`.

## What the page calls

- `POST /mcp` with MCP `initialize`, then `notifications/initialized`
- `GET /mcp?sessionId=...` via `EventSource`
- `POST /api/ai-command` with `{ command, sessionId }`
- `POST /api/cancel-command` with `{ sessionId }`

The gear dialog and the history dialog are React state in this app. The server must already be running, and its CORS config allows this Vite origin.
