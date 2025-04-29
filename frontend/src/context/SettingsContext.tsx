// 设置上下文管理
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  showSettings: boolean;
  toggleSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// 从存储中加载设置
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

// 保存设置到存储
const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // 初始化从存储加载的状态
  const [apiKey, setApiKeyState] = useState(() =>
    loadFromStorage("apiKey", "")
  );
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    loadFromStorage("theme", "light")
  );
  const [showSettings, setShowSettings] = useState(false);

  // 更新API密钥并存储
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    saveToStorage("apiKey", key);
  };

  // 切换主题并存储
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    saveToStorage("theme", newTheme);
  };

  // 切换设置面板显示
  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  // 应用主题到文档
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value = {
    apiKey,
    setApiKey,
    theme,
    toggleTheme,
    showSettings,
    toggleSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// 自定义钩子
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
