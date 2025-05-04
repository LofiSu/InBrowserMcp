// AI指令服务接口

// 服务器配置
const API_BASE_URL = 'http://localhost:3000';

// 会话ID管理

// 服务器事件数据接口
export interface ServerEventData {
  type: string;
  data: any;
}
let currentSessionId: string | null = null;

export const setSessionId = (sessionId: string) => {
  currentSessionId = sessionId;
};

export const getSessionId = () => currentSessionId;

// 事件回调类型
export type EventCallback = (data: any) => void; // 回调函数接收解析后的 data

// 存储事件回调
// 使用 ServerEventData['type'] 作为键，确保类型安全
const eventCallbacks: Record<string, EventCallback[]> = {};

// 注册事件监听器
export const addEventListener = (eventType: string, callback: EventCallback) => {
  if (!eventCallbacks[eventType]) {
    eventCallbacks[eventType] = [];
  }
  eventCallbacks[eventType].push(callback);
};

// 移除事件监听器
export const removeEventListener = (eventType: string, callback: EventCallback) => {
  if (eventCallbacks[eventType]) {
    eventCallbacks[eventType] = eventCallbacks[eventType].filter(cb => cb !== callback);
  }
};

// AI指令处理接口
export interface AICommandResponse {
  message?: string;
  error?: string;
}

// 发送AI指令到服务器
export const sendAICommand = async (command: string): Promise<AICommandResponse> => {
  if (!currentSessionId) {
    throw new Error('No active session ID found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai-command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command,
        sessionId: currentSessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process AI command');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending AI command:', error);
    throw error;
  }
};

// 初始化MCP会话
export const initializeMCPSession = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        // ! 初始化时 params 不能为空
        // ? 参见：https://github.com/modelcontextprotocol/typescript-sdk/issues/412
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: {
            name: "ExampleClient",
            version: "1.0.0",
          },
        },
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize MCP session');
    }

    const sessionId = response.headers.get('mcp-session-id');
    if (!sessionId) {
      throw new Error('No session ID received from server');
    }

    setSessionId(sessionId);
    console.log('MCP session initialized with ID:', sessionId);

    // 添加短暂延迟，确保后端有足够时间完成会话初始化
    await new Promise((resolve) => setTimeout(resolve, 100));

    // ! 客户端需要回传 notification 表示会话已初始化
    // ? 参见：https://modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle#lifecycle-phases
    // 发送 initialized 通知，并添加错误处理
    try {
      const notificationResponse = await fetch(
        `${API_BASE_URL}/mcp?sessionId=${encodeURIComponent(sessionId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "notifications/initialized",
          }),
        }
      );

      if (!notificationResponse.ok) {
        // 如果响应状态不为 OK，记录错误信息
        const errorText = await notificationResponse.text(); // 尝试获取文本以了解更多信息
        console.error(
          `Failed to send initialized notification. Status: ${notificationResponse.status}, Response: ${errorText}`
        );
        // 可以选择抛出错误或仅记录
        // throw new Error(`Failed to send initialized notification. Status: ${notificationResponse.status}`);
      } else {
        console.log('Successfully sent initialized notification.');
      }
    } catch (error) {
      // 处理 fetch 本身的网络错误等
      console.error('Error sending initialized notification:', error);
      // 可以选择重新抛出错误或进行其他处理
      // throw error;
    }
    // 建立事件流连接，将 sessionId 作为查询参数传递
    const eventSourceUrl = `${API_BASE_URL}/mcp?sessionId=${encodeURIComponent(sessionId)}`;
    console.log(`Connecting to EventSource: ${eventSourceUrl}`);
    const eventSource = new EventSource(eventSourceUrl, {
      // 注意：标准 EventSource 不支持自定义 header，所以我们用 query param
      // 如果需要 header，需要使用 fetch + ReadableStream 或特定库
      withCredentials: false, // 修改为false，避免CORS复杂请求问题
    });
    console.log('EventSource connection established');

    eventSource.onmessage = (event) => {
      console.log('Received event:', event.data);
      try {
        // 尝试解析为 ServerEventData 结构
        const parsedData: ServerEventData = JSON.parse(event.data);
        // 确保解析后的数据包含 type 字段
        if (parsedData && typeof parsedData.type === 'string') {
          const eventType = parsedData.type;
          const eventPayload = parsedData.data;
          // 根据事件类型分发给对应的回调
          if (eventCallbacks[eventType]) {
            eventCallbacks[eventType].forEach(callback => callback(eventPayload));
          }
        } else {
          console.warn('Received event data without a valid type:', event.data);
        }
      } catch (error) {
        console.error('Error parsing event data:', error, 'Raw data:', event.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

  } catch (error) {
    console.error('Error initializing MCP session:', error);
    throw error;
  }
};