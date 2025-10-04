import { ensureUnique, parseRange, randInt, sample, uid } from './utils.js';

const toQuestion = (text, answer, kind = 'normal', meta = {}) => ({
  id: uid(),
  text,
  answer: String(answer),
  kind,
  meta,
});

const formatExpression = (parts) => parts.join(' ');

const padTens = () => randInt(1, 9) * 10;

const chooseChainOps = (terms, ops) => {
  if (Array.isArray(ops)) return ops;
  if (typeof ops === 'string') {
    const patterns = ops.split('|').map((s) => s.trim().split(/\s+/));
    return sample(patterns);
  }
  const result = [];
  const available = ['+', '-'];
  for (let i = 0; i < terms - 1; i += 1) {
    result.push(sample(available));
  }
  return result;
};

const nonNegativeResult = (numbers, ops) => {
  let acc = numbers[0];
  for (let i = 0; i < ops.length; i += 1) {
    const op = ops[i];
    const value = numbers[i + 1];
    acc = op === '+' ? acc + value : acc - value;
    if (acc < 0) return false;
  }
  return true;
};

const chainResult = (numbers, ops) => {
  let acc = numbers[0];
  const detail = [`${acc}`];
  for (let i = 0; i < ops.length; i += 1) {
    const op = ops[i];
    const value = numbers[i + 1];
    detail.push(op, String(value));
    acc = op === '+' ? acc + value : acc - value;
  }
  return { value: acc, text: formatExpression([...detail, '=', '?']) };
};

