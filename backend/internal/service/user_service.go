package service

import (
	"errors"
	"time"
	
	"github.com/yourusername/MentalMathGame/internal/dto"
	"github.com/yourusername/MentalMathGame/internal/model"
	"github.com/yourusername/MentalMathGame/internal/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService interface {
	GetUserByID(userID uint64) (*dto.UserBasic, error)
	UpdateUser(userID uint64, req *dto.UpdateUserRequest) (*dto.UserBasic, error)
	GetUserSettings(userID uint64) (*dto.UserSettingsResponse, error)
	UpdateUserSettings(userID uint64, req *dto.UpdateSettingsRequest) (*dto.UserSettingsResponse, error)
	ChangePassword(userID uint64, req *dto.ChangePasswordRequest) error
	MigrateData(userID uint64, req *dto.MigrationRequest) (*dto.MigrationResponse, error)
}

type userService struct {
	userRepo     repository.UserRepository
	statsRepo    repository.StatsRepository
	settingsRepo repository.SettingsRepository
	gameRepo     repository.GameRepository
	db           *gorm.DB
}

func NewUserService(
	userRepo repository.UserRepository,
	statsRepo repository.StatsRepository,
	settingsRepo repository.SettingsRepository,
	gameRepo repository.GameRepository,
	db *gorm.DB,
) UserService {
	return &userService{
		userRepo:     userRepo,
		statsRepo:    statsRepo,
		settingsRepo: settingsRepo,
		gameRepo:     gameRepo,
		db:           db,
	}
}

func (s *userService) GetUserByID(userID uint64) (*dto.UserBasic, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	
	stats, err := s.statsRepo.GetUserStats(userID)
	if err != nil {
		return nil, err
	}
	
	return &dto.UserBasic{
		ID:          user.ID,
		Username:    user.Username,
		Nickname:    user.Nickname,
		Email:       user.Email,
		AvatarURL:   user.AvatarURL,
		Role:        user.Role,
		Level:       stats.Level,
		Experience:  stats.Experience,
		CreatedAt:   user.CreatedAt.Format(time.RFC3339),
		LastLoginAt: user.LastLoginAt.Format(time.RFC3339),
	}, nil
}

func (s *userService) UpdateUser(userID uint64, req *dto.UpdateUserRequest) (*dto.UserBasic, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	
	if req.Nickname != "" {
		user.Nickname = req.Nickname
	}
	if req.AvatarURL != "" {
		user.AvatarURL = req.AvatarURL
	}
	
	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}
	
	return s.GetUserByID(userID)
}

func (s *userService) GetUserSettings(userID uint64) (*dto.UserSettingsResponse, error) {
	settings, err := s.settingsRepo.GetUserSettings(userID)
	if err != nil {
		return nil, err
	}
	if settings == nil {
		return nil, errors.New("设置未找到")
	}
	
	return &dto.UserSettingsResponse{
		AudioEnabled:   settings.AudioEnabled,
		ShakeEnabled:   settings.ShakeEnabled,
		ColorblindMode: settings.ColorblindMode,
		FontScale:      settings.FontScale,
	}, nil
}

func (s *userService) UpdateUserSettings(userID uint64, req *dto.UpdateSettingsRequest) (*dto.UserSettingsResponse, error) {
	settings, err := s.settingsRepo.GetUserSettings(userID)
	if err != nil {
		return nil, err
	}
	if settings == nil {
		return nil, errors.New("设置未找到")
	}
	
	if req.AudioEnabled != nil {
		settings.AudioEnabled = *req.AudioEnabled
	}
	if req.ShakeEnabled != nil {
		settings.ShakeEnabled = *req.ShakeEnabled
	}
	if req.ColorblindMode != nil {
		settings.ColorblindMode = *req.ColorblindMode
	}
	if req.FontScale != nil {
		settings.FontScale = *req.FontScale
	}
	
	if err := s.settingsRepo.UpsertUserSettings(settings); err != nil {
		return nil, err
	}
	
	return s.GetUserSettings(userID)
}

func (s *userService) ChangePassword(userID uint64, req *dto.ChangePasswordRequest) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}
	
	// 验证旧密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
		return errors.New("旧密码错误")
	}
	
	// 加密新密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("密码加密失败")
	}
	
	user.PasswordHash = string(hashedPassword)
	return s.userRepo.Update(user)
}

func (s *userService) MigrateData(userID uint64, req *dto.MigrationRequest) (*dto.MigrationResponse, error) {
	var progressCount int
	
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 迁移统计数据
		stats, err := s.statsRepo.GetUserStats(userID)
		if err != nil {
			return err
		}
		
		stats.TotalScore += req.Stats.TotalScore
		stats.TotalPlays += req.Stats.TotalPlays
		stats.TotalCorrect += req.Stats.TotalCorrect
		stats.TotalWrong += req.Stats.TotalWrong
		stats.VictoryCount += req.Stats.VictoryCount
		
		if req.Stats.BestCombo > stats.BestCombo {
			stats.BestCombo = req.Stats.BestCombo
		}
		if req.Stats.BestStreak > stats.BestStreak {
			stats.BestStreak = req.Stats.BestStreak
		}
		
		if err := tx.Save(stats).Error; err != nil {
			return err
		}
		
		// 迁移关卡进度
		for _, p := range req.Progress {
			existing, _ := s.gameRepo.GetLevelProgress(userID, p.LevelID)
			
			if existing == nil {
				newProgress := &model.UserLevelProgress{
					UserID:       userID,
					LevelID:      p.LevelID,
					BestScore:    p.BestScore,
					BestTime:     p.BestTime,
					BestAccuracy: p.BestAccuracy,
					PlayCount:    p.PlayCount,
				}
				if err := tx.Create(newProgress).Error; err != nil {
					return err
				}
			} else {
				if p.BestScore > existing.BestScore {
					existing.BestScore = p.BestScore
				}
				if p.BestTime > 0 && (existing.BestTime == 0 || p.BestTime < existing.BestTime) {
					existing.BestTime = p.BestTime
				}
				if p.BestAccuracy > existing.BestAccuracy {
					existing.BestAccuracy = p.BestAccuracy
				}
				existing.PlayCount += p.PlayCount
				
				if err := tx.Save(existing).Error; err != nil {
					return err
				}
			}
			progressCount++
		}
		
		// 迁移设置
		settings, err := s.settingsRepo.GetUserSettings(userID)
		if err != nil {
			return err
		}
		
		settings.AudioEnabled = req.Settings.AudioEnabled
		settings.ShakeEnabled = req.Settings.ShakeEnabled
		settings.ColorblindMode = req.Settings.ColorblindMode
		settings.FontScale = req.Settings.FontScale
		
		if err := tx.Save(settings).Error; err != nil {
			return err
		}
		
		return nil
	})
	
	if err != nil {
		return nil, err
	}
	
	return &dto.MigrationResponse{
		Success:       true,
		Message:       "数据迁移成功",
		ProgressCount: progressCount,
	}, nil
}

