-- 添加游戏模式配置字段
-- Mental Math Game

ALTER TABLE `levels`
ADD COLUMN `game_mode` VARCHAR(50) DEFAULT 'battle' COMMENT '默认游戏模式' AFTER `hp_config`,
ADD COLUMN `recommended_modes` JSON COMMENT '推荐游戏模式列表' AFTER `game_mode`,
ADD COLUMN `mode_config` JSON COMMENT '游戏模式配置' AFTER `recommended_modes`;

-- 为现有关卡配置游戏模式
-- 基础入门关卡 - 主要使用战斗、收集、钓鱼模式
UPDATE `levels` SET 
  `game_mode` = 'battle',
  `recommended_modes` = JSON_ARRAY('battle', 'collection', 'fishing'),
  `mode_config` = JSON_OBJECT()
WHERE `category` = '基础入门' AND `sort_order` <= 10;

-- 基础入门中后期 - 增加建造和种植模式
UPDATE `levels` SET 
  `game_mode` = 'building',
  `recommended_modes` = JSON_ARRAY('building', 'farming', 'collection'),
  `mode_config` = JSON_OBJECT()
WHERE `category` = '基础入门' AND `sort_order` > 10 AND `sort_order` <= 18;

-- 基础入门后期 - 增加音乐和解密模式
UPDATE `levels` SET 
  `game_mode` = 'music',
  `recommended_modes` = JSON_ARRAY('music', 'puzzle', 'battle'),
  `mode_config` = JSON_OBJECT()
WHERE `category` = '基础入门' AND `sort_order` > 18;

-- 进阶拓展关卡 - 使用赛跑、烹饪、探险模式
UPDATE `levels` SET 
  `game_mode` = 'racing',
  `recommended_modes` = JSON_ARRAY('racing', 'cooking', 'adventure'),
  `mode_config` = JSON_OBJECT()
WHERE `category` = '进阶拓展' AND `sort_order` <= 40;

-- 进阶拓展中期 - 使用防守、战斗、建造模式
UPDATE `levels` SET 
  `game_mode` = 'defense',
  `recommended_modes` = JSON_ARRAY('defense', 'battle', 'building'),
  `mode_config` = JSON_OBJECT()
WHERE `category` = '进阶拓展' AND `sort_order` > 40 AND `sort_order` <= 60;

-- 进阶拓展后期 - 使用解密、音乐、探险模式
UPDATE `levels` SET 
  `game_mode` = 'puzzle',
  `recommended_modes` = JSON_ARRAY('puzzle', 'music', 'adventure'),
  `mode_config` = JSON_OBJECT()
WHERE `category` = '进阶拓展' AND `sort_order` > 60;

-- 挑战进阶关卡 - 使用所有模式
UPDATE `levels` SET 
  `game_mode` = 'battle',
  `recommended_modes` = JSON_ARRAY('battle', 'defense', 'racing', 'puzzle', 'building'),
  `mode_config` = JSON_OBJECT()
WHERE `category` = '挑战进阶';

SELECT '✅ 游戏模式字段添加成功！' as message;

