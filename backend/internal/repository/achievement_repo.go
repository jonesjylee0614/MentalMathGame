package repository

import (
	"github.com/yourusername/MentalMathGame/internal/model"
	"gorm.io/gorm"
)

type AchievementRepository interface {
	FindAll(category string, status int) ([]model.Achievement, error)
	FindByID(id string) (*model.Achievement, error)
	
	GetUserAchievement(userID uint64, achievementID string) (*model.UserAchievement, error)
	GetUserAchievements(userID uint64, completed *bool) ([]model.UserAchievement, error)
	UpsertUserAchievement(ua *model.UserAchievement) error
	GetUserCompletedCount(userID uint64, category string) (int64, error)
}

type achievementRepository struct {
	db *gorm.DB
}

func NewAchievementRepository(db *gorm.DB) AchievementRepository {
	return &achievementRepository{db: db}
}

func (r *achievementRepository) FindAll(category string, status int) ([]model.Achievement, error) {
	var achievements []model.Achievement
	query := r.db.Model(&model.Achievement{})
	
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if status >= 0 {
		query = query.Where("status = ?", status)
	}
	
	err := query.Order("sort_order ASC").Find(&achievements).Error
	return achievements, err
}

func (r *achievementRepository) FindByID(id string) (*model.Achievement, error) {
	var achievement model.Achievement
	err := r.db.Where("id = ?", id).First(&achievement).Error
	if err != nil {
		return nil, err
	}
	return &achievement, nil
}

func (r *achievementRepository) GetUserAchievement(userID uint64, achievementID string) (*model.UserAchievement, error) {
	var ua model.UserAchievement
	err := r.db.Where("user_id = ? AND achievement_id = ?", userID, achievementID).First(&ua).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &ua, nil
}

func (r *achievementRepository) GetUserAchievements(userID uint64, completed *bool) ([]model.UserAchievement, error) {
	var achievements []model.UserAchievement
	query := r.db.Where("user_id = ?", userID)
	
	if completed != nil {
		query = query.Where("completed = ?", *completed)
	}
	
	err := query.Find(&achievements).Error
	return achievements, err
}

func (r *achievementRepository) UpsertUserAchievement(ua *model.UserAchievement) error {
	var existing model.UserAchievement
	err := r.db.Where("user_id = ? AND achievement_id = ?", ua.UserID, ua.AchievementID).First(&existing).Error
	
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(ua).Error
	}
	if err != nil {
		return err
	}
	
	ua.ID = existing.ID
	return r.db.Save(ua).Error
}

func (r *achievementRepository) GetUserCompletedCount(userID uint64, category string) (int64, error) {
	var count int64
	query := r.db.Model(&model.UserAchievement{}).
		Joins("JOIN achievements ON achievements.id = user_achievements.achievement_id").
		Where("user_achievements.user_id = ? AND user_achievements.completed = 1", userID)
	
	if category != "" {
		query = query.Where("achievements.category = ?", category)
	}
	
	err := query.Count(&count).Error
	return count, err
}

