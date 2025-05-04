wowoimport { useState, useEffect } from "react" // Import useEffect
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

  // Animation classes
  const backdropAnimation = isVisible ? 'opacity-100' : 'opacity-0';
  const modalAnimation = isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95';

  return (
    // Lighter backdrop with blur and fade-in animation
    <div className={`fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${backdropAnimation}`}>
      {/* Modal with scale/fade animation, lighter border, subtle shadow */}
      <div className={`bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl border border-gray-200 overflow-hidden transform transition-all duration-300 ease-out ${modalAnimation}`}>
        {/* Lighter header */}
        <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">模型环境配置</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <textarea
            {/* Textarea with lighter border and focus ring */}
            className="w-full border border-gray-300 rounded-lg p-3 min-h-[200px] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors"
            value={envConfig}
            onChange={(e) => setEnvConfig(e.target.value)}
          />

          <p className="mt-4 text-gray-700">格式为 KEY=VALUE，每行一个配置项。</p>

          <p className="mt-2 mb-6 text-gray-700">
            这些数据将<strong>保存在您的浏览器本地</strong>。
          </p>

          <div className="flex justify-end gap-3">
            {/* Standard Cancel Button */}
            <button
              onClick={handleClose} // Use handleClose for animation
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
            >
              取消
            </button>
            {/* Simpler Save Button */}
            <button className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
