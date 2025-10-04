export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const sample = (arr) => arr[randInt(0, arr.length - 1)];

export const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const uid = () => Math.random().toString(36).slice(2, 11);

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const formatPercent = (value) => `${Math.round(value * 100)}%`;

export const sum = (numbers) => numbers.reduce((a, b) => a + b, 0);

export const average = (numbers) => (numbers.length ? sum(numbers) / numbers.length : 0);

export const pickDistinct = (min, max, count) => {
  const pool = new Set();
  const result = [];
  while (result.length < count) {
    const value = randInt(min, max);
    if (!pool.has(value)) {
      pool.add(value);
      result.push(value);
    }
  }
  return result;
};

export const ensureUnique = (generator, amount, toKey) => {
  const seen = new Set();
  const res = [];
  let attempts = 0;
  while (res.length < amount && attempts < amount * 20) {
    const item = generator();
    const key = toKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      res.push(item);
    }
    attempts += 1;
  }
  if (res.length < amount) {
    throw new Error('无法生成足够不重复的题目，请检查生成器参数');
  }
  return res;
};

export const parseRange = (value, fallback) => {
  if (typeof value === 'number') return { min: value, max: value };
  if (typeof value === 'string' && value.includes('..')) {
    const [min, max] = value.split('..').map(Number);
    if (Number.isFinite(min) && Number.isFinite(max) && min <= max) {
      return { min, max };
    }
  }
  return { min: fallback ?? 2, max: fallback ?? 3 };
};

export const formatDate = (ts) => {
  const date = new Date(ts);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const pluralize = (value, unit) => `${value} ${unit}`;
