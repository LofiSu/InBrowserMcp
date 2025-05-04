import { useState } from "react"
import { X } from "lucide-react"

interface EnvConfigModalProps {
  onClose: () => void
}

export default function EnvConfigModal({ onClose }: EnvConfigModalProps) {
  const [envConfig, setEnvConfig] = useState(
    `OPENAI_BASE_URL="https://ark.cn-beijing.volces..."
OPENAI_API_KEY="aa47bf4e-89d8-431c-9f24-1b6..."
MIDSCENE_MODEL_NAME="ep-20250416102532-7t9bj"
MIDSCENE_USE_VLM_UI_TARS=1
MIDSCENE_OPENAI_INIT_CONFIG_JSON='{ "REPO...`,
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-lg border border-pink-200 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">模型环境配置</h2>
          <button onClick={onClose} className="text-white hover:text-pink-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <textarea
            className="w-full border border-pink-200 rounded-lg p-3 min-h-[200px] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            value={envConfig}
            onChange={(e) => setEnvConfig(e.target.value)}
          />

          <p className="mt-4 text-gray-700">格式为 KEY=VALUE，每行一个配置项。</p>

          <p className="mt-2 mb-6 text-gray-700">
            这些数据将<strong>保存在您的浏览器本地</strong>。
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              取消
            </button>
            <button className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-md">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
