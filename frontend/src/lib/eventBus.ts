type EventHandler = (payload: any) => void;

/**
 * 简单的事件总线实现
 * 用于游戏模式内部通信
 */
export class EventBus {
  private events: Map<string, Set<EventHandler>> = new Map();

  /**
   * 监听事件
   */
  on(eventName: string, handler: EventHandler): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)!.add(handler);

    // 返回取消监听的函数
    return () => {
      this.events.get(eventName)?.delete(handler);
    };
  }

  /**
   * 触发事件
   */
  emit(eventName: string, payload?: any): void {
    const handlers = this.events.get(eventName);
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }

  /**
   * 监听一次性事件
   */
  once(eventName: string, handler: EventHandler): () => void {
    const wrapper = (payload: any) => {
      handler(payload);
      this.events.get(eventName)?.delete(wrapper);
    };
    return this.on(eventName, wrapper);
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.events.clear();
  }
}