const makeAddSub = (max, ops) => {
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

const makeFill = (mode) => {
  const max = mode === 'within10' ? 10 : mode === 'within20' ? 20 : 100;
  const op = sample(['+', '-']);
  const blankPos = sample(['left', 'right', 'result']);
  let a = randInt(0, max);
  let b = randInt(0, max);
  if (op === '-' && a < b) [a, b] = [b, a];
  let text;
  let answer;
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

const makeNoCarryAdd = (max) => {
  let a;
  let b;
  do {
    a = randInt(0, max);
    b = randInt(0, max);
  } while ((a % 10) + (b % 10) >= 10);
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeNoBorrowSub = (max) => {
  let a;
  let b;
  do {
    a = randInt(0, max);
    b = randInt(0, max);
    if (a < b) [a, b] = [b, a];
  } while ((a % 10) < (b % 10));
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeCarryAdd = (max) => {
  let a;
  let b;
  do {
    a = randInt(0, max);
    b = randInt(0, max);
  } while ((a % 10) + (b % 10) < 10);
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeBorrowSub = (max) => {
  let a;
  let b;
  do {
    a = randInt(Math.ceil(max / 2), max);
    b = randInt(0, max);
    if (a < b) [a, b] = [b, a];
  } while ((a % 10) >= (b % 10));
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeTensOp = ({ op, mode }) => {
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
  const minuend = a >= b ? a : b + padTens();
  return toQuestion(`${minuend} - ${b} = ?`, minuend - b);
};

const makeChain = ({ terms, max }) => {
  const range = parseRange(terms, 3);
  let numbers;
  let ops;
  let result;
  do {
    const termCount = randInt(range.min, range.max);
    numbers = Array.from({ length: termCount }, () => randInt(0, max));
    ops = chooseChainOps(termCount, null);
  } while (!nonNegativeResult(numbers, ops));
  result = chainResult(numbers, ops);
  return toQuestion(result.text, result.value, 'normal', { numbers, ops });
};

const makeAddSubChain = ({ terms, max }) => {
  const range = parseRange(terms, 3);
  let numbers;
  let ops;
  let result;
  do {
    const termCount = randInt(range.min, range.max);
    numbers = Array.from({ length: termCount }, () => randInt(0, max));
    ops = chooseChainOps(termCount, ['+', '-']);
  } while (!nonNegativeResult(numbers, ops));
  result = chainResult(numbers, ops);
  return toQuestion(result.text, result.value, 'normal', { numbers, ops });
};

const makeChain3 = ({ max, ops }) => {
  const termCount = 3;
  let numbers;
  let opsArr;
  let result;
  do {
    numbers = Array.from({ length: termCount }, () => randInt(0, max));
    opsArr = chooseChainOps(termCount, ops);
  } while (!nonNegativeResult(numbers, opsArr));
  result = chainResult(numbers, opsArr);
  return toQuestion(result.text, result.value, 'normal', { numbers, ops: opsArr });
};

const makeTwoPlusOne = () => {
  const a = randInt(10, 99);
  const b = randInt(0, 9);
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeTwoPlusTens = () => {
  const a = randInt(10, 99);
  const b = randInt(1, 9) * 10;
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeTwoMinusOne = () => {
  const a = randInt(10, 99);
  const b = randInt(0, 9);
  const minuend = Math.max(a, b + randInt(10, 90));
  return toQuestion(`${minuend} - ${b} = ?`, minuend - b);
};

const makeTwoMinusTens = () => {
  const a = randInt(10, 99);
  const b = randInt(1, 9) * 10;
  let minuend = a;
  if (a < b) minuend = b + randInt(10, 40);
  return toQuestion(`${minuend} - ${b} = ?`, minuend - b);
};

const currencyQuestion = () => {
  const pattern = sample(['yuanToFen', 'yuanToJiao', 'jiaoToFen']);
  if (pattern === 'yuanToFen') {
    const yuan = randInt(1, 9);
    const jiao = randInt(0, 9);
    const fen = randInt(0, 9);
    const total = yuan * 100 + jiao * 10 + fen;
    return toQuestion(`${yuan}元${jiao}角${fen}分 = ？分`, total);
  }
  if (pattern === 'yuanToJiao') {
    const yuan = randInt(1, 9);
    const jiao = randInt(0, 9);
    const total = yuan * 10 + jiao;
    return toQuestion(`${yuan}元${jiao}角 = ？角`, total);
  }
  const jiao = randInt(1, 9);
  const fen = randInt(1, 9);
  const total = jiao * 10 + fen;
  return toQuestion(`${jiao}角${fen}分 = ？分`, total);
};

const lengthQuestion = () => {
  const meters = randInt(1, 9);
  const centimeters = randInt(0, 99);
  const target = sample(['cm', 'm']);
  if (target === 'cm') {
    return toQuestion(`${meters}米${centimeters}厘米 = ？厘米`, meters * 100 + centimeters);
  }
  const totalCm = meters * 100 + centimeters;
  const m = Math.floor(totalCm / 100);
  const cm = totalCm % 100;
  return toQuestion(`${totalCm}厘米 = ？米？厘米（用逗号分隔）`, `${m},${cm}`, 'pair', { format: 'm,cm' });
};

const timeQuestion = () => {
  const minutes = randInt(0, 5);
  const seconds = randInt(0, 59);
  const target = sample(['seconds', 'minutes']);
  if (target === 'seconds') {
    return toQuestion(`${minutes}分${seconds}秒 = ？秒`, minutes * 60 + seconds);
  }
  const total = randInt(60, 360);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return toQuestion(`${total}秒 = ？分？秒（用逗号分隔）`, `${m},${s}`, 'pair', { format: 'm,s' });
};

const makeUnit = (cfg) => {
  if (cfg.subtype === 'currency') return currencyQuestion();
  if (cfg.subtype === 'length') return lengthQuestion();
  return timeQuestion();
};

const makeMultiAddLimit = (limit) => {
  let nums;
  do {
    nums = [randInt(10, 60), randInt(10, 40), randInt(5, 30)];
  } while (nums.reduce((a, b) => a + b, 0) > limit);
  const expr = `${nums[0]} + ${nums[1]} + ${nums[2]} = ?`;
  return toQuestion(expr, nums.reduce((a, b) => a + b, 0));
};

const makeMultiSubLimit = (limit) => {
  let start;
  let nums;
  do {
    start = randInt(Math.ceil(limit / 2), limit);
    nums = [randInt(5, 40), randInt(5, 40)];
  } while (start - nums[0] - nums[1] < 0);
  const expr = `${start} - ${nums[0]} - ${nums[1]} = ?`;
  return toQuestion(expr, start - nums[0] - nums[1]);
};

const makeTwoPlusTwoLimit = (limit) => {
  let a;
  let b;
  do {
    a = randInt(10, 99);
    b = randInt(10, 99);
  } while (a + b > limit);
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeTwoMinusTwo = () => {
  let a = randInt(20, 99);
  let b = randInt(10, 98);
  if (a < b) [a, b] = [b, a];
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeTensMinusTwo = () => {
  const tens = padTens();
  let b = randInt(10, 99);
  const minuend = tens + randInt(0, 4) * 10;
  if (minuend < b) return makeTensMinusTwo();
  return toQuestion(`${minuend} - ${b} = ?`, minuend - b);
};

const makeAddSubTwoDigits = () => {
  const op = sample(['+', '-']);
  let a = randInt(10, 99);
  let b = randInt(10, 99);
  if (op === '-' && a < b) [a, b] = [b, a];
  return toQuestion(`${a} ${op} ${b} = ?`, op === '+' ? a + b : a - b);
};

const makeMulTable = (maxTable) => {
  const a = randInt(2, maxTable);
  const b = randInt(0, maxTable);
  return toQuestion(`${a} × ${b} = ?`, a * b);
};

const makeDivTable = (maxTable) => {
  const b = randInt(2, maxTable);
  const q = randInt(0, maxTable);
  const a = b * q;
  return toQuestion(`${a} ÷ ${b} = ?`, q);
};

const makeMulDivMix = (maxTable) => {
  const mode = sample(['mul', 'div']);
  if (mode === 'mul') return makeMulTable(maxTable);
  return makeDivTable(maxTable);
};

const makeThousandsAdd = (limit) => {
  const a = randInt(1, (limit - 1000) / 1000) * 1000;
  const b = randInt(1, (limit - a) / 1000) * 1000;
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeThousandsSub = () => {
  const a = randInt(2, 9) * 1000;
  const b = randInt(1, Math.floor(a / 1000) - 1) * 1000;
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeThousandsMix = (limit) => {
  if (Math.random() > 0.5) return makeThousandsAdd(limit);
  return makeThousandsSub();
};

const makeTensCarryAdd = () => {
  const a = randInt(2, 9) * 10;
  let b;
  do {
    b = randInt(2, 9) * 10;
  } while (a + b <= 100);
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeTensBorrowSub = () => {
  const minuend = randInt(11, 19) * 10;
  const sub = randInt(2, 9) * 10;
  return toQuestion(`${minuend} - ${sub} = ?`, minuend - sub);
};

const makeTensMixOver100 = () => {
  if (Math.random() > 0.5) {
    const a = randInt(11, 15) * 10;
    const b = randInt(6, 12) * 10;
    return toQuestion(`${a} - ${b} = ?`, a - b);
  }
  const a = randInt(60, 90);
  const b = randInt(40, 80);
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeHundredsCarryAdd = () => {
  const a = randInt(2, 9) * 100;
  const b = randInt(2, 9) * 100;
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeHundredsBorrowSub = () => {
  const minuend = randInt(11, 19) * 100;
  const sub = randInt(2, 9) * 100;
  return toQuestion(`${minuend} - ${sub} = ?`, minuend - sub);
};

const makeHundredsMixOver1000 = () => {
  if (Math.random() > 0.5) {
    const a = randInt(12, 18) * 100;
    const b = randInt(4, 9) * 100;
    return toQuestion(`${a} - ${b} = ?`, a - b);
  }
  const a = randInt(5, 9) * 100;
  const b = randInt(5, 9) * 100;
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeEnd0ThreeAdd = (limit) => {
  let a;
  let b;
  do {
    a = randInt(10, (limit - 100) / 10) * 10;
    b = randInt(10, (limit - a) / 10) * 10;
  } while (a + b >= limit);
  return toQuestion(`${a} + ${b} = ?`, a + b);
};

const makeEnd0ThreeSub = () => {
  const a = randInt(20, 99) * 10;
  const b = randInt(10, Math.floor(a / 10) - 1) * 10;
  return toQuestion(`${a} - ${b} = ?`, a - b);
};

const makeEnd0ThreeMix = () => (Math.random() > 0.5 ? makeEnd0ThreeAdd(1000) : makeEnd0ThreeSub());

const makeMulAddMix = () => {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(1, 9);
  const expr = `${a} × ${b} + ${c} = ?`;
  return toQuestion(expr, a * b + c);
};

const makeSameAdd = (max) => {
  const value = randInt(2, max);
  const times = randInt(3, 5);
  const terms = Array(times).fill(value).join(' + ');
  return toQuestion(`${terms} = ?`, value * times);
};

const makeDivAddMix = (max) => {
  const divisor = randInt(2, max);
  const quotient = randInt(1, max);
  const dividend = divisor * quotient;
  const add = randInt(1, max);
  const expr = `${dividend} ÷ ${divisor} + ${add} = ?`;
  return toQuestion(expr, quotient + add);
};

const makeMultiMul10 = () => {
  const nums = [randInt(2, 9), randInt(2, 9), randInt(2, 9)];
  const expr = `${nums[0]} × ${nums[1]} × ${nums[2]} = ?`;
  return toQuestion(expr, nums[0] * nums[1] * nums[2]);
};

const makeMultiDiv10 = () => {
  const nums = [randInt(2, 9), randInt(2, 9), randInt(1, 9)];
  const start = nums[0] * nums[1] * nums[2];
  const div1 = nums[1];
  const div2 = nums[2];
  const expr = `${start} ÷ ${div1} ÷ ${div2} = ?`;
  return toQuestion(expr, start / div1 / div2);
};

const makeMulDivMixExpr = () => {
  if (Math.random() > 0.5) {
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    const c = randInt(2, 9);
    const expr = `${a} × ${b} ÷ ${c} = ?`;
    return toQuestion(expr, (a * b) / c);
  }
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  const expr = `${a * b * c} ÷ ${b} × ${c} = ?`;
  return toQuestion(expr, (a * b * c) / b * c);
};

const makeCompareTime = () => {
  const totalA = randInt(10, 360);
  const totalB = randInt(10, 360);
  const toLabel = (total) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    if (m === 0) return `${total}秒`;
    if (s === 0) return `${m}分`;
    return `${m}分${s}秒`;
  };
  const text = `${toLabel(totalA)} ？ ${toLabel(totalB)}`;
  const answer = totalA === totalB ? '=' : totalA > totalB ? '>' : '<';
  return toQuestion(text, answer, 'compare', { totalA, totalB });
};

const makeDivRemainder = (cfg) => {
  let dividend;
  let divisor;
  do {
    dividend = randInt(2, cfg.dividendMax);
    divisor = randInt(2, cfg.divisorMax);
  } while (dividend % divisor === 0 || dividend <= divisor);
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  const text = `${dividend} ÷ ${divisor} = ？（商），余？（用逗号分隔）`;
  return toQuestion(text, `${quotient},${remainder}`, 'pair', { format: 'quotient,remainder' });
};

const makeParenMix = () => {
  const pattern = sample(['(a + b) × c', '(a - b) × c', 'a + (b × c)', '(a + b) - c']);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  let text;
  let answer;
  if (pattern === '(a + b) × c') {
    const n1 = randInt(10, 90);
    const n2 = randInt(2, 9);
    text = `(${n1} + ${n2}) × ${c} = ?`;
    answer = (n1 + n2) * c;
  } else if (pattern === '(a - b) × c') {
    const n1 = randInt(20, 90);
    const n2 = randInt(2, Math.min(9, Math.floor(n1 / 2)));
    text = `(${n1} - ${n2}) × ${c} = ?`;
    answer = (n1 - n2) * c;
  } else if (pattern === 'a + (b × c)') {
    const n1 = randInt(10, 90);
    text = `${n1} + (${b} × ${c}) = ?`;
    answer = n1 + b * c;
  } else {
    const n1 = randInt(40, 120);
    const n2 = randInt(10, 40);
    const n3 = randInt(5, 20);
    text = `(${n1} + ${n2}) - ${n3} = ?`;
    answer = n1 + n2 - n3;
  }
  return toQuestion(text, answer);
};

const generatorFactory = {
  addsub: (cfg) => () => makeAddSub(cfg.max, cfg.ops),
  fill: (cfg) => () => makeFill(cfg.mode),
  noCarryAdd: (cfg) => () => makeNoCarryAdd(cfg.max),
  noBorrowSub: (cfg) => () => makeNoBorrowSub(cfg.max),
  make10: () => () => {
    const a = randInt(0, 10);
    const b = 10 - a;
    const pattern = sample(['left', 'right']);
    if (pattern === 'left') return toQuestion(`？ + ${a} = 10`, b, 'fill');
    return toQuestion(`${a} + ？ = 10`, b, 'fill');
  },
  carryAdd: (cfg) => () => makeCarryAdd(cfg.max),
  borrowSub: (cfg) => () => makeBorrowSub(cfg.max),
  tensOp: (cfg) => () => makeTensOp(cfg),
  chain: (cfg) => () => makeChain(cfg),
  twoPlusOne: () => () => makeTwoPlusOne(),
  twoPlusTens: () => () => makeTwoPlusTens(),
  twoMinusOne: () => () => makeTwoMinusOne(),
  twoMinusTens: () => () => makeTwoMinusTens(),
  addsubChain: (cfg) => () => makeAddSubChain(cfg),
  chain3: (cfg) => () => makeChain3(cfg),
  unitConv: (cfg) => () => makeUnit(cfg),
  multiAddLimit: (cfg) => () => makeMultiAddLimit(cfg.limit),
  multiSubLimit: (cfg) => () => makeMultiSubLimit(cfg.limit),
  twoPlusTwoLimit: (cfg) => () => makeTwoPlusTwoLimit(cfg.limit),
  twoMinusTwo: () => () => makeTwoMinusTwo(),
  tensMinusTwo: () => () => makeTensMinusTwo(),
  addsubTwoDigits: () => () => makeAddSubTwoDigits(),
  mulTable: (cfg) => () => makeMulTable(cfg.maxTable),
  divTable: (cfg) => () => makeDivTable(cfg.maxTable),
  mulDivMix: (cfg) => () => makeMulDivMix(cfg.maxTable),
  thousandsAdd: (cfg) => () => makeThousandsAdd(cfg.limit || 10000),
  thousandsSub: () => () => makeThousandsSub(),
  thousandsMix: (cfg) => () => makeThousandsMix(cfg.limit || 10000),
  tensCarryAdd: () => () => makeTensCarryAdd(),
  tensBorrowSub: () => () => makeTensBorrowSub(),
  tensMixOver100: () => () => makeTensMixOver100(),
  hundredsCarryAdd: () => () => makeHundredsCarryAdd(),
  hundredsBorrowSub: () => () => makeHundredsBorrowSub(),
  hundredsMixOver1000: () => () => makeHundredsMixOver1000(),
  end0ThreeAdd: (cfg) => () => makeEnd0ThreeAdd(cfg.limit || 1000),
  end0ThreeSub: () => () => makeEnd0ThreeSub(),
  end0ThreeMix: () => () => makeEnd0ThreeMix(),
  mulAddMix: () => () => makeMulAddMix(),
  sameAdd: (cfg) => () => makeSameAdd(cfg.max),
  divAddMix: (cfg) => () => makeDivAddMix(cfg.max),
  multiMul10: () => () => makeMultiMul10(),
  multiDiv10: () => () => makeMultiDiv10(),
  mulDivMixExpr: () => () => makeMulDivMixExpr(),
  compare: (cfg) => () => makeCompareTime(cfg),
  divRemainder: (cfg) => () => makeDivRemainder(cfg),
  parenMix: () => () => makeParenMix(),
};

export const buildQuestions = (level) => {
  const factory = generatorFactory[level.generator.type];
  if (!factory) {
    throw new Error(`未知的关卡出题器：${level.generator.type}`);
  }
  const generator = factory(level.generator);
  return ensureUnique(generator, level.count, (q) => q.text);
};
