import express from "express";
import cors from 'cors';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "crypto";
import * as tools from "./tools/index.js";
import { debugLog } from "./utils/log.js";
import { Context } from "./types/context.js";
import { Tool } from "./types/tools.js";
import fetch from 'node-fetch';
import { WebSocketServer, WebSocket } from 'ws'; // 引入 WebSocket 

// 创建 Express 应用
const app = express();

// 配置 CORS
const corsOptions = {
  origin: 'http://localhost:5173', // 允许来自前端的请求
  methods: ['GET', 'POST', 'OPTIONS'], // 允许的 HTTP 方法
  allowedHeaders: ['Content-Type', 'Accept', 'Mcp-Session-Id'], // 允许的请求头
  credentials: true, // 允许携带凭证（例如 cookies）
  exposedHeaders: ['Mcp-Session-Id'], // 允许前端访问的响应头
};

app.use(cors(corsOptions));
app.use(express.json());

// 新增：取消命令端点
app.post('/api/cancel-command', (req, res) => {
  const { sessionId } = req.body;
  debugLog(`🔌 收到取消命令请求，会话 ID: ${sessionId}`);

  // TODO: 更精细的取消逻辑可能需要将会话 ID 与特定操作关联
  // 目前，我们尝试取消所有与当前 WebSocket 连接相关的待处理请求

  let cancelledCount = 0;
  pendingRequests.forEach((request, requestId) => {
    debugLog(`⏳ 正在取消请求 ID: ${requestId}`);
    clearTimeout(request.timeoutId); // 清除超时
    request.reject(new Error('Operation cancelled by user request.')); // 拒绝 Promise
    pendingRequests.delete(requestId); // 从 Map 中移除
    cancelledCount++;
  });

  if (cancelledCount > 0) {
    debugLog(`✅ 成功取消 ${cancelledCount} 个待处理的浏览器操作请求。`);
    res.status(200).json({ message: `Cancelled ${cancelledCount} pending browser actions.` });
  } else {
    debugLog(`🤷 没有找到与当前连接相关的待处理请求进行取消。`);
    res.status(200).json({ message: 'No active browser actions found to cancel for the current connection.' });
  }
  // 注意：这不会停止已经在浏览器中执行的操作，只会停止服务器端的等待
  // 可能需要向插件发送一个特定的取消指令来停止浏览器端的活动
});

// 中间件：从查询参数中提取自定义头字段
app.use((req, res, next) => {
  const sessionId = req.query.sessionId as string;
  if (sessionId) {
    req.headers["mcp-session-id"] = sessionId; // 将查询参数中的 sessionId 设置为请求头
  }
  next();
});

// 存储会话传输实例
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// 存储来自插件 background.js 的 WebSocket 连接
// 用于存储等待插件响应的 Promise 回调
const pendingRequests = new Map<string, { resolve: (value: any) => void, reject: (reason?: any) => void, timeoutId?: NodeJS.Timeout }>();
const REQUEST_TIMEOUT = 30000; // 30 秒超时
let pluginWebSocket: WebSocket | null = null;
const WS_PORT = 8081; // WebSocket 服务器端口

/**
 * 验证请求头中的 Accept 头部是否符合 MCP 协议要求
 * MCP 协议要求 POST 请求必须同时接受 application/json 和 text/event-stream
 */
function validateAcceptHeader(req: express.Request): boolean {
  const acceptHeader = req.headers.accept || "";
  // 检查是否同时包含 application/json 和 text/event-stream
  return (
    acceptHeader.includes("application/json") &&
    acceptHeader.includes("text/event-stream")
  );
}

/**
 * 工具注册
 */
function registerTool(server: McpServer, tool: Tool, context: Context) {
  server.tool(
    tool.schema.name,
    tool.schema.description,
    async (params) => {
      debugLog(`➡️ 执行工具: ${tool.schema.name}`, params);
      // 工具处理逻辑现在依赖于 mcpContext 通过插件API与浏览器通信
      return await tool.handle(context, params);
    }
  );
}

