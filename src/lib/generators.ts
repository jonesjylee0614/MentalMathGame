import { ensureUnique, parseRange, randInt, sample, uid } from './utils';
import { Level, Question } from './types';

type GeneratorFactory = (level: Level) => Question[];

type GeneratorMap = Record<string, GeneratorFactory>;

const toQuestion = (text: string, answer: string | number, kind: Question['kind'] = 'normal', meta: Record<string, unknown> = {}): Question => ({
  id: uid(),
  text,
  answer: String(answer),
  kind,
  meta
});

const formatExpression = (parts: Array<string | number>) => parts.join(' ');

const padTens = () => randInt(1, 9) * 10;

const chooseChainOps = (terms: number, ops: string | string[]) => {
  if (Array.isArray(ops)) return ops;
  if (typeof ops === 'string') {
    const patterns = ops.split('|').map((s) => s.trim().split(/\s+/));
    return sample(patterns);
  }
  const result: string[] = [];
  const available = ['+', '-'];
  for (let i = 0; i < terms - 1; i += 1) {
    result.push(sample(available));
  }
  return result;
};

const nonNegativeResult = (numbers: number[], ops: string[]) => {
  let acc = numbers[0];
  for (let i = 0; i < ops.length; i += 1) {
    const op = ops[i];
    const value = numbers[i + 1];
    acc = op === '+' ? acc + value : acc - value;
    if (acc < 0) return false;
  }
  return true;
};

const chainResult = (numbers: number[], ops: string[]) => {
  let acc = numbers[0];
  const detail: string[] = [`${acc}`];
  for (let i = 0; i < ops.length; i += 1) {
    const op = ops[i];
    const value = numbers[i + 1];
    detail.push(op, String(value));
    acc = op === '+' ? acc + value : acc - value;
  }
  return { value: acc, text: formatExpression([...detail, '=', '?']) };
};

const makeAddSub = (max: number, ops: string[]) => {
  const a = randInt(0, max);
  const b = randInt(0, max);
  const op = sample(ops);
  let left = a;
  let right = b;
  if (op === '-' && left < right) {
    [left, right] = [right, left];
  }
  const ans = op === '+' ? left + right : left - right;
  return toQuestion(`${left} ${op} ${right} = ?`, ans, 'normal', { a: left, b: right, op });
};

const makeFill = (mode: string) => {
  const max = mode === 'within10' ? 10 : mode === 'within20' ? 20 : 100;
  const op = sample(['+', '-']);
  const blankPos = sample(['left', 'right', 'result']);
  let a = randInt(0, max);
  let b = randInt(0, max);
  if (op === '-' && a < b) [a, b] = [b, a];
  let text: string;
  let answer: number;
  if (blankPos === 'result') {
    const res = op === '+' ? a + b : a - b;
    text = `${a} ${op} ${b} = ？`;
    answer = res;
  } else if (blankPos === 'left') {
    if (op === '+') {
      const target = a + b;
      text = `？ ${op} ${b} = ${target}`;
      answer = a;
    } else {
      text = `？ - ${b} = ${a - b}`;
      answer = a;
    }
  } else {
    if (op === '+') {
      text = `${a} + ？ = ${a + b}`;
      answer = b;
    } else {
      text = `${a} - ？ = ${a - b}`;
      answer = b;
    }
  }
  return toQuestion(text, answer, 'fill', { op, max });
};

