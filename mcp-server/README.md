# mcp-server

HTTP and WebSocket process for [InBrowserMcp](../README.md). The root README is the install and behavior guide. This file only records what this package's scripts and source do.

## Scripts

From `package.json`:

| Script | Command | What it does |
| --- | --- | --- |
| `npm run dev` | `tsx watch src/server.ts` | Run the server from TypeScript. |
| `npm run build` | `tsc` | Compile `src` to `dist` (`tsconfig.json`). |
| `npm start` | `pnpm build && node dist/server.js` | Requires `pnpm` on `PATH`. |
| `npm test` | `tsx src/test/test-client.ts` | Manual MCP client against `http://localhost:3000/mcp`. Start the server first. |

There is no lint script.

## Ports

Hardcoded in `src/server.ts`:

- HTTP `3000` — Express. MCP Streamable HTTP at `/mcp` (`POST`, `GET`, `DELETE`). Also `POST /api/ai-command` and `POST /api/cancel-command`.
- WebSocket `8081` — one Chrome extension connection.

CORS origin is `http://localhost:5173`.

## Layout

```
mcp-server/
├── src/server.ts          # Express, MCP sessions, WebSocket bridge
├── src/tools/             # Tool handlers registered by createServer()
├── src/types/tools.ts     # Tool names, descriptions, and zod args
├── src/test/test-client.ts
├── package.json
└── tsconfig.json
```

There is no `src/transport.ts`. SSE is handled inside the MCP SDK transport created in `server.ts`.
