export type Operator = '+' | '-' | '×' | '÷';

export interface QuestionMeta {
  [key: string]: unknown;
}

export type QuestionKind = 'normal' | 'fill' | 'pair' | 'compare';

export interface Question {
  id: string;
  text: string;
  answer: string;
  kind: QuestionKind;
  meta?: QuestionMeta;
}

export interface Level {
  id: string;
  category: string;
  name: string;
  desc: string;
  generator: Record<string, unknown>;
  count: number;
  timeSec: number;
  difficulty: number;
  hp?: {
    player?: number;
    monster?: number;
  };
}

export interface Profile {
  name: string;
  createdAt: number;
}

export interface Settings {
  audio: boolean;
  shake: boolean;
  colorblind: boolean;
  fontScale: number;
}

export interface ProgressEntry {
  levelId: string;
  bestScore: number;
  bestTimeSec: number;
  bestAccuracy: number;
  playCount: number;
  lastPlayedAt: number;
  lastOutcome?: 'victory' | 'defeat' | 'timeout';
}

export interface Stats {
  totalScore: number;
  totalPlays: number;
  totalCorrect: number;
  totalWrong: number;
  totalTimeSec: number;
  bestCombo: number;
}

export interface GameSnapshot {
  level: Level | null;
  questionIndex: number;
  questionTotal: number;
  correct: number;
  combo: number;
  maxCombo: number;
  hp: { player: number; monster: number };
  hpMax: { player: number; monster: number };
  timeLeft: number;
  timeTotal: number;
  history: Array<{ id: string; correct: boolean; answer: string; expected: string }>;
}

export interface GameResult {
  score: number;
  correct: number;
  total: number;
  comboMax: number;
  accuracy: number;
  timeUsed: number;
  timeLeft: number;
  outcome: 'victory' | 'defeat' | 'timeout';
  levelId?: string;
  levelName?: string;
  history?: Array<{ id: string; correct: boolean; answer: string; expected: string }>;
}
