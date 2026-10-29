# Repository metadata

Copy these into the GitHub **About** panel. They describe this tree only: an MCP Streamable HTTP server, a Manifest V3 Chrome extension, and a React UI.

## Description

Use this as the About description (under 350 characters):

```
Experimental MCP server that drives a Chrome extension over WebSocket. TypeScript Streamable HTTP on :3000, Manifest V3 extension on ws://localhost:8081, and a React UI whose commands are matched by keywords.
```

## Website

Leave the website field empty. This repo has no deployed homepage.

## Topics

Suggested GitHub topics, in order. Each one matches a file in the tree:

| Topic | Why it matches |
| --- | --- |
| `mcp` | `@modelcontextprotocol/sdk` in `mcp-server` and `frontend`. Server name `Browser Plugin MCP Server`. |
| `model-context-protocol` | Streamable HTTP MCP session at `POST/GET/DELETE /mcp` in `mcp-server/src/server.ts`. |
| `browser` | Tool handlers and `extension/background.js` target the browser. |
| `typescript` | `mcp-server` and `frontend` are TypeScript (`tsc` / `tsc -b`). |
| `chrome-extension` | `extension/manifest.json` is Manifest V3 (`background.js` service worker, content script, side panel). |
| `agent` | The UI and `/api/ai-command` exist so a caller can ask the browser to act. The handler is a keyword matcher. |
| `websocket` | Extension bridge on `ws://localhost:8081` (`ws` package and `extension/background.js`). |
| `react` | `frontend` is React 19 (`src/App.tsx`). |
| `vite` | `frontend` scripts use Vite 6. |
| `browser-automation` | Registered tools include navigate, click, type, tabs, and scripting. See the wiring notes in the README before treating every tool as end-to-end. |

Topics that do not fit this repo: `firefox`, `playwright`, `puppeteer`, `python`. None of those are dependencies or source here.
