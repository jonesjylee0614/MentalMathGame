-- 修复小范围关卡的题目数量配置
-- Mental Math Game
-- 详细分析见：analyze_question_counts.md

-- ========================================
-- 必须修改（避免生成错误）
-- ========================================

-- 5以内的减法：只有21种组合，20题太紧张
UPDATE `levels` SET `question_count` = 10 WHERE `id` = 'sub_1_5';

-- ========================================
-- 推荐优化（提升用户体验）
-- ========================================

-- 5以内的加法：21种组合，改为12题更宽松
UPDATE `levels` SET `question_count` = 12 WHERE `id` = 'add_1_5';

-- 5以内的加减法：42种组合，改为15题
UPDATE `levels` SET `question_count` = 15 WHERE `id` = 'addsub_1_5';

-- 10以内的加法和减法：66种组合，改为18题
UPDATE `levels` SET `question_count` = 18 WHERE `id` IN ('add_1_10', 'sub_1_10');

-- 10以内的加减法：132种组合，改为20题
UPDATE `levels` SET `question_count` = 20 WHERE `id` = 'addsub_1_10';

-- 10以内的填括号：60-80种组合，改为18题
UPDATE `levels` SET `question_count` = 18 WHERE `id` = 'fill_1_10';

-- 凑10练习：正好10种组合，保持10题（完美匹配）
-- make10 已经是10题，不需要修改

-- ========================================
-- 查看修改结果
-- ========================================
SELECT 
    id, 
    name, 
    question_count AS '题数', 
    time_limit AS '时限(秒)', 
    category AS '分类'
FROM `levels`
WHERE `id` IN (
    'add_1_5', 'sub_1_5', 'addsub_1_5', 
    'add_1_10', 'sub_1_10', 'addsub_1_10', 
    'fill_1_10', 'make10'
)
ORDER BY sort_order;

SELECT '✅ 题目数量配置已修复！' as message;

