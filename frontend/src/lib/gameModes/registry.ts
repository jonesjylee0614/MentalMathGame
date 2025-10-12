import { GameModeManager } from './GameModeManager';
import { BattleModeFactory } from './modes/BattleMode';
import { BuildingModeFactory } from './modes/BuildingMode';
import { CollectionModeFactory } from './modes/CollectionMode';
import { RacingModeFactory } from './modes/RacingMode';
import { DefenseModeFactory } from './modes/DefenseMode';
import { CookingModeFactory } from './modes/CookingMode';
import { PuzzleModeFactory } from './modes/PuzzleMode';
import { FarmingModeFactory } from './modes/FarmingMode';
import { AdventureModeFactory } from './modes/AdventureMode';
import { MusicModeFactory } from './modes/MusicMode';
import { FishingModeFactory } from './modes/FishingMode';

/**
 * 注册所有游戏模式
 * 应用启动时调用一次
 */
export function registerGameModes(): void {
  const manager = GameModeManager.getInstance();

  // 注册所有模式
  manager.registerAll([
    BattleModeFactory,
    BuildingModeFactory,
    CollectionModeFactory,
    RacingModeFactory,
    DefenseModeFactory,
    CookingModeFactory,
    PuzzleModeFactory,
    FarmingModeFactory,
    AdventureModeFactory,
    FishingModeFactory,
    MusicModeFactory,
    // 其他模式工厂...
  ]);

  console.log('✅ 游戏模式注册完成');
  console.log('已注册模式:', manager.getRegisteredModes());
}

