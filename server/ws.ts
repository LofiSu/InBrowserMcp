// 导入WebSocket服务器类型定义
import type { Server } from "ws";
// 导入配置和工具函数
import { appConfig } from "./config/app.config.js";
import { isPortInUse, killProcessOnPort, wait } from "./utils/port.js";
import { debugLog } from "./utils/log.js";
import WebSocket from "ws";

/**
 * 创建WebSocket服务器
 * @param port 服务器端口号，默认使用配置中的端口
 * @returns 创建好的WebSocketServer实例
 */
export async function createWebSocketServer(
  port: number = appConfig.defaultWsPort
): Promise<Server> {
  debugLog(`尝试在端口 ${port} 上创建WebSocket服务器...`);

  // 尝试杀死可能占用端口的进程
  killProcessOnPort(port);

  // 等待端口释放
  while (await isPortInUse(port)) {
    debugLog(`端口 ${port} 仍在使用中，等待...`);
    await wait(100);
  }

  // 创建WebSocket服务器
  const wss = new WebSocket.Server({ port });

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

// 启动WebSocket服务器
export const startWsServer = async (port: number) => {
  if (!port) {
    throw new Error("Port is required");
  }

  const wss = new WebSocket.Server({ port });

  // ... existing code ...
};
