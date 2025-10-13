import { GameMode } from '../types';

/**
 * 游戏模式兼容性规则
 * 定义哪些模式适合哪些题型
 */
export interface ModeCompatibility {
  /** 模式ID */
  modeId: GameMode;
  
  /** 模式名称 */
  name: string;
  
  /** 模式描述 */
  description: string;
  
  /** 模式图标 */
  icon: string;
  
  /** 适合的题型 */
  suitableFor: {
    questionTypes?: string[];  // 适合的题目类型
    categories?: string[];     // 适合的关卡分类
    difficultyRange?: [number, number]; // 适合的难度范围
  };
  
  /** 不适合的场景 */
  notSuitableFor?: {
    questionTypes?: string[];
    categories?: string[];
  };
  
  /** 特性标签 */
  tags?: string[];
}

/** 所有模式的兼容性配置 */
export const MODE_COMPATIBILITY: ModeCompatibility[] = [
  {
    modeId: 'battle',
    name: '战斗模式',
    description: '植物 vs 僵尸，紧张刺激',
    icon: '⚔️',
    suitableFor: {
      questionTypes: ['addsub', 'mulTable', 'divTable', 'twoDigits'],
      categories: ['基础入门', '进阶拓展'],
      difficultyRange: [1.0, 2.5]
    },
    tags: ['刺激', '对战', '动作']
  },
  {
    modeId: 'building',
    name: '建造模式',
    description: '搭建高塔，成就感满满',
    icon: '🏗️',
    suitableFor: {
      questionTypes: ['addsub', 'chain', 'sameAdd', 'tens', 'hundreds'],
      categories: ['基础入门', '进阶拓展']
    },
    tags: ['建造', '成就感', '累积']
  },
  {
    modeId: 'collection',
    name: '收集模式',
    description: '收集宝物，趣味十足',
    icon: '🎁',
    suitableFor: {
      questionTypes: ['fill', 'unitConv', 'compare', 'make10'],
      categories: ['基础入门', '进阶拓展']
    },
    tags: ['收集', '趣味', '轻松']
  },
  {
    modeId: 'racing',
    name: '赛跑模式',
    description: '竞速比赛，快速反应',
    icon: '🏃',
    suitableFor: {
      questionTypes: ['addsub', 'chain', 'compare', 'twoDigits'],
      difficultyRange: [1.0, 2.0]
    },
    tags: ['竞速', '快节奏', '比赛']
  },
  {
    modeId: 'puzzle',
    name: '解密模式',
    description: '解开谜题，挑战思维',
    icon: '🧩',
    suitableFor: {
      questionTypes: ['parenMix', 'chain', 'fill', 'mulDivMixExpr'],
      difficultyRange: [1.5, 3.0]
    },
    tags: ['解谜', '挑战', '思维']
  },
  {
    modeId: 'farming',
    name: '种植模式',
    description: '培育植物，耐心成长',
    icon: '🌱',
    suitableFor: {
      questionTypes: ['mulTable', 'divTable', 'muldiv'],
      categories: ['进阶拓展']
    },
    tags: ['种植', '成长', '耐心']
  },
  {
    modeId: 'adventure',
    name: '探险模式',
    description: '探索地图，冒险旅程',
    icon: '🗺️',
    suitableFor: {
      questionTypes: ['chain', 'thousands', 'hundreds', 'mix'],
      categories: ['进阶拓展', '挑战进阶']
    },
    tags: ['探险', '冒险', '地图']
  },
  {
    modeId: 'defense',
    name: '防守模式',
    description: '守卫城堡，快速应对',
    icon: '🛡️',
    suitableFor: {
      questionTypes: ['divTable', 'divAddMix', 'multiDiv', 'muldiv'],
      difficultyRange: [1.5, 2.5]
    },
    tags: ['防守', '塔防', '快速']
  },
  {
    modeId: 'fishing',
    name: '钓鱼模式',
    description: '垂钓乐趣，轻松愉快',
    icon: '🎣',
    suitableFor: {
      questionTypes: ['addsub', 'fill', 'make10', 'noCarry', 'noBorrow'],
      difficultyRange: [1.0, 1.5]
    },
    tags: ['钓鱼', '轻松', '休闲']
  },
  {
    modeId: 'cooking',
    name: '烹饪模式',
    description: '制作美食，创意无限',
    icon: '🍳',
    suitableFor: {
      questionTypes: ['carryAdd', 'borrowSub', 'mulAddMix'],
      difficultyRange: [1.2, 2.0]
    },
    tags: ['烹饪', '美食', '创意']
  },
  {
    modeId: 'music',
    name: '音乐模式',
    description: '演奏旋律，节奏感强',
    icon: '🎵',
    suitableFor: {
      questionTypes: ['addsub', 'chain'],
      difficultyRange: [1.0, 1.8]
    },
    tags: ['音乐', '节奏', '艺术']
  }
];

