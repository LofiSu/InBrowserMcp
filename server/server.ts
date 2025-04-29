import { WebSocket, WebSocketServer } from "ws";
import { createWebSocketServer } from "./ws";
import { Context } from "./context";
import { Tool } from "./tools/tool";
import { debugLog } from "./utils/log";

// 服务器配置选项接口
type ServerOptions = {
  name: string; // 服务器名称
  version: string; // 服务器版本
  tools: Tool[]; // 可用工具列表
};

// 请求处理器
type RequestHandler = (
  requestId: string,
  method: string,
  params: unknown
) => Promise<unknown>;

/**
 * MCP服务器类
 */
export class Server {
  private name: string;
  private version: string;
  private tools: Tool[];
  private handlers: Map<string, RequestHandler> = new Map();
  private context: Context;
  private wss: WebSocketServer | null = null;

  /**
   * 构造函数
   * @param options 服务器配置选项
   */
  constructor(options: ServerOptions) {
    this.name = options.name;
    this.version = options.version;
    this.tools = options.tools;
    this.context = new Context();

    // 注册内置请求处理器
    this.registerBuiltinHandlers();
  }

  /**
   * 注册内置请求处理器
   */
  private registerBuiltinHandlers() {
    // 处理列出工具请求
    this.handlers.set("listTools", async () => {
      return { tools: this.tools.map((tool) => tool.schema) };
    });

    // 处理调用工具请求
    this.handlers.set("callTool", async (_, __, params) => {
      const { name, arguments: args } = params as {
        name: string;
        arguments: Record<string, unknown>;
      };

      // 查找工具
      const tool = this.tools.find((tool) => tool.schema.name === name);
      if (!tool) {
        return {
          content: [{ type: "text", text: `工具 "${name}" 未找到` }],
          isError: true,
        };
      }

      try {
        // 执行工具
        return await tool.handle(this.context, args);
      } catch (error) {
        // 处理错误
        return {
          content: [{ type: "text", text: String(error) }],
          isError: true,
        };
      }
    });
  }

  /**
   * 启动服务器
   * @param port WebSocket服务器端口
   */
  async start(port?: number) {
    debugLog(`启动 "${this.name}" 服务器 v${this.version}...`);

    // 创建WebSocket服务器
    this.wss = await createWebSocketServer(port);

    // 监听连接
    this.wss.on("connection", (ws: WebSocket) => {
      debugLog("新的WebSocket连接已建立");

      // 关闭现有连接
      if (this.context.hasWs()) {
        debugLog("关闭现有的WebSocket连接");
        this.context.close();
      }

      // 设置新连接
      this.context.ws = ws;

      // 处理接收到的消息
      ws.on("message", async (data: Buffer) => {
        try {
          // 解析请求
          const request = JSON.parse(data.toString());
          debugLog("收到请求:", request);

          // 如果不是客户端发来的请求消息，直接忽略
          if (!request.id || !request.method) {
            return;
          }

          // 查找处理器
          const handler = this.handlers.get(request.method);
          if (!handler) {
            // 发送错误响应
            ws.send(
              JSON.stringify({
                id: request.id,
                error: {
                  message: `未知方法: ${request.method}`,
                },
              })
            );
            return;
          }

          try {
            // 执行处理器
            const result = await handler(
              request.id,
              request.method,
              request.params || {}
            );

            // 发送响应
            ws.send(
              JSON.stringify({
                id: request.id,
                result,
              })
            );
          } catch (error) {
            // 发送错误响应
            ws.send(
              JSON.stringify({
                id: request.id,
                error: {
                  message: String(error),
                },
              })
            );
          }
        } catch (error) {
          debugLog("处理请求时出错:", error);
        }
      });
    });

    return this;
  }

  /**
   * 关闭服务器
   */
  async close() {
    if (this.wss) {
      debugLog("关闭WebSocket服务器...");

      // 关闭WebSocket服务器
      const closeWss = new Promise<void>((resolve) => {
        this.wss?.close(() => {
          debugLog("WebSocket服务器已关闭");
          resolve();
        });
      });

      // 关闭上下文
      const closeContext = this.context.close();

      // 等待所有关闭完成
      await Promise.all([closeWss, closeContext]);
      this.wss = null;
    }
  }
}
