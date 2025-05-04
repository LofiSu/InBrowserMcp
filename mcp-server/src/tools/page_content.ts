// mcp-server/src/tools/page_content.ts
import { 
  GetPageContentTool, 
  GetElementAttributeTool, 
  GetCurrentStateTool,
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

// 获取页面内容工具
export const getContent: Tool = {
  schema: createToolSchema(GetPageContentTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(GetPageContentTool.shape.argsSchema, params);
      debugLog(`请求插件获取内容: ${validatedParams.selector || '整个页面'}`);
      const content = await context.sendBrowserAction("get_content", validatedParams);
      return createTextResponse(content as string);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 获取元素属性工具
export const getAttribute: Tool = {
  schema: createToolSchema(GetElementAttributeTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(GetElementAttributeTool.shape.argsSchema, params);
      debugLog(`请求插件获取属性 '${validatedParams.attribute}' 来自 '${validatedParams.selector}'`);
      const attributeValue = await context.sendBrowserAction("get_attribute", validatedParams);
      return createTextResponse(attributeValue as string);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 获取当前状态工具
export const getCurrentState: Tool = {
  schema: createToolSchema(GetCurrentStateTool),
  handle: async (context: Context) => {
    try {
      debugLog("请求插件获取当前状态 (URL 和标题)");
      const state = await context.sendBrowserAction("getCurrentState", {});
      // 假设插件返回 { url: string, title: string }
      const stateObj = state as { url: string; title: string };
      return createTextResponse(`URL: ${stateObj.url}\nTitle: ${stateObj.title}`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};