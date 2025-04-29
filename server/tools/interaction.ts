import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import { Tool, ToolFactory } from "./tool.js";
import { Context } from "../context.js";
import { captureAriaSnapshot } from "../utils/aria-snapshot.js";

// 点击工具参数定义
const ClickToolArgs = z.object({
  element: z.string().describe("要点击的元素选择器"),
});

// 输入工具参数定义
const TypeToolArgs = z.object({
  element: z.string().describe("要输入文本的元素选择器"),
  text: z.string().describe("要输入的文本"),
});

// 按键工具参数定义
const PressKeyToolArgs = z.object({
  key: z.string().describe("要按下的按键，例如 'Enter', 'Escape', 'Tab'"),
});

// 等待工具参数定义
const WaitToolArgs = z.object({
  time: z.number().describe("等待时间（秒）"),
});

/**
 * 点击工具
 * 点击页面上的元素
 */
export const click: Tool = {
  schema: {
    name: "click",
    description: "点击页面上的元素",
    inputSchema: zodToJsonSchema(ClickToolArgs),
  },
  handle: async (context: Context, params?: Record<string, any>) => {
    // 验证参数
    const { element } = ClickToolArgs.parse(params);

    // 发送点击消息
    await context.sendSocketMessage("browser_click", { element });

    // 获取快照并返回结果
    const snapshot = await captureAriaSnapshot(context);
    return {
      content: [
        {
          type: "text",
          text: `点击了元素: "${element}"`,
        },
        ...snapshot.content,
      ],
    };
  },
};

/**
 * 输入工具
 * 在页面元素中输入文本
 */
export const type: Tool = {
  schema: {
    name: "type",
    description: "在页面元素中输入文本",
    inputSchema: zodToJsonSchema(TypeToolArgs),
  },
  handle: async (context: Context, params?: Record<string, any>) => {
    // 验证参数
    const { element, text } = TypeToolArgs.parse(params);

    // 发送输入消息
    await context.sendSocketMessage("browser_type", { element, text });

    // 获取快照并返回结果
    const snapshot = await captureAriaSnapshot(context);
    return {
      content: [
        {
          type: "text",
          text: `在元素 "${element}" 中输入了: "${text}"`,
        },
        ...snapshot.content,
      ],
    };
  },
};

/**
 * 按键工具
 * 模拟按下键盘按键
 */
export const pressKey: Tool = {
  schema: {
    name: "pressKey",
    description: "模拟按下键盘按键",
    inputSchema: zodToJsonSchema(PressKeyToolArgs),
  },
  handle: async (context: Context, params?: Record<string, any>) => {
    // 验证参数
    const { key } = PressKeyToolArgs.parse(params);

    // 发送按键消息
    await context.sendSocketMessage("browser_press_key", { key });

    // 返回结果
    return {
      content: [
        {
          type: "text",
          text: `按下了按键: "${key}"`,
        },
      ],
    };
  },
};

/**
 * 等待工具
 * 等待指定的时间
 */
export const wait: Tool = {
  schema: {
    name: "wait",
    description: "等待指定的时间（秒）",
    inputSchema: zodToJsonSchema(WaitToolArgs),
  },
  handle: async (context: Context, params?: Record<string, any>) => {
    // 验证参数
    const { time } = WaitToolArgs.parse(params);

    // 发送等待消息
    await context.sendSocketMessage("browser_wait", { time });

    // 返回结果
    return {
      content: [
        {
          type: "text",
          text: `等待了 ${time} 秒`,
        },
      ],
    };
  },
};
