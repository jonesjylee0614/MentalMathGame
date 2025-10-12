package router

import (
	"github.com/yourusername/MentalMathGame/internal/api/handler"
	"github.com/yourusername/MentalMathGame/internal/repository"
	"github.com/yourusername/MentalMathGame/internal/service"
	"gorm.io/gorm"
)

// 手动依赖注入 - 初始化Handler

func initAuthHandler(db *gorm.DB) *handler.AuthHandler {
	userRepo := repository.NewUserRepository(db)
	statsRepo := repository.NewStatsRepository(db)
	settingsRepo := repository.NewSettingsRepository(db)
	
	authService := service.NewAuthService(userRepo, statsRepo, settingsRepo, db)
	
	return handler.NewAuthHandler(authService)
}

func initUserHandler(db *gorm.DB) *handler.UserHandler {
	userRepo := repository.NewUserRepository(db)
	statsRepo := repository.NewStatsRepository(db)
	settingsRepo := repository.NewSettingsRepository(db)
	gameRepo := repository.NewGameRepository(db)
	
	userService := service.NewUserService(userRepo, statsRepo, settingsRepo, gameRepo, db)
	
	return handler.NewUserHandler(userService)
}

func initGameHandler(db *gorm.DB) *handler.GameHandler {
	gameRepo := repository.NewGameRepository(db)
	levelRepo := repository.NewLevelRepository(db)
	statsRepo := repository.NewStatsRepository(db)
	achievementRepo := repository.NewAchievementRepository(db)
	
	gameService := service.NewGameService(gameRepo, levelRepo, statsRepo, achievementRepo, db)
	
	return handler.NewGameHandler(gameService)
}

func initStatsHandler(db *gorm.DB) *handler.StatsHandler {
	statsRepo := repository.NewStatsRepository(db)
	gameRepo := repository.NewGameRepository(db)
	levelRepo := repository.NewLevelRepository(db)
	achievementRepo := repository.NewAchievementRepository(db)
	
	statsService := service.NewStatsService(statsRepo, gameRepo, levelRepo, achievementRepo)
	
	return handler.NewStatsHandler(statsService)
}

func initLevelHandler(db *gorm.DB) *handler.LevelHandler {
	levelRepo := repository.NewLevelRepository(db)
	gameRepo := repository.NewGameRepository(db)
	
	levelService := service.NewLevelService(levelRepo, gameRepo)
	
	return handler.NewLevelHandler(levelService)
}

func initLeaderboardHandler(db *gorm.DB) *handler.LeaderboardHandler {
	statsRepo := repository.NewStatsRepository(db)
	
	leaderboardService := service.NewLeaderboardService(statsRepo)
	
	return handler.NewLeaderboardHandler(leaderboardService)
}

