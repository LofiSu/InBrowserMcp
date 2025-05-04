import { 
  ScreenshotTool,
  WaitTool, // 添加 WaitTool
  ClearBrowsingDataTool, // 添加 ClearBrowsingDataTool
  Tool,
} from "../types/tools.js";
import { Context } from "../types/context.js";
import { 
  createToolSchema, 
  createTextResponse, 
  handleToolError,
  validateToolParams, // 添加 validateToolParams
  createSnapshotResponse // 添加 createSnapshotResponse
} from "./helpers.js";
import { debugLog } from "../utils/log.js"; // 添加 debugLog
import { captureAriaSnapshot } from "../utils/aria-snapshot.js"; // 添加 captureAriaSnapshot

// 等待工具 (后端实现)
export const wait: Tool = {
  schema: createToolSchema(WaitTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(WaitTool.shape.argsSchema, params);
      const time = validatedParams.time;
      debugLog(`后端等待 ${time}ms`); // 添加日志
      // 等待指定时间
      await new Promise(resolve => setTimeout(resolve, time));
      
      // 等待后通常需要获取最新状态，这里捕获快照
      const snapshot = await captureAriaSnapshot(context);
      return createSnapshotResponse(`等待了 ${time}ms`, snapshot.content);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 截图工具
export const screenshot: Tool = {
  schema: createToolSchema(ScreenshotTool),
  handle: async (context: Context) => { // 移除 params，因为 schema 中没有参数
    try {
      debugLog("请求插件截取当前可见标签页"); // 添加日志
      const screenshotData = await context.sendBrowserAction(
        "screenshot",
        {}, // 无参数
      );
      return {
        content: [
          {
            type: "image",
            data: screenshotData as string, // 插件直接返回 base64 数据
            mimeType: "image/png", // 假设插件总是返回 PNG
          },
        ],
      };
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 清除浏览数据工具
export const clearBrowsingData: Tool = {
  schema: createToolSchema(ClearBrowsingDataTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(ClearBrowsingDataTool.shape.argsSchema, params);
      debugLog(`请求插件清除浏览数据: ${JSON.stringify(validatedParams)}`); // 添加日志
      await context.sendBrowserAction("clearBrowsingData", validatedParams);
      return createTextResponse(`浏览数据已清除: ${validatedParams.dataTypes.join(', ')}`);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 注意：getConsoleLogs 工具已被移除