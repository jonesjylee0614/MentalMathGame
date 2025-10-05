import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { GameResult, Profile, ProgressEntry, Settings, Stats } from '../lib/types';

const PREFIX = 'mentalGame:v2:';
const PROFILE_KEY = `${PREFIX}profile`;
const PROGRESS_KEY = `${PREFIX}progress`;
const STATS_KEY = `${PREFIX}stats`;
const SETTINGS_KEY = `${PREFIX}settings`;
const ACHIEVE_KEY = `${PREFIX}achievements`;
const LAST_RESULT_KEY = 'mentalGame:lastResult';

const defaultProfile: Profile = { name: '小勇士', createdAt: Date.now() };
const defaultSettings: Settings = { audio: true, shake: true, colorblind: false, fontScale: 1 };
const defaultStats: Stats = { totalScore: 0, totalPlays: 0, totalCorrect: 0, totalWrong: 0, totalTimeSec: 0, bestCombo: 0 };

const isBrowser = () => typeof window !== 'undefined';

const safeRead = <T,>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('读取 localStorage 失败', key, err);
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const ensureDefaults = () => {
  safeWrite(PROFILE_KEY, safeRead(PROFILE_KEY, defaultProfile));
  safeWrite(PROGRESS_KEY, safeRead(PROGRESS_KEY, [] as ProgressEntry[]));
  safeWrite(STATS_KEY, safeRead(STATS_KEY, defaultStats));
  safeWrite(SETTINGS_KEY, safeRead(SETTINGS_KEY, defaultSettings));
  safeWrite(ACHIEVE_KEY, safeRead(ACHIEVE_KEY, [] as string[]));
};

if (isBrowser()) {
  ensureDefaults();
}

interface GameContextValue {
  profile: Profile;
  settings: Settings;
  stats: Stats;
  progress: ProgressEntry[];
  achievements: string[];
  lastResult: GameResult | null;
  setProfile: (profile: Profile) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  recordResult: (result: GameResult & { levelId: string }) => void;
  refresh: () => void;
  setLastResult: (result: GameResult | null) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<Profile>(() => safeRead(PROFILE_KEY, defaultProfile));
  const [settings, setSettings] = useState<Settings>(() => safeRead(SETTINGS_KEY, defaultSettings));
  const [stats, setStats] = useState<Stats>(() => safeRead(STATS_KEY, defaultStats));
  const [progress, setProgress] = useState<ProgressEntry[]>(() => safeRead(PROGRESS_KEY, [] as ProgressEntry[]));
  const [achievements, setAchievements] = useState<string[]>(() => safeRead(ACHIEVE_KEY, [] as string[]));
  const [lastResult, setLastResultState] = useState<GameResult | null>(() => {
    if (!isBrowser()) return null;
    const raw = window.sessionStorage.getItem(LAST_RESULT_KEY);
    return raw ? (JSON.parse(raw) as GameResult) : null;
  });

  useEffect(() => {
    if (!isBrowser()) return;
    safeWrite(PROFILE_KEY, profile);
  }, [profile]);

  useEffect(() => {
    if (!isBrowser()) return;
    safeWrite(SETTINGS_KEY, settings);
  }, [settings]);

  useEffect(() => {
    if (!isBrowser()) return;
    safeWrite(STATS_KEY, stats);
  }, [stats]);

  useEffect(() => {
    if (!isBrowser()) return;
    safeWrite(PROGRESS_KEY, progress);
  }, [progress]);

  useEffect(() => {
    if (!isBrowser()) return;
    safeWrite(ACHIEVE_KEY, achievements);
  }, [achievements]);

  const refresh = useCallback(() => {
    setProfileState(safeRead(PROFILE_KEY, defaultProfile));
    setSettings(safeRead(SETTINGS_KEY, defaultSettings));
    setStats(safeRead(STATS_KEY, defaultStats));
    setProgress(safeRead(PROGRESS_KEY, [] as ProgressEntry[]));
    setAchievements(safeRead(ACHIEVE_KEY, [] as string[]));
    if (isBrowser()) {
      const raw = window.sessionStorage.getItem(LAST_RESULT_KEY);
      setLastResultState(raw ? (JSON.parse(raw) as GameResult) : null);
    }
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const recordResult = useCallback(
    (result: GameResult & { levelId: string }) => {
      setProgress((prev) => {
        const map = new Map(prev.map((item) => [item.levelId, item]));
        const existing = map.get(result.levelId);
        const now = Date.now();
        const entry: ProgressEntry =
          existing || {
            levelId: result.levelId,
            bestScore: 0,
            bestTimeSec: Number.MAX_SAFE_INTEGER,
            bestAccuracy: 0,
            playCount: 0,
            lastPlayedAt: now
          };
        entry.playCount += 1;
        entry.lastPlayedAt = now;
        if (result.score > entry.bestScore) entry.bestScore = result.score;
        if (result.timeUsed < entry.bestTimeSec) entry.bestTimeSec = result.timeUsed;
        if (result.accuracy > entry.bestAccuracy) entry.bestAccuracy = result.accuracy;
        entry.lastOutcome = result.outcome;
        map.set(result.levelId, entry);
        return Array.from(map.values()).sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0));
      });

      setStats((prev) => ({
        totalScore: prev.totalScore + result.score,
        totalPlays: prev.totalPlays + 1,
        totalCorrect: prev.totalCorrect + result.correct,
        totalWrong: prev.totalWrong + (result.total - result.correct),
        totalTimeSec: prev.totalTimeSec + result.timeUsed,
        bestCombo: Math.max(prev.bestCombo, result.comboMax)
      }));

      setLastResultState(result);
      if (isBrowser()) {
        window.sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
      }
    },
    []
  );

  const value = useMemo<GameContextValue>(
    () => ({
      profile,
      settings,
      stats,
      progress,
      achievements,
      lastResult,
      setProfile: setProfileState,
      updateSettings,
      recordResult,
      refresh,
      setLastResult: (res) => {
        setLastResultState(res);
        if (!isBrowser()) return;
        if (res) {
          window.sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(res));
        } else {
          window.sessionStorage.removeItem(LAST_RESULT_KEY);
        }
      }
    }),
    [achievements, lastResult, profile, progress, recordResult, refresh, settings, stats, updateSettings]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('GameContext 未初始化');
  return ctx;
};
