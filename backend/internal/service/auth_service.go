package service

import (
	"errors"
	"time"
	
	"github.com/yourusername/MentalMathGame/internal/config"
	"github.com/yourusername/MentalMathGame/internal/dto"
	"github.com/yourusername/MentalMathGame/internal/model"
	"github.com/yourusername/MentalMathGame/internal/pkg/jwt"
	"github.com/yourusername/MentalMathGame/internal/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(req *dto.RegisterRequest) (uint64, error)
	Login(req *dto.LoginRequest) (*dto.LoginResponse, error)
	RefreshToken(userID uint64) (*dto.RefreshTokenResponse, error)
}

type authService struct {
	userRepo     repository.UserRepository
	statsRepo    repository.StatsRepository
	settingsRepo repository.SettingsRepository
	db           *gorm.DB
}

func NewAuthService(
	userRepo repository.UserRepository,
	statsRepo repository.StatsRepository,
	settingsRepo repository.SettingsRepository,
	db *gorm.DB,
) AuthService {
	return &authService{
		userRepo:     userRepo,
		statsRepo:    statsRepo,
		settingsRepo: settingsRepo,
		db:           db,
	}
}

func (s *authService) Register(req *dto.RegisterRequest) (uint64, error) {
	// 1. 检查用户名是否已存在
	existingUser, err := s.userRepo.FindByUsername(req.Username)
	if err != nil && err != gorm.ErrRecordNotFound {
		return 0, err
	}
	if existingUser != nil {
		return 0, errors.New("用户名已存在")
	}
	
	// 2. 检查邮箱是否已存在
	existingEmail, err := s.userRepo.FindByEmail(req.Email)
	if err != nil && err != gorm.ErrRecordNotFound {
		return 0, err
	}
	if existingEmail != nil {
		return 0, errors.New("邮箱已被注册")
	}
	
	// 3. 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return 0, errors.New("密码加密失败")
	}
	
	// 4. 创建用户
	user := &model.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Nickname:     req.Nickname,
		Role:         "student",
		Status:       1,
	}
	
	// 5. 使用事务创建用户及相关数据
	err = s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(user).Error; err != nil {
			return err
		}
		
		// 创建用户统计
		stats := &model.UserStats{
			UserID:     user.ID,
			Level:      1,
			Experience: 0,
		}
		if err := tx.Create(stats).Error; err != nil {
			return err
		}
		
		// 创建用户设置
		settings := &model.UserSettings{
			UserID:         user.ID,
			AudioEnabled:   true,
			ShakeEnabled:   true,
			ColorblindMode: false,
			FontScale:      1.0,
		}
		if err := tx.Create(settings).Error; err != nil {
			return err
		}
		
		return nil
	})
	
	if err != nil {
		return 0, err
	}
	
	return user.ID, nil
}

func (s *authService) Login(req *dto.LoginRequest) (*dto.LoginResponse, error) {
	// 1. 查找用户
	user, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("用户名或密码错误")
		}
		return nil, err
	}
	
	// 2. 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("用户名或密码错误")
	}
	
	// 3. 检查状态
	if user.Status != 1 {
		return nil, errors.New("账号已被禁用")
	}
	
	// 4. 获取用户统计（等级和经验）
	stats, err := s.statsRepo.GetUserStats(user.ID)
	if err != nil {
		return nil, err
	}
	
	// 5. 生成Token
	expiresAt := time.Now().Add(time.Duration(config.AppConfig.JWT.ExpireHours) * time.Hour).Unix()
	token, err := jwt.GenerateToken(
		user.ID,
		user.Username,
		user.Role,
		config.AppConfig.JWT.Secret,
		config.AppConfig.JWT.ExpireHours,
	)
	if err != nil {
		return nil, err
	}
	
	// 6. 更新最后登录时间
	go s.userRepo.UpdateLastLogin(user.ID)
	
	// 7. 构建响应
	response := &dto.LoginResponse{
		Token:     token,
		ExpiresAt: expiresAt,
		User: &dto.UserBasic{
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
		},
	}
	
	return response, nil
}

func (s *authService) RefreshToken(userID uint64) (*dto.RefreshTokenResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	
	if user.Status != 1 {
		return nil, errors.New("账号已被禁用")
	}
	
	expiresAt := time.Now().Add(time.Duration(config.AppConfig.JWT.ExpireHours) * time.Hour).Unix()
	token, err := jwt.GenerateToken(
		user.ID,
		user.Username,
		user.Role,
		config.AppConfig.JWT.Secret,
		config.AppConfig.JWT.ExpireHours,
	)
	if err != nil {
		return nil, err
	}
	
	return &dto.RefreshTokenResponse{
		Token:     token,
		ExpiresAt: expiresAt,
	}, nil
}

