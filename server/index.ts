#!/usr/bin/env node
import { Command } from "commander";
import { Server } from "./server";
import { tools } from "./tools/index";
import { appConfig } from "./config/app.config";
import { debugLog } from "./utils/log";

// 读取package.json中的版本信息
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取package.json
const packageJsonPath = join(__dirname, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

// 创建命令行程序
const program = new Command();

// 配置命令行选项
program
  .name("in-browser-mcp-server")
  .description("浏览器MCP服务器")
  .version(packageJson.version)
  .option(
    "-p, --port <number>",
    "WebSocket服务器端口",
    String(appConfig.defaultWsPort)
  );

// 主命令
program.action(async (options) => {
  try {
    const port = parseInt(options.port, 10);

    // 创建服务器
    const server = new Server({
      name: appConfig.name,
      version: packageJson.version,
      tools: [
        // 导航工具
        tools.navigate(true),
        tools.goBack(true),
        tools.goForward(true),

        // 交互工具
        tools.click,
        tools.type,
        tools.pressKey,
        tools.wait,

        // 快照工具
        tools.snapshot,
        tools.screenshot,
      ],
    });

    // 启动服务器
    await server.start(port);

    debugLog(`服务器已启动，监听端口: ${port}`);
    debugLog("按 Ctrl+C 停止服务器");

    // 处理退出信号
    process.on("SIGINT", async () => {
      debugLog("接收到退出信号，正在关闭服务器...");
      await server.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      debugLog("接收到终止信号，正在关闭服务器...");
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    debugLog("启动服务器时出错:", error);
    process.exit(1);
  }
});

// 解析命令行参数
program.parse(process.argv);
