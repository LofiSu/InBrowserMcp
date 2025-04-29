// 导出所有工具
import { click, type, pressKey, wait } from "./interaction";
import { navigate, goBack, goForward } from "./navigation";
import { snapshot, screenshot } from "./screenshot";

// 导出工具类型
export { Tool, ToolFactory, ToolResult, ToolSchema } from "./tool";

// 导出所有工具
export const tools = {
  // 交互工具
  click,
  type,
  pressKey,
  wait,

  // 导航工具
  navigate,
  goBack,
  goForward,

  // 快照/截图工具
  snapshot,
  screenshot,
};
