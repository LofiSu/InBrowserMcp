import { useState } from "react"
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-lg border border-pink-200 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            执行历史记录
          </h2>
          <button onClick={onClose} className="text-white hover:text-pink-100">
            <X className="w-6 h-6" />
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
                      ? "border-pink-300 bg-pink-50"
                      : "border-gray-200 hover:border-pink-200 hover:bg-pink-50/30"
                  }`}
                  onClick={() => setSelectedHistory(item.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-800">{item.command}</div>
                    <button
                      className="text-gray-400 hover:text-red-500 p-1"
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
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <ArrowRight className="w-3 h-3 mr-1" />
                        结果
                      </div>
                      <div className="text-sm bg-white p-2 rounded border border-gray-200 whitespace-pre-line">
                        {item.result}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">暂无执行历史记录</div>
          )}

          <div className="mt-4 flex justify-between">
            <button
              onClick={clearHistory}
              className="px-4 py-2 text-sm text-red-500 hover:text-red-600 disabled:text-gray-400"
              disabled={history.length === 0}
            >
              清空历史记录
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