// 创建全局 context 对象，使其可在不同请求处理器中访问
const globalContext = {
  async sendBrowserAction(type: string, payload: any): Promise<any> {
    // 通过 WebSocket 将指令发送给插件
    if (pluginWebSocket && pluginWebSocket.readyState === WebSocket.OPEN) {
      // --- 请求/响应机制 --- 
      return new Promise((resolve, reject) => {
        const requestId = randomUUID(); // 为每个请求生成唯一ID
        const message = JSON.stringify({ type, payload, requestId }); // 在消息中包含 requestId
        debugLog(`🔌 发送 WebSocket 指令 (ID: ${requestId}): ${type}`, payload);

        // 设置超时
        const timeoutId = setTimeout(() => {
          if (pendingRequests.has(requestId)) {
            debugLog(`⏰ 请求超时 (ID: ${requestId}): ${type}`);
            pendingRequests.get(requestId)?.reject(new Error(`Request timed out after ${REQUEST_TIMEOUT / 1000} seconds`));
            pendingRequests.delete(requestId);
          }
        }, REQUEST_TIMEOUT);

        // 存储请求的 resolve/reject 和 timeoutId
        pendingRequests.set(requestId, { resolve, reject, timeoutId });

        // 发送消息
        pluginWebSocket?.send(message, (err) => {
          if (err) {
            debugLog(`❌ WebSocket 发送错误 (ID: ${requestId}):`, err);
            // 如果发送失败，清除超时并拒绝 Promise
            clearTimeout(timeoutId);
            pendingRequests.delete(requestId);
            reject(err);
          } else {
            debugLog(`✅ WebSocket 指令已发送 (ID: ${requestId})`);
            // 发送成功，等待插件响应
          }
        });
      });
      // --- 结束 请求/响应机制 ---
    } else {
      debugLog('❌ WebSocket 连接不可用，无法发送指令');
      return Promise.reject(new Error('WebSocket connection to extension is not available.'));
    }
  },
  async wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  async getBrowserState(): Promise<any> {
    // TODO: 实现通过 WebSocket 从插件请求状态
    debugLog('⚠️ getBrowserState via WebSocket not implemented yet.');
    return Promise.reject(new Error('getBrowserState via WebSocket not implemented yet.'));
  },
  // executeBrowserAction 方法已移除，直接使用 sendBrowserAction
  isConnected(): boolean {
    // 检查 WebSocket 连接状态
    return pluginWebSocket !== null && pluginWebSocket.readyState === WebSocket.OPEN;
  },
} as Context; // 恢复类型断言为 Context

/**
 * 创建 MCP Server 实例
 * 注册所有工具并返回服务器实例
 */
function createServer() {
  const server = new McpServer({
    name: "Browser Plugin MCP Server", // 更新服务器名称
    version: "1.0.0",
  });

  // 使用全局 context 对象
  const context = globalContext;



  const allTools = [
    // 导航类
    tools.navigate,
    tools.refreshPage, 
    
    // 交互类
    tools.click,
    tools.hover,
    tools.type,
    tools.scroll, // 添加 scroll

    // 页面内容类
    tools.getContent,
    tools.getAttribute,
    tools.getCurrentState,

    // 高级操作类
    tools.executeScript,

    // 标签页管理类
    tools.getAllTabs,
    tools.createTab,
    tools.closeTab,
    tools.focusTab,

    // 窗口管理类
    tools.getAllWindows,
    tools.createWindow,
    tools.closeWindow,
    tools.focusWindow,

    // 存储管理类
    tools.getCookies,
    tools.setCookie,
    tools.deleteCookie,
    tools.getStorageItem,
    tools.setStorageItem,
    tools.deleteStorageItem,

    // 历史与书签类
    tools.searchHistory,
    tools.deleteHistoryUrl,
    tools.createBookmark,
    tools.searchBookmarks,
    
    // 快照类
    tools.snapshot,
    
    // 实用工具类
    tools.wait, // wait 移到实用工具类
    tools.screenshot,
    tools.clearBrowsingData // 添加 clearBrowsingData

    // 移除的工具: goBack, goForward, pressKey, drag, selectOption, getConsoleLogs
  ];

  // 批量注册所有工具
  allTools.forEach(tool => registerTool(server, tool, globalContext)); // 使用全局 context

  return server;
}

