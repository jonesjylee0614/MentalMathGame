-- 回滚关卡奖励和目标时间配置
-- Mental Math Game

ALTER TABLE `levels`
DROP COLUMN `reward_points`,
DROP COLUMN `target_time`;

SELECT '✅ 关卡奖励和目标时间配置回滚成功！' as message;

