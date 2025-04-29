// 导入WebSocket类型
import * as WebSocketModule from "ws";
import { appConfig } from "./config/app.config";
import { Context as ContextInterface } from "./tools/tool";
import { debugLog } from "./utils/log";

// 创建WebSocket类型别名
type WebSocket = WebSocketModule.WebSocket;

// 当没有连接到浏览器扩展时显示的错误消息
const noConnectionMessage = appConfig.errors.noConnectedTab || `Fallback message`;

/**
 * 创建一个唯一ID
 * @returns 唯一ID字符串
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * 上下文类
 * 管理与浏览器扩展的WebSocket连接
 */
export class Context implements ContextInterface {
  // WebSocket连接实例
  public _ws: WebSocket | undefined;
  // 存储待处理的消息回调
  public pendingMessages: Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (error: unknown) => void;
      timeout: NodeJS.Timeout;
    }
  > = new Map();

  /**
   * 构造函数
   */
  constructor() {
    // 可以添加初始化逻辑
  }

  /**
   * 获取WebSocket连接
   * 如果连接不存在，则抛出错误
   */
  get ws(): WebSocket {
    if (!this._ws) {
      throw new Error(noConnectionMessage);
    }
    return this._ws;
  }

  /**
   * 设置WebSocket连接并配置消息处理
   */
  set ws(ws: WebSocket) {
    this._ws = ws;

    // 设置消息处理
    this._ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        debugLog("收到WebSocket消息:", message);

        // 如果消息包含ID，则处理响应
        if (message.id && this.pendingMessages.has(message.id)) {
          const { resolve, timeout } = this.pendingMessages.get(message.id)!;
          clearTimeout(timeout);
          this.pendingMessages.delete(message.id);
          resolve(message.payload);
        }
      } catch (error) {
        debugLog("解析WebSocket消息出错:", error);
      }
    });

    // 设置错误处理
    this._ws.on("error", (error: Error) => {
      debugLog("WebSocket错误:", error);
    });

    // 设置关闭处理
    this._ws.on("close", () => {
      debugLog("WebSocket连接已关闭");
      this._ws = undefined;

      // 拒绝所有待处理的消息
      for (const { reject, timeout } of this.pendingMessages.values()) {
        clearTimeout(timeout);
        reject(new Error("WebSocket连接已关闭"));
      }
      this.pendingMessages.clear();
    });
  }

  /**
   * 检查是否存在WebSocket连接
   */
  hasWs(): boolean {
    return !!this._ws;
  }

  /**
   * 向浏览器扩展发送WebSocket消息
   * @param type 消息类型
   * @param payload 消息负载
   * @param options 选项，包括超时时间
   * @returns 消息响应
   */
  async sendSocketMessage<T extends string>(
    type: T,
    payload?: unknown,
    options: { timeoutMs?: number } = { timeoutMs: 30000 }
  ): Promise<unknown> {
    if (!this._ws) {
      throw new Error(noConnectionMessage);
    }

    return new Promise((resolve, reject) => {
      const id = generateId();
      const message = { id, type, payload };

      // 设置超时
      const timeout = setTimeout(() => {
        if (this.pendingMessages.has(id)) {
          this.pendingMessages.delete(id);
          reject(new Error("WebSocket消息响应超时"));
        }
      }, options.timeoutMs);

      // 存储消息回调
      this.pendingMessages.set(id, { resolve, reject, timeout });

      // 发送消息
      this._ws?.send(JSON.stringify(message), (err?: Error) => {
        if (err) {
          clearTimeout(timeout);
          this.pendingMessages.delete(id);
          reject(err);
        }
      });
    });
  }

  /**
   * 关闭WebSocket连接
   */
  async close() {
    if (!this._ws) {
      return;
    }

    // 清理所有待处理的消息
    for (const { timeout } of this.pendingMessages.values()) {
      clearTimeout(timeout);
    }
    this.pendingMessages.clear();

    // 关闭连接
    this._ws.close();
  }
}
