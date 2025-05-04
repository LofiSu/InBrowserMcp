# InBrowserMcp - 前端界面

这是 InBrowserMcp 项目的前端部分，提供一个用户界面来发送浏览器操作指令并查看结果。

## 功能

*   提供一个输入框，允许用户输入自然语言指令（例如，“打开 google.com”）。
*   通过 HTTP POST 请求将指令发送到 `mcp-server` 的 `/api/ai-command` 端点。
*   通过 Server-Sent Events (SSE) 连接到 `mcp-server` 的 `/mcp` 端点，实时接收操作状态和结果。
*   根据从 SSE 收到的事件（`message`, `error`, `status`）更新 UI，显示当前操作状态（例如，“空闲”、“运行中”、“成功”、“失败”）。
*   提供取消按钮，通过 HTTP POST 请求调用 `mcp-server` 的 `/api/cancel-command` 端点来取消正在进行的操作。

## 技术栈

*   **框架**: React
*   **构建工具**: Vite
*   **语言**: TypeScript
*   **样式**: Tailwind CSS
*   **状态管理**: React Hooks (`useState`, `useEffect`)
*   **数据获取**: `fetch` API (用于 POST 请求), `EventSource` (用于 Server-Sent Events)

## 目录结构 (主要文件)

```
frontend/
├── public/
├── src/
│   ├── App.tsx         # 主要应用组件，包含 UI 布局和逻辑
│   ├── main.tsx        # 应用入口点
│   └── index.css       # Tailwind CSS 入口
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 安装与运行

**先决条件:**

*   Node.js (建议 v18 或更高版本)
*   pnpm (推荐) 或 npm
*   `mcp-server` 正在运行 (默认在 `http://localhost:8080`)

**步骤:**

1.  **进入前端目录:**
    ```bash
    cd frontend
    ```

2.  **安装依赖:**
    ```bash
    pnpm install
    # 或者使用 npm
    # npm install
    ```

3.  **启动开发服务器:**
    ```bash
    pnpm run dev
    ```

4.  **访问应用:**
    在浏览器中打开 Vite 提供的地址 (通常是 `http://localhost:5173`)。

## 与后端交互

*   **发送指令**: `POST /api/ai-command`
    *   Body: `{ "command": "用户输入的指令" }`
*   **取消指令**: `POST /api/cancel-command`
    *   Body: `{ "sessionId": "当前会话 ID" }`
*   **接收状态更新**: `GET /mcp` (建立 SSE 连接)
    *   服务器会推送 `message`, `error`, `status` 类型的事件。

确保 `mcp-server` 正在运行，并且前端配置中的后端地址 (`VITE_MCP_SERVER_URL` 在 `.env` 文件中，如果使用的话，或者硬编码在 `App.tsx` 中) 指向正确的服务器地址 (默认为 `http://localhost:8080`)。