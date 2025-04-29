import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import { Tool } from "./tool.js";
import { Context } from "../context.js";

// 快照工具参数定义
const SnapshotToolArgs = z.object({}).optional();

// 截图工具参数定义
const ScreenshotToolArgs = z.object({
  element: z.string().describe("要截图的元素选择器").optional(),
});

/**
 * 页面快照工具
 * 获取当前页面的ARIA快照
 */
export const snapshot: Tool = {
  schema: {
    name: "snapshot",
    description: "获取当前页面的ARIA快照",
    inputSchema: zodToJsonSchema(SnapshotToolArgs),
  },
  handle: async (context: Context) => {
    // 调用浏览器快照功能
    const snapshot = await context.sendSocketMessage("browser_snapshot");
    const url = await context.sendSocketMessage("getUrl");
    const title = await context.sendSocketMessage("getTitle");

    // 返回结果
    return {
      content: [
        {
          type: "text",
          text: `
- Page URL: ${url}
- Page Title: ${title}
- Page Snapshot
\`\`\`yaml
${snapshot}
\`\`\`
`,
        },
      ],
    };
  },
};

/**
 * 截图工具
 * 获取页面或元素的截图
 */
export const screenshot: Tool = {
  schema: {
    name: "screenshot",
    description: "获取当前页面或指定元素的截图",
    inputSchema: zodToJsonSchema(ScreenshotToolArgs),
  },
  handle: async (context: Context, params?: Record<string, any>) => {
    // 解析参数
    const args = ScreenshotToolArgs.parse(params);

    // 调用浏览器截图功能
    const imageData = await context.sendSocketMessage(
      "browser_screenshot",
      args
    ) as string;

    // 返回结果
    return {
      content: [
        {
          type: "text",
          text: args.element
            ? `已截取元素 "${args.element}" 的截图`
            : "已截取页面截图",
        },
        {
          type: "image",
          imageUrl: imageData,
        },
      ],
    };
  },
};
