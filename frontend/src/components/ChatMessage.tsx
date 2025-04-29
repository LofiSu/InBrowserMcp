import React from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessage as ChatMessageType } from "../context/ChatContext";
import "./ChatMessage.scss";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content, pending, error, toolResults } = message;

  return (
    <div className={`chat-message ${role}`}>
      <div className="chat-message-avatar">{role === "user" ? "👤" : "🤖"}</div>
      <div className="chat-message-content">
        {pending ? (
          <div className="chat-message-pending">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : error ? (
          <div className="chat-message-error">
            <span className="error-title">错误</span>
            <span className="error-message">{error}</span>
          </div>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}

        {toolResults && toolResults.length > 0 && (
          <div className="tool-results">
            {toolResults.map((result, index) => (
              <div
                key={index}
                className={`tool-result ${result.isError ? "error" : ""}`}
              >
                <div className="tool-result-header">
                  <span className="tool-name">{result.name}</span>
                  <span
                    className={`tool-status ${
                      result.isError ? "error" : "success"
                    }`}
                  >
                    {result.isError ? "❌ 失败" : "✅ 成功"}
                  </span>
                </div>
                <div className="tool-result-content">
                  <ReactMarkdown>{result.result}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
