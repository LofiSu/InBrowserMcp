import { useState, useEffect } from "react"
import { Play, Clock, Settings, Loader2, CheckCircle, XCircle } from "lucide-react" // 移除 StopCircle
import ThinkingDots from "./components/thinking-dots"
import EnvConfigModal from "./components/env-config-modal"
import HistoryModal from "./components/history-modal"
import AlertMessage from "./components/alert-message" // 导入新的 Alert 组件
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
  const [alertMessage, setAlertMessage] = useState<string>(""); // 新增状态用于管理 Alert 消息

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
  }, [currentCommandId]); // 添加 currentCommandId 依赖

  // 执行命令
  const executeCommand = async () => {
    // 添加输入校验并提示
    if (!inputValue.trim()) {
      setAlertMessage("请先输入您想要执行的操作"); // 使用新的 Alert 状态
      // 可选：设置定时器自动关闭 Alert
      setTimeout(() => setAlertMessage(""), 3000);
      return;
    }
    // 运行时不允许再次执行
    if (runStatus === 'running') return;

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
            <Play className="w-3.5 h-3.5 mr-1 fill-pink-600" />
            运行
          </>
        );
    }
  };

  // 根据状态获取按钮样式
  const getButtonClass = () => {
    // Base style for the button
    const baseClass = "text-pink-700 rounded-full px-4 py-1.5 flex items-center shadow-sm hover:shadow transition-all text-sm min-w-[80px] justify-center border border-pink-200";
    // Light pink background, slightly darker on hover
    const defaultStyle = "bg-pink-100 hover:bg-pink-200/70";
    // Style for disabled/non-interactive states
    const disabledStyle = "bg-pink-50 opacity-70 cursor-not-allowed";

    switch (runStatus) {
      case 'running':
        // Use default style but allow click (for cancel)
        return `${baseClass} ${defaultStyle} cursor-pointer`; 
      case 'success':
      case 'error':
        // Use disabled style
        return `${baseClass} ${disabledStyle}`; 
      case 'idle':
      default:
        // Default interactive style
        return `${baseClass} ${defaultStyle}`; 
    }
  };

  return (
    // Use a solid very light pink background
    <div className="max-w-3xl mx-auto p-4 bg-pink-50 min-h-screen rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl shadow-sm border border-pink-200">
        <div className="flex items-center gap-2">
          {/* Use a solid pink color for the title */}
          <h1 className="text-xl font-bold text-pink-600">
            InBrowserMcp
          </h1>
        </div>
      </div>

      {/* Title with Settings Button */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-pink-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">
          AI驱动的浏览器自动化工具
        </h2>
        <button
          onClick={() => setShowEnvConfig(true)}
          // Simple light pink button for settings
          className="bg-pink-100 hover:bg-pink-200/70 p-2 rounded-full text-pink-600 shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={runStatus === 'running'} // 运行时禁用设置
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Input Area */}
      <div className="border border-pink-200 rounded-xl p-4 mb-6 relative bg-white shadow-sm">
        <div className="flex items-start">
          <div className="p-1 text-pink-400 mr-2">
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
            className={getButtonClass()} // Use dynamic class
            onClick={handleRunButtonClick} // Use new handler
            // Disabled logic is now handled within getButtonClass
            // disabled={runStatus === 'success' || runStatus === 'error'} // Remove explicit disable here
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

      {/* Results Area */}
      <div className="border border-pink-200 rounded-xl p-4 min-h-[300px] bg-white shadow-sm">
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

      {/* Alert Message */} 
      <AlertMessage message={alertMessage} onClose={() => setAlertMessage("")} />

      {/* Modals */}
      {showEnvConfig && <EnvConfigModal onClose={() => setShowEnvConfig(false)} />}
      {showHistory && <HistoryModal history={history} onClose={() => setShowHistory(false)} onClearHistory={clearHistory} onDeleteHistoryItem={deleteHistoryItem} />}
    </div>
  )
}
