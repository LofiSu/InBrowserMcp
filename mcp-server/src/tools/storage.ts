// mcp-server/src/tools/storage.ts
import { 
  GetCookiesTool, 
  SetCookieTool, 
  DeleteCookieTool, 
  GetStorageItemTool, 
  SetStorageItemTool, 
  DeleteStorageItemTool,
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

// 获取 Cookie 工具
export const getCookies: Tool = {
  schema: createToolSchema(GetCookiesTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(GetCookiesTool.shape.argsSchema, params);
      debugLog(`请求插件获取 Cookies: ${JSON.stringify(validatedParams)}`);
      const cookies = await context.sendBrowserAction("getCookies", validatedParams);
      return createTextResponse(JSON.stringify(cookies, null, 2));
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 设置 Cookie 工具
export const setCookie: Tool = {
  schema: createToolSchema(SetCookieTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(SetCookieTool.shape.argsSchema, params);
      debugLog(`请求插件设置 Cookie: ${JSON.stringify(validatedParams)}`);
      const cookie = await context.sendBrowserAction("setCookie", validatedParams);
      return createTextResponse(`Cookie 已设置: ${JSON.stringify(cookie)}`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 删除 Cookie 工具
export const deleteCookie: Tool = {
  schema: createToolSchema(DeleteCookieTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(DeleteCookieTool.shape.argsSchema, params);
      debugLog(`请求插件删除 Cookie: ${JSON.stringify(validatedParams)}`);
      await context.sendBrowserAction("deleteCookie", validatedParams);
      return createTextResponse(`Cookie '${validatedParams.name}' 在 URL '${validatedParams.url}' 已删除`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 获取存储项工具
export const getStorageItem: Tool = {
  schema: createToolSchema(GetStorageItemTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(GetStorageItemTool.shape.argsSchema, params);
      debugLog(`请求插件获取存储项 '${validatedParams.key}' 从 ${validatedParams.storageType} storage`);
      const value = await context.sendBrowserAction("getStorageItem", validatedParams);
      return createTextResponse(value as string);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 设置存储项工具
export const setStorageItem: Tool = {
  schema: createToolSchema(SetStorageItemTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(SetStorageItemTool.shape.argsSchema, params);
      debugLog(`请求插件设置存储项 '${validatedParams.key}' 到 ${validatedParams.storageType} storage`);
      await context.sendBrowserAction("setStorageItem", validatedParams);
      return createTextResponse(`存储项 '${validatedParams.key}' 已设置`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 删除存储项工具
export const deleteStorageItem: Tool = {
  schema: createToolSchema(DeleteStorageItemTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(DeleteStorageItemTool.shape.argsSchema, params);
      debugLog(`请求插件删除存储项 '${validatedParams.key}' 从 ${validatedParams.storageType} storage`);
      await context.sendBrowserAction("deleteStorageItem", validatedParams);
      return createTextResponse(`存储项 '${validatedParams.key}' 已删除`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};