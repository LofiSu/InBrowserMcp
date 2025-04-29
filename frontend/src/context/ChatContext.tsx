// 聊天上下文管理
import React, { createContext, useContext, useState, ReactNode } from "react";
import { AiService, Message } from "../services/ai-service";
import { getToolByName } from "../tools";

// 消息类型
export interface ChatMessage extends Message {
  id: string;
  pending?: boolean;
  error?: string;
  toolResults?: Array<{
    name: string;
    result: string;
    isError?: boolean;
  }>;
}

// 聊天上下文类型
interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  apiKey: string;
  setApiKey: (key: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

// 创建上下文
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// 系统提示词
const SYSTEM_PROMPT = `你是一个浏览器自动化助手，可以通过API与用户当前浏览的网页进行交互。
你可以执行各种浏览器操作，包括：
1. 查看当前页面的内容（使用snapshot）
2. 点击按钮或链接（使用click）
3. 在输入框中输入文本（使用type）
4. 导航到特定URL（使用navigate）
5. 捕获屏幕截图（使用screenshot）
6. 在浏览器历史中前进和后退（使用goBack和goForward）

请理解用户意图并尽可能准确地执行操作。如果不确定用户想要什么，请先获取页面快照来了解当前页面状态。`;

// 提供者组件
export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");

  // 初始化AI服务
  const aiService = new AiService(apiKey);

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // 清除消息
  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  // 执行工具
  const executeTool = async (toolName: string, args?: Record<string, any>) => {
    const tool = getToolByName(toolName);
    if (!tool) {
      return {
        name: toolName,
        result: `未知工具: ${toolName}`,
        isError: true,
      };
    }

    try {
      const result = await tool.execute(args);
      return {
        name: toolName,
        result: result.content.map((c) => c.text || "").join("\n"),
        isError: result.isError,
      };
    } catch (error) {
      return {
        name: toolName,
        result: `工具执行失败: ${(error as Error).message}`,
        isError: true,
      };
    }
  };

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    if (!apiKey) {
      setError("请先设置API密钥");
      return;
    }

    // 创建用户消息
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
    };

    // 创建临时助手消息
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "思考中...",
      pending: true,
    };

    // 更新消息列表
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // 准备发送给AI的消息
      const aiMessages = messages
        .filter((m) => !m.pending)
        .map(({ role, content }) => ({ role, content }));

      // 添加新的用户消息
      aiMessages.push({ role: "user", content });

      // 发送消息到AI
      const response = await aiService.sendMessage(aiMessages, SYSTEM_PROMPT);

      // 处理工具调用
      const toolResults: Array<{
        name: string;
        result: string;
        isError?: boolean;
      }> = [];

      if (response.tools && response.tools.length > 0) {
        for (const tool of response.tools) {
          const result = await executeTool(tool.name, tool.args);
          toolResults.push(result);
        }
      }

      // 更新助手消息
      setMessages((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((m) => m.id === assistantMessage.id);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            content: response.text || "我理解了",
            pending: false,
            toolResults: toolResults.length > 0 ? toolResults : undefined,
          };
        }
        return updated;
      });
    } catch (error) {
      // 处理错误
      setError((error as Error).message);
      setMessages((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((m) => m.id === assistantMessage.id);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            content: "发生错误",
            pending: false,
            error: (error as Error).message,
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    messages,
    isLoading,
    error,
    apiKey,
    setApiKey,
    sendMessage,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// 自定义钩子
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
