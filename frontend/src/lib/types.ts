export type Operator = '+' | '-' | '×' | '÷';

/**
 * 游戏模式类型
 */
export type GameMode = 
  | 'battle'      // 战斗模式
  | 'building'    // 建造模式
  | 'collection'  // 收集模式
  | 'racing'      // 赛跑模式
  | 'puzzle'      // 解密模式
  | 'farming'     // 种植模式
  | 'adventure'   // 探险模式
  | 'defense'     // 防守模式
  | 'fishing'     // 钓鱼模式
  | 'cooking';    // 烹饪模式

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
  
  // 🔧 新设计：支持多种游戏模式
  recommendedModes?: GameMode[]; // 推荐的游戏模式（可多个）
  defaultMode?: GameMode;        // 默认模式（用户未选择时使用）
  modeConfig?: Record<string, any>; // 模式特定配置，可以针对不同模式设置不同配置
  
  // ⚠️ 向后兼容：保留旧字段，但优先使用新字段
  gameMode?: GameMode; // @deprecated 使用 defaultMode 代替
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
