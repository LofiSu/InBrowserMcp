import React, { useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import Settings from "./Settings";
import "./ChatContainer.scss";

const ChatContainer: React.FC = () => {
  const { messages, isLoading, error, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 消息更新时滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Browser MCP</h2>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>欢迎使用Browser MCP</h3>
            <p>
              使用AI来自动化您的浏览器操作。输入指令告诉AI您想要执行的操作。
            </p>
            <div className="example-prompts">
              <p>示例：</p>
              <ul>
                <li>"获取当前页面的内容"</li>
                <li>"点击登录按钮"</li>
                <li>"在搜索框中输入'机器学习'"</li>
                <li>"跳转到 https://example.com"</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}

        {error && (
          <div className="error-message">
            <span>错误：{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>

      <Settings />
    </div>
  );
};

export default ChatContainer;
