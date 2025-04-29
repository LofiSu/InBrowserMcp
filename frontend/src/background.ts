// 后台脚本，处理浏览器扩展的全局状态和消息

// 消息类型定义
type MessageType =
  | { type: "EXECUTE_TOOL"; payload: { name: string; params: any } }
  | { type: "GET_SNAPSHOT" }
  | { type: "GET_URL" }
  | { type: "GET_TITLE" };

// 监听来自内容脚本或popup页面的消息
chrome.runtime.onMessage.addListener(
  (message: MessageType, _sender, sendResponse) => {
    console.log("Background script received message:", message);

    // 根据消息类型处理不同操作
    switch (message.type) {
      case "EXECUTE_TOOL":
        // 转发工具执行请求到活动标签页
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              { type: "EXECUTE_TOOL", payload: message.payload },
              (response) => {
                sendResponse(response);
              }
            );
          } else {
            sendResponse({ error: "No active tab found" });
          }
        });
        // 需要异步响应，返回true
        return true;

      // 其他消息类型处理...
      default:
        sendResponse({ error: "Unknown message type" });
    }
  }
);

// 初始化扩展
console.log("Browser MCP Extension background script initialized");

// 让TypeScript将此文件视为模块
export {};
