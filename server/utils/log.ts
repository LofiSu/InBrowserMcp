/**
 * 调试日志函数
 * 将日志信息输出到控制台
 *
 * 使用console.error是因为标准输入/输出用作MCP的传输通道
 */
export const debugLog: typeof console.error = (...args) => {
  console.error(...args);
};
