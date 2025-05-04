import { debugLog } from './log.js';
// import { v4 as uuidv4 } from 'uuid'; // Removed UUID dependency for now

// Ensure chrome types are available (install @types/chrome if needed)
declare const chrome: any;

/**
 * MCP上下文
 * 提供与浏览器插件API交互的接口
 */
export class McpContext {

  constructor() {
    debugLog('🔧 McpContext initialized for browser extension interaction.');
    // No WebSocket server initialization needed
  }

  /**
   * 发送指令到浏览器插件的内容脚本或背景脚本
   * @param type 指令类型 (例如 'navigate', 'click', 'getSnapshot')
   * @param payload 指令参数
   * @param target 'content' 或 'background' (默认为 'content')
   * @returns 插件执行结果
   * @throws 如果与插件通信失败或插件返回错误
   */
  async sendBrowserAction(type: string, payload: any, target: 'content' | 'background' = 'content'): Promise<any> {
    debugLog(`🚀 Sending browser action: Type=${type}, Target=${target}, Payload=`, payload);

    try {
      if (target === 'content') {
        // 获取当前活动标签页
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs || tabs.length === 0 || !tabs[0].id) {
          throw new Error('No active tab found to send action to content script.');
        }
        const activeTabId = tabs[0].id;

        // 向活动标签页的内容脚本发送消息
        // 内容脚本需要设置监听器 chrome.runtime.onMessage.addListener
        debugLog(`📬 Sending message to content script in tab ${activeTabId}`);
        const response = await chrome.tabs.sendMessage(activeTabId, { type, payload });
        debugLog(`✅ Received response from content script for action ${type}:`, response);
        if (response && response.error) {
          throw new Error(`Content script error for action ${type}: ${response.error}`);
        }
        return response?.result; // 假设响应格式为 { result: ... } 或 { error: ... }

      } else { // target === 'background'
        // 向背景脚本发送消息
        // 背景脚本需要设置监听器 chrome.runtime.onMessage.addListener
        debugLog(`📬 Sending message to background script`);
        const response = await chrome.runtime.sendMessage({ type, payload });
        debugLog(`✅ Received response from background script for action ${type}:`, response);
        if (response && response.error) {
          throw new Error(`Background script error for action ${type}: ${response.error}`);
        }
        return response?.result;
      }

    } catch (error: any) {
      debugLog(`❌ Error sending browser action ${type} to ${target}:`, error);
      // 区分是发送错误还是插件内部错误
      if (error.message.includes('Could not establish connection') || error.message.includes('Receiving end does not exist')) {
        throw new Error(`Failed to communicate with ${target} script for action ${type}. Ensure the script is injected/running and listening.`);
      } else {
        throw new Error(`Error during browser action ${type}: ${error.message}`);
      }
    }
  }

  /**
   * 获取浏览器当前状态 (URL 和 Title)
   * @returns 状态对象
   */
  async getBrowserState(): Promise<{ connected: boolean; url?: string; title?: string }> {
    debugLog('ℹ️ Getting browser state...');
    try {
      // 检查是否能访问 tabs API
      if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
        debugLog('⚠️ Chrome Tabs API not available.');
        return { connected: false };
      }
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0 && tabs[0]) {
        const activeTab = tabs[0];
        debugLog(`✅ Active tab found: URL=${activeTab.url}, Title=${activeTab.title}`);
        return { connected: true, url: activeTab.url, title: activeTab.title };
      } else {
        debugLog('⚠️ No active tab found.');
        return { connected: false }; // 没有活动标签页，视为未连接或不可操作
      }
    } catch (error: any) {
      debugLog('❌ Error getting browser state:', error);
      // 权限错误等可能导致异常
      return { connected: false }; // 获取失败意味着无法交互
    }
  }

  /**
   * 检查是否可以与浏览器插件交互
   * 在浏览器扩展上下文中，后台脚本通常被认为是“连接的”
   * 可以添加权限检查等
   */
  isConnected(): boolean {
    // Check if the necessary chrome APIs are available
    const connected = typeof chrome !== 'undefined' && chrome.runtime && chrome.tabs;
    if (!connected) {
        debugLog('⚠️ Chrome runtime or tabs API not available. Assuming disconnected.');
    }
    return connected;
  }

  /**
   * 关闭/清理资源 (如果需要)
   */
  close(): void {
    debugLog('🧹 McpContext closing (if any cleanup needed)...');
    // No WebSocket connections to close.
    // Add any other cleanup logic here if necessary (e.g., remove listeners).
  }
}

// 创建并导出 McpContext 的单例
export const mcpContext = new McpContext();

// 移除 SIGINT/SIGTERM 处理，因为后台脚本的生命周期由浏览器管理
// process.on('SIGINT', () => { ... });
// process.on('SIGTERM', () => { ... });