/**
 * 根据关卡信息自动推荐游戏模式
 */
export function autoRecommendModes(levelInfo: {
  generatorType?: string;
  category?: string;
  difficulty?: number;
}): GameMode[] {
  const { generatorType, category, difficulty } = levelInfo;
  
  const matchingModes: { mode: GameMode; score: number }[] = [];
  
  for (const config of MODE_COMPATIBILITY) {
    let score = 0;
    
    // 检查题型匹配
    if (generatorType && config.suitableFor.questionTypes) {
      const typeMatch = config.suitableFor.questionTypes.some(type => 
        generatorType.includes(type) || type.includes(generatorType)
      );
      if (typeMatch) score += 3;
    }
    
    // 检查分类匹配
    if (category && config.suitableFor.categories) {
      if (config.suitableFor.categories.includes(category)) {
        score += 2;
      }
    }
    
    // 检查难度匹配
    if (difficulty && config.suitableFor.difficultyRange) {
      const [min, max] = config.suitableFor.difficultyRange;
      if (difficulty >= min && difficulty <= max) {
        score += 1;
      }
    }
    
    if (score > 0) {
      matchingModes.push({ mode: config.modeId, score });
    }
  }
  
  // 按分数排序，返回前4个
  matchingModes.sort((a, b) => b.score - a.score);
  const recommended = matchingModes.slice(0, 4).map(m => m.mode);
  
  // 如果推荐的模式少于3个，添加默认模式
  if (recommended.length < 3) {
    const defaults: GameMode[] = ['battle', 'building', 'racing'];
    for (const mode of defaults) {
      if (!recommended.includes(mode)) {
        recommended.push(mode);
      }
      if (recommended.length >= 4) break;
    }
  }
  
  return recommended;
}

/**
 * 获取模式信息
 */
export function getModeInfo(modeId: GameMode): ModeCompatibility | undefined {
  return MODE_COMPATIBILITY.find(m => m.modeId === modeId);
}

/**
 * 获取所有可用模式
 */
export function getAllModes(): GameMode[] {
  return MODE_COMPATIBILITY.map(m => m.modeId);
}

/**
 * 检查模式是否适合某个关卡
 */
export function isModeCompatible(
  modeId: GameMode,
  levelInfo: {
    generatorType?: string;
    category?: string;
    difficulty?: number;
  }
): boolean {
  const config = getModeInfo(modeId);
  if (!config) return false;
  
  const { generatorType, category, difficulty } = levelInfo;
  
  // 检查是否在不适合列表中
  if (config.notSuitableFor) {
    if (generatorType && config.notSuitableFor.questionTypes?.includes(generatorType)) {
      return false;
    }
    if (category && config.notSuitableFor.categories?.includes(category)) {
      return false;
    }
  }
  
  // 检查是否在适合列表中
  let compatible = false;
  
  if (generatorType && config.suitableFor.questionTypes) {
    compatible = config.suitableFor.questionTypes.some(type => 
      generatorType.includes(type) || type.includes(generatorType)
    );
  }
  
  if (category && config.suitableFor.categories) {
    compatible = compatible || config.suitableFor.categories.includes(category);
  }
  
  if (difficulty && config.suitableFor.difficultyRange) {
    const [min, max] = config.suitableFor.difficultyRange;
    compatible = compatible || (difficulty >= min && difficulty <= max);
  }
  
  // 如果没有明确的不兼容，且有一定匹配，则认为兼容
  return compatible || !config.suitableFor.questionTypes;
}

