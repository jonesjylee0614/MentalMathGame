import { Level, GameMode } from './types';
import { autoRecommendModes, getModeInfo } from './gameModes/compatibility';

/**
 * 获取关卡的默认游戏模式
 * 提供向后兼容性
 */
export function getDefaultMode(level: Level): GameMode {
  // 优先使用新字段 defaultMode
  if (level.defaultMode) return level.defaultMode;
  
  // 回退到旧字段 gameMode
  if (level.gameMode) return level.gameMode;
  
  // 如果有推荐模式，使用第一个
  if (level.recommendedModes && level.recommendedModes.length > 0) {
    return level.recommendedModes[0];
  }
  
  // 最终默认值
  return 'battle';
}

/**
 * 获取关卡的推荐游戏模式列表
 */
export function getRecommendedModes(level: Level): GameMode[] {
  // 如果已经配置了推荐模式，直接返回
  if (level.recommendedModes && level.recommendedModes.length > 0) {
    return level.recommendedModes;
  }
  
  // 如果没有推荐模式，根据题型自动推荐
  const generatorType = (level.generator as any).type;
  return autoRecommendModes({
    generatorType,
    category: level.category,
    difficulty: level.difficulty
  });
}

/**
 * 获取模式的特定配置
 * 支持两种配置格式：
 * 1. modeConfig 直接是配置对象（旧格式，所有模式共享）
 * 2. modeConfig[modeId] 是配置对象（新格式，每个模式独立配置）
 */
export function getModeConfig(level: Level, modeId: GameMode): Record<string, any> {
  if (!level.modeConfig) return {};
  
  // 新格式：检查是否有针对该模式的配置
  if (typeof level.modeConfig[modeId] === 'object') {
    return level.modeConfig[modeId];
  }
  
  // 旧格式：所有模式共享配置
  // 但要排除那些看起来像模式ID的key
  const allModeIds: GameMode[] = [
    'battle', 'building', 'collection', 'racing', 'puzzle',
    'farming', 'adventure', 'defense', 'fishing', 'cooking', 'music'
  ];
  
  const hasModeSpecificConfig = Object.keys(level.modeConfig).some(key => 
    allModeIds.includes(key as GameMode)
  );
  
  if (!hasModeSpecificConfig) {
    // 没有模式专用配置，返回整个modeConfig
    return level.modeConfig;
  }
  
  // 有模式专用配置，但当前模式没有，返回空对象
  return {};
}

/**
 * 获取模式显示信息（名称、图标等）
 */
export function getModeDisplay(modeId: GameMode): { name: string; icon: string; description: string } {
  const info = getModeInfo(modeId);
  if (info) {
    return {
      name: info.name,
      icon: info.icon,
      description: info.description
    };
  }
  
  // 回退到默认值
  const defaults: Record<GameMode, { name: string; icon: string; description: string }> = {
    battle: { name: '战斗模式', icon: '⚔️', description: '紧张刺激的对战' },
    building: { name: '建造模式', icon: '🏗️', description: '搭建你的高塔' },
    collection: { name: '收集模式', icon: '🎁', description: '收集宝物' },
    racing: { name: '赛跑模式', icon: '🏃', description: '竞速比赛' },
    puzzle: { name: '解密模式', icon: '🧩', description: '解开谜题' },
    farming: { name: '种植模式', icon: '🌱', description: '培育植物' },
    adventure: { name: '探险模式', icon: '🗺️', description: '探索地图' },
    defense: { name: '防守模式', icon: '🛡️', description: '守卫城堡' },
    fishing: { name: '钓鱼模式', icon: '🎣', description: '轻松垂钓' },
    cooking: { name: '烹饪模式', icon: '🍳', description: '制作美食' },
    music: { name: '音乐模式', icon: '🎵', description: '演奏旋律' }
  };
  
  return defaults[modeId] || { name: '未知模式', icon: '🎮', description: '' };
}

