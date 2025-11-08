import { useState, useEffect } from 'react';
import { persistentLogger, LogEntry } from '../lib/persistentLogger';
import styles from '../styles/LogViewerPage.module.css';

export const LogViewerPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'debug'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshLogs = () => {
    const allLogs = persistentLogger.getLogs();
    if (filter === 'all') {
      setLogs(allLogs);
    } else {
      setLogs(persistentLogger.getLogsByLevel(filter));
    }
  };

  useEffect(() => {
    refreshLogs();

    if (autoRefresh) {
      const interval = setInterval(refreshLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [filter, autoRefresh]);

  const handleClearLogs = () => {
    if (confirm('确定要清空所有日志吗？')) {
      persistentLogger.clearLogs();
      refreshLogs();
    }
  };

  const handleExportLogs = () => {
    const text = persistentLogger.exportLogsAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return '#ff4444';
      case 'warn': return '#ffaa00';
      case 'info': return '#4444ff';
      case 'debug': return '#888888';
      default: return '#000000';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>日志查看器</h1>
        <div className={styles.controls}>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">全部</option>
            <option value="error">错误</option>
            <option value="warn">警告</option>
            <option value="info">信息</option>
            <option value="debug">调试</option>
          </select>
          
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            自动刷新
          </label>

          <button onClick={refreshLogs} className={styles.button}>
            刷新
          </button>
          
          <button onClick={handleExportLogs} className={styles.button}>
            导出
          </button>
          
          <button onClick={handleClearLogs} className={styles.buttonDanger}>
            清空
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <span>总日志数: {logs.length}</span>
        <span>错误: {persistentLogger.getLogsByLevel('error').length}</span>
        <span>警告: {persistentLogger.getLogsByLevel('warn').length}</span>
      </div>

      <div className={styles.logList}>
        {logs.length === 0 ? (
          <div className={styles.noLogs}>暂无日志</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={styles.logEntry}>
              <div className={styles.logHeader}>
                <span 
                  className={styles.logLevel}
                  style={{ color: getLevelColor(log.level) }}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span className={styles.logTime}>
                  {new Date(log.timestamp).toLocaleString('zh-CN')}
                </span>
              </div>
              <div className={styles.logMessage}>{log.message}</div>
              {log.context && (
                <pre className={styles.logContext}>
                  {JSON.stringify(log.context, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

