package main

import (
	"fmt"
	"log"
	
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// 数据库连接配置
	dsn := "root:Jz@szM982io@tcp(localhost:3306)/mental_math_game?charset=utf8mb4&parseTime=True&loc=Local"
	
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("连接数据库失败: %v", err)
	}
	
	fmt.Println("✅ 数据库连接成功")
	
	// 执行SQL语句
	fmt.Println("📝 开始执行迁移...")
	
	// 1. 添加字段
	fmt.Println("1. 添加game_mode字段...")
	if err := db.Exec("ALTER TABLE `levels` ADD COLUMN `game_mode` VARCHAR(50) DEFAULT 'battle' COMMENT '默认游戏模式' AFTER `hp_config`").Error; err != nil {
		log.Fatalf("❌ 添加game_mode字段失败: %v", err)
	}
	
	fmt.Println("2. 添加recommended_modes字段...")
	if err := db.Exec("ALTER TABLE `levels` ADD COLUMN `recommended_modes` JSON COMMENT '推荐游戏模式列表' AFTER `game_mode`").Error; err != nil {
		log.Fatalf("❌ 添加recommended_modes字段失败: %v", err)
	}
	
	fmt.Println("3. 添加mode_config字段...")
	if err := db.Exec("ALTER TABLE `levels` ADD COLUMN `mode_config` JSON COMMENT '游戏模式配置' AFTER `recommended_modes`").Error; err != nil {
		log.Fatalf("❌ 添加mode_config字段失败: %v", err)
	}
	
	// 2. 更新关卡配置
	fmt.Println("4. 配置基础入门前期关卡...")
	db.Exec("UPDATE `levels` SET `game_mode` = 'battle', `recommended_modes` = JSON_ARRAY('battle', 'collection', 'fishing'), `mode_config` = JSON_OBJECT() WHERE `category` = '基础入门' AND `sort_order` <= 10")
	
	fmt.Println("5. 配置基础入门中期关卡...")
	db.Exec("UPDATE `levels` SET `game_mode` = 'building', `recommended_modes` = JSON_ARRAY('building', 'farming', 'collection'), `mode_config` = JSON_OBJECT() WHERE `category` = '基础入门' AND `sort_order` > 10 AND `sort_order` <= 18")
	
	fmt.Println("6. 配置基础入门后期关卡...")
	db.Exec("UPDATE `levels` SET `game_mode` = 'music', `recommended_modes` = JSON_ARRAY('music', 'puzzle', 'battle'), `mode_config` = JSON_OBJECT() WHERE `category` = '基础入门' AND `sort_order` > 18")
	
	fmt.Println("7. 配置进阶拓展前期关卡...")
	db.Exec("UPDATE `levels` SET `game_mode` = 'racing', `recommended_modes` = JSON_ARRAY('racing', 'cooking', 'adventure'), `mode_config` = JSON_OBJECT() WHERE `category` = '进阶拓展' AND `sort_order` <= 40")
	
	fmt.Println("8. 配置进阶拓展中期关卡...")
	db.Exec("UPDATE `levels` SET `game_mode` = 'defense', `recommended_modes` = JSON_ARRAY('defense', 'battle', 'building'), `mode_config` = JSON_OBJECT() WHERE `category` = '进阶拓展' AND `sort_order` > 40 AND `sort_order` <= 60")
	
	fmt.Println("9. 配置进阶拓展后期关卡...")
	db.Exec("UPDATE `levels` SET `game_mode` = 'puzzle', `recommended_modes` = JSON_ARRAY('puzzle', 'music', 'adventure'), `mode_config` = JSON_OBJECT() WHERE `category` = '进阶拓展' AND `sort_order` > 60")
	
	fmt.Println("10. 配置挑战进阶关卡...")
	db.Exec("UPDATE `levels` SET `game_mode` = 'battle', `recommended_modes` = JSON_ARRAY('battle', 'defense', 'racing', 'puzzle', 'building'), `mode_config` = JSON_OBJECT() WHERE `category` = '挑战进阶'")
	
	fmt.Println("✅ 迁移执行成功！")
	fmt.Println()
	fmt.Println("=========================================")
	fmt.Println("已为关卡配置游戏模式：")
	fmt.Println("- 基础入门前期: 战斗、收集、钓鱼")
	fmt.Println("- 基础入门中期: 建造、种植、收集")
	fmt.Println("- 基础入门后期: 音乐、解密、战斗")
	fmt.Println("- 进阶拓展前期: 赛跑、烹饪、探险")
	fmt.Println("- 进阶拓展中期: 防守、战斗、建造")
	fmt.Println("- 进阶拓展后期: 解密、音乐、探险")
	fmt.Println("- 挑战进阶: 战斗、防守、赛跑、解密、建造")
	fmt.Println("=========================================")
	fmt.Println()
	fmt.Println("🎮 现在每个关卡都有自己的游戏模式了！")
}

