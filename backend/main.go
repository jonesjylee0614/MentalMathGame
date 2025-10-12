package main

import (
	"fmt"
	"log"
	"time"
	
	"github.com/yourusername/MentalMathGame/internal/api/router"
	"github.com/yourusername/MentalMathGame/internal/config"
	"github.com/yourusername/MentalMathGame/internal/model"
	"github.com/yourusername/MentalMathGame/internal/pkg/logger"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func main() {
	// 1. 加载配置
	if err := config.LoadConfig("configs/config.yaml"); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	
	// 2. 初始化日志
	logger.InitLogger()
	defer logger.Sync()
	
	logger.Info("Starting Mental Math Game Server...")
	logger.Info("Config loaded",
		zap.String("mode", config.AppConfig.Server.Mode),
		zap.String("port", config.AppConfig.Server.Port),
	)
	
	// 3. 连接数据库
	db, err := initDatabase()
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	logger.Info("Database connected successfully")
	
	// 4. 设置路由
	r := router.SetupRouter(db)
	
	// 5. 启动服务器
	addr := fmt.Sprintf(":%s", config.AppConfig.Server.Port)
	logger.Info("Server is running", zap.String("address", addr))
	
	if err := r.Run(addr); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	}
}

// initDatabase 初始化数据库连接
func initDatabase() (*gorm.DB, error) {
	dbConfig := config.AppConfig.Database
	
	// 构建DSN
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
		dbConfig.Username,
		dbConfig.Password,
		dbConfig.Host,
		dbConfig.Port,
		dbConfig.Database,
		dbConfig.Charset,
	)
	
	// 配置GORM日志
	var gormLogLevel gormlogger.LogLevel
	if config.AppConfig.Server.Mode == "release" {
		gormLogLevel = gormlogger.Error
	} else {
		gormLogLevel = gormlogger.Info
	}
	
	// 连接数据库
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormLogLevel),
	})
	if err != nil {
		return nil, err
	}
	
	// 配置连接池
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	
	sqlDB.SetMaxIdleConns(dbConfig.MaxIdleConns)
	sqlDB.SetMaxOpenConns(dbConfig.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Duration(dbConfig.ConnMaxLifetime) * time.Second)
	
	// 自动迁移模型（仅在开发模式）
	if config.AppConfig.Server.Mode != "release" {
		if err := autoMigrate(db); err != nil {
			logger.Warn("Auto migration failed", zap.Error(err))
		} else {
			logger.Info("Auto migration completed")
		}
	}
	
	return db, nil
}

// autoMigrate 自动迁移数据库表结构
func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&model.User{},
		&model.UserSettings{},
		&model.Level{},
		&model.UserLevelProgress{},
		&model.GameRecord{},
		&model.UserStats{},
		&model.Achievement{},
		&model.UserAchievement{},
		&model.DailyQuest{},
		&model.UserDailyQuest{},
	)
}

