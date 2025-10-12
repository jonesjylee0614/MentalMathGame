import { Question, GameSnapshot, GameResult, Level, Settings } from '../types';
import { GameEngine } from '../engine';
import React from 'react';

/**
 * 游戏上下文
 */
export interface GameContext {
  /** 引擎引用 */
  engine: GameEngine;
  
  /** 事件总线 */
  eventBus: EventBus;
  
  /** 音效播放器 */
  soundPlayer: SoundPlayer;
}

/**
 * 事件总线接口
 */
export interface EventBus {
  on(eventName: string, handler: (payload: any) => void): () => void;
  emit(eventName: string, payload?: any): void;
  once(eventName: string, handler: (payload: any) => void): () => void;
  clear(): void;
}

/**
 * 音效播放器接口
 */
export interface SoundPlayer {
  play(sound: 'success' | 'error'): void;
}

/**
 * 模式配置
 */
export interface GameModeConfig {
  /** 关卡信息 */
  level: Level;
  
  /** 模式特定配置 */
  modeConfig?: Record<string, any>;
  
  /** 用户设置 */
  settings: Settings;
}

/**
 * 模式状态（由各模式自定义）
 */
export interface GameModeState {
  /** 模式ID */
  mode: string;
  
  /** 自定义状态数据 */
  data: Record<string, any>;
}

/**
 * 渲染属性
 */
export interface GameModeRenderProps {
  /** 模式状态 */
  state: GameModeState;
  
  /** 游戏快照 */
  snapshot: GameSnapshot;
  
  /** 当前题目 */
  question: Question | null;
  
  /** 反馈信息 */
  feedback: { correct: boolean; expected?: string } | null;
}

/**
 * 游戏模式标准接口
 */
export interface IGameMode {
  /** 模式唯一标识 */
  readonly id: string;
  
  /** 模式名称 */
  readonly name: string;
  
  /** 模式版本 (用于兼容性检查) */
  readonly version: string;

  /** 
   * 初始化模式
   * @param config - 关卡配置
   * @param context - 游戏上下文（引擎引用、事件总线等）
   */
  init(config: GameModeConfig, context: GameContext): void;

  /**
   * 游戏开始
   * @param totalQuestions - 总题目数
   */
  onGameStart(totalQuestions: number): void;

  /**
   * 答题正确回调
   * @param question - 当前题目
   * @param snapshot - 游戏快照
   */
  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void;

  /**
   * 答题错误回调
   * @param question - 当前题目
   * @param snapshot - 游戏快照
   * @param userAnswer - 用户答案
   * @param correctAnswer - 正确答案
   */
  onWrongAnswer(
    question: Question, 
    snapshot: GameSnapshot, 
    userAnswer: string, 
    correctAnswer: string
  ): void;

  /**
   * 游戏状态更新（每秒触发）
   * @param snapshot - 游戏快照
   */
  onUpdate(snapshot: GameSnapshot): void;

  /**
   * 游戏结束
   * @param result - 游戏结果
   */
  onGameEnd(result: GameResult): void;

  /**
   * 销毁模式（清理资源）
   */
  destroy(): void;

  /**
   * 获取当前模式状态（用于渲染）
   */
  getState(): GameModeState;

  /**
   * 获取渲染组件
   */
  getComponent(): React.ComponentType<GameModeRenderProps>;
}

/**
 * 游戏模式工厂接口
 */
export interface GameModeFactory {
  /** 模式ID */
  readonly modeId: string;
  
  /** 工厂名称 */
  readonly name: string;
  
  /** 创建模式实例 */
  create(config: GameModeConfig, context: GameContext): IGameMode;
}

