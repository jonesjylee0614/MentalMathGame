const PREFIX = 'mentalGame:v1:';
const PROFILE_KEY = `${PREFIX}profile`;
const PROGRESS_KEY = `${PREFIX}progress`;
const STATS_KEY = `${PREFIX}stats`;
const SETTINGS_KEY = `${PREFIX}settings`;
const ACHIEVE_KEY = `${PREFIX}achievements`;

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('读取 localStorage 失败', key, err);
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const ensureDefaults = () => {
  if (!read(PROFILE_KEY)) {
    write(PROFILE_KEY, {
      name: '小勇士',
      createdAt: Date.now(),
    });
  }
  if (!read(PROGRESS_KEY)) {
    write(PROGRESS_KEY, []);
  }
  if (!read(STATS_KEY)) {
    write(STATS_KEY, {
      totalScore: 0,
      totalPlays: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalTimeSec: 0,
      bestCombo: 0,
    });
  }
  if (!read(SETTINGS_KEY)) {
    write(SETTINGS_KEY, {
      audio: true,
      shake: true,
      colorblind: false,
      fontScale: 1,
    });
  }
  if (!read(ACHIEVE_KEY)) {
    write(ACHIEVE_KEY, []);
  }
};

ensureDefaults();

const getProgressMap = () => {
  const list = read(PROGRESS_KEY, []);
  const map = new Map();
  list.forEach((item) => map.set(item.levelId, item));
  return map;
};

const saveProgressMap = (map) => {
  write(PROGRESS_KEY, Array.from(map.values()));
};

export const Store = {
  getProfile: () => read(PROFILE_KEY, { name: '小勇士', createdAt: Date.now() }),
  setProfile: (profile) => write(PROFILE_KEY, profile),

  getSettings: () => read(SETTINGS_KEY, { audio: true, shake: true, colorblind: false, fontScale: 1 }),
  updateSettings: (patch) => {
    const current = Store.getSettings();
    const next = { ...current, ...patch };
    write(SETTINGS_KEY, next);
    return next;
  },

  getStats: () => read(STATS_KEY, { totalScore: 0, totalPlays: 0, totalCorrect: 0, totalWrong: 0, totalTimeSec: 0, bestCombo: 0 }),
  getProgress: () => read(PROGRESS_KEY, []),
  getProgressByLevel: (levelId) => getProgressMap().get(levelId) || null,

  recordResult: (result) => {
    const {
      levelId,
      score,
      timeUsed,
      total,
      correct,
      accuracy,
      comboMax,
      outcome,
    } = result;
    const map = getProgressMap();
    const existing = map.get(levelId);
    const now = Date.now();
    const entry = existing || {
      levelId,
      bestScore: 0,
      bestTimeSec: Number.MAX_SAFE_INTEGER,
      bestAccuracy: 0,
      playCount: 0,
      lastPlayedAt: now,
    };
    entry.playCount += 1;
    entry.lastPlayedAt = now;
    if (score > entry.bestScore) entry.bestScore = score;
    if (timeUsed < entry.bestTimeSec) entry.bestTimeSec = timeUsed;
    if (accuracy > entry.bestAccuracy) entry.bestAccuracy = accuracy;
    entry.lastOutcome = outcome;
    map.set(levelId, entry);
    saveProgressMap(map);

    const stats = Store.getStats();
    stats.totalScore += score;
    stats.totalPlays += 1;
    stats.totalCorrect += correct;
    stats.totalWrong += total - correct;
    stats.totalTimeSec += timeUsed;
    if (comboMax > stats.bestCombo) stats.bestCombo = comboMax;
    write(STATS_KEY, stats);
  },

  getAchievements: () => read(ACHIEVE_KEY, []),
  unlockAchievement: (id) => {
    const list = new Set(Store.getAchievements());
    if (!list.has(id)) {
      list.add(id);
      write(ACHIEVE_KEY, Array.from(list));
    }
  },
};
