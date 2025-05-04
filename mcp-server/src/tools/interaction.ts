import { captureAriaSnapshot } from "../utils/aria-snapshot.js";
import { 
  ClickTool, 
  HoverTool, 
  TypeTool,
  ScrollPageTool, 
  Tool,
} from "../types/tools.js";
import { Context } from "../types/context.js";
import { 
  createToolSchema, 
  createSnapshotResponse, 
  handleToolError,
  validateToolParams 
} from "./helpers.js";
import { debugLog } from "../utils/log.js"; // 添加 debugLog

// 点击工具
export const click: Tool = {
  schema: createToolSchema(ClickTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(ClickTool.shape.argsSchema, params);
      debugLog(`请求插件点击元素: ${validatedParams.selector}`); // 添加日志
      await context.sendBrowserAction("click", validatedParams);
      const snapshot = await captureAriaSnapshot(context);
      return createSnapshotResponse(`点击了 "${validatedParams.selector}"`, snapshot.content);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 悬停工具
export const hover: Tool = {
  schema: createToolSchema(HoverTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(HoverTool.shape.argsSchema, params);
      debugLog(`请求插件悬停在元素上: ${validatedParams.selector}`); // 添加日志
      await context.sendBrowserAction("hover", validatedParams);
      const snapshot = await captureAriaSnapshot(context);
      return createSnapshotResponse(`悬停在 "${validatedParams.selector}" 上`, snapshot.content);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 输入工具
export const type: Tool = {
  schema: createToolSchema(TypeTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(TypeTool.shape.argsSchema, params);
      debugLog(`请求插件在元素 '${validatedParams.selector}' 中输入文本`); // 添加日志
      await context.sendBrowserAction("type", validatedParams);
      const snapshot = await captureAriaSnapshot(context);
      return createSnapshotResponse(
        `在 "${validatedParams.selector}" 中输入了 "${validatedParams.text}"`, 
        snapshot.content
      );
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 滚动页面工具
export const scroll: Tool = {
  schema: createToolSchema(ScrollPageTool),
  handle: async (context: Context, params?: Record<string, any>) => {
    try {
      const validatedParams = validateToolParams(ScrollPageTool.shape.argsSchema, params);
      debugLog(`请求插件滚动页面: ${JSON.stringify(validatedParams)}`); // 添加日志
      await context.sendBrowserAction("scroll", validatedParams);
      const snapshot = await captureAriaSnapshot(context);
      let message = "滚动了页面";
      if (validatedParams.direction) {
        message += ` 方向: ${validatedParams.direction}`;
        if (validatedParams.amount) {
          message += ` 距离: ${validatedParams.amount}px`;
        }
      } else if (validatedParams.selector) {
        message += ` 到元素: ${validatedParams.selector}`;
      }
      return createSnapshotResponse(message, snapshot.content);
    } catch (error) {
      return handleToolError(error);
    }
  },
};

// 注意：drag 和 selectOption 工具已被移除