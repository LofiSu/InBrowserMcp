import { useState, useEffect } from "react" // Import useEffect
import { X, Clock, ArrowRight, Trash2 } from "lucide-react"

interface HistoryItem {
  id: number
  command: string
  timestamp: string
  result: string
}

interface HistoryModalProps {
  onClose: () => void
  history: HistoryItem[]
  onClearHistory: () => void
  onDeleteHistoryItem: (id: number) => void
}

export default function HistoryModal({ onClose, history = [], onClearHistory, onDeleteHistoryItem }: HistoryModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Allow animation to finish before calling onClose
    setTimeout(onClose, 300); 
  };

  const [selectedHistory, setSelectedHistory] = useState<number | null>(null)

  const clearHistory = () => {
    const confirmed = window.confirm("确定要清空所有历史记录吗？")
    if (confirmed) {
      setSelectedHistory(null)
      onClearHistory()
    }
  }

  const deleteHistoryItem = (id: number) => {
    const confirmed = window.confirm("确定要删除这条历史记录吗？")
    if (confirmed) {
      if (selectedHistory === id) {
        setSelectedHistory(null)
      }
      onDeleteHistoryItem(id)
    }
  }

  // Animation classes
  const backdropAnimation = isVisible ? 'opacity-100' : 'opacity-0';
  const modalAnimation = isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95';

  return (
    // Lighter backdrop with blur and fade-in animation
    <div className={`fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${backdropAnimation}`}>
      {/* Modal with scale/fade animation, pink border, subtle shadow */}
      <div className={`bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl border border-pink-100 overflow-hidden transform transition-all duration-300 ease-out ${modalAnimation}`}>
        {/* Light pink header */}
        <div className="bg-pink-50 p-4 flex justify-between items-center border-b border-pink-100">
          <h2 className="text-lg font-semibold text-pink-600 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-pink-400" />
            执行历史记录
          </h2>
          <button onClick={handleClose} className="text-pink-400 hover:text-pink-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {history.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 mb-2 rounded-lg border transition-all cursor-pointer ${
                    selectedHistory === item.id
                      ? "border-pink-200 bg-pink-50/50"
                      : "border-pink-100 hover:border-pink-100 hover:bg-pink-50/30"
                  }`}
                  onClick={() => setSelectedHistory(item.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-800">{item.command}</div>
                    <button
                      className="text-pink-300 hover:text-red-500 p-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteHistoryItem(item.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{item.timestamp}</div>
                  {selectedHistory === item.id && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center text-xs text-pink-500 mb-1">
                        <ArrowRight className="w-3 h-3 mr-1 text-pink-400" />
                        结果
                      </div>
                      <div className="text-sm bg-pink-50/20 p-2 rounded border border-pink-100 whitespace-pre-line">
                        {item.result}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-pink-400">暂无执行历史记录</div>
          )}

          <div className="mt-4 flex justify-between">
            <button
              onClick={clearHistory}
              className="px-4 py-2 text-sm text-red-500 hover:text-red-600 disabled:text-gray-400"
              disabled={history.length === 0}
            >
              清空历史记录
            </button>
            {/* Pink Close Button */}
            <button
              onClick={handleClose} // Use handleClose for animation
              className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200/70 transition-colors shadow-sm border border-pink-200"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
