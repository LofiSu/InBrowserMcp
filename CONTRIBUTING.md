# Contributing

Thanks for looking at InBrowserMcp. The project is an experiment: a TypeScript MCP server, a Manifest V3 Chrome extension, and a React UI. Behavior and ports are described in [README.md](README.md). Copyright holder of the [MIT license](LICENSE) is LofiSu.

## Setup

Node.js 20 or newer and npm. Chrome is required only if you want to load the extension.

```bash
cd mcp-server
npm install
npm run dev          # tsx watch src/server.ts
                     # http://localhost:3000 and ws://localhost:8081
```

```bash
cd frontend
npm install
npm run dev          # vite, http://localhost:5173
```

Load the unpacked extension from the `extension` directory after the WebSocket port is open. `extension/background.js` connects to `ws://localhost:8081`.

`mcp-server` `npm start` is `pnpm build && node dist/server.js`. The dev and build commands above use npm only.

## Checks

CI runs the scripts that already exist. Run the same ones before a pull request.

`mcp-server` (`package.json` has `build` and `test`, no lint script):

```bash
cd mcp-server
npm install
npm run build        # tsc
```

`npm test` is `tsx src/test/test-client.ts`. That file connects to `http://localhost:3000/mcp`, lists tools, and calls `navigate` and `snapshot`. Start the server first. It is a manual client, so CI does not run it.

`frontend` (no `test` script):

```bash
cd frontend
npm install
npm run lint         # eslint .
npm run build        # tsc -b && vite build
```

`npm run lint` currently reports an existing `react-hooks/exhaustive-deps` warning in `src/components/alert-message.tsx` and exits 0.

## Pull requests

1. Branch from `main`.
2. Keep the change focused. Docs that describe a port or a tool name should match `mcp-server/src/server.ts`, `mcp-server/src/types/tools.ts`, or `extension/manifest.json`.
3. Leave generated output out of the commit. Root `.gitignore` ignores `node_modules/`, `dist/`, lockfiles, and `.env`.
4. The extension has no package script. Changes there are plain JavaScript.

## License

By contributing, you agree that your contributions are licensed under the MIT License, Copyright (c) 2025-2026 LofiSu.
