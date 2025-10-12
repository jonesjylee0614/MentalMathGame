package router

import (
	"github.com/gin-gonic/gin"
	"github.com/yourusername/MentalMathGame/internal/api/handler"
	"github.com/yourusername/MentalMathGame/internal/api/middleware"
	"github.com/yourusername/MentalMathGame/internal/config"
	"gorm.io/gorm"
)

// SetupRouter 配置路由
func SetupRouter(db *gorm.DB) *gin.Engine {
	// 设置运行模式
	if config.AppConfig.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}
	
	r := gin.New()
	
	// 全局中间件
	r.Use(middleware.RecoveryMiddleware())
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.RateLimitMiddleware())
	
	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"service": "mental-math-game",
		})
	})
	
	// API v1 路由组
	v1 := r.Group("/api/v1")
	{
		setupAuthRoutes(v1, db)
		setupUserRoutes(v1, db)
		setupGameRoutes(v1, db)
		setupStatsRoutes(v1, db)
		setupLevelRoutes(v1, db)
		setupLeaderboardRoutes(v1, db)
	}
	
	return r
}

// setupAuthRoutes 认证相关路由
func setupAuthRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	authHandler := initAuthHandler(db)
	
	auth := rg.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/logout", middleware.AuthMiddleware(), authHandler.Logout)
		auth.POST("/refresh", middleware.AuthMiddleware(), authHandler.RefreshToken)
	}
}

// setupUserRoutes 用户相关路由
func setupUserRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	userHandler := initUserHandler(db)
	
	users := rg.Group("/users")
	users.Use(middleware.AuthMiddleware())
	{
		users.GET("/me", userHandler.GetMe)
		users.PUT("/me", userHandler.UpdateMe)
		users.PUT("/me/avatar", userHandler.UploadAvatar)
		users.GET("/me/settings", userHandler.GetSettings)
		users.PUT("/me/settings", userHandler.UpdateSettings)
		users.PUT("/me/password", userHandler.ChangePassword)
		users.POST("/me/migrate", userHandler.Migrate)
	}
}

// setupGameRoutes 游戏相关路由
func setupGameRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	gameHandler := initGameHandler(db)
	
	games := rg.Group("/games")
	games.Use(middleware.AuthMiddleware())
	{
		games.POST("/submit", gameHandler.SubmitResult)
		games.GET("/records", gameHandler.GetRecords)
		games.GET("/records/:id", gameHandler.GetRecordDetail)
	}
}

// setupStatsRoutes 统计相关路由
func setupStatsRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	statsHandler := initStatsHandler(db)
	
	stats := rg.Group("/stats")
	stats.Use(middleware.AuthMiddleware())
	{
		stats.GET("/me", statsHandler.GetMyStats)
		stats.GET("/me/progress", statsHandler.GetMyProgress)
		stats.GET("/me/history", statsHandler.GetMyHistory)
		stats.GET("/me/achievements", statsHandler.GetMyAchievements)
	}
}

// setupLevelRoutes 关卡相关路由
func setupLevelRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	levelHandler := initLevelHandler(db)
	
	levels := rg.Group("/levels")
	{
		levels.GET("", levelHandler.GetLevels)
		levels.GET("/:id", levelHandler.GetLevelDetail)
		levels.GET("/:id/progress", middleware.AuthMiddleware(), levelHandler.GetLevelProgress)
	}
}

// setupLeaderboardRoutes 排行榜相关路由
func setupLeaderboardRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	leaderboardHandler := initLeaderboardHandler(db)
	
	leaderboard := rg.Group("/leaderboard")
	{
		leaderboard.GET("/global", leaderboardHandler.GetGlobalLeaderboard)
		leaderboard.GET("/level/:id", leaderboardHandler.GetLevelLeaderboard)
		leaderboard.GET("/weekly", leaderboardHandler.GetWeeklyLeaderboard)
		leaderboard.GET("/monthly", leaderboardHandler.GetMonthlyLeaderboard)
	}
}

