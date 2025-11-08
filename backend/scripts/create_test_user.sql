-- 创建测试用户脚本
-- Mental Math Game

USE mental_math_game;

-- 删除已存在的测试用户（如果有）
DELETE FROM `user_settings` WHERE `user_id` IN (SELECT `id` FROM `users` WHERE `username` IN ('testuser', 'admin@focustask.com'));
DELETE FROM `user_stats` WHERE `user_id` IN (SELECT `id` FROM `users` WHERE `username` IN ('testuser', 'admin@focustask.com'));
DELETE FROM `users` WHERE `username` IN ('testuser', 'admin@focustask.com');

-- 创建测试用户1: testuser (密码: Test123!)
-- bcrypt hash: $2a$10$YourHashHereForTest123!
INSERT INTO `users` (`username`, `email`, `password_hash`, `nickname`, `role`, `status`) VALUES
('testuser', 'test@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '测试用户', 'student', 1);

SET @test_user_id = LAST_INSERT_ID();

-- 为测试用户创建统计和设置
INSERT INTO `user_stats` (`user_id`, `level`, `experience`) VALUES (@test_user_id, 1, 0);
INSERT INTO `user_settings` (`user_id`) VALUES (@test_user_id);

-- 创建测试用户2: admin@focustask.com (密码: Test123!)
INSERT INTO `users` (`username`, `email`, `password_hash`, `nickname`, `role`, `status`) VALUES
('admin@focustask.com', 'admin@focustask.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FocusTask管理员', 'admin', 1);

SET @admin_user_id = LAST_INSERT_ID();

-- 为管理员创建统计和设置
INSERT INTO `user_stats` (`user_id`, `level`, `experience`) VALUES (@admin_user_id, 1, 0);
INSERT INTO `user_settings` (`user_id`) VALUES (@admin_user_id);

-- 显示创建的用户
SELECT 
    `id`,
    `username`,
    `email`,
    `nickname`,
    `role`,
    `status`,
    '密码: Test123!' as password_info
FROM `users` 
WHERE `username` IN ('testuser', 'admin@focustask.com')
ORDER BY `id`;

SELECT '✅ 测试用户创建成功！' as message;
SELECT '使用以下账号登录：' as info;
SELECT '1. 用户名: testuser, 密码: Test123!' as account1;
SELECT '2. 用户名: admin@focustask.com, 密码: Test123!' as account2;
SELECT '3. 用户名: admin, 密码: Admin123!' as account3;

