import { useState, useEffect } from "react"
import { Play, Clock, Settings, Loader2 } from "lucide-react"
import ThinkingDots from "./components/thinking-dots"
import EnvConfigModal from "./components/env-config-modal"
import HistoryModal from "./components/history-modal"
import { initializeMCPSession, sendAICommand, addEventListener, removeEventListener } from "./service"

// 定义从服务器接收的事件数据类型
interface ServerEventData {
  // 根据后端实际发送的数据结构定义，这里先用 unknown 或具体类型
  // 例如: message?: string; details?: any; code?: number; 
  [key: string]: unknown; // 允许任意属性，但值为 unknown
}


export default function InBrowserMcp() {
  const [showEnvConfig, setShowEnvConfig] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [history, setHistory] = useState<Array<{ id: number; command: string; timestamp: string; result: string }>>([])  

  const clearHistory = () => {
    setHistory([])
  }

  const deleteHistoryItem = (id: number) => {
    setHistory((prev) => prev.filter(item => item.id !== id))
  }

  // 初始化MCP会话和事件监听
  useEffect(() => {
    initializeMCPSession().catch(error => {
      console.error("Failed to initialize MCP session:", error);
      setResult(`错误：无法初始化MCP会话 - ${error.message}`);
    });

    const handleMessage = (data: ServerEventData) => {
      console.log("Received message event:", data);
      // 逐步更新结果，模拟流式输出
      setResult(prevResult => (prevResult ? prevResult + "\n" : "") + JSON.stringify(data)); 
      setIsThinking(false); // 收到消息认为思考结束，可以根据需要调整
    };

    const handleError = (data: ServerEventData) => {
      console.error("Received error event:", data);
      setResult(prevResult => (prevResult ? prevResult + "\n" : "") + `错误: ${JSON.stringify(data)}`);
      setIsThinking(false);
    };

    // 注册事件监听器
    addEventListener('message', handleMessage);
    addEventListener('error', handleError);

    // 清理函数：移除事件监听器
    return () => {
      removeEventListener('message', handleMessage);
      removeEventListener('error', handleError);
    };
  }, []); // 空依赖数组确保只在挂载和卸载时运行

  // 执行命令
  const executeCommand = async () => {
    if (!inputValue.trim()) return;

    const commandToSend = inputValue;
    setInputValue(''); // 清空输入框
    setIsThinking(true);
    setResult(null); // 清空之前的结果

    try {
      // 调用service中的函数发送命令
      const response = await sendAICommand(commandToSend);
      console.log('AI Command Response:', response);
      // 初始响应可能只包含确认信息，实际结果通过SSE推送
      // setResult(response.message || '命令已发送'); 
      // 暂时注释掉，因为结果主要通过SSE更新

      // 添加到历史记录 (可以在收到最终结果时再添加，或者立即添加)
      const newHistoryItem = {
        id: Date.now(),
        command: commandToSend,
        timestamp: new Date().toLocaleString(),
        result: "处理中...", // 初始状态，会被SSE更新
      };
      setHistory((prev) => [newHistoryItem, ...prev]);

    } catch (error: any) {
      console.error('Error executing command:', error);
      setResult(`执行命令时出错: ${error.message}`);
      setIsThinking(false);
      // 添加错误记录到历史
      const errorHistoryItem = {
        id: Date.now(),
        command: commandToSend,
        timestamp: new Date().toLocaleString(),
        result: `错误: ${error.message}`,
      };
      setHistory((prev) => [errorHistoryItem, ...prev]);
    } 
    // 注意：setIsThinking(false) 的调用移到了事件处理中，或者在超时后设置
    // 可以加一个超时逻辑，如果在一定时间内没有收到SSE消息，则停止思考动画
    // setTimeout(() => setIsThinking(false), 10000); // 例如10秒超时
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gradient-to-b from-pink-50 to-purple-50 min-h-screen rounded-lg">
      {/* Header with cute design */}
      <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl shadow-sm border border-pink-200">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
            InBrowserMcp
          </h1>
        </div>
      </div>

      {/* Title with Settings Button */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-pink-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">
          AI驱动的浏览器自动化工具
          <a href="#" className="text-blue-500 hover:text-blue-600 ml-2 text-sm underline decoration-dotted">
            了解更多
          </a>
        </h2>
        <button
          onClick={() => setShowEnvConfig(true)}
          className="bg-gradient-to-r from-pink-400 to-purple-400 p-2 rounded-full text-white shadow-sm hover:shadow-md transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Input Area */}
      <div className="border border-pink-200 rounded-xl p-4 mb-6 relative bg-white shadow-sm">
        <div className="flex items-start">
          <div className="p-1 text-pink-400 mr-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <textarea
            className="flex-1 outline-none resize-none min-h-[40px] bg-transparent"
            placeholder="请输入您想要执行的操作..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                executeCommand()
              }
            }}
            disabled={isThinking}
          />
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            className={`bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full px-4 py-1.5 flex items-center shadow-md hover:shadow-lg transition-all text-sm min-w-[80px] justify-center`}
            onClick={executeCommand}
            disabled={isThinking}
          >
            {isThinking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                运行中
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1 fill-white" />
                运行
              </>
            )}
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-1.5 flex items-center shadow-sm hover:shadow transition-all"
            disabled={isThinking}
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Area */}
      <div className="border border-pink-200 rounded-xl p-4 min-h-[300px] bg-white shadow-sm">
        <div className="flex items-center mb-3">
          <div className="w-3 h-3 rounded-full bg-pink-400 mr-1 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-purple-400 mr-1 animate-pulse delay-100"></div>
          <div className="w-3 h-3 rounded-full bg-blue-400 mr-1 animate-pulse delay-200"></div>
          <h3 className="text-sm font-medium text-gray-700 ml-2">模型输出</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg min-h-[250px] text-gray-600 whitespace-pre-line">
          {isThinking ? (
            <div className="flex items-center">
              <span className="text-gray-500">思考中</span>
              <ThinkingDots />
            </div>
          ) : result ? (
            <div className="animate-fadeIn">{result}</div>
          ) : (
            "这里将显示模型的思考过程和结果"
          )}
        </div>
      </div>

      {/* Environment Config Modal */}
      {showEnvConfig && <EnvConfigModal onClose={() => setShowEnvConfig(false)} />}

      {/* History Modal */}
      {showHistory && (
        <HistoryModal
          onClose={() => setShowHistory(false)}
          history={history}
          onClearHistory={clearHistory}
          onDeleteHistoryItem={deleteHistoryItem}
        />
      )}
    </div>
  )
}
