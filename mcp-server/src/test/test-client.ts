import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { debugLog } from "../utils/log.js";

/**
 * 测试 MCP 客户端
 * 此文件演示如何创建 MCP 客户端并与服务器进行交互
 */

// 服务器地址
const SERVER_URL = "http://localhost:3000/mcp";

/**
 * 创建并初始化 MCP 客户端
 */
async function createClient() {
  // 创建传输层
  const transport = new StreamableHTTPClientTransport(new URL(SERVER_URL));

  // 创建客户端
  const client = new Client({
    name: "MCP Test Client",
    version: "1.0.0"
  });
  
  // 连接到传输层
  await client.connect(transport);
  debugLog("✅ 客户端已连接到服务器");

  // 获取可用工具列表
  const tools = await client.listTools();
  debugLog("🔧 可用工具列表:", tools);

  return { client, transport };
}

/**
 * 执行工具调用示例
 */
async function runToolExample() {
  const { client, transport } = await createClient();

  try {
    // 示例：使用导航工具
    const navigateResult = await client.callTool({
      name: "navigate",
      params: { url: "https://www.bilibili.com" }
    });
    debugLog("➡️ 导航结果:", navigateResult);

    // 示例：使用快照工具
    const snapshotResult = await client.callTool({
      name: "snapshot",
      params: {}
    });
    debugLog("📸 快照结果:", snapshotResult);

    // 关闭连接
    await transport.close();
    debugLog("👋 连接已关闭");
  } catch (error) {
    debugLog("❌ 工具调用错误:", error);
    await transport.close();
  }
}

// 运行示例
runToolExample().catch(error => {
  debugLog("❌ 运行示例时出错:", error);
});