import { buildQuestions } from './generators';
import { GameResult, GameSnapshot, Level, Question } from './types';
import { clamp } from './utils';

type GameState = 'idle' | 'preparing' | 'playing' | 'result';

type GameEvents = {
  statechange: { state: GameState };
  question: Question | null;
  update: GameSnapshot;
  feedback: { correct: boolean; expected?: string };
  finish: GameResult;
};

type EventKey = keyof GameEvents;

type Listener<K extends EventKey> = (payload: GameEvents[K]) => void;

const defaultHP = { player: 100, monster: 100 };

const normalizeInput = (answer: string, question: Question) => {
  const trimmed = answer.trim();
  if (question.kind === 'pair') {
    const parts = trimmed
      .replace(/，/g, ',')
      .split(/[,\s]+/)
      .filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]},${parts[1]}`;
    }
    return trimmed.replace(/\s+/g, '');
  }
  if (question.kind === 'compare') {
    const map: Record<string, string> = { greater: '>', less: '<', equal: '=' };
    return map[trimmed] || trimmed;
  }
  return trimmed;
};

export class GameEngine {
  private level: Level | null = null;
  private state: GameState = 'idle';
  private questions: Question[] = [];
  private current = 0;
  private correct = 0;
  private combo = 0;
  private maxCombo = 0;
  private score = 0;
  private comboScore = 0;
  private timeLeft = 0;
  private timeTotal = 0;
  private timer: number | null = null;
  private hp = { ...defaultHP };
  private hpMax = { ...defaultHP };
  private history: Array<{ id: string; correct: boolean; answer: string; expected: string }> = [];
  private startedAt: number | null = null;
  private listeners: { [K in EventKey]: Set<Listener<K>> } = {
    statechange: new Set(),
    question: new Set(),
    update: new Set(),
    feedback: new Set(),
    finish: new Set()
  };

  on<K extends EventKey>(event: K, handler: Listener<K>) {
    this.listeners[event].add(handler);
    return () => this.listeners[event].delete(handler);
  }

  private dispatch<K extends EventKey>(event: K, payload: GameEvents[K]) {
    this.listeners[event].forEach((listener) => listener(payload));
  }

  reset() {
    this.level = null;
    this.state = 'idle';
    this.questions = [];
    this.current = 0;
    this.correct = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.score = 0;
    this.comboScore = 0;
    this.timeLeft = 0;
    this.timeTotal = 0;
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.hp = { ...defaultHP };
    this.hpMax = { ...defaultHP };
    this.history = [];
    this.startedAt = null;
  }

  init(level: Level) {
    this.reset();
    this.level = level;
    this.state = 'preparing';
    this.dispatch('statechange', { state: this.state });
  }

  start() {
    if (!this.level) throw new Error('未初始化关卡');
    this.questions = buildQuestions(this.level);
    const hpCfg = this.level.hp || defaultHP;
    this.hpMax = {
      player: hpCfg.player ?? defaultHP.player,
      monster: hpCfg.monster ?? defaultHP.monster
    };
    this.hp = { ...this.hpMax };
    this.timeTotal = this.level.timeSec;
    this.timeLeft = this.timeTotal;
    this.current = 0;
    this.correct = 0;
    this.combo = 0;
    this.comboScore = 0;
    this.score = 0;
    this.maxCombo = 0;
    this.history = [];
    this.startedAt = Date.now();
    this.state = 'playing';
    this.dispatch('statechange', { state: this.state });
    this.dispatch('question', this.getCurrentQuestion());
    this.dispatch('update', this.snapshot());
    this.timer = window.setInterval(() => this.tick(), 1000);
  }

  getCurrentQuestion() {
    return this.questions[this.current] ?? null;
  }

  submit(rawAnswer: string) {
    if (this.state !== 'playing') return;
    const question = this.getCurrentQuestion();
    if (!question) return;
    const answer = normalizeInput(rawAnswer, question);
    const correct = answer === question.answer;
    const damagePerHit = Math.max(1, Math.ceil(this.hpMax.monster / this.questions.length));
    const damageOnMiss = Math.max(5, Math.ceil(this.hpMax.player / Math.max(1, Math.round(this.questions.length / 2))));

    if (correct) {
      this.correct += 1;
      this.combo += 1;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.comboScore += this.combo * this.combo;
      this.hp.monster = clamp(this.hp.monster - damagePerHit, 0, this.hpMax.monster);
      this.history.push({ id: question.id, correct: true, answer, expected: question.answer });
      this.dispatch('feedback', { correct: true });
    } else {
      this.combo = 0;
      this.hp.player = clamp(this.hp.player - damageOnMiss, 0, this.hpMax.player);
      this.history.push({ id: question.id, correct: false, answer, expected: question.answer });
      this.dispatch('feedback', { correct: false, expected: question.answer });
    }

    this.current += 1;
    if (this.hp.monster <= 0) {
      this.finish('victory');
      return;
    }
    if (this.hp.player <= 0) {
      this.finish('defeat');
      return;
    }
    if (this.current >= this.questions.length) {
      const outcome = this.hp.monster <= 0 ? 'victory' : 'defeat';
      this.finish(outcome);
      return;
    }
    this.dispatch('update', this.snapshot());
    this.dispatch('question', this.getCurrentQuestion());
  }

  tick() {
    if (this.state !== 'playing') return;
    this.timeLeft = clamp(this.timeLeft - 1, 0, this.timeTotal);
    if (this.timeLeft <= 0) {
      this.finish('timeout');
      return;
    }
    this.dispatch('update', this.snapshot());
  }

  snapshot(): GameSnapshot {
    return {
      level: this.level,
      questionIndex: this.current,
      questionTotal: this.questions.length,
      correct: this.correct,
      combo: this.combo,
      maxCombo: this.maxCombo,
      hp: { ...this.hp },
      hpMax: { ...this.hpMax },
      timeLeft: this.timeLeft,
      timeTotal: this.timeTotal,
      history: this.history.slice()
    };
  }

  private computeScore(outcome: GameResult['outcome']): Omit<GameResult, 'levelId' | 'levelName' | 'history'> {
    const used = this.timeTotal - this.timeLeft;
    const accuracy = this.questions.length === 0 ? 0 : this.correct / this.questions.length;
    const base = this.correct * 10;
    const timeBonus = Math.max(0, Math.ceil((this.timeLeft / (this.timeTotal || 1)) * 200));
    const difficultyBonus = Math.round((this.level?.difficulty || 1) * 10);
    const score = Math.max(0, Math.round(base + this.comboScore + timeBonus + difficultyBonus));
    return {
      score,
      correct: this.correct,
      total: this.questions.length,
      comboMax: this.maxCombo,
      accuracy,
      timeUsed: used,
      timeLeft: this.timeLeft,
      outcome
    };
  }

  finish(reason: 'victory' | 'defeat' | 'timeout') {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (this.state !== 'playing') return;
    const outcome = reason === 'victory' ? 'victory' : reason === 'defeat' ? 'defeat' : 'timeout';
    if (reason !== 'victory' && this.hp.monster <= 0) {
      this.hp.monster = 0;
    }
    this.state = 'result';
    const result = this.computeScore(outcome);
    const payload: GameResult = {
      ...result,
      levelId: this.level?.id,
      levelName: this.level?.name,
      history: this.history.slice()
    };
    this.dispatch('update', this.snapshot());
    this.dispatch('finish', payload);
  }
}

export const Game = new GameEngine();
