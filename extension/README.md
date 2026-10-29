# extension

Manifest V3 Chrome extension for [InBrowserMcp](../README.md). Load this directory unpacked from `chrome://extensions`.

`background.js` opens `ws://localhost:8081` (the WebSocket server in `mcp-server/src/server.ts`) and reconnects every 5 seconds. Incoming messages use `{ type, payload, requestId }`. Results go back as `{ type: "action_response", payload }`.

`content.js` is registered for `<all_urls>` and answers `chrome.runtime` messages. The service worker performs tab and scripting work itself.

## manifest.json

- Manifest version 3, name `InBrowser MCP Extension`
- Permissions: `activeTab`, `scripting`, `storage`, `sidePanel`, `tabs`
- Service worker: `background.js`
- Side panel file: `dist/index.html` (relative to this directory). The Vite app builds to `frontend/dist` and no script copies it here.

`background.js` also calls `chrome.cookies`, `chrome.history`, `chrome.bookmarks`, `chrome.browsingData`, and `chrome.windows`. Those permissions are not listed in `manifest.json`.
