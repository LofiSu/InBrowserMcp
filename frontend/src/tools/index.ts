// 导出所有工具
import { Tool } from "./tool";
import { SnapshotTool } from "./snapshot";
import { ClickTool } from "./interaction";
import { TypeTool } from "./interaction";
import { NavigateTool } from "./navigation";
import { ScreenshotTool } from "./screenshot";

// 所有可用工具的集合
export const tools: Tool[] = [
  new SnapshotTool(),
  new ClickTool(),
  new TypeTool(),
  new NavigateTool(),
  new ScreenshotTool(),
];

// 获取工具通过名称
export function getToolByName(name: string): Tool | undefined {
  return tools.find((tool) => tool.name === name);
}

// 获取所有工具定义
export function getAllToolDefinitions(): Array<{
  name: string;
  description: string;
}> {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
  }));
}
