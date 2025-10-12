package model

import (
	"time"
)

// DailyQuest 每日任务模型
type DailyQuest struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	QuestDate   time.Time `gorm:"type:date;index;not null" json:"quest_date"`
	QuestType   string    `gorm:"type:varchar(50);not null" json:"quest_type"`
	QuestConfig JSONMap   `gorm:"type:json;not null" json:"quest_config"`
	RewardExp   int       `gorm:"default:0" json:"reward_exp"`
	RewardScore int       `gorm:"default:0" json:"reward_score"`
	CreatedAt   time.Time `json:"created_at"`
}

// TableName 指定表名
func (DailyQuest) TableName() string {
	return "daily_quests"
}

// UserDailyQuest 用户每日任务模型
type UserDailyQuest struct {
	ID          uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      uint64      `gorm:"index;not null" json:"user_id"`
	QuestID     uint64      `gorm:"not null" json:"quest_id"`
	Progress    int         `gorm:"default:0" json:"progress"`
	Completed   bool        `gorm:"default:false;index" json:"completed"`
	CompletedAt *time.Time  `json:"completed_at"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	User        *User       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Quest       *DailyQuest `gorm:"foreignKey:QuestID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName 指定表名
func (UserDailyQuest) TableName() string {
	return "user_daily_quests"
}

