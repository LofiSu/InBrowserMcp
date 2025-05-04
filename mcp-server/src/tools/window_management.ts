// mcp-server/src/tools/window_management.ts
import { 
  GetAllWindowsTool, 
  CreateWindowTool, 
  CloseWindowTool, 
  FocusWindowTool,
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

// 获取所有窗口工具
export const getAllWindows: Tool = {
  schema: createToolSchema(GetAllWindowsTool),
  handle: async (context: Context) => {
    try {
      debugLog("请求插件获取所有窗口信息");
      const windows = await context.sendBrowserAction("getAllWindows", {});
      return createTextResponse(JSON.stringify(windows, null, 2));
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 创建窗口工具
export const createWindow: Tool = {
  schema: createToolSchema(CreateWindowTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(CreateWindowTool.shape.argsSchema, params);
      debugLog(`请求插件创建新窗口: ${JSON.stringify(validatedParams)}`);
      const newWindow = await context.sendBrowserAction("createWindow", validatedParams);
      return createTextResponse(`新窗口已创建: ${JSON.stringify(newWindow)}`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 关闭窗口工具
export const closeWindow: Tool = {
  schema: createToolSchema(CloseWindowTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(CloseWindowTool.shape.argsSchema, params);
      debugLog(`请求插件关闭窗口 ID: ${validatedParams.windowId}`);
      await context.sendBrowserAction("closeWindow", validatedParams);
      return createTextResponse(`窗口 ID ${validatedParams.windowId} 已关闭`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 聚焦窗口工具
export const focusWindow: Tool = {
  schema: createToolSchema(FocusWindowTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(FocusWindowTool.shape.argsSchema, params);
      debugLog(`请求插件聚焦窗口 ID: ${validatedParams.windowId}`);
      await context.sendBrowserAction("focusWindow", validatedParams);
      return createTextResponse(`已聚焦窗口 ID ${validatedParams.windowId}`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};