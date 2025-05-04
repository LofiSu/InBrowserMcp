import { captureAriaSnapshot } from "../utils/aria-snapshot.js";
import { 
  NavigateTool, 
  RefreshPageTool,
  Tool,
} from "../types/tools.js";
import { Context } from "../types/context.js";
import { 
  createToolSchema, 
  createSnapshotResponse, 
  handleToolError,
  validateToolParams 
} from "./helpers.js";
import { debugLog } from "../utils/log.js";

// 导航工具
export const navigate: Tool = {
  schema: createToolSchema(NavigateTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(NavigateTool.shape.argsSchema, params);
      
      // 发送导航消息到插件
      debugLog("请求插件导航到: " + validatedParams.url);
      await context.sendBrowserAction("navigate", { url: validatedParams.url });

      // 捕获快照 (通过插件)
      debugLog("请求插件捕获页面快照");
      try {
        const snapshot = await captureAriaSnapshot(context);
        return createSnapshotResponse("导航成功", snapshot.content);
      } catch (snapshotError: any) {
        debugLog("捕获快照失败: " + snapshotError.message);
        return createSnapshotResponse(
          "导航可能成功，但无法获取快照",
          [{
            type: "text",
            text: "Navigation may have succeeded, but snapshot failed."
          }]
        );
      }
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 刷新页面工具
export const refreshPage: Tool = {
  schema: createToolSchema(RefreshPageTool),
  handle: async (context: Context) => {
    try {
      // 发送刷新消息到插件
      debugLog("请求插件刷新当前页面");
      await context.sendBrowserAction("refreshPage", {});

      // 捕获快照 (通过插件)
      debugLog("请求插件捕获页面快照");
      try {
        const snapshot = await captureAriaSnapshot(context);
        return createSnapshotResponse("页面刷新成功", snapshot.content);
      } catch (snapshotError: any) {
        debugLog("捕获快照失败: " + snapshotError.message);
        return createSnapshotResponse(
          "页面可能刷新成功，但无法获取快照",
          [{
            type: "text",
            text: "Refresh may have succeeded, but snapshot failed."
          }]
        );
      }
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 注意：goBack, goForward, pressKey, wait 工具已被移除或移至其他类别
