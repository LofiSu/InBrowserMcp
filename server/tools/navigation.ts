import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import { Tool, ToolFactory } from "./tool";
import { Context } from "../context";
import { captureAriaSnapshot } from "../utils/aria-snapshot";

// 导航工具参数定义
const NavigateToolArgs = z.object({
  url: z.string().describe("要访问的网址"),
});

/**
 * 导航工具
 * 导航到指定URL
 */
export const navigate: ToolFactory = (snapshot: boolean): Tool => ({
  schema: {
    name: "navigate",
    description: "导航到指定URL",
    inputSchema: zodToJsonSchema(NavigateToolArgs),
  },
  handle: async (context: Context, params?: Record<string, any>) => {
    // 验证参数
    const { url } = NavigateToolArgs.parse(params);

    // 发送导航消息
    await context.sendSocketMessage("browser_navigate", { url });

    // 如果需要快照，返回页面快照
    if (snapshot) {
      return captureAriaSnapshot(context, `成功导航到: ${url}`);
    }

    // 否则只返回文本结果
    return {
      content: [
        {
          type: "text",
          text: `成功导航到: ${url}`,
        },
      ],
    };
  },
});

/**
 * 返回上一页工具
 */
export const goBack: ToolFactory = (snapshot: boolean): Tool => ({
  schema: {
    name: "goBack",
    description: "返回到上一页",
    inputSchema: {},
  },
  handle: async (context: Context) => {
    // 发送返回上一页消息
    await context.sendSocketMessage("browser_go_back");

    // 如果需要快照，返回页面快照
    if (snapshot) {
      return captureAriaSnapshot(context, "已返回上一页");
    }

    // 否则只返回文本结果
    return {
      content: [
        {
          type: "text",
          text: "已返回上一页",
        },
      ],
    };
  },
});

/**
 * 前进到下一页工具
 */
export const goForward: ToolFactory = (snapshot: boolean): Tool => ({
  schema: {
    name: "goForward",
    description: "前进到下一页",
    inputSchema: {},
  },
  handle: async (context: Context) => {
    // 发送前进到下一页消息
    await context.sendSocketMessage("browser_go_forward");

    // 如果需要快照，返回页面快照
    if (snapshot) {
      return captureAriaSnapshot(context, "已前进到下一页");
    }

    // 否则只返回文本结果
    return {
      content: [
        {
          type: "text",
          text: "已前进到下一页",
        },
      ],
    };
  },
});
