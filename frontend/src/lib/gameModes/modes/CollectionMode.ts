import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { CollectionModeComponent } from '../../../components/gameModes/CollectionModeComponent';

/**
 * 收集主题配置
 */
export const collectionThemes = {
  fruit: {
    name: '果园采摘',
    items: ['🍎', '🍊', '🍓', '🍌', '🍇'],
    background: 'linear-gradient(135deg, #FFE5B4 0%, #98D8C8 100%)',
    container: '🧺',
    containerName: '篮子'
  },
  gem: {
    name: '宝石矿洞',
    items: ['💎', '⭐', '✨', '🔮', '💠'],
    background: 'linear-gradient(135deg, #2C3E50 0%, #4A569D 100%)',
    container: '⛏️',
    containerName: '矿车'
  },
  ocean: {
    name: '海底探险',
    items: ['🐠', '🐚', '🦀', '🐙', '🦈'],
    background: 'linear-gradient(135deg, #1E3A8A 0%, #0EA5E9 100%)',
    container: '🪣',
    containerName: '水桶'
  }
};

export type CollectionTheme = keyof typeof collectionThemes;

/**
 * 收集模式
 * 收集星星、水果、宝石等物品到容器中
 */
export class CollectionMode extends BaseGameMode {
  readonly id = 'collection';
  readonly name = '收集模式';

  private timers: number[] = []; // 存储所有定时器，用于清理

  protected initState() {
    // 从配置中获取主题，默认为水果
    const theme = (this.config?.modeConfig?.theme as CollectionTheme) || 'fruit';
    const themeConfig = collectionThemes[theme];

    return {
      theme,
      themeConfig,
      collectedItems: [] as string[],
      basket: [] as { id: string; emoji: string; timestamp: number }[],
      targetCount: 0,
      collectingItem: null as string | null,
      droppingItem: null as string | null,
      showSuccess: false,
      showError: false
    };
  }

  onGameStart(totalQuestions: number): void {
    super.onGameStart(totalQuestions);
    this.setState({
      targetCount: totalQuestions
    });
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);

    // 随机选择一个物品
    const items = this.state.themeConfig.items;
    const randomItem = items[Math.floor(Math.random() * items.length)];

    // 创建物品实例
    const item = {
      id: `item-${Date.now()}`,
      emoji: randomItem,
      timestamp: Date.now()
    };

    // 触发收集动画
    this.setState({
      collectingItem: randomItem,
      showSuccess: true
    });

    // 500ms后添加到篮子
    const timer1 = window.setTimeout(() => {
      this.state.basket.push(item);
      this.setState({
        basket: [...this.state.basket]
      });
      this.emit('itemCollected', { item });
    }, 500);
    this.timers.push(timer1);

    // 1秒后隐藏收集动画
    const timer2 = window.setTimeout(() => {
      this.setState({
        collectingItem: null,
        showSuccess: false
      });
    }, 1000);
    this.timers.push(timer2);
  }

  onWrongAnswer(
    question: Question,
    snapshot: GameSnapshot,
    userAnswer: string,
    correctAnswer: string
  ): void {
    super.onWrongAnswer(question, snapshot, userAnswer, correctAnswer);

    // 如果篮子里有物品，掉出一个
    if (this.state.basket.length > 0) {
      const droppedItem = this.state.basket[this.state.basket.length - 1];
      
      // 触发掉落动画
      this.setState({
        droppingItem: droppedItem.emoji,
        showError: true
      });

      // 300ms后从篮子移除
      const timer1 = window.setTimeout(() => {
        this.state.basket.pop();
        this.setState({
          basket: [...this.state.basket]
        });
        this.emit('itemDropped', { item: droppedItem });
      }, 300);
      this.timers.push(timer1);

      // 800ms后隐藏掉落动画
      const timer2 = window.setTimeout(() => {
        this.setState({
          droppingItem: null,
          showError: false
        });
      }, 800);
      this.timers.push(timer2);
    } else {
      // 篮子为空时，只显示错误提示
      this.setState({
        showError: true
      });

      const timer = window.setTimeout(() => {
        this.setState({
          showError: false
        });
      }, 800);
      this.timers.push(timer);
    }
  }

  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    super.destroy();
  }

  getComponent() {
    return CollectionModeComponent;
  }
}

/**
 * 收集模式工厂
 */
export const CollectionModeFactory = {
  modeId: 'collection',
  name: '收集模式工厂',
  create: (config: any, context: any) => {
    const mode = new CollectionMode();
    mode.init(config, context);
    return mode;
  }
};

