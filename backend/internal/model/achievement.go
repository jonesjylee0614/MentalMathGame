package model

import (
	"time"
)

// Achievement 成就模型
type Achievement struct {
	ID             string    `gorm:"primaryKey;type:varchar(50)" json:"id"`
	Name           string    `gorm:"type:varchar(100);not null" json:"name"`
	Description    string    `gorm:"type:text" json:"description"`
	IconURL        string    `gorm:"type:varchar(255)" json:"icon_url"`
	Category       string    `gorm:"type:varchar(50);index" json:"category"`
	ConditionType  string    `gorm:"type:varchar(50);not null" json:"condition_type"`
	ConditionValue JSONMap   `gorm:"type:json;not null" json:"condition_value"`
	RewardExp      int       `gorm:"default:0" json:"reward_exp"`
	SortOrder      int       `gorm:"default:0" json:"sort_order"`
	Status         int8      `gorm:"default:1;index" json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// TableName 指定表名
func (Achievement) TableName() string {
	return "achievements"
}

// UserAchievement 用户成就模型
type UserAchievement struct {
	ID            uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID        uint64     `gorm:"index;not null" json:"user_id"`
	AchievementID string     `gorm:"type:varchar(50);not null" json:"achievement_id"`
	Progress      int        `gorm:"default:0" json:"progress"`
	Completed     bool       `gorm:"default:false;index" json:"completed"`
	CompletedAt   *time.Time `json:"completed_at"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	User          *User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Achievement   *Achievement `gorm:"foreignKey:AchievementID" json:"-"`
}

// TableName 指定表名
func (UserAchievement) TableName() string {
	return "user_achievements"
}

