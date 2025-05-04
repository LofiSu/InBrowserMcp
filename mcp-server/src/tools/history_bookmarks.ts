// mcp-server/src/tools/history_bookmarks.ts
import { 
  SearchHistoryTool, 
  DeleteHistoryUrlTool, 
  CreateBookmarkTool, 
  SearchBookmarksTool,
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

// 搜索历史记录工具
export const searchHistory: Tool = {
  schema: createToolSchema(SearchHistoryTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(SearchHistoryTool.shape.argsSchema, params);
      debugLog(`请求插件搜索历史记录: ${JSON.stringify(validatedParams)}`);
      const historyItems = await context.sendBrowserAction("searchHistory", validatedParams);
      return createTextResponse(JSON.stringify(historyItems, null, 2));
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 删除历史记录 URL 工具
export const deleteHistoryUrl: Tool = {
  schema: createToolSchema(DeleteHistoryUrlTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(DeleteHistoryUrlTool.shape.argsSchema, params);
      debugLog(`请求插件删除历史记录 URL: ${validatedParams.url}`);
      await context.sendBrowserAction("deleteHistoryUrl", validatedParams);
      return createTextResponse(`历史记录 URL '${validatedParams.url}' 已删除`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 创建书签工具
export const createBookmark: Tool = {
  schema: createToolSchema(CreateBookmarkTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(CreateBookmarkTool.shape.argsSchema, params);
      debugLog(`请求插件创建书签: ${JSON.stringify(validatedParams)}`);
      const bookmark = await context.sendBrowserAction("createBookmark", validatedParams);
      return createTextResponse(`书签已创建: ${JSON.stringify(bookmark)}`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 搜索书签工具
export const searchBookmarks: Tool = {
  schema: createToolSchema(SearchBookmarksTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(SearchBookmarksTool.shape.argsSchema, params);
      debugLog(`请求插件搜索书签: ${validatedParams.query}`);
      const bookmarks = await context.sendBrowserAction("searchBookmarks", validatedParams);
      return createTextResponse(JSON.stringify(bookmarks, null, 2));
    } catch (error) {
      return handleToolError(error);
    }
  },
};