// 内容脚本，用于在网页内执行操作

// 消息类型定义
type MessageType =
  | { type: "EXECUTE_TOOL"; payload: { name: string; params: any } }
  | { type: "GET_SNAPSHOT" }
  | { type: "GET_URL" }
  | { type: "GET_TITLE" };

// 创建ARIA快照，提取页面结构
const captureAriaSnapshot = (): string => {
  // 创建一个可访问性树快照
  const snapshot: string[] = [];

  // 提取标题和URL信息
  snapshot.push(`title: ${document.title}`);
  snapshot.push(`url: ${window.location.href}`);

  // 提取可交互元素
  const interactiveElements = document.querySelectorAll(
    "button, a, input, select, textarea"
  );
  snapshot.push("elements:");

  Array.from(interactiveElements).forEach((element, index) => {
    const el = element as HTMLElement;
    const tagName = el.tagName.toLowerCase();
    const text = el.innerText || el.textContent || "";
    const id = el.id ? `id="${el.id}"` : "";
    const ariaLabel = el.getAttribute("aria-label")
      ? `aria-label="${el.getAttribute("aria-label")}"`
      : "";
    const placeholder =
      el instanceof HTMLInputElement && el.placeholder
        ? `placeholder="${el.placeholder}"`
        : "";
    const name = el.getAttribute("name")
      ? `name="${el.getAttribute("name")}"`
      : "";

    snapshot.push(
      `  - ${index}: <${tagName} ${id} ${name} ${ariaLabel} ${placeholder}>${text.trim()}</${tagName}>`
    );
  });

  return snapshot.join("\n");
};

// 单击元素
const clickElement = (
  selector: string
): { success: boolean; message: string } => {
  try {
    // 尝试查找元素
    const element = document.querySelector(selector);
    if (!element) {
      return { success: false, message: `元素未找到: ${selector}` };
    }

    // 创建点击事件并分发
    (element as HTMLElement).click();
    return { success: true, message: `成功点击元素: ${selector}` };
  } catch (error) {
    return { success: false, message: `点击失败: ${(error as Error).message}` };
  }
};

// 在元素上输入文本
const typeIntoElement = (
  selector: string,
  text: string
): { success: boolean; message: string } => {
  try {
    const element = document.querySelector(selector) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    if (!element) {
      return { success: false, message: `元素未找到: ${selector}` };
    }

    // 焦点事件
    element.focus();

    // 清除现有内容
    element.value = "";

    // 设置新值
    element.value = text;

    // 触发输入事件
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));

    return { success: true, message: `成功在元素 ${selector} 中输入文本` };
  } catch (error) {
    return { success: false, message: `输入失败: ${(error as Error).message}` };
  }
};

// 处理消息
chrome.runtime.onMessage.addListener(
  (message: MessageType, _sender, sendResponse) => {
    console.log("Content script received message:", message);

    switch (message.type) {
      case "EXECUTE_TOOL":
        const { name, params } = message.payload;

        // 根据工具名称执行相应操作
        switch (name) {
          case "click":
            sendResponse(clickElement(params.element));
            break;

          case "type":
            sendResponse(typeIntoElement(params.element, params.text));
            break;

          // 其他工具实现...

          default:
            sendResponse({ success: false, message: `未知工具: ${name}` });
        }
        break;

      case "GET_SNAPSHOT":
        sendResponse({ snapshot: captureAriaSnapshot() });
        break;

      case "GET_URL":
        sendResponse({ url: window.location.href });
        break;

      case "GET_TITLE":
        sendResponse({ title: document.title });
        break;

      default:
        sendResponse({ error: "未知消息类型" });
    }

    // 表明我们会异步发送响应
    return true;
  }
);

console.log("Browser MCP Extension content script initialized");

// 让TypeScript将此文件视为模块
export {};
