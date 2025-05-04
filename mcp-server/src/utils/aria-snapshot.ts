import { ToolResult } from "../types/tools.js";
import { Context } from "../types/context.js";


export async function captureAriaSnapshot(
  context: Context,
  status: string = "",
): Promise<ToolResult> {
  // 检查浏览器 API 是否可用 (由 mcpContext 内部管理)
  if (!context.isConnected()) {
    return {
      content: [
        {
          type: "text",
          text: `浏览器插件未连接，无法获取页面快照。请确保插件已安装并运行。`,
        },
      ],
    };
  }

  try {
    // 从 context 获取 URL 和 Title
    const { url, title } = await context.getBrowserState();

    // 通过浏览器动作获取快照
    // 注意：这里假设插件 API 需要 'snapshot' 类型的消息
    const snapshot = await context.sendBrowserAction("snapshot", {});

    // 检查快照返回值是否有效
    if (snapshot === null || snapshot === undefined) {
      return {
        content: [
          {
            type: "text",
            text: `无法从插件获取页面快照。插件可能未正确响应或页面状态异常。`,
          },
        ],
      };
    }

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
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `捕获页面快照时出错: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