// POST /mcp - 处理 JSON-RPC 请求
app.post("/mcp", async (req, res) => {
  // 获取会话ID (不区分大小写)
  const sessionId = req.headers["mcp-session-id"] as string;
  const method = req.body?.method;
  const isInitialize = method === "initialize";
  
  // debugLog(`📩 收到方法: ${method}，Session: ${sessionId || "无"}`); 

  // 验证 Accept 头部
  if (!validateAcceptHeader(req)) {
    // debugLog(`❌ 无效的 Accept 头部: ${req.headers.accept}`);
    return res.status(406).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Not Acceptable: Client must accept both application/json and text/event-stream",
      },
      id: null,
    });
  }

  let transport: StreamableHTTPServerTransport;

  // 处理现有会话
  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
    // debugLog(`✅ 使用现有会话: ${sessionId}`);
    res.setHeader("Mcp-Session-Id", sessionId);
  } 
  // 处理新的初始化请求
  else if (!sessionId && isInitialize) {
    const newSessionId = randomUUID();
    // debugLog(`🆕 创建新会话: ${newSessionId}`);
    
    // 设置会话ID响应头
    res.setHeader("Mcp-Session-Id", newSessionId);
    
    // 1. 创建 MCP Server 实例
    const server = createServer();
    // debugLog(`🔧 MCP Server 实例已创建 (会话: ${newSessionId})`);

    // 2. 创建传输实例
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newSessionId,
      onsessioninitialized: (id) => {
        // debugLog(`✅ 会话初始化成功回调: ${id}`);
      }
    });
    // debugLog(`🔧 传输实例已创建 (会话: ${newSessionId})`);

    // 3. 存储传输实例
    transports[newSessionId] = transport;
    
    // 4. 设置会话关闭处理
    transport.onclose = () => {
      if (transport.sessionId) {
        // debugLog(`❌ 会话关闭: ${transport.sessionId}`);
        // 在这里可以添加清理插件连接的逻辑（如果需要）
        delete transports[transport.sessionId];
      }
    };

    // 5. 连接服务器到传输层
    try {
      // debugLog(`⏳ 尝试连接服务器到传输层 (会话: ${newSessionId})...`);
      await server.connect(transport);
      // debugLog(`🔌 服务器已成功连接到传输层 (会话: ${newSessionId})`);
    } catch (connectError) {
      // debugLog(`❌ 连接服务器到传输层时出错 (会话: ${newSessionId}):`, connectError);
      // 如果连接失败，可能需要清理并返回错误
      delete transports[newSessionId];
      return res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32001, // Custom error code for connection failure
          message: "Internal Server Error: Failed to connect server to transport",
        },
        id: req.body?.id || null,
      });
    }
  } 
  // 处理无效请求
  else {
    // debugLog(`❌ 无效请求: sessionId=${sessionId || "无"}, isInitialize=${isInitialize}`);
    return res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: Server not initialized",
      },
      id: null,
    });
  }

  try {
    // debugLog(`⏳ 即将处理请求体: ${JSON.stringify(req.body)}`);
    
    // 如果是初始化请求，完全手动处理响应
    if (isInitialize) {
      // ! 似乎一定得调用 sdk 的这个方法才能完成初始化请求
      await transport.handleRequest(req, res, req.body);
    } else {
      await transport.handleRequest(req, res, req.body);
      // debugLog(`✅ 请求处理完成: ${method}`);
    }
  } catch (error) {
    // debugLog(`❌ 处理 MCP 请求时出错 (${method}):`, error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

// 处理 GET 和 DELETE 请求的通用函数
const handleSessionRequest = async (req: express.Request, res: express.Response) => {
  // 优先从 Header 获取 sessionId，如果不存在（例如 EventSource GET 请求），则从查询参数获取
  let sessionId = req.headers["mcp-session-id"] as string;
  if (!sessionId && req.method === 'GET' && req.query.sessionId) {
    sessionId = req.query.sessionId as string;
    // debugLog(`ℹ️ 从查询参数获取 Session ID: ${sessionId}`);
  }

  // 第一步：验证会话ID是否存在
  if (!sessionId) {
    // debugLog(`❌ 无效会话请求: 缺少sessionId`);
    return res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Missing session ID",
      },
      id: null,
    });
  }

  // 第二步：验证会话ID是否在transports中存在
  if (!transports[sessionId]) {
    // debugLog(`❌ 无效会话请求: sessionId=${sessionId} 在transports中不存在`);
    // debugLog(`当前有效的会话IDs: ${Object.keys(transports).join(', ') || '无'}`);
    
    // 检查是否是大小写问题 - MCP会话ID通常是UUID，可能存在大小写不一致的情况
    const lowerCaseSessionId = sessionId.toLowerCase();
    const matchingSessionId = Object.keys(transports).find(
      id => id.toLowerCase() === lowerCaseSessionId
    );
    
    if (matchingSessionId) {
      sessionId = matchingSessionId; // 使用找到的匹配ID
    } else {
      return res.status(404).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Session not found",
        },
        id: null,
      });
    }
  } else {
  }
  
  // 验证 Accept 头部 (仅对 GET 请求)
  if (req.method === "GET") {
    const acceptHeader = req.headers.accept || "";
    
    // 根据MCP协议规范，EventSource连接请求的Accept头部必须包含text/event-stream
    if (!acceptHeader.includes("text/event-stream")) {
      return res.status(406).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Not Acceptable: Client must accept text/event-stream",
        },
        id: null,
      });
    }
  }
  
  res.setHeader("Mcp-Session-Id", sessionId);
  
  try {
    const transport = transports[sessionId];
    // 确保transport存在
    if (!transport) {
      debugLog(`❌ 无法找到会话ID对应的transport: ${sessionId}`);
      return res.status(404).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Session transport not found",
        },
        id: null,
      });
    }
    // debugLog(`⏳ 开始处理会话请求: ${req.method} ${req.url}`);
    await transport.handleRequest(req, res);
    // debugLog(`✅ 会话请求处理完成: ${req.method} ${req.url}`);
  } catch (error) {
    // debugLog(`❌ 处理会话请求时出错: ${error}`);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
};

