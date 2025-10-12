import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { FishingModeComponent } from '../../../components/gameModes/FishingModeComponent';

/**
 * 鱼类定义
 */
interface Fish {
  id: string;
  emoji: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  score: number;
  caught: boolean;
}

/**
 * 钓鱼状态
 */
type FishingState = 'idle' | 'waiting' | 'hooked' | 'catching' | 'caught' | 'escaped';

/**
 * 鱼类配置
 */
const FISH_TYPES = [
  // 普通鱼 (70%概率)
  { emoji: '🐟', name: '小鱼', rarity: 'common' as const, score: 10 },
  { emoji: '🐠', name: '热带鱼', rarity: 'common' as const, score: 10 },
  { emoji: '🐡', name: '河豚', rarity: 'common' as const, score: 15 },
  
  // 稀有鱼 (20%概率)
  { emoji: '🦈', name: '鲨鱼', rarity: 'rare' as const, score: 30 },
  { emoji: '🐙', name: '章鱼', rarity: 'rare' as const, score: 35 },
  { emoji: '🦑', name: '鱿鱼', rarity: 'rare' as const, score: 30 },
  
  // 史诗鱼 (8%概率)
  { emoji: '🐬', name: '海豚', rarity: 'epic' as const, score: 50 },
  { emoji: '🐳', name: '鲸鱼', rarity: 'epic' as const, score: 60 },
  
  // 传说鱼 (2%概率)
  { emoji: '🦀', name: '黄金蟹', rarity: 'legendary' as const, score: 100 },
  { emoji: '🐉', name: '龙鱼', rarity: 'legendary' as const, score: 150 }
];

const encouragingMessages = {
  common: ['🎣 钓到小鱼！', '🐟 不错的开始！', '🐠 继续钓鱼！'],
  rare: ['🌟 稀有鱼！', '🦈 运气不错！', '🎉 好鱼上钩！'],
  epic: ['⭐⭐ 史诗级！', '🐬 太棒了！', '💎 珍稀鱼类！'],
  legendary: ['🏆 传说之鱼！', '👑 传奇收获！', '🌈 超级幸运！']
};

/**
 * 钓鱼模式
 * 通过答题钓鱼，收集各种鱼类
 */
export class FishingMode extends BaseGameMode {
  readonly id = 'fishing';
  readonly name = '钓鱼模式';

  private timers: number[] = [];

  protected initState() {
    return {
      fishingState: 'idle' as FishingState,
      currentFish: null as Fish | null,
      caughtFish: [] as Fish[],
      totalScore: 0,
      combo: 0,
      bestCombo: 0,
      fishEscaped: 0,
      totalQuestions: 0,
      answeredQuestions: 0,
      showCelebration: false,
      showEscape: false,
      encouragingMsg: '',
      waterRipple: false,
      rodCasting: false,
      rodPulling: false
    };
  }

  onGameStart(totalQuestions: number): void {
    super.onGameStart(totalQuestions);
    this.setState({
      totalQuestions,
      answeredQuestions: 0,
      totalScore: 0,
      caughtFish: [],
      combo: 0,
      bestCombo: 0
    });
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);

    this.setState({
      answeredQuestions: this.state.answeredQuestions + 1,
      combo: this.state.combo + 1,
      bestCombo: Math.max(this.state.bestCombo, this.state.combo + 1)
    });

