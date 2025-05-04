// mcp-server/src/types/tools.ts
import { z } from "zod";

import type {
  ImageContent,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";
import type { JsonSchema7Type } from "zod-to-json-schema";
import { Context } from "../types/context.js";

// 基础类型定义
export type ToolSchema = {
  name: string;
  description: string;
  inputSchema: JsonSchema7Type;
};

export type ToolResult = {
  content: (ImageContent | TextContent)[];
  isError?: boolean;
};

// 自定义工具接口，兼容 SDK 的 Tool 类型
export interface CustomTool {
  schema: ToolSchema;
  handle: (
    context: Context,
    params?: Record<string, any>
  ) => Promise<ToolResult>;
}

// 使用 SDK 的 Tool 类型名称，但结构与我们自定义的一致
export type Tool = CustomTool;

export type ToolFactory = (snapshot: boolean) => Tool;

// 工具类型分组
type ToolCategory = 'navigation' | 'interaction' | 'utility' | 'snapshot' | 'page_content' | 'advanced' | 'tab_management' | 'window_management' | 'storage' | 'history_bookmarks';

// 工具定义辅助函数
const createTool = <T extends string, D extends string, A extends z.ZodTypeAny>(
  category: ToolCategory,
  name: T, 
  description: D, 
  argsSchema: A
) => ({
  shape: {
    name: z.literal(name),
    description: z.literal(description),
    argsSchema,
  },
  category,
});

// 导航类工具
export const NavigateTool = createTool(
  'navigation',
  'navigate',
  'Navigate to a specified URL',
  z.object({
    url: z.string().url("Invalid URL format"),
  })
);

export const RefreshPageTool = createTool(
  'navigation',
  'refreshPage',
  'Refresh the current active tab',
  z.object({})
);

// 交互类工具
export const ClickTool = createTool(
  'interaction',
  'click',
  'Click on an element on the page',
  z.object({
    selector: z.string(),
  })
);

export const HoverTool = createTool(
  'interaction',
  'hover',
  'Hover over an element on the page',
  z.object({
    selector: z.string(),
  })
);

export const TypeTool = createTool(
  'interaction',
  'type',
  'Type text into an input element',
  z.object({
    selector: z.string(),
    text: z.string(),
  })
);

export const ScrollPageTool = createTool(
  'interaction',
  'scroll',
  'Scroll the page up, down, left, right, or to a specific element',
  z.object({
    direction: z.enum(['up', 'down', 'left', 'right']).optional(),
    selector: z.string().optional(),
    amount: z.number().optional(), // Optional pixel amount for directional scroll
  }).refine(data => data.direction || data.selector, {
    message: "Either direction or selector must be provided",
  })
);

// 页面内容类工具
export const GetPageContentTool = createTool(
  'page_content',
  'get_content',
  'Get the HTML content of the page or a specific element',
  z.object({
    selector: z.string().optional(), // Optional selector to get content of a specific element
  })
);

export const GetElementAttributeTool = createTool(
  'page_content',
  'get_attribute',
  'Get the value of a specific attribute for an element',
  z.object({
    selector: z.string(),
    attribute: z.string(),
  })
);

export const GetCurrentStateTool = createTool(
  'page_content',
  'getCurrentState',
  'Get the URL and title of the current active tab',
  z.object({})
);

// 高级操作类工具
export const ExecuteCustomScriptTool = createTool(
  'advanced',
  'execute_script',
  'Execute custom JavaScript code on the page',
  z.object({
    script: z.string(),
  })
);

// 标签页管理类工具
export const GetAllTabsTool = createTool(
  'tab_management',
  'getAllTabs',
  'Get information about all open tabs',
  z.object({})
);

export const CreateTabTool = createTool(
  'tab_management',
  'create_tab',
  'Create a new tab',
  z.object({
    url: z.string().url().optional(), // Optional URL to open in the new tab
    active: z.boolean().optional().default(true), // Whether the new tab should be active
  })
);

export const CloseTabTool = createTool(
  'tab_management',
  'close_tab',
  'Close a specific tab',
  z.object({
    tabId: z.number().int(),
  })
);

export const FocusTabTool = createTool(
  'tab_management',
  'focus_tab',
  'Focus on a specific tab',
  z.object({
    tabId: z.number().int(),
  })
);

// 窗口管理类工具
export const GetAllWindowsTool = createTool(
  'window_management',
  'getAllWindows',
  'Get information about all open browser windows',
  z.object({})
);

export const CreateWindowTool = createTool(
  'window_management',
  'createWindow',
  'Create a new browser window',
  z.object({
    url: z.string().url().optional(),
    focused: z.boolean().optional().default(true),
    type: z.enum(['normal', 'popup', 'panel']).optional(),
  })
);

export const CloseWindowTool = createTool(
  'window_management',
  'closeWindow',
  'Close a specific browser window',
  z.object({
    windowId: z.number().int(),
  })
);

export const FocusWindowTool = createTool(
  'window_management',
  'focusWindow',
  'Focus on a specific browser window',
  z.object({
    windowId: z.number().int(),
  })
);

// 存储管理类工具
export const GetCookiesTool = createTool(
  'storage',
  'getCookies',
  'Get cookies for a specific URL',
  z.object({
    url: z.string().url().optional(),
    name: z.string().optional(),
    domain: z.string().optional(),
    path: z.string().optional(),
  })
);

export const SetCookieTool = createTool(
  'storage',
  'setCookie',
  'Set a cookie',
  z.object({
    url: z.string().url(),
    name: z.string(),
    value: z.string(),
    domain: z.string().optional(),
    path: z.string().optional(),
    secure: z.boolean().optional(),
    httpOnly: z.boolean().optional(),
    expirationDate: z.number().optional(), // Unix timestamp in seconds
  })
);

export const DeleteCookieTool = createTool(
  'storage',
  'deleteCookie',
  'Delete a cookie',
  z.object({
    url: z.string().url(),
    name: z.string(),
  })
);

export const GetStorageItemTool = createTool(
  'storage',
  'getStorageItem',
  'Get an item from local or session storage',
  z.object({
    key: z.string(),
    storageType: z.enum(['local', 'session']).default('local'),
  })
);

export const SetStorageItemTool = createTool(
  'storage',
  'setStorageItem',
  'Set an item in local or session storage',
  z.object({
    key: z.string(),
    value: z.string(),
    storageType: z.enum(['local', 'session']).default('local'),
  })
);

export const DeleteStorageItemTool = createTool(
  'storage',
  'deleteStorageItem',
  'Delete an item from local or session storage',
  z.object({
    key: z.string(),
    storageType: z.enum(['local', 'session']).default('local'),
  })
);

// 历史与书签类工具
export const SearchHistoryTool = createTool(
  'history_bookmarks',
  'searchHistory',
  'Search browser history',
  z.object({
    text: z.string(),
    startTime: z.number().optional(), // Unix timestamp in milliseconds
    endTime: z.number().optional(), // Unix timestamp in milliseconds
    maxResults: z.number().int().optional().default(100),
  })
);

export const DeleteHistoryUrlTool = createTool(
  'history_bookmarks',
  'deleteHistoryUrl',
  'Delete a specific URL from browser history',
  z.object({
    url: z.string().url(),
  })
);

export const CreateBookmarkTool = createTool(
  'history_bookmarks',
  'createBookmark',
  'Create a new bookmark',
  z.object({
    title: z.string().optional(),
    url: z.string().url(),
    parentId: z.string().optional(), // ID of the parent folder
  })
);

export const SearchBookmarksTool = createTool(
  'history_bookmarks',
  'searchBookmarks',
  'Search bookmarks',
  z.object({
    query: z.string(),
  })
);

// 实用工具类
export const WaitTool = createTool(
  'utility',
  'wait',
  'Wait for a specified duration (backend only)',
  z.object({
    time: z.number().min(0, "Time must be positive"),
  })
);

export const ScreenshotTool = createTool(
  'utility',
  'screenshot',
  'Take a screenshot of the current visible tab',
  z.object({}) // No parameters needed as per background.js implementation
);

export const ClearBrowsingDataTool = createTool(
  'utility',
  'clearBrowsingData',
  'Clear browsing data',
  z.object({
    dataTypes: z.array(z.enum([
      'appcache', 'cache', 'cookies', 'downloads', 'fileSystems',
      'formData', 'history', 'indexedDB', 'localStorage',
      'pluginData', 'passwords', 'serviceWorkers', 'webSQL'
    ])),
    since: z.number().optional(), // Unix timestamp in milliseconds
  })
);

// 快照工具 (uses get_content internally via captureAriaSnapshot)
export const SnapshotTool = createTool(
  'snapshot',
  'snapshot',
  'Take a snapshot of the current page state (DOM/ARIA)',
  z.object({})
);

// 按类别分组工具
export const TOOLS_BY_CATEGORY = {
  navigation: [NavigateTool, RefreshPageTool],
  interaction: [ClickTool, HoverTool, TypeTool, ScrollPageTool],
  page_content: [GetPageContentTool, GetElementAttributeTool, GetCurrentStateTool],
  advanced: [ExecuteCustomScriptTool],
  tab_management: [GetAllTabsTool, CreateTabTool, CloseTabTool, FocusTabTool],
  window_management: [GetAllWindowsTool, CreateWindowTool, CloseWindowTool, FocusWindowTool],
  storage: [GetCookiesTool, SetCookieTool, DeleteCookieTool, GetStorageItemTool, SetStorageItemTool, DeleteStorageItemTool],
  history_bookmarks: [SearchHistoryTool, DeleteHistoryUrlTool, CreateBookmarkTool, SearchBookmarksTool],
  utility: [WaitTool, ScreenshotTool, ClearBrowsingDataTool],
  snapshot: [SnapshotTool],
};

// 所有工具列表
export const ALL_TOOLS = [
  ...TOOLS_BY_CATEGORY.navigation,
  ...TOOLS_BY_CATEGORY.interaction,
  ...TOOLS_BY_CATEGORY.page_content,
  ...TOOLS_BY_CATEGORY.advanced,
  ...TOOLS_BY_CATEGORY.tab_management,
  ...TOOLS_BY_CATEGORY.window_management,
  ...TOOLS_BY_CATEGORY.storage,
  ...TOOLS_BY_CATEGORY.history_bookmarks,
  ...TOOLS_BY_CATEGORY.utility,
  ...TOOLS_BY_CATEGORY.snapshot
];

// 工具类型定义 (包含所有当前定义的工具)
export type ToolType = 
  | typeof NavigateTool
  | typeof RefreshPageTool
  | typeof ClickTool
  | typeof HoverTool
  | typeof TypeTool
  | typeof ScrollPageTool
  | typeof GetPageContentTool
  | typeof GetElementAttributeTool
  | typeof GetCurrentStateTool
  | typeof ExecuteCustomScriptTool
  | typeof GetAllTabsTool
  | typeof CreateTabTool
  | typeof CloseTabTool
  | typeof FocusTabTool
  | typeof GetAllWindowsTool
  | typeof CreateWindowTool
  | typeof CloseWindowTool
  | typeof FocusWindowTool
  | typeof GetCookiesTool
  | typeof SetCookieTool
  | typeof DeleteCookieTool
  | typeof GetStorageItemTool
  | typeof SetStorageItemTool
  | typeof DeleteStorageItemTool
  | typeof SearchHistoryTool
  | typeof DeleteHistoryUrlTool
  | typeof CreateBookmarkTool
  | typeof SearchBookmarksTool
  | typeof WaitTool
  | typeof ScreenshotTool
  | typeof ClearBrowsingDataTool
  | typeof SnapshotTool;