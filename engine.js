import { buildQuestions } from './generators.js';
import { Store } from './store.js';
import { clamp } from './utils.js';

const defaultHP = { player: 100, monster: 100 };

const normalizeInput = (answer, question) => {
  if (typeof answer !== 'string') return '';
  const trimmed = answer.trim();
  if (question.kind === 'pair') {
    const parts = trimmed.replace(/，/g, ',').split(/[,\s]+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]},${parts[1]}`;
    }
    return trimmed.replace(/\s+/g, '');
  }
  if (question.kind === 'compare') {
    const map = { greater: '>', less: '<', equal: '=' };
    return map[trimmed] || trimmed;
  }
  return trimmed;
};

class GameEngine extends EventTarget {
  constructor() {
    super();
    this.reset();
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
    this.timer = null;
    this.hp = { ...defaultHP };
    this.hpMax = { ...defaultHP };
    this.history = [];
    this.startedAt = null;
  }

  init(level) {
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
      monster: hpCfg.monster ?? defaultHP.monster,
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
    this.timer = setInterval(() => this.tick(), 1000);
  }

  getCurrentQuestion() {
    return this.questions[this.current] || null;
  }

  submit(rawAnswer) {
    if (this.state !== 'playing') return;
    const question = this.getCurrentQuestion();
    if (!question) return;
    const answer = normalizeInput(rawAnswer, question);
    const correct = answer === question.answer;
    const damagePerHit = Math.max(1, Math.ceil(this.hpMax.monster / this.questions.length));
    const damageOnMiss = Math.max(
      5,
      Math.ceil(this.hpMax.player / Math.max(1, Math.round(this.questions.length / 2)))
    );

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

  snapshot() {
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
      history: this.history.slice(),
    };
  }

  computeScore(outcome) {
    const used = this.timeTotal - this.timeLeft;
    const accuracy = this.questions.length === 0 ? 0 : this.correct / this.questions.length;
    const base = this.correct * 10;
    const timeBonus = Math.max(0, Math.ceil((this.timeLeft / (this.timeTotal || 1)) * 200));
    const difficultyBonus = Math.round((this.level.difficulty || 1) * 10);
    const score = Math.max(0, Math.round(base + this.comboScore + timeBonus + difficultyBonus));
    return {
      score,
      correct: this.correct,
      total: this.questions.length,
      comboMax: this.maxCombo,
      accuracy,
      timeUsed: used,
      timeLeft: this.timeLeft,
      outcome,
    };
  }

  finish(reason) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.state !== 'playing') return;
    const outcome = reason === 'victory' ? 'victory' : reason === 'defeat' ? 'defeat' : 'timeout';
    if (reason !== 'victory' && this.hp.monster <= 0) {
      // ensure victory when怪物倒下
      this.hp.monster = 0;
    }
    this.state = 'result';
    const result = this.computeScore(outcome);
    Store.recordResult({
      levelId: this.level.id,
      score: result.score,
      timeUsed: result.timeUsed,
      total: result.total,
      correct: result.correct,
      accuracy: result.accuracy,
      comboMax: result.comboMax,
      outcome,
    });
    sessionStorage.setItem('mentalGame:lastResult', JSON.stringify({
      ...result,
      levelId: this.level.id,
      levelName: this.level.name,
      history: this.history,
    }));
    this.dispatch('update', this.snapshot());
    this.dispatch('finish', result);
  }
}

export const Game = new GameEngine();
