package repository

import (
	"github.com/yourusername/MentalMathGame/internal/model"
	"gorm.io/gorm"
)

type LevelRepository interface {
	FindAll(category string, status int) ([]model.Level, error)
	FindByID(id string) (*model.Level, error)
	FindByCategory(category string) ([]model.Level, error)
	GetCategories() ([]string, error)
}

type levelRepository struct {
	db *gorm.DB
}

func NewLevelRepository(db *gorm.DB) LevelRepository {
	return &levelRepository{db: db}
}

func (r *levelRepository) FindAll(category string, status int) ([]model.Level, error) {
	var levels []model.Level
	query := r.db.Model(&model.Level{})
	
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if status >= 0 {
		query = query.Where("status = ?", status)
	}
	
	err := query.Order("sort_order ASC").Find(&levels).Error
	return levels, err
}

func (r *levelRepository) FindByID(id string) (*model.Level, error) {
	var level model.Level
	err := r.db.Where("id = ?", id).First(&level).Error
	if err != nil {
		return nil, err
	}
	return &level, nil
}

func (r *levelRepository) FindByCategory(category string) ([]model.Level, error) {
	var levels []model.Level
	err := r.db.Where("category = ? AND status = 1", category).
		Order("sort_order ASC").
		Find(&levels).Error
	return levels, err
}

func (r *levelRepository) GetCategories() ([]string, error) {
	var categories []string
	err := r.db.Model(&model.Level{}).
		Select("DISTINCT category").
		Where("status = 1").
		Pluck("category", &categories).Error
	return categories, err
}

