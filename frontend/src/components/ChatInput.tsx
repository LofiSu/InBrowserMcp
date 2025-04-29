import React, { useState, useRef, useEffect } from "react";
import "./ChatInput.scss";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // 处理消息发送
  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue("");

      // 重置文本区域高度
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 在组件挂载时聚焦输入框
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="chat-input">
      <textarea
        ref={textareaRef}
        className="textarea"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="输入消息，回车发送..."
        disabled={isLoading}
        rows={1}
      />
      <button
        className="send-button"
        onClick={handleSendMessage}
        disabled={!inputValue.trim() || isLoading}
      >
        {isLoading ? (
          <span className="loading-icon"></span>
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatInput;
