# Contributing

InBrowserMcp is experimental. Bug reports, tool ideas, and pull requests are welcome in Chinese or English.

## Development

Prerequisites: Node.js 18 or newer, npm, and Chrome.

```bash
git clone https://github.com/LofiSu/InBrowserMcp.git
cd InBrowserMcp

# MCP server — HTTP :3000, extension WebSocket :8081
cd mcp-server
npm install
npm run dev

# Panel UI — http://localhost:5173
cd ../frontend
npm install
npm run dev
```

Load `extension/` as an unpacked extension at `chrome://extensions`. The extension connects to `ws://localhost:8081`. The UI's API base URL is `http://localhost:3000` in `frontend/src/service/index.ts`, and the server only allows CORS from `http://localhost:5173`.

`mcp-server` scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | `tsx watch src/server.ts` |
| `npm run build` | `tsc` (this is the typecheck) |
| `npm start` | `npm run build && node dist/server.js` |
| `npm test` | Live MCP client against a running server. Not a unit test, and not run in CI. |

`frontend` scripts: `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run lint`, `npm run preview`.

CI (`.github/workflows/ci.yml`) installs dependencies and runs `npm run build` in `mcp-server` and `frontend` on Node.js 22. There is no root `package.json`. Lockfiles are gitignored, so CI uses `npm install`.

## Pull requests

- Keep changes focused. Match the style of the file you are editing.
- Run `npm run build` in each package you touch.
- Do not commit `node_modules/`, `dist/`, or `.env` files.

## GitHub repository metadata

GitHub About text, the license field, and topics are set on the repository, not by files in a pull request. After this packaging lands on `main`:

Suggested description:

```text
Experimental MCP server and Chrome extension that lets AI agents drive the browser — navigate, click, type, and read the page.
```

Suggested topics:

```text
mcp
chrome-extension
browser-automation
typescript
ai-agents
```

Optional extras if you want a wider net: `model-context-protocol`, `react`, `websocket`.

A maintainer can apply them with the GitHub CLI:

```bash
gh repo edit LofiSu/InBrowserMcp \
  --description "Experimental MCP server and Chrome extension that lets AI agents drive the browser — navigate, click, type, and read the page." \
  --add-topic mcp \
  --add-topic chrome-extension \
  --add-topic browser-automation \
  --add-topic typescript \
  --add-topic ai-agents
```

The license field should pick up `LICENSE` (MIT) on its own once that file is on the default branch. Confirm it on the repository About settings if GitHub has not detected it yet.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
