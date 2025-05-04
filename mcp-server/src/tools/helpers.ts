import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import type { ToolResult } from "../types/tools.js";

/**
 * 创建工具的schema对象
 */
export const createToolSchema = (tool: any) => ({
  name: tool.shape.name.value,
  description: tool.shape.description.value,
  inputSchema: zodToJsonSchema(tool.shape.arguments || tool.shape.argsSchema),
});

/**
 * 创建文本响应
 */
export const createTextResponse = (text: string): ToolResult => ({
  content: [
    {
      type: "text",
      text,
    },
  ],
});

/**
 * 创建带快照的文本响应
 */
export const createSnapshotResponse = (text: string, snapshotContent: any): ToolResult => ({
  content: [
    {
      type: "text",
      text,
    },
    ...snapshotContent,
  ],
});

/**
 * 处理工具执行错误
 */
export const handleToolError = (error: any): ToolResult => ({
  content: [
    {
      type: "text",
      text: `执行工具时出错: ${error.message || '未知错误'}`,
    },
  ],
  isError: true,
});

/**
 * 验证并解析工具参数
 */
export const validateToolParams = <T extends z.ZodTypeAny>(schema: T, params?: Record<string, any>) => {
  try {
    return schema.parse(params);
  } catch (error) {
    throw new Error(`参数验证失败: ${(error as Error).message}`);
  }
};