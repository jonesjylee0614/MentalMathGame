# 游戏模式说明

## 已实现的模式

### 1. 战斗模式 (Battle Mode)
- **文件**: `BattleMode.ts`
- **状态**: ✅ 已完成
- **适用题型**: 基础加减法、乘除法口诀、两位数运算
- **特点**: 植物 vs 僵尸，答对发射子弹，答错被攻击

### 2. 建造模式 (Building Mode)
- **文件**: `BuildingMode.ts`
- **状态**: ✅ 已完成
- **适用题型**: 连加、整十数加法、相同整数连加
- **特点**: 答对堆积木，房子逐渐长高

### 3. 收集模式 (Collection Mode)
- **文件**: `CollectionMode.ts`
- **状态**: ✅ 已完成
- **适用题型**: 填空题、单位换算、比较大小
- **特点**: 收集水果/宝石，答对收集，答错掉落

### 4. 赛跑模式 (Racing Mode)
- **文件**: `RacingMode.ts`
- **状态**: ✅ 已完成
- **适用题型**: 
  - 20以内加减混合
  - 连减题
  - 有余数的除法
  - 时间大小比较
- **特点**: 
  - 跑步比赛、赛车、游泳竞速
  - 答对玩家前进，答错对手前进
  - 三种难度主题：简单(🏃vs🐢)、中等(🚗vs🐇)、困难(🏊vs🤖)
  - 实时显示领先/落后状态
  - 比赛结束显示胜利/失败横幅

### 5. 防守模式 (Defense Mode)
- **文件**: `DefenseMode.ts`
- **状态**: ✅ 已完成
- **适用题型**: 
  - 表内除法
  - 连除
  - 除加混合
  - 乘除混合
- **特点**: 
  - 守卫城堡、太空防御场景
  - 敌人从右侧走来，答对击退，答错城堡扣血
  - 三种难度主题：简单(🏰守花园vs🐛)、中等(🏯太空vs👾)、困难(🏛️城堡vs👹)
  - 城堡血量显示，低血量警告动画
  - 敌人移动、武器飞行、击退动画
  - 防守成功或城堡沦陷结局

### 6. 烹饪模式 (Cooking Mode) 🆕
- **文件**: `CookingMode.ts`
- **状态**: ✅ 已完成（全新创作）
- **适用题型**: 
  - 基础加减法
  - 进位退位运算
  - 乘加混合
  - 简单混合运算
- **特点**: 
  - 做菜、烹饪、调饮料主题
  - 答对添加食材，料理进度提升
  - 答错食材烧焦，锅晃动
  - 三种难度菜谱：简单(🍚蛋炒饭)、中等(🍕披萨)、困难(🎂生日蛋糕)
  - 食材飞入动画、蒸汽效果
  - 完成展示精美成品，星级评价
  - 食材清单实时显示使用情况

## 已分配赛跑模式的关卡

1. `addsub_20` - 20以内的加减法
2. `chain_sub_20` - 20以内三个数的减法
3. `chain_mix_20` - 20以内三数加减混合
4. `mix_20` - 20以内加减混合
5. `sub_le_100` - 被减数在100以内的连减
6. `mix_addsub_100` - 100以内连加连减混合
7. `time_compare` - 时间大小比较
8. `div_remainder` - 有余数的除法

## 已分配防守模式的关卡

1. `div_6` - 6以内的表内除法
2. `div_9` - 9以内的表内除法
3. `muldiv_9` - 9以内表内乘除混合
4. `div_add_mix` - 10以内除法+加法混合
5. `multi_div_10` - 10以内整数连除

## 已分配烹饪模式的关卡

1. `add_carry_20` - 20以内进位加法
2. `sub_borrow_20` - 20以内退位减法
3. `mul_add_mix` - 表内乘加混合

## 开发文件清单

### 赛跑模式
```
frontend/src/
├── lib/gameModes/modes/
│   └── RacingMode.ts                     # 模式逻辑类
├── components/gameModes/
│   └── RacingModeComponent.tsx           # React 组件
└── styles/gameModes/
    └── RacingMode.module.css             # CSS 样式
```

### 防守模式
```
frontend/src/
├── lib/gameModes/modes/
│   └── DefenseMode.ts                    # 模式逻辑类
├── components/gameModes/
│   └── DefenseModeComponent.tsx          # React 组件
└── styles/gameModes/
    └── DefenseMode.module.css            # CSS 样式
```

### 烹饪模式
```
frontend/src/
├── lib/gameModes/modes/
│   └── CookingMode.ts                    # 模式逻辑类
├── components/gameModes/
│   └── CookingModeComponent.tsx          # React 组件
└── styles/gameModes/
    └── CookingMode.module.css            # CSS 样式
```

## 使用方法

在 `levels.ts` 中为关卡指定游戏模式：

```typescript
{
  id: 'your-level-id',
  name: '你的关卡名',
  // ... 其他配置
  gameMode: 'racing',  // 指定赛跑模式
}
```

## 下一步计划

待实现的模式：
- [ ] 解密模式 (Puzzle Mode)
- [ ] 种植模式 (Farming Mode)
- [ ] 探险模式 (Adventure Mode)
