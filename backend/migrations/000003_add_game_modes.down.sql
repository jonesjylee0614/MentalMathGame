-- 回滚游戏模式配置字段
ALTER TABLE `levels`
DROP COLUMN `mode_config`,
DROP COLUMN `recommended_modes`,
DROP COLUMN `game_mode`;

