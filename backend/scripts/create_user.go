package main

import (
	"fmt"
	"log"
	"time"
	
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// 简化的模型结构
type User struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement"`
	Username     string    `gorm:"type:varchar(50);uniqueIndex;not null"`
	Email        string    `gorm:"type:varchar(100);uniqueIndex;not null"`
	PasswordHash string    `gorm:"type:varchar(255);not null"`
	Nickname     string    `gorm:"type:varchar(50);not null"`
	Role         string    `gorm:"type:enum('student','parent','admin');default:'student'"`
	Status       int8      `gorm:"default:1"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type UserStats struct {
	ID         uint64 `gorm:"primaryKey;autoIncrement"`
	UserID     uint64 `gorm:"uniqueIndex;not null"`
	Level      int    `gorm:"default:1"`
	Experience int    `gorm:"default:0"`
}

type UserSettings struct {
	ID             uint64  `gorm:"primaryKey;autoIncrement"`
	UserID         uint64  `gorm:"uniqueIndex;not null"`
	AudioEnabled   bool    `gorm:"default:true"`
	ShakeEnabled   bool    `gorm:"default:true"`
	ColorblindMode bool    `gorm:"default:false"`
	FontScale      float64 `gorm:"type:decimal(3,2);default:1.00"`
}

func (User) TableName() string {
	return "users"
}

func (UserStats) TableName() string {
	return "user_stats"
}

func (UserSettings) TableName() string {
	return "user_settings"
}

func main() {
	// 数据库连接配置
	dsn := "root:Jz@szM982io@tcp(localhost:3306)/mental_math_game?charset=utf8mb4&parseTime=True&loc=Local"
	
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("连接数据库失败: %v", err)
	}
	
	fmt.Println("✅ 数据库连接成功")
	
	// 创建测试用户列表
	testUsers := []struct {
		Username string
		Email    string
		Password string
		Nickname string
		Role     string
	}{
		{"testuser", "test@example.com", "Test123!", "测试用户", "student"},
		{"admin@focustask.com", "admin@focustask.com", "Test123!", "FocusTask管理员", "admin"},
	}
	
	for _, tu := range testUsers {
		// 检查用户是否已存在
		var existingUser User
		result := db.Where("username = ?", tu.Username).First(&existingUser)
		
		if result.Error == nil {
			fmt.Printf("⚠️  用户 %s 已存在，跳过创建\n", tu.Username)
			continue
		}
		
		// 加密密码
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(tu.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("❌ 加密密码失败 (%s): %v", tu.Username, err)
			continue
		}
		
		// 创建用户
		user := User{
			Username:     tu.Username,
			Email:        tu.Email,
			PasswordHash: string(hashedPassword),
			Nickname:     tu.Nickname,
			Role:         tu.Role,
			Status:       1,
		}
		
		if err := db.Create(&user).Error; err != nil {
			log.Printf("❌ 创建用户失败 (%s): %v", tu.Username, err)
			continue
		}
		
		// 创建用户统计
		stats := UserStats{
			UserID:     user.ID,
			Level:      1,
			Experience: 0,
		}
		if err := db.Create(&stats).Error; err != nil {
			log.Printf("❌ 创建用户统计失败 (%s): %v", tu.Username, err)
			continue
		}
		
		// 创建用户设置
		settings := UserSettings{
			UserID:         user.ID,
			AudioEnabled:   true,
			ShakeEnabled:   true,
			ColorblindMode: false,
			FontScale:      1.0,
		}
		if err := db.Create(&settings).Error; err != nil {
			log.Printf("❌ 创建用户设置失败 (%s): %v", tu.Username, err)
			continue
		}
		
		fmt.Printf("✅ 用户创建成功: %s (ID: %d, 密码: %s)\n", tu.Username, user.ID, tu.Password)
	}
	
	fmt.Println("\n========== 测试账号列表 ==========")
	fmt.Println("1. 用户名: testuser")
	fmt.Println("   密码: Test123!")
	fmt.Println("")
	fmt.Println("2. 用户名: admin@focustask.com")
	fmt.Println("   密码: Test123!")
	fmt.Println("")
	fmt.Println("3. 用户名: admin (已存在)")
	fmt.Println("   密码: Admin123!")
	fmt.Println("==================================")
}

