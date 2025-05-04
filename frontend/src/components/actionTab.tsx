import { useState } from "react"
import { Clock, Zap, Search, CheckCircle, Pointer } from "lucide-react"

export default function ActionTabs() {
  const [activeTab, setActiveTab] = useState("action")

  return (
    <div className="mb-4 flex items-center bg-white p-2 rounded-xl shadow-sm border border-pink-200">
      <div className="flex space-x-2">
        <button
          className={`px-4 py-2 rounded-full transition-all flex items-center ${
            activeTab === "action"
              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("action")}
        >
          <Zap className="w-4 h-4 mr-1" />
          动作
        </button>
        <button
          className={`px-4 py-2 rounded-full transition-all flex items-center ${
            activeTab === "query"
              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("query")}
        >
          <Search className="w-4 h-4 mr-1" />
          查询
        </button>
        <button
          className={`px-4 py-2 rounded-full transition-all flex items-center ${
            activeTab === "assert"
              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("assert")}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          断言
        </button>
        <button
          className={`px-4 py-2 rounded-full transition-all flex items-center ${
            activeTab === "tap"
              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("tap")}
        >
          <Pointer className="w-4 h-4 mr-1" />
          点击
        </button>
      </div>
      <button className="ml-auto bg-gray-50 p-2 rounded-full hover:bg-gray-100 transition-all">
        <Clock className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}
