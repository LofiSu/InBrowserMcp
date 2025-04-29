import React, { useState } from "react";
import { useSettings } from "../context/SettingsContext";
import "./Settings.scss";

const Settings: React.FC = () => {
  const {
    apiKey,
    setApiKey,
    theme,
    toggleTheme,
    showSettings,
    toggleSettings,
  } = useSettings();
  const [inputApiKey, setInputApiKey] = useState(apiKey);

  const handleSaveApiKey = () => {
    setApiKey(inputApiKey);
  };

  if (!showSettings) {
    return (
      <button className="settings-toggle" onClick={toggleSettings}>
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
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    );
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>设置</h3>
        <button className="close-button" onClick={toggleSettings}>
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
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-group">
          <label htmlFor="api-key">OpenAI API密钥</label>
          <div className="api-key-input">
            <input
              id="api-key"
              type="password"
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              placeholder="输入您的API密钥"
            />
            <button
              className="save-button"
              onClick={handleSaveApiKey}
              disabled={!inputApiKey.trim() || inputApiKey === apiKey}
            >
              保存
            </button>
          </div>
          <p className="help-text">
            请输入您的OpenAI
            API密钥来使用AI功能。密钥将安全地存储在本地浏览器中。
          </p>
        </div>

        <div className="settings-group">
          <label>主题</label>
          <div className="theme-toggle">
            <span className={theme === "light" ? "active" : ""}>浅色</span>
            <button
              className={`toggle-button ${theme === "dark" ? "active" : ""}`}
              onClick={toggleTheme}
            >
              <span className="toggle-thumb"></span>
            </button>
            <span className={theme === "dark" ? "active" : ""}>深色</span>
          </div>
        </div>

        <div className="settings-group">
          <label>关于</label>
          <p className="about-text">
            Browser MCP 扩展 v1.0.0
            <br />
            使用AI直接在浏览器中自动化网页操作。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
