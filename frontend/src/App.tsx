import { useState, useEffect } from "react"
import { Play, Clock, Settings, Loader2, CheckCircle, XCircle } from "lucide-react" // 移除 StopCircle
import ThinkingDots from "./components/thinking-dots"
import EnvConfigModal from "./components/env-config-modal"
import HistoryModal from "./components/history-modal"
import { initializeMCPSession, sendAICommand, addEventListener, removeEventListener, sendCancelCommand } from "./service"

// 定义从服务器接收的事件数据类型
interface ServerEventData {
  // 根据后端实际发送的数据结构定义，这里先用 unknown 或具体类型
  // 例如: message?: string; details?: any; code?: number;
  [key: string]: unknown; 
}

// 定义运行状态类型
type RunStatus = 'idle' | 'running' | 'success' | 'error';

export default function InBrowserMcp() {
  const [showEnvConfig, setShowEnvConfig] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [result, setResult] = useState<string | null>(null)
  // const [isThinking, setIsThinking] = useState(false) // 使用 runStatus 替代
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [history, setHistory] = useState<Array<{ id: number; command: string; timestamp: string; result: string }>>([])
  const [currentCommandId, setCurrentCommandId] = useState<number | null>(null); // 用于追踪当前命令，以便更新历史记录

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
      setRunStatus('error'); // 初始化失败设为错误状态
    });

    const handleMessage = (data: ServerEventData) => {
      console.log("Received message event:", data);
      const messageString = JSON.stringify(data);
      setResult(prevResult => (prevResult ? prevResult + "\n" : "") + messageString);
      // 假设成功的消息意味着运行成功
      setRunStatus('success');
      // 更新对应历史记录的状态
      if (currentCommandId) {
        setHistory(prev => prev.map(item =>
          item.id === currentCommandId ? { ...item, result: (item.result === "处理中..." ? "" : item.result + "\n") + messageString } : item
        ));
      }
      // 短暂显示成功状态后恢复 idle
      setTimeout(() => setRunStatus('idle'), 2000);
    };

    const handleError = (data: ServerEventData) => {
      console.error("Received error event:", data);
      const errorString = `错误: ${JSON.stringify(data)}`;
      setResult(prevResult => (prevResult ? prevResult + "\n" : "") + errorString);
      setRunStatus('error');
      // 更新对应历史记录的状态
      if (currentCommandId) {
        setHistory(prev => prev.map(item =>
          item.id === currentCommandId ? { ...item, result: (item.result === "处理中..." ? "" : item.result + "\n") + errorString } : item
        ));
      }
      // 短暂显示错误状态后恢复 idle
      setTimeout(() => setRunStatus('idle'), 3000);
    };

    // 注册事件监听器
    addEventListener('message', handleMessage);
    addEventListener('error', handleError);

    // 清理函数：移除事件监听器
    return () => {
      removeEventListener('message', handleMessage);
      removeEventListener('error', handleError);
    };
  }, [currentCommandId]); 

  // 执行命令
  const executeCommand = async () => {
    if (!inputValue.trim() || runStatus === 'running') return; // 运行时不允许再次执行

    const commandToSend = inputValue;
    // setInputValue(''); // 不再立即清空输入框
    setRunStatus('running');
    setResult(null); // 清空之前的结果

    const newCommandId = Date.now();
    setCurrentCommandId(newCommandId);

    // 添加到历史记录
    const newHistoryItem = {
      id: newCommandId,
      command: commandToSend,
      timestamp: new Date().toLocaleString(),
      result: "处理中...", // 初始状态
    };
    setHistory((prev) => [newHistoryItem, ...prev]);

    try {
      // 调用service中的函数发送命令
      const response = await sendAICommand(commandToSend);
      console.log('AI Command Response:', response);
      // 初始响应可能只包含确认信息，实际结果通过SSE推送
      // 如果初始响应包含错误，则立即标记为错误
      if (response && response.error) {
         throw new Error(response.error);
      }
      // 否则保持 running 状态，等待 SSE

    } catch (error: any) {
      console.error('Error executing command:', error);
      const errorMsg = `执行命令时出错: ${error.message}`;
      setResult(errorMsg);
      setRunStatus('error');
      // 更新历史记录为错误
      setHistory(prev => prev.map(item =>
        item.id === newCommandId ? { ...item, result: errorMsg } : item
      ));
      setCurrentCommandId(null);
      // 短暂显示错误状态后恢复 idle
      setTimeout(() => setRunStatus('idle'), 3000);
    }
    // 注意：成功状态由 SSE 的 handleMessage 设置
    // 超时逻辑 (可选，如果SSE长时间没响应)
    // setTimeout(() => {
    //   if (runStatus === 'running') {
    //     setResult("操作超时");
    //     setRunStatus('error');
    //     // 更新历史记录
    //     setHistory(prev => prev.map(item =>
    //       item.id === newCommandId ? { ...item, result: "操作超时" } : item
    //     ));
    //     setCurrentCommandId(null);
    //     setTimeout(() => setRunStatus('idle'), 3000);
    //   }
    // }, 30000); // 30秒超时
  };

  // 取消命令 (需要后端支持)
  const cancelCommand = async () => {
    if (runStatus !== 'running') return;
    console.log("尝试取消命令...");

    // --- 立即更新UI状态以提供反馈 ---
    setResult("操作已取消");
    setRunStatus('idle'); // 直接设置为空闲状态
    const commandIdToCancel = currentCommandId;
    if (commandIdToCancel) {
      setHistory(prev => prev.map(item =>
        item.id === commandIdToCancel ? { ...item, result: "用户取消" } : item
      ));
      setCurrentCommandId(null); 
    }
    try {
      await sendCancelCommand();
      console.log('Cancel command sent successfully.');
      // 注意：UI状态已经更新，这里主要是发送信号给后端
    } catch (error: any) {
      console.error('Error cancelling command:', error);
      setResult(`取消命令时出错: ${error.message}`);
      // 保持 running 状态可能不合适，根据后端行为决定，暂时设为 error
      setRunStatus('error');
      setTimeout(() => setRunStatus('idle'), 3000);
    }
  };

  // 运行按钮的点击处理
  const handleRunButtonClick = () => {
    if (runStatus === 'running') {
      cancelCommand();
    } else {
      executeCommand();
    }
  };

  // 根据状态获取按钮内容
  const getButtonContent = () => {
    switch (runStatus) {
      case 'running':
        return (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            运行中
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-300" />
            成功
          </>
        );
      case 'error':
        return (
          <>
            <XCircle className="w-3.5 h-3.5 mr-1 text-red-300" />
            失败
          </>
        );
      case 'idle':
      default:
        return (
          <>
            <Play className="w-3.5 h-3.5 mr-1 fill-white" />
            运行
          </>
        );
    }
  };

  // 根据状态获取按钮样式
  const getButtonClass = () => {
    const baseClass = "text-white rounded-full px-4 py-1.5 flex items-center shadow-md hover:shadow-lg transition-all text-sm min-w-[80px] justify-center";
    const defaultGradient = "bg-gradient-to-r from-morandi-pink to-morandi-blue hover:from-morandi-pink-dark hover:to-morandi-blue-dark";

    switch (runStatus) {
      case 'running':
        return `${baseClass} ${defaultGradient} cursor-pointer`; // 运行时允许点击取消
      case 'success':
      case 'error':
        return `${baseClass} ${defaultGradient} opacity-70 cursor-not-allowed`; // 成功或失败时降低透明度并禁用
      case 'idle':
      default:
        return `${baseClass} ${defaultGradient}`; // 默认状态
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gradient-to-b from-morandi-pink-light to-morandi-blue-light min-h-screen rounded-lg">
      {/* Header - 使用莫兰迪色 */}
      <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl shadow-sm border border-morandi-pink">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-morandi-pink to-morandi-blue text-transparent bg-clip-text">
            InBrowserMcp
          </h1>
        </div>
      </div>

      {/* Title with Settings Button - 使用莫兰迪色 */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-morandi-pink flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">
          AI驱动的浏览器自动化工具
        </h2>
        <button
          onClick={() => setShowEnvConfig(true)}
          className="bg-gradient-to-r from-morandi-pink to-morandi-blue p-2 rounded-full text-white shadow-sm hover:shadow-md transition-all"
          disabled={runStatus === 'running'} // 运行时禁用设置
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Input Area - 使用莫兰迪色 */}
      <div className="border border-morandi-pink rounded-xl p-4 mb-6 relative bg-white shadow-sm">
        <div className="flex items-start">
          <div className="p-1 text-morandi-pink mr-2">
            {/* Icon */}
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
                handleRunButtonClick() // 使用新的处理函数
              }
            }}
            disabled={runStatus === 'running' || runStatus === 'success' || runStatus === 'error'} // 运行时、成功、失败时禁用输入
          />
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            className={getButtonClass()} // 使用动态样式
            onClick={handleRunButtonClick} // 使用新的处理函数
            // 禁用逻辑由 getButtonClass 控制或保留部分
            disabled={runStatus === 'success' || runStatus === 'error'} // 成功或失败时禁用按钮
          >
            {getButtonContent()} {/* 使用动态内容 */}
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-1.5 flex items-center shadow-sm hover:shadow transition-all"
            disabled={runStatus === 'running'} // 运行时禁用历史记录按钮
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Area - 使用莫兰迪色 */}
      <div className="border border-morandi-pink rounded-xl p-4 min-h-[300px] bg-white shadow-sm">
        <div className="flex items-center mb-3">
          {/* Status indicators - Always show running animation */}
          <div className="w-3 h-3 rounded-full mr-1 bg-yellow-400 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full mr-1 bg-orange-400 animate-pulse delay-100"></div>
          <div className="w-3 h-3 rounded-full mr-1 bg-blue-400 animate-pulse delay-200"></div>
          <h3 className="text-sm font-medium text-gray-700 ml-2">模型输出</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg min-h-[250px] text-gray-600 whitespace-pre-line">
          {runStatus === 'running' ? (
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

      {/* Modals */}
      {showEnvConfig && <EnvConfigModal onClose={() => setShowEnvConfig(false)} />}
      {showHistory && <HistoryModal history={history} onClose={() => setShowHistory(false)} onClearHistory={clearHistory} onDeleteHistoryItem={deleteHistoryItem} />}
    </div>
  )
}
