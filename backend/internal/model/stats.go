package model

import (
	"time"
)

// UserStats 用户统计模型
type UserStats struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID        uint64    `gorm:"uniqueIndex;not null" json:"user_id"`
	TotalScore    int       `gorm:"default:0" json:"total_score"`
	TotalPlays    int       `gorm:"default:0" json:"total_plays"`
	TotalCorrect  int       `gorm:"default:0" json:"total_correct"`
	TotalWrong    int       `gorm:"default:0" json:"total_wrong"`
	TotalTimeSec  int       `gorm:"default:0" json:"total_time_sec"`
	BestCombo     int       `gorm:"default:0" json:"best_combo"`
	VictoryCount  int       `gorm:"default:0" json:"victory_count"`
	DefeatCount   int       `gorm:"default:0" json:"defeat_count"`
	CurrentStreak int       `gorm:"default:0" json:"current_streak"`
	BestStreak    int       `gorm:"default:0" json:"best_streak"`
	Level         int       `gorm:"default:1" json:"level"`
	Experience    int       `gorm:"default:0" json:"experience"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	User          *User     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName 指定表名
func (UserStats) TableName() string {
	return "user_stats"
}

