import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { RacingModeComponent } from '../../../components/gameModes/RacingModeComponent';

const encouragingMessages = [
  '🏃 冲刺！领先啦！',
  '⚡ 太快了！像闪电！',
  '🚀 加速前进！',
  '💨 追不上你啦！',
  '🎯 完美冲刺！',
  '⭐ 继续保持！',
  '🔥 势不可挡！',
  '👏 精彩表现！',
];

const trackThemes = {
  easy: { player: '🏃', opponent: '🐢', name: '跑步比赛' },
  medium: { player: '🚗', opponent: '🐇', name: '赛车竞速' },
  hard: { player: '🏊', opponent: '🤖', name: '游泳挑战' }
};

/**
 * 赛跑模式
 * 跑步比赛、赛车、游泳竞速
 */
export class RacingMode extends BaseGameMode {
  readonly id = 'racing';
  readonly name = '赛跑模式';

  private timers: number[] = []; // 存储所有定时器，用于清理

  protected initState() {
    // 根据难度选择主题
    const difficulty = this.config.level?.difficulty || 1;
    let theme;
    if (difficulty <= 2) {
      theme = trackThemes.easy;
    } else if (difficulty <= 4) {
      theme = trackThemes.medium;
    } else {
      theme = trackThemes.hard;
    }

    return {
      playerPosition: 0, // 0-100%
      opponentPosition: 0,
      trackLength: 100,
      playerSpeed: 8, // 每次答对前进8%
      opponentSpeed: 2, // 每次答错对手前进2%
      playerRunning: false,
      opponentRunning: false,
      showSpeedLines: false,
      encouragingMsg: '',
      theme: theme,
      raceFinished: false,
      winner: null as 'player' | 'opponent' | null
    };
  }

  onGameStart(totalQuestions: number): void {
    super.onGameStart(totalQuestions);
    
    // 计算速度，确保在完成所有题目前不会到达终点
    const playerSpeed = Math.floor(95 / totalQuestions);
    this.setState({
      playerSpeed: Math.max(3, Math.min(playerSpeed, 10)),
      totalQuestions
    });
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);
    
    if (this.state.raceFinished) return;

    // 随机鼓励消息
    const randomMsg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    
    // 玩家前进
    const newPosition = Math.min(100, this.state.playerPosition + this.state.playerSpeed);
    
    this.setState({
      playerPosition: newPosition,
      playerRunning: true,
      showSpeedLines: true,
      encouragingMsg: randomMsg
    });

    this.emit('playerAdvance', { from: this.state.playerPosition, to: newPosition });

    // 检查是否到达终点
    if (newPosition >= 100) {
      this.finishRace('player');
    }

    // 600ms后停止跑步动画
    const timer1 = window.setTimeout(() => {
      this.setState({
        playerRunning: false,
        showSpeedLines: false
      });
    }, 600);
    this.timers.push(timer1);
  }

  onWrongAnswer(
    question: Question, 
    snapshot: GameSnapshot, 
    userAnswer: string, 
    correctAnswer: string
  ): void {
    super.onWrongAnswer(question, snapshot, userAnswer, correctAnswer);

    if (this.state.raceFinished) return;

    // 对手前进
    const newPosition = Math.min(100, this.state.opponentPosition + this.state.opponentSpeed);
    
    this.setState({
      opponentPosition: newPosition,
      opponentRunning: true
    });

    this.emit('opponentAdvance', { from: this.state.opponentPosition, to: newPosition });

    // 检查对手是否到达终点
    if (newPosition >= 100) {
      this.finishRace('opponent');
    }

    // 800ms后停止跑步动画
    const timer1 = window.setTimeout(() => {
      this.setState({
        opponentRunning: false
      });
    }, 800);
    this.timers.push(timer1);
  }

  private finishRace(winner: 'player' | 'opponent'): void {
    this.setState({
      raceFinished: true,
      winner: winner,
      playerRunning: false,
      opponentRunning: false,
      showSpeedLines: false
    });

    this.emit('raceFinished', { winner });

    // 播放胜利或失败音效
    if (winner === 'player') {
      this.context.soundPlayer.play('victory');
    } else {
      this.context.soundPlayer.play('defeat');
    }
  }

  onUpdate(snapshot: GameSnapshot): void {
    super.onUpdate(snapshot);
    
    // 如果时间紧迫且玩家落后，给对手加速
    if (snapshot.timeLeft < 10 && !this.state.raceFinished) {
      if (this.state.playerPosition < this.state.opponentPosition) {
        // 对手缓慢前进
        const slowAdvance = 0.5; // 每次更新前进0.5%
        const newOpponentPos = Math.min(100, this.state.opponentPosition + slowAdvance);
        
        if (newOpponentPos !== this.state.opponentPosition) {
          this.setState({
            opponentPosition: newOpponentPos
          });
          
          if (newOpponentPos >= 100 && !this.state.raceFinished) {
            this.finishRace('opponent');
          }
        }
      }
    }
  }

  onGameEnd(result: GameResult): void {
    super.onGameEnd(result);
    
    // 如果游戏结束但比赛未结束，判定胜负
    if (!this.state.raceFinished) {
      const winner = this.state.playerPosition >= this.state.opponentPosition 
        ? 'player' 
        : 'opponent';
      this.finishRace(winner);
    }
  }

  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    super.destroy();
  }

  getComponent() {
    return RacingModeComponent;
  }
}

/**
 * 赛跑模式工厂
 */
export const RacingModeFactory = {
  modeId: 'racing',
  name: '赛跑模式工厂',
  create: (config: any, context: any) => {
    const mode = new RacingMode();
    mode.init(config, context);
    return mode;
  }
};

