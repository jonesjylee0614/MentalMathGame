-- Rollback Initial Schema

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `user_daily_quests`;
DROP TABLE IF EXISTS `daily_quests`;
DROP TABLE IF EXISTS `user_achievements`;
DROP TABLE IF EXISTS `achievements`;
DROP TABLE IF EXISTS `user_stats`;
DROP TABLE IF EXISTS `game_records`;
DROP TABLE IF EXISTS `user_level_progress`;
DROP TABLE IF EXISTS `levels`;
DROP TABLE IF EXISTS `user_settings`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

