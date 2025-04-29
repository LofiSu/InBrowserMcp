// 导航工具
import {
  Tool,
  ToolParams,
  ToolResult,
  ToolValidationError,
  createTextResult,
} from "./tool";

export class NavigateTool implements Tool {
  name = "navigate";
  description = "导航到指定URL";

  async execute(params?: ToolParams): Promise<ToolResult> {
    // 验证参数
    if (!params?.url) {
      throw new ToolValidationError("缺少必要参数: url");
    }

    try {
      // 使用Chrome API导航到指定URL
      return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]?.id) {
            return reject(new Error("未找到活动标签页"));
          }

          chrome.tabs.update(
            tabs[0].id,
            { url: params.url as string },
            (tab) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else if (tab) {
                // 等待页面加载完成
                const checkComplete = () => {
                  if (!tab.id) {
                    return resolve(
                      createTextResult(
                        `无法检查页面加载状态，但已导航至 ${params.url}`
                      )
                    );
                  }

                  chrome.tabs.get(tab.id, (updatedTab) => {
                    if (chrome.runtime.lastError) {
                      reject(new Error(chrome.runtime.lastError.message));
                    } else if (updatedTab.status === "complete") {
                      resolve(createTextResult(`成功导航到: ${params.url}`));
                    } else {
                      // 继续等待页面加载
                      setTimeout(checkComplete, 500);
                    }
                  });
                };

                setTimeout(checkComplete, 500);
              } else {
                resolve(createTextResult(`导航请求已发送至: ${params.url}`));
              }
            }
          );
        });
      });
    } catch (error) {
      return createTextResult(`导航失败: ${(error as Error).message}`, true);
    }
  }
}

export class GoBackTool implements Tool {
  name = "goBack";
  description = "返回上一页";

  async execute(): Promise<ToolResult> {
    try {
      return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]?.id) {
            return reject(new Error("未找到活动标签页"));
          }

          chrome.tabs.goBack(tabs[0].id, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(createTextResult("返回上一页"));
            }
          });
        });
      });
    } catch (error) {
      return createTextResult(
        `返回上一页失败: ${(error as Error).message}`,
        true
      );
    }
  }
}

export class GoForwardTool implements Tool {
  name = "goForward";
  description = "前进到下一页";

  async execute(): Promise<ToolResult> {
    try {
      return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]?.id) {
            return reject(new Error("未找到活动标签页"));
          }

          chrome.tabs.goForward(tabs[0].id, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(createTextResult("前进到下一页"));
            }
          });
        });
      });
    } catch (error) {
      return createTextResult(`前进失败: ${(error as Error).message}`, true);
    }
  }
}
