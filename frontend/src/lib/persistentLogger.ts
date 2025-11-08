/**
 * 持久化日志工具
 * 日志会保存到localStorage,不会因为页面刷新而丢失
 */

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: any;
}

const MAX_LOGS = 500; // 最多保存500条日志
const STORAGE_KEY = 'app_logs';

class PersistentLogger {
  private logs: LogEntry[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('加载日志失败:', error);
    }
  }

  private saveLogs() {
    try {
      // 只保留最新的MAX_LOGS条日志
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('保存日志失败:', error);
    }
  }

  private log(level: LogEntry['level'], message: string, context?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    this.logs.push(entry);
    this.saveLogs();

    // 同时输出到控制台
    const consoleMethod = level === 'error' ? console.error : 
                          level === 'warn' ? console.warn : 
                          console.log;
    
    if (context) {
      consoleMethod(`[${level.toUpperCase()}] ${message}`, context);
    } else {
      consoleMethod(`[${level.toUpperCase()}] ${message}`);
    }
  }

  debug(message: string, context?: any) {
    this.log('debug', message, context);
  }

  info(message: string, context?: any) {
    this.log('info', message, context);
  }

  warn(message: string, context?: any) {
    this.log('warn', message, context);
  }

  error(message: string, context?: any) {
    this.log('error', message, context);
  }

  // 获取所有日志
  getLogs(): LogEntry[] {
    return this.logs;
  }

  // 清空日志
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  // 导出日志为文本
  exportLogsAsText(): string {
    return this.logs.map(log => {
      const context = log.context ? `\n  Context: ${JSON.stringify(log.context, null, 2)}` : '';
      return `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${context}`;
    }).join('\n\n');
  }

  // 按级别筛选日志
  getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
}

export const persistentLogger = new PersistentLogger();

// 导出一个React Hook用于查看日志
export function useLogger() {
  return persistentLogger;
}

