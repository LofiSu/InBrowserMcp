// mcp-server/src/tools/advanced.ts
import { 
  ExecuteCustomScriptTool,
  Tool,
} from "../types/tools.js";
import { Context } from "../types/context.js";
import { 
  createToolSchema, 
  createTextResponse, 
  handleToolError,
  validateToolParams 
} from "./helpers.js";
import { debugLog } from "../utils/log.js";

// 执行自定义脚本工具
export const executeScript: Tool = {
  schema: createToolSchema(ExecuteCustomScriptTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(ExecuteCustomScriptTool.shape.argsSchema, params);
      debugLog("请求插件执行自定义脚本");
      const result = await context.sendBrowserAction("execute_script", validatedParams);
      // 插件应该返回脚本执行结果或错误信息
      return createTextResponse(JSON.stringify(result)); 
    } catch (error) {
      return handleToolError(error);
    }
  },
};