import { Tool } from "../types/tools.js";
import { Context } from "../types/context.js";
import { captureAriaSnapshot } from "../utils/aria-snapshot.js";
import { SnapshotTool } from "../types/tools.js";
import { 
  createToolSchema, 
  handleToolError 
} from "./helpers.js";
import { debugLog } from "../utils/log.js"; 

// 快照工具
export const snapshot: Tool = {
  schema: createToolSchema(SnapshotTool),
  handle: async (context: Context) => { // 移除 params，因为 schema 中没有参数
    try {
      debugLog("请求插件捕获页面快照 (DOM/ARIA)"); // 添加日志
      return await captureAriaSnapshot(context);
    } catch (error) {
      return handleToolError(error);
    }
  },
};
