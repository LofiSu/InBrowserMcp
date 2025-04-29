import { execSync } from "node:child_process";
import net from "node:net";

/**
 * 检查端口是否被占用
 * @param port 要检查的端口号
 * @returns 如果端口被占用返回true，否则返回false
 */
export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    // 创建测试服务器
    const server = net.createServer();
    // 如果出错，表示端口被占用
    server.once("error", () => resolve(true)); // 端口仍在使用中
    // 如果能监听，表示端口空闲
    server.once("listening", () => {
      server.close(() => resolve(false)); // 端口空闲
    });
    // 尝试监听端口
    server.listen(port);
  });
}

/**
 * 强制杀死占用指定端口的进程
 * @param port 端口号
 */
export function killProcessOnPort(port: number) {
  try {
    // 根据操作系统使用不同的命令
    if (process.platform === "win32") {
      // Windows系统
      execSync(
        `FOR /F "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /F /PID %a`
      );
    } else {
      // Unix/Linux/MacOS系统
      execSync(`lsof -ti:${port} | xargs kill -9`);
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
}

/**
 * 等待一段时间
 * @param ms 毫秒数
 * @returns Promise
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
