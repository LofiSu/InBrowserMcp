// 快照工具，用于捕获页面状态
import { Tool, ToolResult, createTextResult } from "./tool";

export class SnapshotTool implements Tool {
  name = "snapshot";
  description = "捕获当前页面的ARIA快照和可访问性树";

  /**
   * 执行页面快照捕获
   */
  async execute(): Promise<ToolResult> {
    try {
      // 发送消息到内容脚本获取快照
      return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]?.id) {
            return reject(new Error("未找到活动标签页"));
          }

          chrome.tabs.sendMessage(
            tabs[0].id,
            { type: "GET_SNAPSHOT" },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else if (response.error) {
                reject(new Error(response.error));
              } else {
                resolve(
                  createTextResult(
                    `当前页面快照\n\`\`\`yaml\n${response.snapshot}\n\`\`\``
                  )
                );
              }
            }
          );
        });
      });
    } catch (error) {
      return createTextResult(
        `获取页面快照失败: ${(error as Error).message}`,
        true
      );
    }
  }
}
