// 浏览器交互工具
import {
  Tool,
  ToolParams,
  ToolResult,
  ToolValidationError,
  createTextResult,
} from "./tool";

// 点击工具
export class ClickTool implements Tool {
  name = "click";
  description = "点击页面上的元素";

  async execute(params?: ToolParams): Promise<ToolResult> {
    // 验证参数
    if (!params?.element) {
      throw new ToolValidationError("缺少必要参数: element");
    }

    try {
      // 发送消息到内容脚本执行点击
      return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]?.id) {
            return reject(new Error("未找到活动标签页"));
          }

          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              type: "EXECUTE_TOOL",
              payload: {
                name: "click",
                params: { element: params.element },
              },
            },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else if (!response.success) {
                reject(new Error(response.message));
              } else {
                resolve(createTextResult(response.message));
              }
            }
          );
        });
      });
    } catch (error) {
      return createTextResult(`点击失败: ${(error as Error).message}`, true);
    }
  }
}

// 输入工具
export class TypeTool implements Tool {
  name = "type";
  description = "在页面元素中输入文本";

  async execute(params?: ToolParams): Promise<ToolResult> {
    // 验证参数
    if (!params?.element) {
      throw new ToolValidationError("缺少必要参数: element");
    }
    if (!params?.text) {
      throw new ToolValidationError("缺少必要参数: text");
    }

    try {
      // 发送消息到内容脚本执行输入
      return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]?.id) {
            return reject(new Error("未找到活动标签页"));
          }

          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              type: "EXECUTE_TOOL",
              payload: {
                name: "type",
                params: {
                  element: params.element,
                  text: params.text,
                },
              },
            },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else if (!response.success) {
                reject(new Error(response.message));
              } else {
                resolve(createTextResult(response.message));
              }
            }
          );
        });
      });
    } catch (error) {
      return createTextResult(`输入失败: ${(error as Error).message}`, true);
    }
  }
}
