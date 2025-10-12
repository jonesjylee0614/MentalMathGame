import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { CookingModeComponent } from '../../../components/gameModes/CookingModeComponent';

const cookingMessages = [
  '🍳 完美！食材加入了！',
  '👨‍🍳 太棒了！料理进行中！',
  '✨ 好香啊！继续加油！',
  '🌟 大厨水平！',
  '🔥 火候刚好！',
  '💯 美味度+1！',
  '🎉 色香味俱全！',
  '⭐ 米其林级别！',
];

const recipes = {
  easy: {
    name: '蛋炒饭',
    emoji: '🍚',
    ingredients: ['🥚', '🍚', '🥕', '🧅', '🫑'],
    cookware: '🍳',
    finalDish: '🍛'
  },
  medium: {
    name: '披萨',
    emoji: '🍕',
    ingredients: ['🫓', '🧀', '🍅', '🥓', '🫒'],
    cookware: '🔥',
    finalDish: '🍕'
  },
  hard: {
    name: '生日蛋糕',
    emoji: '🎂',
    ingredients: ['🥚', '🥛', '🍰', '🍓', '🍫'],
    cookware: '🎂',
    finalDish: '🎂'
  }
};

/**
 * 烹饪模式
 * 做菜、烹饪、调饮料
 * 答对添加食材，答错食材烧焦，完成展示成品
 */
export class CookingMode extends BaseGameMode {
  readonly id = 'cooking';
  readonly name = '烹饪模式';

  private timers: number[] = []; // 存储所有定时器，用于清理

  protected initState() {
    // 根据难度选择菜谱
    const difficulty = this.config.level?.difficulty || 1;
    let recipe;
    if (difficulty <= 2) {
      recipe = recipes.easy;
    } else if (difficulty <= 4) {
      recipe = recipes.medium;
    } else {
      recipe = recipes.hard;
    }

    return {
      recipe: recipe,
      ingredientsAdded: [] as string[], // 已添加的食材
      totalIngredients: 0,
      targetIngredients: 0, // 目标食材数（题目总数）
      currentIngredient: null as string | null, // 当前要添加的食材
      ingredientFlying: false, // 食材飞行动画
      ingredientBurned: false, // 食材烧焦
      potShaking: false, // 锅晃动
      cookingMsg: '',
      dishComplete: false, // 料理完成
      steamEffect: false, // 蒸汽效果
      sparkles: false // 闪光效果
    };
  }

  onGameStart(totalQuestions: number): void {
    super.onGameStart(totalQuestions);
    
    // 根据题目数量循环使用食材
    this.setState({
      targetIngredients: totalQuestions,
      totalIngredients: totalQuestions
    });

    // 准备第一个食材
    this.prepareNextIngredient();
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);
    
    if (this.state.dishComplete) return;

    // 随机鼓励消息
    const randomMsg = cookingMessages[Math.floor(Math.random() * cookingMessages.length)];
    
    // 添加食材
    const ingredient = this.state.currentIngredient;
    if (ingredient) {
      this.state.ingredientsAdded.push(ingredient);
    }

    this.setState({
      ingredientsAdded: this.state.ingredientsAdded,
      ingredientFlying: true,
      cookingMsg: randomMsg,
      steamEffect: true
    });

    this.emit('ingredientAdded', { ingredient });

    // 食材飞入动画
    const timer1 = window.setTimeout(() => {
      this.setState({
        ingredientFlying: false,
        currentIngredient: null
      });

      // 检查是否完成
      if (this.state.ingredientsAdded.length >= this.state.targetIngredients) {
        this.completeDish();
      } else {
        // 准备下一个食材
        this.prepareNextIngredient();
      }
    }, 800);
    this.timers.push(timer1);

    // 停止蒸汽效果
    const timer2 = window.setTimeout(() => {
      this.setState({
        steamEffect: false,
        cookingMsg: ''
      });
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

    if (this.state.dishComplete) return;

    // 食材烧焦效果
    this.setState({
      ingredientBurned: true,
      potShaking: true
    });

    this.emit('ingredientBurned', {});

    // 重置效果
    const timer = window.setTimeout(() => {
      this.setState({
        ingredientBurned: false,
        potShaking: false
      });
    }, 1000);
    this.timers.push(timer);
  }

  onUpdate(snapshot: GameSnapshot): void {
    super.onUpdate(snapshot);
    
    // 如果时间紧迫，锅会开始冒烟（紧张感）
    if (snapshot.timeLeft < 20 && !this.state.dishComplete) {
      if (!this.state.steamEffect) {
        this.setState({
          steamEffect: true
        });
      }
    }
  }

  /**
   * 准备下一个食材
   */
  private prepareNextIngredient(): void {
    if (this.state.dishComplete) return;

    const recipe = this.state.recipe;
    const addedCount = this.state.ingredientsAdded.length;
    
    // 循环使用食材列表
    const ingredientIndex = addedCount % recipe.ingredients.length;
    const nextIngredient = recipe.ingredients[ingredientIndex];

    this.setState({
      currentIngredient: nextIngredient
    });

    this.emit('ingredientPrepared', { ingredient: nextIngredient });
  }

  /**
   * 完成料理
   */
  private completeDish(): void {
    this.setState({
      dishComplete: true,
      sparkles: true,
      steamEffect: true,
      cookingMsg: `🎉 ${this.state.recipe.name}完成！`
    });

    this.emit('dishComplete', { recipe: this.state.recipe });
    this.context.soundPlayer.play('victory');

    // 持续闪光效果
    const timer = window.setTimeout(() => {
      this.setState({
        sparkles: false
      });
    }, 3000);
    this.timers.push(timer);
  }

  onGameEnd(result: GameResult): void {
    super.onGameEnd(result);
    
    // 如果游戏结束但料理未完成，判定为半成品
    if (!this.state.dishComplete && this.state.ingredientsAdded.length > 0) {
      this.setState({
        dishComplete: true,
        cookingMsg: '⏰ 时间到！料理完成度：' + 
          Math.round((this.state.ingredientsAdded.length / this.state.targetIngredients) * 100) + '%'
      });
    }
  }

  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    super.destroy();
  }

  getComponent() {
    return CookingModeComponent;
  }
}

/**
 * 烹饪模式工厂
 */
export const CookingModeFactory = {
  modeId: 'cooking',
  name: '烹饪模式工厂',
  create: (config: any, context: any) => {
    const mode = new CookingMode();
    mode.init(config, context);
    return mode;
  }
};

