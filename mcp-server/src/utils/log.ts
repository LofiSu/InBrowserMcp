/**
 * 日志工具模块
 * 提供调试日志功能，可以根据环境变量控制日志输出
 */

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * 当前日志级别，默认为 DEBUG
 * 可以通过环境变量 MCP_LOG_LEVEL 设置
 * - DEBUG: 所有日志
 * - INFO: 信息、警告和错误
 * - WARN: 警告和错误
 * - ERROR: 只有错误
 * - NONE: 不输出任何日志
 */
const getCurrentLogLevel = (): LogLevel => {
  const envLevel = process.env.MCP_LOG_LEVEL?.toUpperCase();
  switch (envLevel) {
    case 'DEBUG': return LogLevel.DEBUG;
    case 'INFO': return LogLevel.INFO;
    case 'WARN': return LogLevel.WARN;
    case 'ERROR': return LogLevel.ERROR;
    case 'NONE': return LogLevel.NONE;
    default: return LogLevel.DEBUG; // 默认为 DEBUG 级别
  }
};

/**
 * 获取当前时间戳字符串
 */
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * 输出调试日志
 * 
 * 由于 MCP 使用标准输入/输出作为传输，日志输出到 stderr
 * 可以通过环境变量 MCP_LOG_LEVEL 控制日志级别
 * 
 * @param args 日志参数，与 console.error 参数相同
 */
export const debugLog: typeof console.error = (...args) => {
  const currentLevel = getCurrentLogLevel();
  
  // 如果当前日志级别高于 DEBUG，则不输出
  if (currentLevel > LogLevel.DEBUG) {
    return;
  }
  
  // 添加时间戳前缀
  const timestamp = getTimestamp();
  const prefix = `[MCP:DEBUG ${timestamp}]`;
  
  // 输出到 stderr
  console.error(prefix, ...args);
};

/**
 * 输出信息日志
 * @param args 日志参数
 */
export const infoLog = (...args: any[]) => {
  const currentLevel = getCurrentLogLevel();
  
  // 如果当前日志级别高于 INFO，则不输出
  if (currentLevel > LogLevel.INFO) {
    return;
  }
  
  // 添加时间戳前缀
  const timestamp = getTimestamp();
  const prefix = `[MCP:INFO ${timestamp}]`;
  
  // 输出到 stderr
  console.error(prefix, ...args);
};

/**
 * 输出警告日志
 * @param args 日志参数
 */
export const warnLog = (...args: any[]) => {
  const currentLevel = getCurrentLogLevel();
  
  // 如果当前日志级别高于 WARN，则不输出
  if (currentLevel > LogLevel.WARN) {
    return;
  }
  
  // 添加时间戳前缀
  const timestamp = getTimestamp();
  const prefix = `[MCP:WARN ${timestamp}]`;
  
  // 输出到 stderr
  console.error(prefix, ...args);
};

/**
 * 输出错误日志
 * @param args 日志参数
 */
export const errorLog = (...args: any[]) => {
  const currentLevel = getCurrentLogLevel();
  
  // 如果当前日志级别高于 ERROR，则不输出
  if (currentLevel > LogLevel.ERROR) {
    return;
  }
  
  // 添加时间戳前缀
  const timestamp = getTimestamp();
  const prefix = `[MCP:ERROR ${timestamp}]`;
  
  // 输出到 stderr
  console.error(prefix, ...args);
};
