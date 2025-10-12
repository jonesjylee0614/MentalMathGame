import { IGameMode, GameModeConfig, GameContext, GameModeState, GameModeRenderProps } from './IGameMode';
import { Question, GameSnapshot, GameResult } from '../types';
import React from 'react';

/**
 * 游戏模式抽象基类
 * 提供默认实现和工具方法，子类可按需覆盖
 */
export abstract class BaseGameMode implements IGameMode {
  abstract readonly id: string;
  abstract readonly name: string;
  readonly version: string = '1.0.0';

  protected config!: GameModeConfig;
  protected context!: GameContext;
  protected state: Record<string, any> = {};

  init(config: GameModeConfig, context: GameContext): void {
    this.config = config;
    this.context = context;
    this.state = this.initState();
  }

  /**
   * 初始化模式特定状态（子类实现）
   */
  protected abstract initState(): Record<string, any>;

  onGameStart(totalQuestions: number): void {
    // 默认实现：记录总题数
    this.state.totalQuestions = totalQuestions;
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    // 默认实现：播放音效
    this.context.soundPlayer.play('success');
  }

  onWrongAnswer(
    question: Question, 
    snapshot: GameSnapshot, 
    userAnswer: string, 
    correctAnswer: string
  ): void {
    // 默认实现：播放音效
    this.context.soundPlayer.play('error');
  }

  onUpdate(snapshot: GameSnapshot): void {
    // 默认实现：更新通用状态
    this.state.currentQuestion = snapshot.questionIndex + 1;
    this.state.timeLeft = snapshot.timeLeft;
  }

  onGameEnd(result: GameResult): void {
    // 默认实现：清空状态
  }

  destroy(): void {
    // 默认实现：清理状态
    this.state = {};
  }

  getState(): GameModeState {
    return {
      mode: this.id,
      data: { ...this.state }
    };
  }

  abstract getComponent(): React.ComponentType<GameModeRenderProps>;

  /**
   * 工具方法：触发自定义事件
   */
  protected emit(eventName: string, payload: any): void {
    this.context.eventBus.emit(`gameMode:${this.id}:${eventName}`, payload);
  }

  /**
   * 工具方法：监听自定义事件
   */
  protected on(eventName: string, handler: (payload: any) => void): () => void {
    return this.context.eventBus.on(`gameMode:${this.id}:${eventName}`, handler);
  }

  /**
   * 工具方法：更新状态并触发渲染
   */
  protected setState(updates: Partial<Record<string, any>>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChange', this.getState());
  }
}

