package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// JSONArray 用于存储 JSON 数组
type JSONArray []interface{}

// Scan 实现 Scanner 接口
func (j *JSONArray) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, j)
}

// Value 实现 Valuer 接口
func (j JSONArray) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// GameRecord 游戏记录模型
type GameRecord struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID         uint64    `gorm:"index;not null" json:"user_id"`
	LevelID        string    `gorm:"type:varchar(50);index;not null" json:"level_id"`
	Score          int       `gorm:"not null;index" json:"score"`
	CorrectCount   int       `gorm:"not null" json:"correct_count"`
	TotalQuestions int       `gorm:"not null" json:"total_questions"`
	MaxCombo       int       `gorm:"default:0" json:"max_combo"`
	Accuracy       float64   `gorm:"type:decimal(5,4);not null" json:"accuracy"`
	TimeUsed       int       `gorm:"not null" json:"time_used"`
	TimeLeft       int       `gorm:"not null" json:"time_left"`
	Outcome        string    `gorm:"type:enum('victory','defeat','timeout');not null;index" json:"outcome"`
	AnswersHistory JSONArray `gorm:"type:json" json:"answers_history"`
	CreatedAt      time.Time `gorm:"index" json:"created_at"`
	User           *User     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Level          *Level    `gorm:"foreignKey:LevelID" json:"-"`
}

// TableName 指定表名
func (GameRecord) TableName() string {
	return "game_records"
}

