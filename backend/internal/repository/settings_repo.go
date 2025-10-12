package repository

import (
	"github.com/yourusername/MentalMathGame/internal/model"
	"gorm.io/gorm"
)

type SettingsRepository interface {
	GetUserSettings(userID uint64) (*model.UserSettings, error)
	UpsertUserSettings(settings *model.UserSettings) error
	UpdateUserSettings(userID uint64, updates map[string]interface{}) error
}

type settingsRepository struct {
	db *gorm.DB
}

func NewSettingsRepository(db *gorm.DB) SettingsRepository {
	return &settingsRepository{db: db}
}

func (r *settingsRepository) GetUserSettings(userID uint64) (*model.UserSettings, error) {
	var settings model.UserSettings
	err := r.db.Where("user_id = ?", userID).First(&settings).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &settings, nil
}

func (r *settingsRepository) UpsertUserSettings(settings *model.UserSettings) error {
	var existing model.UserSettings
	err := r.db.Where("user_id = ?", settings.UserID).First(&existing).Error
	
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(settings).Error
	}
	if err != nil {
		return err
	}
	
	settings.ID = existing.ID
	return r.db.Save(settings).Error
}

func (r *settingsRepository) UpdateUserSettings(userID uint64, updates map[string]interface{}) error {
	return r.db.Model(&model.UserSettings{}).Where("user_id = ?", userID).Updates(updates).Error
}

