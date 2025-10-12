-- Mental Math Game Database Schema
-- Version: 1.0
-- MySQL 5.7

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- 用户表
-- ==========================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
    `avatar_url` VARCHAR(255) DEFAULT '' COMMENT '头像URL',
    `role` ENUM('student', 'parent', 'admin') DEFAULT 'student' COMMENT '角色',
    `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '家长ID（用于家长模式）',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `last_login_at` TIMESTAMP NULL COMMENT '最后登录时间',
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`),
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ==========================================
-- 用户设置表
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_settings` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '用户ID',
    `audio_enabled` BOOLEAN DEFAULT TRUE COMMENT '音效开关',
    `shake_enabled` BOOLEAN DEFAULT TRUE COMMENT '震动开关',
    `colorblind_mode` BOOLEAN DEFAULT FALSE COMMENT '色盲模式',
    `font_scale` DECIMAL(3,2) DEFAULT 1.00 COMMENT '字体缩放',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户设置表';

-- ==========================================
-- 关卡配置表
-- ==========================================
CREATE TABLE IF NOT EXISTS `levels` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '关卡ID',
    `category` VARCHAR(50) NOT NULL COMMENT '关卡分类',
    `name` VARCHAR(100) NOT NULL COMMENT '关卡名称',
    `description` TEXT COMMENT '关卡描述',
    `generator_config` JSON NOT NULL COMMENT '题目生成器配置',
    `question_count` INT DEFAULT 20 COMMENT '题目数量',
    `time_limit` INT DEFAULT 120 COMMENT '时间限制（秒）',
    `difficulty` DECIMAL(3,2) DEFAULT 1.00 COMMENT '难度系数',
    `hp_config` JSON COMMENT 'HP配置',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_category` (`category`),
    INDEX `idx_status` (`status`),
    INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关卡配置表';

-- ==========================================
-- 用户关卡进度表
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_level_progress` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `level_id` VARCHAR(50) NOT NULL COMMENT '关卡ID',
    `best_score` INT DEFAULT 0 COMMENT '最高分数',
    `best_time` INT DEFAULT 0 COMMENT '最佳用时（秒）',
    `best_accuracy` DECIMAL(5,4) DEFAULT 0 COMMENT '最高正确率',
    `play_count` INT DEFAULT 0 COMMENT '游玩次数',
    `total_score` INT DEFAULT 0 COMMENT '累计分数',
    `total_correct` INT DEFAULT 0 COMMENT '累计正确数',
    `total_wrong` INT DEFAULT 0 COMMENT '累计错误数',
    `last_outcome` ENUM('victory', 'defeat', 'timeout') COMMENT '最后结果',
    `last_played_at` TIMESTAMP NULL COMMENT '最后游玩时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_level` (`user_id`, `level_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_level_id` (`level_id`),
    INDEX `idx_last_played` (`last_played_at`),
    INDEX `idx_best_score` (`best_score`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户关卡进度表';

-- ==========================================
-- 游戏记录表
-- ==========================================
CREATE TABLE IF NOT EXISTS `game_records` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `level_id` VARCHAR(50) NOT NULL COMMENT '关卡ID',
    `score` INT NOT NULL COMMENT '得分',
    `correct_count` INT NOT NULL COMMENT '正确数',
    `total_questions` INT NOT NULL COMMENT '总题数',
    `max_combo` INT DEFAULT 0 COMMENT '最大连击',
    `accuracy` DECIMAL(5,4) NOT NULL COMMENT '正确率',
    `time_used` INT NOT NULL COMMENT '用时（秒）',
    `time_left` INT NOT NULL COMMENT '剩余时间（秒）',
    `outcome` ENUM('victory', 'defeat', 'timeout') NOT NULL COMMENT '结果',
    `answers_history` JSON COMMENT '答题历史',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '游戏时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_level_id` (`level_id`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_score` (`score`),
    INDEX `idx_outcome` (`outcome`),
    INDEX `idx_user_level` (`user_id`, `level_id`, `score`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏记录表';

-- ==========================================
-- 用户统计表
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_stats` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '用户ID',
    `total_score` INT DEFAULT 0 COMMENT '总积分',
    `total_plays` INT DEFAULT 0 COMMENT '总游玩次数',
    `total_correct` INT DEFAULT 0 COMMENT '总正确数',
    `total_wrong` INT DEFAULT 0 COMMENT '总错误数',
    `total_time_sec` INT DEFAULT 0 COMMENT '总游戏时长（秒）',
    `best_combo` INT DEFAULT 0 COMMENT '最佳连击',
    `victory_count` INT DEFAULT 0 COMMENT '胜利次数',
    `defeat_count` INT DEFAULT 0 COMMENT '失败次数',
    `current_streak` INT DEFAULT 0 COMMENT '当前连胜',
    `best_streak` INT DEFAULT 0 COMMENT '最佳连胜',
    `level` INT DEFAULT 1 COMMENT '玩家等级',
    `experience` INT DEFAULT 0 COMMENT '经验值',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户统计表';

-- ==========================================
-- 成就表
-- ==========================================
CREATE TABLE IF NOT EXISTS `achievements` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT '成就ID',
    `name` VARCHAR(100) NOT NULL COMMENT '成就名称',
    `description` TEXT COMMENT '成就描述',
    `icon_url` VARCHAR(255) COMMENT '图标URL',
    `category` VARCHAR(50) COMMENT '分类',
    `condition_type` VARCHAR(50) NOT NULL COMMENT '条件类型',
    `condition_value` JSON NOT NULL COMMENT '条件值',
    `reward_exp` INT DEFAULT 0 COMMENT '奖励经验',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_category` (`category`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就表';

-- ==========================================
-- 用户成就表
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_achievements` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `achievement_id` VARCHAR(50) NOT NULL COMMENT '成就ID',
    `progress` INT DEFAULT 0 COMMENT '进度',
    `completed` BOOLEAN DEFAULT FALSE COMMENT '是否完成',
    `completed_at` TIMESTAMP NULL COMMENT '完成时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_completed` (`completed`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户成就表';

-- ==========================================
-- 每日任务表
-- ==========================================
CREATE TABLE IF NOT EXISTS `daily_quests` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `quest_date` DATE NOT NULL COMMENT '任务日期',
    `quest_type` VARCHAR(50) NOT NULL COMMENT '任务类型',
    `quest_config` JSON NOT NULL COMMENT '任务配置',
    `reward_exp` INT DEFAULT 0 COMMENT '奖励经验',
    `reward_score` INT DEFAULT 0 COMMENT '奖励积分',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_date_type` (`quest_date`, `quest_type`),
    INDEX `idx_quest_date` (`quest_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日任务表';

-- ==========================================
-- 用户每日任务表
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_daily_quests` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `quest_id` BIGINT UNSIGNED NOT NULL COMMENT '任务ID',
    `progress` INT DEFAULT 0 COMMENT '进度',
    `completed` BOOLEAN DEFAULT FALSE COMMENT '是否完成',
    `completed_at` TIMESTAMP NULL COMMENT '完成时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_quest` (`user_id`, `quest_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_completed` (`completed`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`quest_id`) REFERENCES `daily_quests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户每日任务表';

SET FOREIGN_KEY_CHECKS = 1;

