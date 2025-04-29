/**
 * 工具模式定义
 * 包含工具名称、描述和输入参数模式
 */
export type ToolSchema = {
  name: string; // 工具名称
  description: string; // 工具描述
  inputSchema: any; // 输入参数的JSON模式
};

/**
 * 工具执行结果定义
 * 包含内容和可选的错误标志
 */
export type ToolResult = {
  content: (ImageContent | TextContent)[]; // 内容数组，可以是文本或图像
  isError?: boolean; // 可选的错误标志
};

/**
 * 图像内容类型
 */
export interface ImageContent {
  type: "image";
  imageUrl: string;
}

/**
 * 文本内容类型
 */
export interface TextContent {
  type: "text";
  text: string;
}

/**
 * 上下文接口
 */
export interface Context {
  sendSocketMessage: <T extends string>(type: T, payload?: any) => Promise<any>;
  hasWs: () => boolean;
  close: () => Promise<void>;
  ws: any; // ws为必选属性以匹配实现类
  _ws: any; // _ws为必选属性以匹配实现类
  pendingMessages: any; // pendingMessages为必选属性以匹配实现类
}

/**
 * 工具接口定义
 * 包括模式和处理函数
 */
export type Tool = {
  schema: ToolSchema; // 工具模式
  handle: (
    // 处理函数
    context: Context, // 上下文对象
    params?: Record<string, any> // 参数对象
  ) => Promise<ToolResult>; // 返回工具执行结果
};

/**
 * 工具工厂类型
 * 用于创建能够选择是否包含快照功能的工具
 */
export type ToolFactory = (snapshot: boolean) => Tool;
