import { Context } from "../context";
import { ToolResult } from "../tools/tool";

/**
 * 获取页面的ARIA可访问性快照
 * 包含页面URL、标题和DOM结构
 *
 * @param context 上下文对象，用于发送WebSocket消息
 * @param status 可选的状态信息，将显示在快照前
 * @returns 包含文本格式快照的工具结果
 */
export async function captureAriaSnapshot(
  context: Context,
  status: string = ""
): Promise<ToolResult> {
  // 获取当前页面URL
  const url = await context.sendSocketMessage("getUrl");
  // 获取当前页面标题
  const title = await context.sendSocketMessage("getTitle");
  // 获取页面DOM快照
  const snapshot = await context.sendSocketMessage("browser_snapshot");

  // 格式化并返回结果
  return {
    content: [
      {
        type: "text",
        text: `${status ? `${status}\n` : ""}
- Page URL: ${url}
- Page Title: ${title}
- Page Snapshot
\`\`\`yaml
${snapshot}
\`\`\`
`,
      },
    ],
  };
}
