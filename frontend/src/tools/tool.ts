// 定义工具接口

// 工具结果类型
export interface ToolResult {
  content: Array<{ type: "text" | "image"; text?: string; imageUrl?: string }>;
  isError?: boolean;
}

// 工具参数类型
export type ToolParams = Record<
  string,
  string | number | boolean | null | undefined
>;

// 工具基础接口
export interface Tool {
  name: string;
  description: string;
  execute: (params?: ToolParams) => Promise<ToolResult>;
}

// 工具参数验证错误
export class ToolValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolValidationError";
  }
}

// 工具执行错误
export class ToolExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolExecutionError";
  }
}

// 创建文本类型的工具结果
export function createTextResult(
  text: string,
  isError: boolean = false
): ToolResult {
  return {
    content: [{ type: "text" as const, text }],
    isError,
  };
}

// 创建包含图片的工具结果
export function createImageResult(imageUrl: string, text?: string): ToolResult {
  const content: Array<{
    type: "text" | "image";
    text?: string;
    imageUrl?: string;
  }> = [{ type: "image" as const, imageUrl }];

  if (text) {
    content.unshift({ type: "text" as const, text });
  }

  return { content };
}
