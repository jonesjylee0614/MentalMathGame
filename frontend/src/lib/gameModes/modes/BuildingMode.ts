import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { BuildingModeComponent } from '../../../components/gameModes/BuildingModeComponent';

interface Block {
  id: string;
  type: 'block';
  emoji: string;
  level: number;
}

/**
 * 建造模式
 * 盖房子、建城堡、搭积木
 */
export class BuildingMode extends BaseGameMode {
  readonly id = 'building';
  readonly name = '建造模式';

  private timers: number[] = []; // 存储所有定时器，用于清理

  protected initState() {
    return {
      blocks: [] as Block[],
      buildingHeight: 0,
      targetHeight: 0,
      buildingType: this.config.modeConfig?.buildingType || 'tower',
      lastBlockShake: false,
      isComplete: false
    };
  }

  onGameStart(totalQuestions: number): void {
    super.onGameStart(totalQuestions);
    this.setState({
      targetHeight: totalQuestions
    });
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);

    // 添加一块积木
    const block: Block = {
      id: `block-${Date.now()}`,
      type: 'block',
      emoji: '🧱',
      level: this.state.buildingHeight
    };

    this.state.blocks.push(block);
    this.setState({
      buildingHeight: this.state.buildingHeight + 1
    });

    // 触发积木飞入动画
    this.emit('blockAdded', { block });

    // 检查是否完成建筑
    if (this.state.buildingHeight >= this.state.targetHeight) {
      this.setState({ isComplete: true });
      this.emit('buildingComplete', {});
      this.playCompletionAnimation();
    }
  }

  onWrongAnswer(
    question: Question, 
    snapshot: GameSnapshot, 
    userAnswer: string, 
    correctAnswer: string
  ): void {
    super.onWrongAnswer(question, snapshot, userAnswer, correctAnswer);

    // 触发最后一块积木抖动
    this.setState({
      lastBlockShake: true
    });

    const timer = window.setTimeout(() => {
      this.setState({
        lastBlockShake: false
      });
    }, 600);
    this.timers.push(timer);
  }

  private playCompletionAnimation(): void {
    // 完成动画：烟花、彩带等
    this.emit('fireworks', {});
  }

  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    super.destroy();
  }

  getComponent() {
    return BuildingModeComponent;
  }
}

/**
 * 建造模式工厂
 */
export const BuildingModeFactory = {
  modeId: 'building',
  name: '建造模式工厂',
  create: (config: any, context: any) => {
    const mode = new BuildingMode();
    mode.init(config, context);
    return mode;
  }
};

