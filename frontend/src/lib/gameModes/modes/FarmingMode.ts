import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { FarmingModeComponent } from '../../../components/gameModes/FarmingModeComponent';

const encouragingMessages = [
  '🌱 植物成长了！',
  '💧 浇水成功！',
  '🌻 花儿在长大！',
  '✨ 长得真好！',
  '🌺 快要开花了！',
];

const bugMessages = [
  '🐛 出现害虫了！',
  '😰 小心害虫！',
  '🐞 有虫子来了！',
];

const completionMessages = [
  '🌺 花园盛开！',
  '🎉 满园春色！',
  '🏆 园丁大师！',
  '✨ 花朵盛开！',
];

/**
 * 植物生长阶段
 */
const GROWTH_STAGES = [
  { stage: 0, emoji: '🌱', name: '种子', color: '#8B4513' },
  { stage: 1, emoji: '🌿', name: '发芽', color: '#90EE90' },
  { stage: 2, emoji: '🪴', name: '幼苗', color: '#32CD32' },
  { stage: 3, emoji: '🌻', name: '开花', color: '#FFD700' },
  { stage: 4, emoji: '🌺', name: '盛开', color: '#FF69B4' },
];

/**
 * 种植模式
 * 照顾植物，看它从种子长成美丽的花朵
 */
export class FarmingMode extends BaseGameMode {
  readonly id = 'farming';
  readonly name = '种植模式';

  private timers: number[] = []; // 存储所有定时器，用于清理

  protected initState() {
    // 从配置中获取花园类型，默认为 'flower'
    const gardenType = this.config.modeConfig?.gardenType || 'flower';
    // 植物数量（默认根据题目数量自动计算）
    const plantsCount = this.config.modeConfig?.plantsCount || 0;
    
    return {
      totalQuestions: 0,
      correctCount: 0, // 答对的题目数
      plantsCount, // 花园中的植物数量
      plants: [] as any[], // 植物列表
      gardenType, // 'flower' | 'tree' | 'vegetable'
      currentGrowthStage: 0, // 当前整体生长阶段
      isWatering: false, // 是否正在浇水
      hasBug: false, // 是否有害虫
      bugPosition: { x: 0, y: 0 }, // 害虫位置
      isComplete: false, // 是否完成
      successMsg: '',
      bugMsg: '',
      completionMsg: '',
      waterDrops: [] as any[], // 水滴动画
    };
  }

  onGameStart(totalQuestions: number): void {
    super.onGameStart(totalQuestions);
    
    // 计算植物数量（如果未指定，则根据题目数量自动计算）
    let plantsCount = this.state.plantsCount;
    if (plantsCount === 0) {
      // 根据题目数量自动计算：每5题一株植物，最少3株，最多8株
      plantsCount = Math.max(3, Math.min(8, Math.ceil(totalQuestions / 5)));
    }

    // 初始化植物
    const plants = Array.from({ length: plantsCount }, (_, i) => ({
      id: i,
      growthStage: 0, // 初始都是种子
      position: this.getPlantPosition(i, plantsCount),
      isActive: false, // 是否是当前生长的植物
    }));

    // 第一株植物是激活状态
    if (plants.length > 0) {
      plants[0].isActive = true;
    }

    this.setState({
      totalQuestions,
      plantsCount,
      plants,
      correctCount: 0,
      currentGrowthStage: 0,
    });
  }

  /**
   * 计算植物在花园中的位置
   */
  private getPlantPosition(index: number, total: number): { x: number; y: number } {
    // 创建一个类似花园的布局
    const rows = Math.ceil(Math.sqrt(total));
    const cols = Math.ceil(total / rows);
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    // 百分比位置，带一些随机偏移
    const baseX = (col + 0.5) / cols * 100;
    const baseY = (row + 0.5) / rows * 100;
    const randomOffsetX = (Math.random() - 0.5) * 5;
    const randomOffsetY = (Math.random() - 0.5) * 5;
    
    return {
      x: Math.max(10, Math.min(90, baseX + randomOffsetX)),
      y: Math.max(15, Math.min(85, baseY + randomOffsetY)),
    };
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);
    
    const randomMsg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    
    // 增加答对计数
    const newCorrectCount = this.state.correctCount + 1;
    
