-- Rollback Initial Data

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `user_settings` WHERE `user_id` = 1;
DELETE FROM `user_stats` WHERE `user_id` = 1;
DELETE FROM `users` WHERE `id` = 1;
DELETE FROM `achievements`;
DELETE FROM `levels`;

SET FOREIGN_KEY_CHECKS = 1;

