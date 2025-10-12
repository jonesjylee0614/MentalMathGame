import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { PuzzleModeComponent } from '../../../components/gameModes/PuzzleModeComponent';

const successMessages = [
  '🔓 解锁一层！',
  '🎯 拼图出现了！',
  '✨ 图片更清晰了！',
  '🔑 又解开一层！',
  '🌟 继续揭秘！',
];

const completionMessages = [
  '🎉 完全解锁！',
  '✅ 拼图完成！',
  '🏆 真相大白！',
  '💎 宝箱打开了！',
];

/**
 * 解密模式
 * 通过答题逐渐揭示图片/解锁/打开宝箱
 */
export class PuzzleMode extends BaseGameMode {
  readonly id = 'puzzle';
  readonly name = '解密模式';

  private timers: number[] = []; // 存储所有定时器，用于清理

  protected initState() {
    // 从配置中获取拼图类型，默认为 'image'
    const puzzleType = this.config.modeConfig?.puzzleType || 'image';
    
    return {
      revealProgress: 0, // 0-100%
      targetProgress: 100,
      revealPerCorrect: 0, // 每次答对揭示的百分比（将在 onGameStart 中计算）
      puzzleType, // 'image' | 'lock' | 'chest'
      isRevealing: false, // 是否正在揭示动画中
      isComplete: false, // 是否完全解锁
      successMsg: '',
      completionMsg: '',
      // 解锁层级（用于 lock 类型）
      lockLayers: [
        { id: 1, unlocked: false },
        { id: 2, unlocked: false },
        { id: 3, unlocked: false },
        { id: 4, unlocked: false },
        { id: 5, unlocked: false },
      ],
      // 拼图块（用于 image 类型）
      puzzlePieces: [] as { id: number; revealed: boolean }[],
      // 宝箱状态（用于 chest 类型）
      chestOpenness: 0, // 0-100%
    };
  }

  onGameStart(totalQuestions: number): void {
    super.onGameStart(totalQuestions);
    
    // 计算每次答对揭示的百分比
    const revealPerCorrect = Math.floor(100 / totalQuestions);
    
    // 初始化拼图块
    const puzzlePieces = Array.from({ length: totalQuestions }, (_, i) => ({
      id: i,
      revealed: false
    }));

    this.setState({
      revealPerCorrect,
      puzzlePieces,
      totalQuestions
    });
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);
    
    // 随机成功消息
    const randomMsg = successMessages[Math.floor(Math.random() * successMessages.length)];
    
    // 计算新的进度
    const newProgress = Math.min(100, this.state.revealProgress + this.state.revealPerCorrect);
    
    // 触发揭示动画
    this.setState({
      isRevealing: true,
      successMsg: randomMsg,
      revealProgress: newProgress
    });

    // 根据不同类型处理
    this.handlePuzzleReveal(snapshot);

    // 检查是否完成
    if (newProgress >= 100 || snapshot.questionIndex + 1 >= this.state.totalQuestions) {
      const timer1 = window.setTimeout(() => {
        this.completePuzzle();
      }, 800);
      this.timers.push(timer1);
    }

    // 1.5秒后重置动画状态
    const timer2 = window.setTimeout(() => {
      this.setState({
        isRevealing: false,
        successMsg: ''
      });
    }, 1500);
    this.timers.push(timer2);

    this.emit('puzzleRevealed', { progress: newProgress });
  }

  onWrongAnswer(
    question: Question, 
    snapshot: GameSnapshot, 
    userAnswer: string, 
    correctAnswer: string
  ): void {
    super.onWrongAnswer(question, snapshot, userAnswer, correctAnswer);
    
    // 解密模式答错不倒退，只是没有进度
    // 可以添加一些提示动画
    this.setState({
      isRevealing: false
    });

    this.emit('wrongAnswer', { userAnswer, correctAnswer });
  }

  /**
   * 根据拼图类型处理揭示逻辑
   */
  private handlePuzzleReveal(snapshot: GameSnapshot): void {
    const { puzzleType } = this.state;

    if (puzzleType === 'lock') {
      // 解锁模式：逐层解锁
      const unlockedCount = Math.floor((this.state.revealProgress / 100) * this.state.lockLayers.length);
      const newLockLayers = this.state.lockLayers.map((layer: any, index: number) => ({
        ...layer,
        unlocked: index < unlockedCount
      }));
      this.setState({ lockLayers: newLockLayers });
    } else if (puzzleType === 'image') {
      // 拼图模式：逐块揭示
      const revealedCount = snapshot.questionIndex + 1;
      const newPuzzlePieces = this.state.puzzlePieces.map((piece: any, index: number) => ({
        ...piece,
        revealed: index < revealedCount
      }));
      this.setState({ puzzlePieces: newPuzzlePieces });
    } else if (puzzleType === 'chest') {
      // 宝箱模式：逐渐打开
      const openness = this.state.revealProgress;
      this.setState({ chestOpenness: openness });
    }
  }

  /**
   * 完成拼图
   */
  private completePuzzle(): void {
    const randomMsg = completionMessages[Math.floor(Math.random() * completionMessages.length)];
    
    this.setState({
      isComplete: true,
      completionMsg: randomMsg,
      revealProgress: 100,
      chestOpenness: 100
    });

    // 完全解锁所有层
    if (this.state.puzzleType === 'lock') {
      const allUnlocked = this.state.lockLayers.map((layer: any) => ({
        ...layer,
        unlocked: true
      }));
      this.setState({ lockLayers: allUnlocked });
    }

    // 揭示所有拼图块
    if (this.state.puzzleType === 'image') {
      const allRevealed = this.state.puzzlePieces.map((piece: any) => ({
        ...piece,
        revealed: true
      }));
      this.setState({ puzzlePieces: allRevealed });
    }

    this.emit('puzzleComplete', {});
  }

  onGameEnd(result: GameResult): void {
    super.onGameEnd(result);
    // 确保完成动画
    if (!this.state.isComplete) {
      this.completePuzzle();
    }
  }

  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    super.destroy();
  }

  getComponent() {
    return PuzzleModeComponent;
  }
}

/**
 * 解密模式工厂
 */
export const PuzzleModeFactory = {
  modeId: 'puzzle',
  name: '解密模式工厂',
  create: (config: any, context: any) => {
    const mode = new PuzzleMode();
    mode.init(config, context);
    return mode;
  }
};

