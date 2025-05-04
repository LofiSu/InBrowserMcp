// mcp-server/src/tools/tab_management.ts
import { 
  GetAllTabsTool, 
  CreateTabTool, 
  CloseTabTool, 
  FocusTabTool,
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

// 获取所有标签页工具
export const getAllTabs: Tool = {
  schema: createToolSchema(GetAllTabsTool),
  handle: async (context: Context) => {
    try {
      debugLog("请求插件获取所有标签页信息");
      const tabs = await context.sendBrowserAction("getAllTabs", {});
      return createTextResponse(JSON.stringify(tabs, null, 2));
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 创建标签页工具
export const createTab: Tool = {
  schema: createToolSchema(CreateTabTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(CreateTabTool.shape.argsSchema, params);
      debugLog(`请求插件创建新标签页: ${JSON.stringify(validatedParams)}`);
      const newTab = await context.sendBrowserAction("create_tab", validatedParams);
      return createTextResponse(`新标签页已创建: ${JSON.stringify(newTab)}`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 关闭标签页工具
export const closeTab: Tool = {
  schema: createToolSchema(CloseTabTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(CloseTabTool.shape.argsSchema, params);
      debugLog(`请求插件关闭标签页 ID: ${validatedParams.tabId}`);
      await context.sendBrowserAction("close_tab", validatedParams);
      return createTextResponse(`标签页 ID ${validatedParams.tabId} 已关闭`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 聚焦标签页工具
export const focusTab: Tool = {
  schema: createToolSchema(FocusTabTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(FocusTabTool.shape.argsSchema, params);
      debugLog(`请求插件聚焦标签页 ID: ${validatedParams.tabId}`);
      await context.sendBrowserAction("focus_tab", validatedParams);
      return createTextResponse(`已聚焦标签页 ID ${validatedParams.tabId}`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};