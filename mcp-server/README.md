# InBrowserMcp - MCP 后端服务器

这是 InBrowserMcp 项目的后端服务器部分，负责处理 MCP 请求、与 Chrome 扩展通信以及与前端界面交互。

## 功能

*   **MCP 服务器实现**: 实现了 `@modelcontextprotocol/sdk` 定义的 MCP 服务器接口。
    *   处理来自客户端（如前端或 AI 模型）的 JSON-RPC 请求，管理 MCP 会话。
    *   支持 MCP 的核心方法，如 `createSession`, `deleteSession`, `getTools`, `invokeTool`。
    *   通过 `/mcp` 端点提供 MCP 服务 (支持 GET, POST, DELETE)。
*   **WebSocket 代理**: 充当 MCP 指令和 Chrome 扩展之间的桥梁。
    *   启动一个 WebSocket 服务器 (默认监听 `ws://localhost:8081`) 等待 Chrome 扩展连接。
    *   当 `invokeTool` 调用浏览器相关工具时，通过 WebSocket 将指令 (`action_request`) 发送给已连接的扩展。
    *   监听来自扩展的响应 (`action_response`)，并将结果返回给 MCP 调用者。
    *   使用请求/响应模式和超时机制管理与扩展的通信。
*   **前端 API**: 提供额外的 HTTP API 端点供前端 UI 使用。
    *   `/api/ai-command` (POST): 接收前端发送的自然语言指令，(当前为模拟)将其转换为 MCP `invokeTool` 请求，并启动浏览器操作。
    *   `/api/cancel-command` (POST): 接收前端发送的取消请求，尝试取消当前正在进行的浏览器操作（通过向扩展发送取消信号）。
*   **Server-Sent Events (SSE)**: 通过 `/mcp` (GET) 端点与前端建立 SSE 连接，推送实时状态更新。
    *   发送 `status` 事件告知会话状态。
    *   发送 `message` 事件表示操作成功完成。
    *   发送 `error` 事件表示操作失败或发生错误。

## 技术栈

*   **框架**: Node.js, Express
*   **语言**: TypeScript
*   **MCP 实现**: `@modelcontextprotocol/sdk`
*   **WebSocket**: `ws`
*   **构建**: `tsc` (TypeScript Compiler)

## 目录结构 (主要文件)

```
mcp-server/
├── dist/             # 编译后的 JavaScript 文件
├── src/
│   ├── server.ts     # 主要服务器逻辑，包括 Express 设置、WebSocket、MCP 实现
│   └── transport.ts  # SSE 相关逻辑 (可能)
├── package.json
├── tsconfig.json
└── README.md
```

## API 端点

*   **MCP Endpoint**: `/mcp` (Methods: GET, POST, DELETE)
    *   用于标准的 MCP 会话管理和工具调用。
    *   GET 请求用于建立 SSE 连接以接收实时更新。
*   **AI Command Endpoint**: `/api/ai-command` (Method: POST)
    *   Body: `{ "command": "用户指令" }`
    *   Response: `{ "sessionId": "会话ID" }` (启动操作后)
*   **Cancel Command Endpoint**: `/api/cancel-command` (Method: POST)
    *   Body: `{ "sessionId": "会话ID" }`
    *   Response: `{ "message": "取消信号已发送" }`
*   **WebSocket Endpoint**: `ws://localhost:8081` (由 Chrome 扩展连接)

## 安装与运行

**先决条件:**

*   Node.js (建议 v18 或更高版本)
*   npm 或 pnpm

**步骤:**

1.  **进入后端目录:**
    ```bash
    cd mcp-server
    ```

2.  **安装依赖:**
    ```bash
    npm install
    # 或者使用 pnpm
    # pnpm install
    ```

3.  **编译 TypeScript:**
    ```bash
    npm run build
    ```
    这会使用 `tsc` 将 `src` 目录下的 TypeScript 文件编译成 JavaScript，并输出到 `dist` 目录。

4.  **启动服务器:**
    ```bash
    npm start
    ```
    这将执行 `node dist/server.js`，启动 Express 服务器 (默认 `http://localhost:8080`) 和 WebSocket 服务器 (默认 `ws://localhost:8081`)。

    或者，在开发过程中使用 `npm run dev` (如果配置了 `ts-node-dev` 或类似工具) 可以实现热重载。

## 配置

*   HTTP 服务器端口 (默认 8080) 和 WebSocket 服务器端口 (默认 8081) 在 `src/server.ts` 中硬编码。可以根据需要修改或使用环境变量。

## 注意事项

*   确保 Chrome 扩展 (`extension/background.js`) 中的 WebSocket 连接地址与此处启动的 WebSocket 服务器地址匹配。
*   当前的 `/api/ai-command` 端点仅为模拟实现，需要根据实际需求对接 AI 模型或更复杂的指令解析逻辑。