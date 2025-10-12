import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { DefenseModeComponent } from '../../../components/gameModes/DefenseModeComponent';

/**
 * 敌人类型定义
 */
interface Enemy {
  id: string;
  emoji: string;
  position: number; // 0-100，从右到左
  speed: number;
  question: Question | null;
  defeated: boolean;
}

/**
 * 防守模式
 * 塔防风格，敌人从右侧走来，答对题目击退敌人
 */
export class DefenseMode extends BaseGameMode {
  readonly id = 'defense';
  readonly name = '防守模式';

  private timers: number[] = []; // 存储所有定时器，用于清理
  private intervals: number[] = []; // 存储所有interval，用于清理
  private enemyTypes = ['👾', '👹', '🦹', '🦸', '🤖', '👽', '💀'];

  protected initState() {
    return {
      castleHP: 100,
      maxCastleHP: 100,
      enemies: [] as Enemy[],
      currentEnemy: null as Enemy | null,
      enemiesDefeated: 0,
      totalEnemies: 0,
      waveNumber: 1,
      showExplosion: false,
      showDamage: false,
      showVictory: false,
      lastShot: Date.now()
    };
  }

  onGameStart(totalQuestions: number): void {
    super.onGameStart(totalQuestions);
    this.setState({
      totalEnemies: totalQuestions,
      castleHP: 100,
      maxCastleHP: 100
    });
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);

    // 找到当前问题对应的敌人
    const enemy = this.state.enemies.find(
      (e: Enemy) => e.question && e.question.id === question.id && !e.defeated
    );

    if (enemy) {
      // 击败敌人
      enemy.defeated = true;
      this.setState({
        enemiesDefeated: this.state.enemiesDefeated + 1,
        showExplosion: true,
        lastShot: Date.now()
      });

      this.emit('enemyDefeated', { enemy });

      // 1秒后移除敌人和爆炸效果
      const timer = window.setTimeout(() => {
        const index = this.state.enemies.findIndex((e: Enemy) => e.id === enemy.id);
        if (index !== -1) {
          this.state.enemies.splice(index, 1);
        }
        this.setState({
          showExplosion: false,
          currentEnemy: null
        });
      }, 1000);
      this.timers.push(timer);

      // 检查是否全部完成
      if (this.state.enemiesDefeated >= this.state.totalEnemies) {
        this.onDefenseComplete();
      }
    }
  }

  onWrongAnswer(
    question: Question, 
    snapshot: GameSnapshot, 
    userAnswer: string, 
    correctAnswer: string
  ): void {
    super.onWrongAnswer(question, snapshot, userAnswer, correctAnswer);

    // 答错不惩罚，但给予提示
    this.emit('wrongAnswerWarning', {});
  }

  /**
   * 每秒更新游戏状态
   */
  onUpdate(snapshot: GameSnapshot): void {
    super.onUpdate(snapshot);

    // 更新所有敌人位置
    this.state.enemies.forEach((enemy: Enemy) => {
      if (!enemy.defeated) {
        enemy.position -= enemy.speed;
        
        // 如果敌人到达城堡
        if (enemy.position <= 0 && !enemy.defeated) {
          this.onEnemyReachCastle(enemy);
        }
      }
    });

    // 触发状态更新以重新渲染
    this.emit('stateChange', this.getState());
  }

  /**
   * 敌人到达城堡
   */
  private onEnemyReachCastle(enemy: Enemy): void {
    enemy.defeated = true;
    
    // 城堡受伤
    const damage = 20;
    const newHP = Math.max(0, this.state.castleHP - damage);
    
    this.setState({
      castleHP: newHP,
      showDamage: true
    });

    this.emit('castleDamaged', { damage, newHP });

    // 移除敌人
    const index = this.state.enemies.findIndex((e: Enemy) => e.id === enemy.id);
    if (index !== -1) {
      this.state.enemies.splice(index, 1);
    }

    // 500ms后隐藏受伤效果
    const timer = window.setTimeout(() => {
      this.setState({
        showDamage: false
      });
    }, 500);
    this.timers.push(timer);

    // 检查游戏是否失败
    if (newHP <= 0) {
      this.onDefenseFailed();
    }
  }

  /**
   * 生成新敌人
   */
  spawnEnemy(question: Question): void {
    const enemy: Enemy = {
      id: `enemy-${Date.now()}-${Math.random()}`,
      emoji: this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)],
      position: 100,
      speed: 0.5, // 每秒移动0.5%
      question: question,
      defeated: false
    };

    this.state.enemies.push(enemy);
    this.setState({
      currentEnemy: enemy
    });

    this.emit('enemySpawned', { enemy });
  }

  /**
   * 防守完成
   */
  private onDefenseComplete(): void {
    this.setState({
      showVictory: true
    });
    this.emit('defenseComplete', {});
  }

  /**
   * 防守失败
   */
  private onDefenseFailed(): void {
    this.emit('defenseFailed', {});
  }

  onGameEnd(result: GameResult): void {
    super.onGameEnd(result);
    // 清理所有敌人
    this.state.enemies = [];
  }

  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    
    // 清理所有interval
    this.intervals.forEach(interval => window.clearInterval(interval));
    this.intervals = [];
    
    super.destroy();
  }

  getComponent() {
    return DefenseModeComponent;
  }
}

/**
 * 防守模式工厂
 */
export const DefenseModeFactory = {
  modeId: 'defense',
  name: '防守模式工厂',
  create: (config: any, context: any) => {
    const mode = new DefenseMode();
    mode.init(config, context);
    return mode;
  }
};
