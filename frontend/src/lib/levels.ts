import { Level } from './types';

export const LEVELS: Level[] = [
  // 基础入门：5 内与 10 内
  { id: 'add_1_5', category: '基础入门', name: '5以内的加法', desc: '例：2+3=?', generator: { type: 'addsub', ops: ['+'], max: 5 }, count: 20, timeSec: 300, difficulty: 1.0, gameMode: 'building', modeConfig: { buildingType: 'tower' } },
  { id: 'sub_1_5', category: '基础入门', name: '5以内的减法', desc: '例：4-2=?', generator: { type: 'addsub', ops: ['-'], max: 5 }, count: 20, timeSec: 300, difficulty: 1.0, gameMode: 'fishing', modeConfig: {} },
  { id: 'addsub_1_5', category: '基础入门', name: '5以内的加减法', desc: '加减混合', generator: { type: 'addsub', ops: ['+', '-'], max: 5 }, count: 20, timeSec: 300, difficulty: 1.1, gameMode: 'fishing', modeConfig: {} },
  { id: 'add_1_10', category: '基础入门', name: '10以内的加法', desc: '例：6+3=?', generator: { type: 'addsub', ops: ['+'], max: 10 }, count: 25, timeSec: 300, difficulty: 1.1, gameMode: 'building', modeConfig: { buildingType: 'tower' } },
  { id: 'sub_1_10', category: '基础入门', name: '10以内的减法', desc: '例：6-3=?', generator: { type: 'addsub', ops: ['-'], max: 10 }, count: 25, timeSec: 300, difficulty: 1.1, gameMode: 'fishing', modeConfig: {} },
  { id: 'addsub_1_10', category: '基础入门', name: '10以内的加减法', desc: '加减混合', generator: { type: 'addsub', ops: ['+', '-'], max: 10 }, count: 25, timeSec: 300, difficulty: 1.2, gameMode: 'fishing', modeConfig: {} },
  { id: 'fill_1_10', category: '基础入门', name: '10以内的填括号', desc: '例：4-？=1', generator: { type: 'fill', mode: 'within10' }, count: 20, timeSec: 80, difficulty: 1.2, gameMode: 'collection', modeConfig: { theme: 'fruit' } },
  { id: 'add_no_carry_20', category: '基础入门', name: '20以内不进位加法', desc: '例：16+3=?', generator: { type: 'noCarryAdd', max: 20 }, count: 25, timeSec: 90, difficulty: 1.2, gameMode: 'fishing', modeConfig: {} },
  { id: 'sub_no_borrow_20', category: '基础入门', name: '20以内不退位减法', desc: '例：16-3=?', generator: { type: 'noBorrowSub', max: 20 }, count: 25, timeSec: 90, difficulty: 1.2, gameMode: 'fishing', modeConfig: {} },
  { id: 'make10', category: '基础入门', name: '凑10练习', desc: '例：？+8=10', generator: { type: 'make10' }, count: 20, timeSec: 60, difficulty: 1.1, gameMode: 'fishing', modeConfig: {} },
  { id: 'add_carry_20', category: '基础入门', name: '20以内进位加法', desc: '例：8+8=?', generator: { type: 'carryAdd', max: 20 }, count: 25, timeSec: 90, difficulty: 1.3, gameMode: 'cooking' },
  { id: 'sub_borrow_20', category: '基础入门', name: '20以内退位减法', desc: '例：15-7=?', generator: { type: 'borrowSub', max: 20 }, count: 25, timeSec: 90, difficulty: 1.3, gameMode: 'cooking' },
  { id: 'add_20', category: '基础入门', name: '20以内的加法', desc: '例：15+3=?', generator: { type: 'addsub', ops: ['+'], max: 20 }, count: 25, timeSec: 90, difficulty: 1.2, gameMode: 'building', modeConfig: { buildingType: 'tower' } },
  { id: 'sub_20', category: '基础入门', name: '20以内的减法', desc: '例：15-3=?', generator: { type: 'addsub', ops: ['-'], max: 20 }, count: 25, timeSec: 90, difficulty: 1.2, gameMode: 'music', modeConfig: { melody: 'happy' } },
  { id: 'addsub_20', category: '基础入门', name: '20以内的加减法', desc: '混合', generator: { type: 'addsub', ops: ['+', '-'], max: 20 }, count: 25, timeSec: 90, difficulty: 1.3, gameMode: 'racing' },
  { id: 'fill_1_20', category: '基础入门', name: '20以内的填括号', desc: '例：10+？=13', generator: { type: 'fill', mode: 'within20' }, count: 20, timeSec: 90, difficulty: 1.3, gameMode: 'collection', modeConfig: { theme: 'fruit' } },
  { id: 'tens_plus_one', category: '基础入门', name: '整十数+一位数', desc: '例：50+3=?', generator: { type: 'tensOp', op: '+', mode: 'tens+one' }, count: 20, timeSec: 80, difficulty: 1.2 },
  { id: 'mix_1', category: '基础入门', name: '第一册计算综合', desc: '例：20-19+17', generator: { type: 'chain', terms: 3, max: 20 }, count: 25, timeSec: 120, difficulty: 1.4, gameMode: 'adventure' },
  { id: 'tens_minus_one', category: '基础入门', name: '整十数-一位数', desc: '例：80-5=?', generator: { type: 'tensOp', op: '-', mode: 'tens-one' }, count: 20, timeSec: 80, difficulty: 1.2 },
  { id: 'tens_plus_tens', category: '基础入门', name: '整十数+整十数', desc: '例：80+10=?', generator: { type: 'tensOp', op: '+', mode: 'tens+tens' }, count: 20, timeSec: 80, difficulty: 1.2, gameMode: 'building', modeConfig: { buildingType: 'tower' } },
  { id: 'tens_minus_tens', category: '基础入门', name: '整十数-整十数', desc: '例：80-10=?', generator: { type: 'tensOp', op: '-', mode: 'tens-tens' }, count: 20, timeSec: 80, difficulty: 1.2 },
  { id: 'two_plus_one', category: '基础入门', name: '两位数+一位数', desc: '例：37+7=?', generator: { type: 'twoPlusOne' }, count: 25, timeSec: 100, difficulty: 1.3 },
  { id: 'two_plus_tens', category: '基础入门', name: '两位数+整十数', desc: '例：37+40=?', generator: { type: 'twoPlusTens' }, count: 25, timeSec: 100, difficulty: 1.3 },
  { id: 'two_minus_one', category: '基础入门', name: '两位数-一位数', desc: '例：37-4=?', generator: { type: 'twoMinusOne' }, count: 25, timeSec: 100, difficulty: 1.3 },
  { id: 'two_minus_tens', category: '基础入门', name: '两位数-整十数', desc: '例：37-20=?', generator: { type: 'twoMinusTens' }, count: 25, timeSec: 100, difficulty: 1.3 },
  { id: 'mix_2', category: '基础入门', name: '第二册计算综合', desc: '例：39-21,20+26', generator: { type: 'chain', terms: '2..3', max: 40 }, count: 25, timeSec: 120, difficulty: 1.5, gameMode: 'adventure' },

  // 进阶拓展
  { id: 'fill_1_100', category: '进阶拓展', name: '100以内的填括号', desc: '例：19+？=31', generator: { type: 'fill', mode: 'within100' }, count: 20, timeSec: 120, difficulty: 1.4, gameMode: 'collection', modeConfig: { theme: 'ocean' } },
  { id: 'chain_add_10', category: '进阶拓展', name: '10以内三个数连加', desc: '例：2+1+5', generator: { type: 'chain3', max: 10, ops: '+ +' }, count: 20, timeSec: 80, difficulty: 1.2, gameMode: 'building', modeConfig: { buildingType: 'tower' } },
  { id: 'chain_sub_10', category: '进阶拓展', name: '10以内三个数连减', desc: '例：5-2-1', generator: { type: 'chain3', max: 10, ops: '- -' }, count: 20, timeSec: 80, difficulty: 1.3 },
  { id: 'chain_mix_10', category: '进阶拓展', name: '10以内三数加减混合', desc: '加+减', generator: { type: 'chain3', max: 10, ops: '+ -| - +' }, count: 20, timeSec: 90, difficulty: 1.35, gameMode: 'puzzle', modeConfig: { puzzleType: 'image' } },
  { id: 'mix_10', category: '进阶拓展', name: '10以内的加减混合', desc: '例：5-0+1', generator: { type: 'addsubChain', terms: 3, max: 10 }, count: 20, timeSec: 90, difficulty: 1.3, gameMode: 'puzzle', modeConfig: { puzzleType: 'chest' } },
  { id: 'chain_add_20', category: '进阶拓展', name: '20以内三个数的加法', desc: '例：12+1+5', generator: { type: 'chain3', max: 20, ops: '+ +' }, count: 20, timeSec: 90, difficulty: 1.35, gameMode: 'building', modeConfig: { buildingType: 'tower' } },
  { id: 'chain_sub_20', category: '进阶拓展', name: '20以内三个数的减法', desc: '例：15-4-7', generator: { type: 'chain3', max: 20, ops: '- -' }, count: 20, timeSec: 90, difficulty: 1.45, gameMode: 'racing' },
  { id: 'chain_mix_20', category: '进阶拓展', name: '20以内三数加减混合', desc: '混合', generator: { type: 'chain3', max: 20, ops: '+ -| - +' }, count: 20, timeSec: 100, difficulty: 1.5, gameMode: 'racing' },
  { id: 'mix_20', category: '进阶拓展', name: '20以内加减混合', desc: '例：19-3+0', generator: { type: 'addsubChain', terms: 3, max: 20 }, count: 20, timeSec: 100, difficulty: 1.45, gameMode: 'racing' },
  { id: 'unit_currency', category: '进阶拓展', name: '元角分换算', desc: '例：6角9分 = ?分', generator: { type: 'unitConv', subtype: 'currency' }, count: 20, timeSec: 120, difficulty: 1.6, gameMode: 'collection', modeConfig: { theme: 'gem' } },
  { id: 'sum_le_100', category: '进阶拓展', name: '和在100以内的连加', desc: '例：7+67+18', generator: { type: 'multiAddLimit', limit: 100 }, count: 20, timeSec: 110, difficulty: 1.5, gameMode: 'building', modeConfig: { buildingType: 'tower' } },
  { id: 'sub_le_100', category: '进阶拓展', name: '被减数在100以内的连减', desc: '例：76-49-11', generator: { type: 'multiSubLimit', limit: 100 }, count: 20, timeSec: 110, difficulty: 1.6, gameMode: 'racing' },
  { id: 'mix_addsub_100', category: '进阶拓展', name: '100以内连加连减混合', desc: '加减混合', generator: { type: 'addsubChain', terms: 3, max: 100 }, count: 20, timeSec: 120, difficulty: 1.7, gameMode: 'racing' },
  { id: 'two_plus_two_100', category: '进阶拓展', name: '两位数+两位数（和≤100）', desc: '例：32+44', generator: { type: 'twoPlusTwoLimit', limit: 100 }, count: 25, timeSec: 120, difficulty: 1.6, gameMode: 'fishing' },
  { id: 'two_minus_two', category: '进阶拓展', name: '两位数-两位数', desc: '例：65-17', generator: { type: 'twoMinusTwo' }, count: 25, timeSec: 120, difficulty: 1.7 },
  { id: 'tens_minus_two', category: '进阶拓展', name: '整十数-两位数', desc: '例：70-24', generator: { type: 'tensMinusTwo' }, count: 25, timeSec: 110, difficulty: 1.6, gameMode: 'fishing' },
  { id: 'two_add_sub', category: '进阶拓展', name: '两位数加减法', desc: '例：32+44/65-17', generator: { type: 'addsubTwoDigits' }, count: 25, timeSec: 120, difficulty: 1.7, gameMode: 'fishing' },
  { id: 'mul_6', category: '进阶拓展', name: '6以内的乘法口诀', desc: '2~6 乘法表', generator: { type: 'mulTable', maxTable: 6 }, count: 30, timeSec: 120, difficulty: 1.6, gameMode: 'farming', modeConfig: {} },
  { id: 'mul_9', category: '进阶拓展', name: '9以内的乘法口诀', desc: '2~9 乘法表', generator: { type: 'mulTable', maxTable: 9 }, count: 30, timeSec: 140, difficulty: 1.8, gameMode: 'farming', modeConfig: {} },
  { id: 'div_6', category: '进阶拓展', name: '6以内的表内除法', desc: '除法表', generator: { type: 'divTable', maxTable: 6 }, count: 30, timeSec: 140, difficulty: 1.8, gameMode: 'defense' },
  { id: 'div_9', category: '进阶拓展', name: '9以内的表内除法', desc: '除法表', generator: { type: 'divTable', maxTable: 9 }, count: 30, timeSec: 150, difficulty: 2.0, gameMode: 'defense' },
  { id: 'muldiv_6', category: '进阶拓展', name: '6以内表内乘除混合', desc: '乘/除', generator: { type: 'mulDivMix', maxTable: 6 }, count: 30, timeSec: 150, difficulty: 2.0, gameMode: 'defense', modeConfig: {} },
  { id: 'muldiv_9', category: '进阶拓展', name: '9以内表内乘除混合', desc: '乘/除', generator: { type: 'mulDivMix', maxTable: 9 }, count: 30, timeSec: 160, difficulty: 2.2, gameMode: 'defense' },
  { id: 'k_1000_add', category: '进阶拓展', name: '整千数加法（和<10000）', desc: '4000+2000', generator: { type: 'thousandsAdd', limit: 10000 }, count: 20, timeSec: 120, difficulty: 1.8, gameMode: 'adventure' },
  { id: 'k_1000_sub', category: '进阶拓展', name: '整千数减法', desc: '4000-2000', generator: { type: 'thousandsSub' }, count: 20, timeSec: 120, difficulty: 1.8, gameMode: 'adventure' },
  { id: 'k_1000_mix', category: '进阶拓展', name: '整千加减（和<10000）', desc: '加/减', generator: { type: 'thousandsMix', limit: 10000 }, count: 20, timeSec: 130, difficulty: 1.9, gameMode: 'adventure' },
  { id: 'tens_carry', category: '进阶拓展', name: '整十+整十（进位）', desc: '80+60', generator: { type: 'tensCarryAdd' }, count: 20, timeSec: 90, difficulty: 1.6 },
  { id: 'tens_borrow', category: '进阶拓展', name: '整十-整十（退位）', desc: '130-60', generator: { type: 'tensBorrowSub' }, count: 20, timeSec: 90, difficulty: 1.6 },
  { id: 'tens_mix_over100', category: '进阶拓展', name: '整十加减（和>100/退位）', desc: '120-40 / 20+80', generator: { type: 'tensMixOver100' }, count: 20, timeSec: 100, difficulty: 1.7 },
  { id: 'hundreds_carry', category: '进阶拓展', name: '整百+整百（进位）', desc: '800+600', generator: { type: 'hundredsCarryAdd' }, count: 20, timeSec: 100, difficulty: 1.8 },
  { id: 'hundreds_borrow', category: '进阶拓展', name: '整百-整百（退位）', desc: '1300-600', generator: { type: 'hundredsBorrowSub' }, count: 20, timeSec: 100, difficulty: 1.9 },
  { id: 'hundreds_mix_over1000', category: '进阶拓展', name: '整百加减（和>1000/退位）', desc: '1500-1300', generator: { type: 'hundredsMixOver1000' }, count: 20, timeSec: 110, difficulty: 2.0, gameMode: 'adventure' },
  { id: 'tri_end0_add', category: '进阶拓展', name: '尾数0三位数加法（和<1000）', desc: '180+710', generator: { type: 'end0ThreeAdd', limit: 1000 }, count: 20, timeSec: 110, difficulty: 1.9 },
  { id: 'tri_end0_sub', category: '进阶拓展', name: '尾数0三位数减法（退位）', desc: '820-520', generator: { type: 'end0ThreeSub' }, count: 20, timeSec: 110, difficulty: 2.0 },
  { id: 'tri_end0_mix', category: '进阶拓展', name: '尾数0三位数加减法', desc: '210+390 / 200-180', generator: { type: 'end0ThreeMix' }, count: 20, timeSec: 120, difficulty: 2.0, gameMode: 'adventure' },
  { id: 'mul_add_mix', category: '进阶拓展', name: '表内乘加混合', desc: '4×7+3', generator: { type: 'mulAddMix' }, count: 25, timeSec: 130, difficulty: 2.1, gameMode: 'cooking' },
  { id: 'same_int_add_10', category: '进阶拓展', name: '10以内相同整数连加', desc: '6+6+6+6', generator: { type: 'sameAdd', max: 10 }, count: 25, timeSec: 110, difficulty: 1.7, gameMode: 'building', modeConfig: { buildingType: 'castle' } },
  { id: 'div_add_mix', category: '进阶拓展', name: '10以内除法+加法混合', desc: '48÷6+3', generator: { type: 'divAddMix', max: 10 }, count: 25, timeSec: 130, difficulty: 2.0, gameMode: 'defense' },
  { id: 'multi_mul_10', category: '进阶拓展', name: '10以内整数连乘', desc: '3×2×7', generator: { type: 'multiMul10' }, count: 25, timeSec: 130, difficulty: 2.1, gameMode: 'defense', modeConfig: {} },
  { id: 'multi_div_10', category: '进阶拓展', name: '10以内整数连除', desc: '54÷9÷1', generator: { type: 'multiDiv10' }, count: 25, timeSec: 130, difficulty: 2.1, gameMode: 'defense' },
  { id: 'mul_div_mix10', category: '进阶拓展', name: '10以内乘除混合', desc: '10÷5×8', generator: { type: 'mulDivMixExpr' }, count: 25, timeSec: 140, difficulty: 2.2, gameMode: 'puzzle', modeConfig: { puzzleType: 'lock' } },
  { id: 'unit_length', category: '进阶拓展', name: '长度单位（米↔厘米）', desc: '3米=?厘米', generator: { type: 'unitConv', subtype: 'length' }, count: 20, timeSec: 120, difficulty: 1.6, gameMode: 'collection', modeConfig: { theme: 'gem' } },
  { id: 'unit_time', category: '进阶拓展', name: '时间单位换算', desc: '1分19秒=?秒', generator: { type: 'unitConv', subtype: 'time' }, count: 20, timeSec: 130, difficulty: 1.7, gameMode: 'collection', modeConfig: { theme: 'ocean' } },
  { id: 'time_compare', category: '进阶拓展', name: '时间大小比较', desc: '50秒 ? 4分', generator: { type: 'compare', subtype: 'time' }, count: 20, timeSec: 110, difficulty: 1.7, gameMode: 'racing' },
  { id: 'div_remainder', category: '进阶拓展', name: '有余数的除法', desc: '11÷6=?余?', generator: { type: 'divRemainder', dividendMax: 50, divisorMax: 9 }, count: 20, timeSec: 140, difficulty: 2.1, gameMode: 'racing' },
  { id: 'paren_mix', category: '挑战进阶', name: '含小括号的混合运算', desc: '(79-76)×8', generator: { type: 'parenMix' }, count: 20, timeSec: 150, difficulty: 2.3, gameMode: 'puzzle', modeConfig: { puzzleType: 'lock' } }
];

export const findLevel = (levelId: string) => LEVELS.find((level) => level.id === levelId) ?? null;

export const listCategories = () => {
  const map = new Map<string, Level[]>();
  LEVELS.forEach((level) => {
    if (!map.has(level.category)) map.set(level.category, []);
    map.get(level.category)!.push(level);
  });
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
};