// GET /mcp - 客户端从服务端获取事件流
app.get("/mcp", handleSessionRequest);

// DELETE /mcp - 主动关闭会话
app.delete("/mcp", handleSessionRequest);

// 新增 API 端点处理前端指令
app.post('/api/ai-command', async (req, res) => {
  const { command, apiKey, sessionId } = req.body;

  console.log(`[API /api/ai-command] Received command: "${command}", Session ID: ${sessionId}`);

  // --- 输入验证 ---
  if (!command || typeof command !== 'string') {
    console.error('[API /api/ai-command] Error: Missing or invalid command');
    return res.status(400).json({ error: 'Missing or invalid command' });
  }
  // 实际应用中应验证 apiKey
  // if (!apiKey) {
  //   return res.status(401).json({ error: 'Missing API Key' });
  // }
  if (!sessionId || typeof sessionId !== 'string') {
    console.error('[API /api/ai-command] Error: Missing or invalid sessionId');
    return res.status(400).json({ error: 'Missing or invalid sessionId' });
  }

  // --- 会话验证 ---
  // 检查会话是否存在 (在实际应用中，需要更完善的会话管理)
  // 这里我们假设 sessionId 总是有效的，因为前端会初始化
  // if (!isValidSession(sessionId)) { // 需要实现 isValidSession
  //   return res.status(404).json({ error: 'Session not found or invalid' });
  // }

  // --- 模拟 AI 处理 --- (替换为实际的 AI 调用)
  let mcpRequestPayload: any;
  try {
    console.log(`[API /api/ai-command] Simulating AI processing for command: "${command}"`);
    // 简单的基于关键词的模拟 AI 响应
    const lowerCaseCommand = command.toLowerCase();

    if (lowerCaseCommand.includes('bilibili') && lowerCaseCommand.includes('搜索框') && lowerCaseCommand.includes('输入')) {
      const searchTextMatch = command.match(/输入\s*(.+)/i);
      const searchText = searchTextMatch ? searchTextMatch[1].trim() : 'Trae AI'; // 默认搜索词
      mcpRequestPayload = {
        tool: 'typeText',
        args: {
          selector: '#nav-search-input', 
          text: searchText,
          options: { delay: 50 } // 模拟打字延迟
        }
      };
      console.log(`[API /api/ai-command] AI Simulation: Generated 'typeText' for Bilibili search input: "${searchText}"`);
    } else if (lowerCaseCommand.includes('导航到') || lowerCaseCommand.includes('打开')) {
        let urlMatch = command.match(new RegExp('https:\/\/\S+', 'i'));
        let targetUrl = 'https://www.google.com'; // Default URL

        if (!urlMatch) { // If full URL not found, try matching "打开 ..."
            urlMatch = command.match(new RegExp('打开\\s+([^\\s]+)', 'i'));
        }

        if (urlMatch && urlMatch[1]) {
            targetUrl = urlMatch[1].startsWith('http') ? urlMatch[1] : `https://${urlMatch[1]}`;
        } else if (lowerCaseCommand.includes('bilibili')) {
            targetUrl = 'https://www.bilibili.com';
        }
        mcpRequestPayload = {
            tool: 'navigate',
            args: { url: targetUrl }
        };
        console.log(`[API /api/ai-command] AI Simulation: Generated 'navigate' to URL: ${targetUrl}`);
    } else if (lowerCaseCommand.includes('点击') || lowerCaseCommand.includes('单击')) {
        // 非常简化的点击模拟，假设用户指定了选择器或明确文本
        const selectorMatch = command.match(/(选择器|selector)\s*['"]([^'"]+)['"]/i);
        const textMatch = command.match(/文本为?['"]([^'"]+)['"]/i);
        let selector = 'button'; // Default selector
        if (selectorMatch && selectorMatch[2]) {
            selector = selectorMatch[2];
        } else if (textMatch && textMatch[1]) {
            // 尝试生成基于文本的选择器 (非常基础)
            selector = `button:contains("${textMatch[1]}"), a:contains("${textMatch[1]}")`; // 示例
        }
        mcpRequestPayload = {
            tool: 'click',
            args: { selector: selector }
        };
        console.log(`[API /api/ai-command] AI Simulation: Generated 'click' on selector: ${selector}`);

    } else if (lowerCaseCommand.includes('快照') || lowerCaseCommand.includes('截图') || lowerCaseCommand.includes('页面状态')) {
      mcpRequestPayload = {
        tool: 'snapshot', // 假设我们有一个 'snapshot' 工具
        args: {} // 可能不需要参数，或者可以指定截图区域等
      };
      console.log(`[API /api/ai-command] AI Simulation: Generated 'snapshot' request`);
    } else {
      // 默认或无法识别的指令，可以返回一个提示或默认操作
      console.log(`[API /api/ai-command] AI Simulation: Command not recognized, generating default 'getConsoleLogs'`);
      mcpRequestPayload = {
        tool: 'getConsoleLogs',
        args: {}
      };
    }

    // --- 直接通过 WebSocket 发送指令给插件 ---
    if (mcpRequestPayload) {
      console.log(`[API /api/ai-command] Sending command via WebSocket:`, mcpRequestPayload);
      try {
        // 使用全局 context 的 sendBrowserAction 方法
        const result = await globalContext.sendBrowserAction(mcpRequestPayload.tool, mcpRequestPayload.args);
        console.log(`[API /api/ai-command] WebSocket command sent successfully. Result:`, result);
        // 假设发送成功，具体响应取决于 sendBrowserAction 的实现
        res.status(200).json({ message: 'Command received and sent to extension via WebSocket', result });
      } catch (sendError) {
        const errorMsg = sendError instanceof Error ? sendError.message : 'Unknown WebSocket send error';
        console.error(`[API /api/ai-command] Error sending command via WebSocket: ${errorMsg}`, sendError);
        // 根据错误类型返回不同的状态码，例如 503 服务不可用（如果 WS 未连接）
        if (errorMsg.includes('WebSocket connection to extension is not available')) {
          res.status(503).json({ error: 'Service Unavailable: Browser extension is not connected.' });
        } else {
          res.status(500).json({ error: `Failed to send command via WebSocket: ${errorMsg}` });
        }
      }
    } else {
      console.log('[API /api/ai-command] No MCP payload generated for the command.');
      res.status(200).json({ message: 'Command received, but no action taken by AI simulation.' });
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown AI processing error';
    console.error(`[API /api/ai-command] Error processing command: ${errorMsg}`, error);
    res.status(500).json({ error: `Failed to process command: ${errorMsg}` });
  }
});

// 启动HTTP服务器
const PORT = 3000;
const server = app.listen(PORT, () => {
  debugLog(`🚀 MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
  debugLog(`🔗 API Endpoint for AI commands available at POST /api/ai-command`);
  debugLog(`🔌 WebSocket Server listening on port ${WS_PORT}, waiting for extension connection...`);
});

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  debugLog('🔌 浏览器插件已连接 WebSocket');

  // 假设只有一个插件实例连接
  if (pluginWebSocket && pluginWebSocket.readyState === WebSocket.OPEN) {
    debugLog('⚠️ 检测到新的插件连接，关闭旧连接');
    pluginWebSocket.terminate(); // 关闭旧连接
  }
  pluginWebSocket = ws;

  ws.on('message', (message) => {
    try {
      const messageString = message.toString();
      debugLog(`📩 收到来自插件的消息: ${messageString}`);
      const parsedMessage = JSON.parse(messageString);

      // 检查是否是动作响应消息
      if (parsedMessage.type === 'action_response' && parsedMessage.payload?.requestId) {
        const { requestId, success, error, data } = parsedMessage.payload;
        debugLog(`📬 处理插件响应 (ID: ${requestId}): success=${success}`, data || error || '');

        if (pendingRequests.has(requestId)) {
          const { resolve, reject, timeoutId } = pendingRequests.get(requestId)!;
          // 清除超时定时器
          if (timeoutId) {
            clearTimeout(timeoutId);
          }

          if (success) {
            resolve(data || { success: true }); // 如果有数据则返回数据，否则返回成功状态
          } else {
            reject(new Error(error || 'Plugin action failed'));
          }
          pendingRequests.delete(requestId); // 处理完后从 Map 中移除
        } else {
          debugLog(`⚠️ 收到未知或已超时的请求响应 (ID: ${requestId})`);
        }
      } else if (parsedMessage.type === 'status_update') {
        // 处理插件发送的状态更新，例如页面加载完成等
        debugLog(`ℹ️ 收到插件状态更新:`, parsedMessage.payload);
        // 这里可以根据需要进行处理，例如更新某个内部状态
      } else {
        // 处理其他类型的消息
        debugLog(`🔧 处理其他插件消息类型: ${parsedMessage.type}`);
      }
    } catch (e) {
      debugLog('❌ 解析插件消息时出错:', e, message.toString());
    }
  });

  ws.on('close', () => {
    debugLog('🔌 浏览器插件 WebSocket 连接已断开');
    if (pluginWebSocket === ws) {
      pluginWebSocket = null;
    }
  });

  ws.on('error', (error) => {
    debugLog('❌ 浏览器插件 WebSocket 连接出错:', error);
    if (pluginWebSocket === ws) {
      pluginWebSocket = null;
    }
  });

  // 发送连接确认消息
  ws.send(JSON.stringify({ type: 'server_connected', payload: { status: 'connected' } }));
  debugLog('✅ 已发送 WebSocket 连接确认消息');
});

wss.on('error', (error) => {
  debugLog('❌ WebSocket Server 发生错误:', error);
});

// 移除进程退出时关闭浏览器的逻辑
process.on('SIGINT', async () => {
  debugLog('👋 正在关闭服务器...');
  wss.close(() => {
    debugLog('🔌 WebSocket Server 已关闭');
  });
  server.close(() => {
    debugLog('🚀 HTTP Server 已关闭');
    process.exit(0);
  });
});
