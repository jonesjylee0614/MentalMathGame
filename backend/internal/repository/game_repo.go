package repository

import (
	"github.com/yourusername/MentalMathGame/internal/model"
	"gorm.io/gorm"
)

type GameRepository interface {
	CreateRecord(record *model.GameRecord) error
	FindByID(id uint64) (*model.GameRecord, error)
	FindByUserID(userID uint64, page, pageSize int) ([]model.GameRecord, int64, error)
	FindByUserAndLevel(userID uint64, levelID string, page, pageSize int) ([]model.GameRecord, int64, error)
	FindByUserAndOutcome(userID uint64, outcome string, page, pageSize int) ([]model.GameRecord, int64, error)
	
	// 关卡进度
	GetLevelProgress(userID uint64, levelID string) (*model.UserLevelProgress, error)
	UpsertLevelProgress(progress *model.UserLevelProgress) error
	GetAllLevelProgress(userID uint64, category string) ([]model.UserLevelProgress, error)
	GetUserCompletedLevelsCount(userID uint64) (int64, error)
}

type gameRepository struct {
	db *gorm.DB
}

func NewGameRepository(db *gorm.DB) GameRepository {
	return &gameRepository{db: db}
}

func (r *gameRepository) CreateRecord(record *model.GameRecord) error {
	return r.db.Create(record).Error
}

func (r *gameRepository) FindByID(id uint64) (*model.GameRecord, error) {
	var record model.GameRecord
	err := r.db.Where("id = ?", id).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (r *gameRepository) FindByUserID(userID uint64, page, pageSize int) ([]model.GameRecord, int64, error) {
	var records []model.GameRecord
	var total int64
	
	offset := (page - 1) * pageSize
	
	err := r.db.Model(&model.GameRecord{}).Where("user_id = ?", userID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	
	err = r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&records).Error
	
	return records, total, err
}

func (r *gameRepository) FindByUserAndLevel(userID uint64, levelID string, page, pageSize int) ([]model.GameRecord, int64, error) {
	var records []model.GameRecord
	var total int64
	
	offset := (page - 1) * pageSize
	
	err := r.db.Model(&model.GameRecord{}).
		Where("user_id = ? AND level_id = ?", userID, levelID).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	
	err = r.db.Where("user_id = ? AND level_id = ?", userID, levelID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&records).Error
	
	return records, total, err
}

func (r *gameRepository) FindByUserAndOutcome(userID uint64, outcome string, page, pageSize int) ([]model.GameRecord, int64, error) {
	var records []model.GameRecord
	var total int64
	
	offset := (page - 1) * pageSize
	
	err := r.db.Model(&model.GameRecord{}).
		Where("user_id = ? AND outcome = ?", userID, outcome).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	
	err = r.db.Where("user_id = ? AND outcome = ?", userID, outcome).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&records).Error
	
	return records, total, err
}

func (r *gameRepository) GetLevelProgress(userID uint64, levelID string) (*model.UserLevelProgress, error) {
	var progress model.UserLevelProgress
	err := r.db.Where("user_id = ? AND level_id = ?", userID, levelID).First(&progress).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &progress, nil
}

func (r *gameRepository) UpsertLevelProgress(progress *model.UserLevelProgress) error {
	var existing model.UserLevelProgress
	err := r.db.Where("user_id = ? AND level_id = ?", progress.UserID, progress.LevelID).First(&existing).Error
	
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(progress).Error
	}
	if err != nil {
		return err
	}
	
	progress.ID = existing.ID
	return r.db.Save(progress).Error
}

func (r *gameRepository) GetAllLevelProgress(userID uint64, category string) ([]model.UserLevelProgress, error) {
	var progress []model.UserLevelProgress
	query := r.db.Where("user_id = ?", userID)
	
	if category != "" {
		// Join with levels table to filter by category
		query = query.Joins("JOIN levels ON levels.id = user_level_progress.level_id").
			Where("levels.category = ?", category)
	}
	
	err := query.Find(&progress).Error
	return progress, err
}

func (r *gameRepository) GetUserCompletedLevelsCount(userID uint64) (int64, error) {
	var count int64
	err := r.db.Model(&model.UserLevelProgress{}).
		Where("user_id = ? AND play_count > 0", userID).
		Count(&count).Error
	return count, err
}