const makeNoCarryAdd = (max: number) => {
  let a: number;
  let b: number;
  do {
    a = randInt(0, max);
    b = randInt(0, max);
  } while ((a % 10) + (b % 10) >= 10);
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeNoBorrowSub = (max: number) => {
  let a: number;
  let b: number;
  do {
    a = randInt(0, max);
    b = randInt(0, max);
    if (a < b) [a, b] = [b, a];
  } while ((a % 10) < (b % 10));
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeCarryAdd = (max: number) => {
  let a: number;
  let b: number;
  do {
    a = randInt(0, max);
    b = randInt(0, max);
  } while ((a % 10) + (b % 10) < 10);
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeBorrowSub = (max: number) => {
  let a: number;
  let b: number;
  do {
    a = randInt(Math.ceil(max / 2), max);
    b = randInt(0, max);
    if (a < b) [a, b] = [b, a];
  } while ((a % 10) >= (b % 10));
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeTensOp = ({ op, mode }: { op: string; mode: string }) => {
  if (mode === 'tens+one') {
    const tens = padTens();
    const one = randInt(0, 9);
    return toQuestion(`${tens} + ${one} = ?`, tens + one);
  }
  if (mode === 'tens-one') {
    const tens = padTens();
    const one = randInt(0, 9);
    const base = tens + randInt(0, 4) * 10;
    const minuend = Math.max(base, tens);
    return toQuestion(`${minuend} - ${one} = ?`, minuend - one);
  }
  if (mode === 'tens+tens') {
    const a = padTens();
    const b = padTens();
    return toQuestion(`${a} + ${b} = ?`, a + b);
  }
  const a = padTens() + randInt(0, 9) * 10;
  const b = padTens();
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeChain = ({ terms, max }: { terms: number | string; max: number }) => {
  const range = typeof terms === 'number' ? { min: terms, max: terms } : parseRange(String(terms), 3);
  const termCount = randInt(range.min, range.max);
  const numbers = Array.from({ length: termCount }, () => randInt(0, max));
  const ops = chooseChainOps(termCount, ['+', '-']);
  if (!nonNegativeResult(numbers, ops)) {
    return makeChain({ terms, max });
  }
  const { value, text } = chainResult(numbers, ops);
  return toQuestion(text, value);
};

const makeChain3 = ({ max, ops }: { max: number; ops: string | string[] }) => {
  const numbers = Array.from({ length: 3 }, () => randInt(0, max));
  const chosen = chooseChainOps(3, ops);
  const { value, text } = chainResult(numbers, chosen);
  return toQuestion(text, value);
};

const makeAddsubChain = ({ terms, max }: { terms: number; max: number }) => {
  const numbers = Array.from({ length: terms }, () => randInt(0, max));
  const ops = chooseChainOps(terms, ['+', '-']);
  if (!nonNegativeResult(numbers, ops)) {
    return makeAddsubChain({ terms, max });
  }
  const { value, text } = chainResult(numbers, ops);
  return toQuestion(text, value);
};

const makeTwoPlusOne = () => {
  const tens = randInt(10, 99);
  const one = randInt(1, 9);
  return toQuestion(`${tens} + ${one} = ?`, tens + one);
};

const makeTwoPlusTens = () => {
  const tens = randInt(10, 99);
  const add = padTens();
  return toQuestion(`${tens} + ${add} = ?`, tens + add);
};

const makeTwoMinusOne = () => {
  const tens = randInt(10, 99);
  const one = randInt(1, 9);
  const minuend = Math.max(tens, one + randInt(10, 60));
  return toQuestion(`${minuend} - ${one} = ?`, minuend - one);
};

const makeTwoMinusTens = () => {
  const tens = randInt(10, 99);
  const sub = padTens();
  const minuend = Math.max(tens + sub, sub);
  return toQuestion(`${minuend} - ${sub} = ?`, minuend - sub);
};

const makeMake10 = () => {
  const left = randInt(0, 9);
  return toQuestion(`？ + ${left} = 10`, 10 - left, 'fill');
};

const makeTwoPlusTwoLimit = (limit: number) => {
  let a: number;
  let b: number;
  do {
    a = randInt(10, 99);
    b = randInt(10, 99);
  } while (a + b > limit);
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeTwoMinusTwo = () => {
  let a = randInt(10, 99);
  let b = randInt(10, 99);
  if (a < b) [a, b] = [b, a];
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeTensMinusTwo = () => {
  const tens = padTens();
  const two = randInt(10, 99);
  const minuend = tens + randInt(1, 3) * 10;
  return toQuestion(`${minuend} - ${two} = ?`, minuend - two);
};

const makeAddsubTwoDigits = () => {
  const a = randInt(10, 99);
  const b = randInt(10, 99);
  const op = sample(['+', '-']);
  const text = `${a} ${op} ${b} = ?`;
  const answer = op === '+' ? a + b : a - b;
  return toQuestion(text, answer);
};

const makeMulTable = (maxTable: number) => {
  const a = randInt(2, maxTable);
  const b = randInt(1, maxTable);
  return toQuestion(`${a} × ${b} = ?`, a * b);
};

const makeDivTable = (maxTable: number) => {
  const divisor = randInt(1, maxTable);
  const quotient = randInt(1, maxTable);
  const dividend = divisor * quotient;
  return toQuestion(`${dividend} ÷ ${divisor} = ?`, quotient);
};

const makeMulDivMix = (maxTable: number) => {
  const pattern = sample(['mul', 'div']);
  if (pattern === 'mul') {
    return makeMulTable(maxTable);
  }
  return makeDivTable(maxTable);
};

const makeMulDivMixExpr = () => {
  const a = randInt(2, 10);
  const b = randInt(1, 10);
  const c = randInt(1, 10);
  const pattern = sample(['mul-div', 'div-mul']);
  if (pattern === 'mul-div') {
    const first = a * b;
    return toQuestion(`${first} ÷ ${b} × ${c} = ?`, first / b * c);
  }
  const first = a * b;
  return toQuestion(`${first} ÷ ${a} × ${c} = ?`, first / a * c);
};

const makeMultiMul10 = () => {
  const a = randInt(1, 10);
  const b = randInt(1, 10);
  const c = randInt(1, 10);
  return toQuestion(`${a} × ${b} × ${c} = ?`, a * b * c);
};

const makeMultiDiv10 = () => {
  const divisor1 = randInt(1, 10);
  const divisor2 = randInt(1, 10);
  const base = randInt(1, 10) * divisor1 * divisor2;
  return toQuestion(`${base} ÷ ${divisor1} ÷ ${divisor2} = ?`, base / divisor1 / divisor2);
};

const makeMultiAddLimit = (limit: number) => {
  const numbers: number[] = [];
  let sum = 0;
  while (numbers.length < 3) {
    const value = randInt(10, limit);
    if (sum + value <= limit) {
      numbers.push(value);
      sum += value;
    }
  }
  const text = `${numbers.join(' + ')} = ?`;
  return toQuestion(text, sum);
};

const makeMultiSubLimit = (limit: number) => {
  const start = randInt(limit - 40, limit);
  const sub1 = randInt(10, 50);
  const sub2 = randInt(5, 30);
  const result = start - sub1 - sub2;
  return toQuestion(`${start} - ${sub1} - ${sub2} = ?`, result);
};

const makeUnitConv = ({ subtype }: { subtype: string }) => {
  if (subtype === 'currency') {
    const yuan = randInt(0, 10);
    const jiao = randInt(0, 9);
    const fen = randInt(0, 9);
    const totalFen = yuan * 100 + jiao * 10 + fen;
    return toQuestion(`${yuan}元${jiao}角${fen}分 = ?分`, totalFen);
  }
  if (subtype === 'length') {
    const meters = randInt(1, 9);
    return toQuestion(`${meters}米 = ?厘米`, meters * 100);
  }
  const minute = randInt(0, 5);
  const second = randInt(0, 59);
  return toQuestion(`${minute}分${second}秒 = ?秒`, minute * 60 + second);
};

const makeCompare = ({ subtype }: { subtype: string }) => {
  if (subtype === 'time') {
    const left = randInt(10, 240);
    const minutes = randInt(1, 5);
    const right = minutes * 60;
    const comparison = left > right ? '>' : left < right ? '<' : '=';
    return toQuestion(`${left}秒 ？ ${minutes}分`, comparison, 'compare');
  }
  const a = randInt(10, 99);
  const b = randInt(10, 99);
  const comparison = a > b ? '>' : a < b ? '<' : '=';
  return toQuestion(`${a} ？ ${b}`, comparison, 'compare');
};

const makeDivRemainder = ({ dividendMax, divisorMax }: { dividendMax: number; divisorMax: number }) => {
  const divisor = randInt(2, divisorMax);
  const dividend = randInt(divisor, dividendMax);
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  return toQuestion(`${dividend} ÷ ${divisor} = ? … ?`, `${quotient},${remainder}`, 'pair');
};

const makeThousandsAdd = (limit: number) => {
  const a = randInt(1, limit / 1000) * 1000;
  const b = randInt(1, limit / 1000) * 1000;
  const sumValue = a + b;
  if (sumValue >= limit) return makeThousandsAdd(limit);
  return toQuestion(`${a} + ${b} = ?`, sumValue);
};

const makeThousandsSub = () => {
  const a = randInt(1, 9) * 1000;
  const b = randInt(1, 9) * 1000;
  const minuend = Math.max(a, b);
  const subtrahend = Math.min(a, b);
  return toQuestion(`${minuend} - ${subtrahend} = ?`, minuend - subtrahend);
};

const makeThousandsMix = (limit: number) => {
  const op = sample(['+', '-']);
  if (op === '+') return makeThousandsAdd(limit);
  return makeThousandsSub();
};

const makeTensCarryAdd = () => {
  const a = padTens();
  const b = padTens();
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeTensBorrowSub = () => {
  const a = padTens() + 100;
  const b = padTens();
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeTensMixOver100 = () => {
  const op = sample(['+', '-']);
  const a = padTens() + randInt(1, 5) * 10;
  const b = padTens();
  const text = `${a} ${op} ${b} = ?`;
  const answer = op === '+' ? a + b : a - b;
  return toQuestion(text, answer);
};

const makeHundredsCarryAdd = () => {
  const a = randInt(1, 9) * 100;
  const b = randInt(1, 9) * 100;
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeHundredsBorrowSub = () => {
  const a = randInt(2, 12) * 100;
  const b = randInt(1, 9) * 100;
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeHundredsMixOver1000 = () => {
  const op = sample(['+', '-']);
  const a = randInt(1, 12) * 100;
  const b = randInt(1, 12) * 100;
  const text = `${a} ${op} ${b} = ?`;
  const answer = op === '+' ? a + b : a - b;
  return toQuestion(text, answer);
};

const makeEnd0ThreeAdd = (limit: number) => {
  const a = randInt(1, limit / 10) * 10;
  const b = randInt(1, limit / 10) * 10;
  const sumValue = a + b;
  if (sumValue >= limit) return makeEnd0ThreeAdd(limit);
  return toQuestion(`${a} + ${b} = ?`, sumValue);
};

const makeEnd0ThreeSub = () => {
  const a = randInt(2, 9) * 100;
  const b = randInt(1, 9) * 100;
  const minuend = Math.max(a, b);
  const sub = Math.min(a, b);
  return toQuestion(`${minuend} - ${sub} = ?`, minuend - sub);
};

const makeEnd0ThreeMix = () => {
  const op = sample(['+', '-']);
  if (op === '+') {
    return makeEnd0ThreeAdd(1000);
  }
  return makeEnd0ThreeSub();
};

const makeMulAddMix = () => {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(1, 9);
  return toQuestion(`${a} × ${b} + ${c} = ?`, a * b + c);
};

const makeSameAdd = (max: number) => {
  const value = randInt(1, max);
  const count = randInt(3, 5);
  const numbers = Array.from({ length: count }, () => value);
  return toQuestion(`${numbers.join(' + ')} = ?`, value * count);
};

const makeDivAddMix = (max: number) => {
  const divisor = randInt(2, max);
  const quotient = randInt(1, max);
  const dividend = divisor * quotient;
  const add = randInt(1, 9);
  return toQuestion(`${dividend} ÷ ${divisor} + ${add} = ?`, quotient + add);
};

const GENERATORS: GeneratorMap = {
  addsub: (level) => ensureUnique(() => makeAddSub(level.generator.max as number, level.generator.ops as string[]), level.count, (q) => q.text),
  fill: (level) => ensureUnique(() => makeFill(level.generator.mode as string), level.count, (q) => q.text),
  noCarryAdd: (level) => ensureUnique(() => makeNoCarryAdd(level.generator.max as number), level.count, (q) => q.text),
  noBorrowSub: (level) => ensureUnique(() => makeNoBorrowSub(level.generator.max as number), level.count, (q) => q.text),
  carryAdd: (level) => ensureUnique(() => makeCarryAdd(level.generator.max as number), level.count, (q) => q.text),
  borrowSub: (level) => ensureUnique(() => makeBorrowSub(level.generator.max as number), level.count, (q) => q.text),
  tensOp: (level) => ensureUnique(() => makeTensOp({ op: level.generator.op as string, mode: level.generator.mode as string }), level.count, (q) => q.text),
  chain: (level) => ensureUnique(() => makeChain({ terms: level.generator.terms as number | string, max: level.generator.max as number }), level.count, (q) => q.text),
  chain3: (level) => ensureUnique(() => makeChain3({ max: level.generator.max as number, ops: level.generator.ops as string | string[] }), level.count, (q) => q.text),
  addsubChain: (level) => ensureUnique(() => makeAddsubChain({ terms: level.generator.terms as number, max: level.generator.max as number }), level.count, (q) => q.text),
  twoPlusOne: (level) => ensureUnique(() => makeTwoPlusOne(), level.count, (q) => q.text),
  twoPlusTens: (level) => ensureUnique(() => makeTwoPlusTens(), level.count, (q) => q.text),
  twoMinusOne: (level) => ensureUnique(() => makeTwoMinusOne(), level.count, (q) => q.text),
  twoMinusTens: (level) => ensureUnique(() => makeTwoMinusTens(), level.count, (q) => q.text),
  make10: (level) => ensureUnique(() => makeMake10(), level.count, (q) => q.text),
  twoPlusTwoLimit: (level) => ensureUnique(() => makeTwoPlusTwoLimit(level.generator.limit as number), level.count, (q) => q.text),
  twoMinusTwo: (level) => ensureUnique(() => makeTwoMinusTwo(), level.count, (q) => q.text),
  tensMinusTwo: (level) => ensureUnique(() => makeTensMinusTwo(), level.count, (q) => q.text),
  addsubTwoDigits: (level) => ensureUnique(() => makeAddsubTwoDigits(), level.count, (q) => q.text),
  mulTable: (level) => ensureUnique(() => makeMulTable(level.generator.maxTable as number), level.count, (q) => q.text),
  divTable: (level) => ensureUnique(() => makeDivTable(level.generator.maxTable as number), level.count, (q) => q.text),
  mulDivMix: (level) => ensureUnique(() => makeMulDivMix(level.generator.maxTable as number), level.count, (q) => q.text),
  mulDivMixExpr: (level) => ensureUnique(() => makeMulDivMixExpr(), level.count, (q) => q.text),
  multiMul10: (level) => ensureUnique(() => makeMultiMul10(), level.count, (q) => q.text),
  multiDiv10: (level) => ensureUnique(() => makeMultiDiv10(), level.count, (q) => q.text),
  multiAddLimit: (level) => ensureUnique(() => makeMultiAddLimit(level.generator.limit as number), level.count, (q) => q.text),
  multiSubLimit: (level) => ensureUnique(() => makeMultiSubLimit(level.generator.limit as number), level.count, (q) => q.text),
  unitConv: (level) => ensureUnique(() => makeUnitConv({ subtype: level.generator.subtype as string }), level.count, (q) => q.text),
  compare: (level) => ensureUnique(() => makeCompare({ subtype: level.generator.subtype as string }), level.count, (q) => q.text),
  divRemainder: (level) => ensureUnique(() => makeDivRemainder({ dividendMax: level.generator.dividendMax as number, divisorMax: level.generator.divisorMax as number }), level.count, (q) => q.text),
  thousandsAdd: (level) => ensureUnique(() => makeThousandsAdd(level.generator.limit as number), level.count, (q) => q.text),
  thousandsSub: (level) => ensureUnique(() => makeThousandsSub(), level.count, (q) => q.text),
  thousandsMix: (level) => ensureUnique(() => makeThousandsMix(level.generator.limit as number), level.count, (q) => q.text),
  tensCarryAdd: (level) => ensureUnique(() => makeTensCarryAdd(), level.count, (q) => q.text),
  tensBorrowSub: (level) => ensureUnique(() => makeTensBorrowSub(), level.count, (q) => q.text),
  tensMixOver100: (level) => ensureUnique(() => makeTensMixOver100(), level.count, (q) => q.text),
  hundredsCarryAdd: (level) => ensureUnique(() => makeHundredsCarryAdd(), level.count, (q) => q.text),
  hundredsBorrowSub: (level) => ensureUnique(() => makeHundredsBorrowSub(), level.count, (q) => q.text),
  hundredsMixOver1000: (level) => ensureUnique(() => makeHundredsMixOver1000(), level.count, (q) => q.text),
  end0ThreeAdd: (level) => ensureUnique(() => makeEnd0ThreeAdd(level.generator.limit as number), level.count, (q) => q.text),
  end0ThreeSub: (level) => ensureUnique(() => makeEnd0ThreeSub(), level.count, (q) => q.text),
  end0ThreeMix: (level) => ensureUnique(() => makeEnd0ThreeMix(), level.count, (q) => q.text),
  mulAddMix: (level) => ensureUnique(() => makeMulAddMix(), level.count, (q) => q.text),
  sameAdd: (level) => ensureUnique(() => makeSameAdd(level.generator.max as number), level.count, (q) => q.text),
  divAddMix: (level) => ensureUnique(() => makeDivAddMix(level.generator.max as number), level.count, (q) => q.text)
};

export const buildQuestions = (level: Level): Question[] => {
  const generator = GENERATORS[level.generator.type as string];
  if (!generator) {
    throw new Error(`未知题目生成器: ${String(level.generator.type)}`);
  }
  return generator(level);
};