    // 答对题目 - 成功钓鱼
    this.catchFish();
  }

  onWrongAnswer(
    question: Question, 
    snapshot: GameSnapshot, 
    userAnswer: string, 
    correctAnswer: string
  ): void {
    super.onWrongAnswer(question, snapshot, userAnswer, correctAnswer);

    this.setState({
      answeredQuestions: this.state.answeredQuestions + 1,
      combo: 0
    });

    // 答错题目 - 鱼逃跑
    this.fishEscape();
  }

  /**
   * 成功钓到鱼
   */
  private catchFish(): void {
    // 生成随机鱼类
    const fish = this.generateRandomFish();
    
    // 连击加成
    const comboBonus = Math.floor(this.state.combo * 0.1 * fish.score);
    const totalScore = fish.score + comboBonus;

    this.setState({
      fishingState: 'catching',
      currentFish: fish,
      rodPulling: true,
      waterRipple: true
    });

    this.emit('fishBiting', { fish });

    // 500ms后鱼上钩
    const timer1 = window.setTimeout(() => {
      fish.caught = true;
      this.state.caughtFish.push(fish);
      
      const newTotalScore = this.state.totalScore + totalScore;
      const messages = encouragingMessages[fish.rarity];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      
      this.setState({
        fishingState: 'caught',
        totalScore: newTotalScore,
        showCelebration: true,
        encouragingMsg: `${msg} +${totalScore}分${comboBonus > 0 ? ` (连击+${comboBonus})` : ''}`,
        rodPulling: false
      });

      this.emit('fishCaught', { fish, score: totalScore, combo: this.state.combo });
    }, 500);
    this.timers.push(timer1);

    // 2秒后重置
    const timer2 = window.setTimeout(() => {
      this.setState({
        fishingState: 'idle',
        currentFish: null,
        showCelebration: false,
        waterRipple: false
      });
    }, 2500);
    this.timers.push(timer2);
  }

  /**
   * 鱼逃跑
   */
  private fishEscape(): void {
    // 生成一条逃跑的鱼（让玩家知道错过了什么）
    const fish = this.generateRandomFish();

    this.setState({
      fishingState: 'escaped',
      currentFish: fish,
      fishEscaped: this.state.fishEscaped + 1,
      showEscape: true,
      waterRipple: true,
      encouragingMsg: '❌ 鱼跑了！再接再厉！'
    });

    this.emit('fishEscaped', { fish });

    // 1.5秒后重置
    const timer = window.setTimeout(() => {
      this.setState({
        fishingState: 'idle',
        currentFish: null,
        showEscape: false,
        waterRipple: false
      });
    }, 1500);
    this.timers.push(timer);
  }

  /**
   * 生成随机鱼类
   */
  private generateRandomFish(): Fish {
    const random = Math.random() * 100;
    let fishType;

    // 连击增加稀有鱼概率
    const comboBonus = Math.min(this.state.combo * 2, 20);
    
    if (random < 2 + comboBonus * 0.5) {
      // 传说 (2% + 连击加成)
      fishType = FISH_TYPES.filter(f => f.rarity === 'legendary')[
        Math.floor(Math.random() * FISH_TYPES.filter(f => f.rarity === 'legendary').length)
      ];
    } else if (random < 10 + comboBonus) {
      // 史诗 (8% + 连击加成)
      fishType = FISH_TYPES.filter(f => f.rarity === 'epic')[
        Math.floor(Math.random() * FISH_TYPES.filter(f => f.rarity === 'epic').length)
      ];
    } else if (random < 30) {
      // 稀有 (20%)
      fishType = FISH_TYPES.filter(f => f.rarity === 'rare')[
        Math.floor(Math.random() * FISH_TYPES.filter(f => f.rarity === 'rare').length)
      ];
    } else {
      // 普通 (70%)
      fishType = FISH_TYPES.filter(f => f.rarity === 'common')[
        Math.floor(Math.random() * FISH_TYPES.filter(f => f.rarity === 'common').length)
      ];
    }

    return {
      id: `fish-${Date.now()}-${Math.random()}`,
      emoji: fishType.emoji,
      name: fishType.name,
      rarity: fishType.rarity,
      score: fishType.score,
      caught: false
    };
  }

  /**
   * 计算稀有度统计
   */
  getRarityStats() {
    const stats = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    };

    this.state.caughtFish.forEach((fish: Fish) => {
      stats[fish.rarity]++;
    });

    return stats;
  }

  onGameEnd(result: GameResult): void {
    super.onGameEnd(result);
    
    const stats = this.getRarityStats();
    this.emit('fishingComplete', {
      totalFish: this.state.caughtFish.length,
      totalScore: this.state.totalScore,
      bestCombo: this.state.bestCombo,
      stats
    });
  }

  destroy(): void {
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    super.destroy();
  }

  getComponent() {
    return FishingModeComponent;
  }
}

/**
 * 钓鱼模式工厂
 */
export const FishingModeFactory = {
  modeId: 'fishing',
  name: '钓鱼模式工厂',
  create: (config: any, context: any) => {
    const mode = new FishingMode();
    mode.init(config, context);
    return mode;
  }
};

// 导出鱼类类型供组件使用
export { FISH_TYPES };
export type { Fish, FishingState };
