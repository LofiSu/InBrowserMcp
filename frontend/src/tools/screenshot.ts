// 截图工具
import { Tool, ToolResult, createImageResult } from "./tool";

export class ScreenshotTool implements Tool {
  name = "screenshot";
  description = "捕获当前页面的截图";

  async execute(): Promise<ToolResult> {
    try {
      // 使用Chrome API捕获截图
      return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]?.id) {
            return reject(new Error("未找到活动标签页"));
          }

          chrome.tabs.captureVisibleTab({ format: "png" }, (dataUrl) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(createImageResult(dataUrl, "页面截图"));
            }
          });
        });
      });
    } catch (error) {
      return {
        content: [
          { type: "text", text: `截图失败: ${(error as Error).message}` },
        ],
        isError: true,
      };
    }
  }
}
