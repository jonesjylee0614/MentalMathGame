import { IGameMode, GameModeFactory, GameModeConfig, GameContext } from './IGameMode';

/**
 * 游戏模式管理器
 * 负责注册、创建、管理游戏模式实例
 */
export class GameModeManager {
  private static instance: GameModeManager;
  
  /** 已注册的模式工厂 */
  private factories = new Map<string, GameModeFactory>();
  
  /** 当前激活的模式实例 */
  private currentMode: IGameMode | null = null;

  private constructor() {
    // 私有构造函数，实现单例
  }

  static getInstance(): GameModeManager {
    if (!GameModeManager.instance) {
      GameModeManager.instance = new GameModeManager();
    }
    return GameModeManager.instance;
  }

  /**
   * 注册游戏模式
   * @param factory - 模式工厂
   */
  register(factory: GameModeFactory): void {
    if (this.factories.has(factory.modeId)) {
      console.warn(`游戏模式 ${factory.modeId} 已注册，将被覆盖`);
    }
    this.factories.set(factory.modeId, factory);
    console.log(`✅ 游戏模式 [${factory.modeId}] 注册成功`);
  }

  /**
   * 批量注册模式
   */
  registerAll(factories: GameModeFactory[]): void {
    factories.forEach(factory => this.register(factory));
  }

  /**
   * 创建游戏模式实例
   * @param modeId - 模式ID
   * @param config - 配置
   * @param context - 上下文
   */
  create(modeId: string, config: GameModeConfig, context: GameContext): IGameMode {
    const factory = this.factories.get(modeId);
    
    if (!factory) {
      console.warn(`游戏模式 [${modeId}] 未注册，使用默认模式 [battle]`);
      return this.createDefault(config, context);
    }

    try {
      const mode = factory.create(config, context);
      console.log(`🎮 创建游戏模式实例: ${mode.name} (${mode.id}@${mode.version})`);
      return mode;
    } catch (error) {
      console.error(`创建模式 [${modeId}] 失败:`, error);
      return this.createDefault(config, context);
    }
  }

  /**
   * 创建默认模式（战斗模式）
   */
  private createDefault(config: GameModeConfig, context: GameContext): IGameMode {
    const defaultFactory = this.factories.get('battle');
    if (!defaultFactory) {
      throw new Error('默认游戏模式 [battle] 未注册！');
    }
    return defaultFactory.create(config, context);
  }

  /**
   * 激活模式
   */
  activate(mode: IGameMode): void {
    if (this.currentMode) {
      this.deactivate();
    }
    this.currentMode = mode;
  }

  /**
   * 停用当前模式
   */
  deactivate(): void {
    if (this.currentMode) {
      this.currentMode.destroy();
      this.currentMode = null;
    }
  }

  /**
   * 获取当前激活的模式
   */
  getCurrentMode(): IGameMode | null {
    return this.currentMode;
  }

  /**
   * 获取所有已注册的模式
   */
  getRegisteredModes(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * 检查模式是否已注册
   */
  isRegistered(modeId: string): boolean {
    return this.factories.has(modeId);
  }
}

