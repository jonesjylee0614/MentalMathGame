import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { BattleModeComponent } from '../../../components/gameModes/BattleModeComponent';

const encouragingMessages = [
  '✅ 太棒了！答对啦！',
  '🌟 你真聪明！',
  '🎉 太厉害了！',
  '💪 做得好！',
  '👏 完美答案！',
  '🚀 你是数学小天才！',
  '⭐ 真棒！继续加油！',
  '🎯 正确！太准了！',
];

/**
 * 战斗模式
 * 植物 vs 僵尸风格的战斗游戏
 */
export class BattleMode extends BaseGameMode {
  readonly id = 'battle';
  readonly name = '战斗模式';

  private timers: number[] = []; // 存储所有定时器，用于清理

  protected initState() {
    return {
      plantAttacking: false,
      zombieAttacking: false,
      zombieDamaged: false,
      playerDamaged: false,
      showStars: false,
      encouragingMsg: '',
      projectiles: {
        plant: [] as string[],
        zombie: [] as string[]
      }
    };
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);
    
    // 随机鼓励消息
    const randomMsg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    
    // 触发植物攻击动画
    this.setState({
      plantAttacking: true,
      showStars: true,
      encouragingMsg: randomMsg
    });

    // 发射子弹
    const bulletId = `bullet-${Date.now()}`;
    this.state.projectiles.plant.push(bulletId);
    this.emit('plantBulletFired', { bulletId });

    // 600ms后僵尸受伤
    const timer1 = window.setTimeout(() => {
      this.setState({ zombieDamaged: true });
      this.emit('zombieDamaged', {});
    }, 600);
    this.timers.push(timer1);

    // 2秒后重置动画
    const timer2 = window.setTimeout(() => {
      this.setState({
        plantAttacking: false,
        zombieDamaged: false,
        showStars: false
      });
      this.clearProjectiles('plant');
    }, 2000);
    this.timers.push(timer2);
  }

  onWrongAnswer(
    question: Question, 
    snapshot: GameSnapshot, 
    userAnswer: string, 
    correctAnswer: string
  ): void {
    super.onWrongAnswer(question, snapshot, userAnswer, correctAnswer);

    // 触发僵尸攻击动画
    this.setState({
      zombieAttacking: true
    });

    // 发射石头
    const bulletId = `rock-${Date.now()}`;
    this.state.projectiles.zombie.push(bulletId);
    this.emit('zombieBulletFired', { bulletId });

    // 500ms后植物受伤
    const timer1 = window.setTimeout(() => {
      this.setState({ playerDamaged: true });
      this.emit('playerDamaged', {});
    }, 500);
    this.timers.push(timer1);

    // 1.2秒后重置动画
    const timer2 = window.setTimeout(() => {
      this.setState({
        zombieAttacking: false,
        playerDamaged: false
      });
      this.clearProjectiles('zombie');
    }, 1200);
    this.timers.push(timer2);
  }

  private clearProjectiles(type: 'plant' | 'zombie'): void {
    this.setState({
      projectiles: {
        ...this.state.projectiles,
        [type]: []
      }
    });
  }

  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    super.destroy();
  }

  getComponent() {
    return BattleModeComponent;
  }
}

/**
 * 战斗模式工厂
 */
export const BattleModeFactory = {
  modeId: 'battle',
  name: '战斗模式工厂',
  create: (config: any, context: any) => {
    const mode = new BattleMode();
    mode.init(config, context);
    return mode;
  }
};

