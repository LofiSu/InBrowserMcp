import { WebSocket, WebSocketServer } from "ws";
// 导入配置和工具函数
import { appConfig } from "./config/app.config.js";
import { isPortInUse, killProcessOnPort, wait } from "./utils/port.js";
import { debugLog } from "./utils/log.js";

/**
 * 创建WebSocket服务器
 * @param port 服务器端口号，默认使用配置中的端口
 * @returns 创建好的WebSocketServer实例
 */
export async function createWebSocketServer(
  port: number = appConfig.defaultWsPort
): Promise<WebSocketServer> {
  debugLog(`尝试在端口 ${port} 上创建WebSocket服务器...`);

  // 尝试杀死可能占用端口的进程
  killProcessOnPort(port);

  // 等待端口释放
  while (await isPortInUse(port)) {
    debugLog(`端口 ${port} 仍在使用中，等待...`);
    await wait(100);
  }

  // 创建WebSocket服务器
  const wss = new WebSocketServer({ port });

  // 设置WebSocket服务器事件处理
  wss.on("listening", () => {
    debugLog(`WebSocket服务器正在监听端口 ${port}`);
  });

  wss.on("error", (error: Error) => {
    debugLog(`WebSocket服务器错误:`, error);
  });

  // 返回创建的WebSocket服务器
  return wss;
}

/**
 * 启动WebSocket服务器
 * @param port 服务器端口号
 * @returns 创建好的WebSocketServer实例
 */
export const startWsServer = async (port: number): Promise<WebSocketServer> => {
  if (!port) {
    throw new Error("端口号是必需的");
  }

  // 复用createWebSocketServer函数创建服务器
  const wss = await createWebSocketServer(port);

  // 添加连接事件处理
  wss.on("connection", (ws: WebSocket) => {
    debugLog("新的WebSocket客户端连接");

    ws.on("message", (message: string) => {
      debugLog(`收到消息: ${message}`);
      // 这里可以添加消息处理逻辑
    });

    ws.on("close", () => {
      debugLog("WebSocket客户端断开连接");
    });

    ws.on("error", (error: Error) => {
      debugLog("WebSocket客户端错误:", error);
    });
  });

  return wss;
};