    // 计算应该达到的生长阶段
    // 每株植物需要经历5个阶段，根据答对数量决定当前植物和阶段
    const questionsPerPlant = Math.ceil(this.state.totalQuestions / this.state.plantsCount);
    const currentPlantIndex = Math.floor((newCorrectCount - 1) / questionsPerPlant);
    const stageWithinPlant = Math.floor(((newCorrectCount - 1) % questionsPerPlant) / questionsPerPlant * GROWTH_STAGES.length);
    
    // 更新植物状态
    const newPlants = [...this.state.plants];
    if (currentPlantIndex < newPlants.length) {
      // 激活当前植物
      newPlants.forEach((p, i) => {
        p.isActive = i === currentPlantIndex;
      });
      
      // 更新当前植物的生长阶段
      const newStage = Math.min(GROWTH_STAGES.length - 1, stageWithinPlant + 1);
      newPlants[currentPlantIndex].growthStage = newStage;
      
      // 如果当前植物已完全成长，激活下一株
      if (newStage >= GROWTH_STAGES.length - 1 && currentPlantIndex + 1 < newPlants.length) {
        newPlants[currentPlantIndex].isActive = false;
        newPlants[currentPlantIndex + 1].isActive = true;
      }
    }

    // 触发浇水动画
    this.setState({
      isWatering: true,
      successMsg: randomMsg,
      correctCount: newCorrectCount,
      plants: newPlants,
      currentGrowthStage: Math.floor(newCorrectCount / questionsPerPlant * GROWTH_STAGES.length),
    });

    // 添加水滴动画
    this.addWaterDrops();

    // 检查是否全部完成
    const allPlantsFullyGrown = newPlants.every(p => p.growthStage >= GROWTH_STAGES.length - 1);
    if (allPlantsFullyGrown || newCorrectCount >= this.state.totalQuestions) {
      const timer1 = window.setTimeout(() => {
        this.completeGarden();
      }, 1000);
      this.timers.push(timer1);
    }

    // 1.5秒后重置动画状态
    const timer2 = window.setTimeout(() => {
      this.setState({
        isWatering: false,
        successMsg: '',
        waterDrops: [],
      });
    }, 1500);
    this.timers.push(timer2);

    this.emit('plantGrown', { correctCount: newCorrectCount, plants: newPlants });
  }

  onWrongAnswer(
    question: Question, 
    snapshot: GameSnapshot, 
    userAnswer: string, 
    correctAnswer: string
  ): void {
    super.onWrongAnswer(question, snapshot, userAnswer, correctAnswer);
    
    const randomMsg = bugMessages[Math.floor(Math.random() * bugMessages.length)];
    
    // 触发害虫出现动画（随机位置）
    const bugPosition = {
      x: 20 + Math.random() * 60,
      y: 30 + Math.random() * 50,
    };

    this.setState({
      hasBug: true,
      bugMsg: randomMsg,
      bugPosition,
    });

    this.emit('bugAppeared', { bugPosition });

    // 害虫飞走（2秒后消失）
    const timer = window.setTimeout(() => {
      this.setState({
        hasBug: false,
        bugMsg: '',
      });
    }, 2000);
    this.timers.push(timer);
  }

  /**
   * 添加水滴动画
   */
  private addWaterDrops(): void {
    const drops = Array.from({ length: 5 }, (_, i) => ({
      id: `drop-${Date.now()}-${i}`,
      x: 45 + Math.random() * 10,
      y: 10 + Math.random() * 5,
      delay: i * 0.1,
    }));

    this.setState({ waterDrops: drops });
  }

  /**
   * 完成花园
   */
  private completeGarden(): void {
    const randomMsg = completionMessages[Math.floor(Math.random() * completionMessages.length)];
    
    // 所有植物全部盛开
    const allBlooming = this.state.plants.map((plant: any) => ({
      ...plant,
      growthStage: GROWTH_STAGES.length - 1,
      isActive: false,
    }));

    this.setState({
      isComplete: true,
      completionMsg: randomMsg,
      plants: allBlooming,
    });

    this.emit('gardenComplete', {});
  }

  onGameEnd(result: GameResult): void {
    super.onGameEnd(result);
    // 确保完成动画
    if (!this.state.isComplete) {
      this.completeGarden();
    }
  }

  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    super.destroy();
  }

  getComponent() {
    return FarmingModeComponent;
  }
}

/**
 * 种植模式工厂
 */
export const FarmingModeFactory = {
  modeId: 'farming',
  name: '种植模式工厂',
  create: (config: any, context: any) => {
    const mode = new FarmingMode();
    mode.init(config, context);
    return mode;
  }
};

// 导出生长阶段常量供组件使用
export { GROWTH_STAGES };
