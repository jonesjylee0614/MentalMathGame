-- 添加关卡奖励和目标时间配置
-- Mental Math Game

-- 为 levels 表添加新字段
ALTER TABLE `levels`
ADD COLUMN `target_time` INT DEFAULT 0 COMMENT '目标完成时间（秒），0表示使用time_limit' AFTER `time_limit`,
ADD COLUMN `reward_points` INT DEFAULT 0 COMMENT '完成奖励积分' AFTER `difficulty`;

-- 更新现有关卡的奖励积分（基于难度梯度递增）
-- 基础入门关卡：10-50积分
UPDATE `levels` SET 
  `reward_points` = CASE 
    WHEN `sort_order` <= 5 THEN 10
    WHEN `sort_order` <= 10 THEN 15
    WHEN `sort_order` <= 15 THEN 20
    WHEN `sort_order` <= 20 THEN 25
    WHEN `sort_order` <= 25 THEN 30
    ELSE 35
  END,
  `target_time` = ROUND(`time_limit` * 0.8)
WHERE `category` = '基础入门';

-- 进阶拓展关卡：40-100积分
UPDATE `levels` SET 
  `reward_points` = CASE 
    WHEN `sort_order` <= 10 THEN 40
    WHEN `sort_order` <= 20 THEN 50
    WHEN `sort_order` <= 30 THEN 60
    WHEN `sort_order` <= 40 THEN 70
    WHEN `sort_order` <= 50 THEN 80
    WHEN `sort_order` <= 60 THEN 90
    ELSE 100
  END,
  `target_time` = ROUND(`time_limit` * 0.75)
WHERE `category` = '进阶拓展';

-- 挑战进阶关卡：100-200积分
UPDATE `levels` SET 
  `reward_points` = CASE 
    WHEN `difficulty` < 2.0 THEN 100
    WHEN `difficulty` < 2.5 THEN 120
    WHEN `difficulty` < 3.0 THEN 150
    ELSE 200
  END,
  `target_time` = ROUND(`time_limit` * 0.7)
WHERE `category` = '挑战进阶';

SELECT '✅ 关卡奖励和目标时间配置添加成功！' as message;

