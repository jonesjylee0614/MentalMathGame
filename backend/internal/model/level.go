package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// JSONMap 用于存储 JSON 对象
type JSONMap map[string]interface{}

// Scan 实现 Scanner 接口
func (j *JSONMap) Scan(value interface{}) error {
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
func (j JSONMap) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// JSONStringArray 用于存储 JSON 字符串数组
type JSONStringArray []string

// Scan 实现 Scanner 接口
func (j *JSONStringArray) Scan(value interface{}) error {
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
func (j JSONStringArray) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Level 关卡配置模型
type Level struct {
	ID               string          `gorm:"primaryKey;type:varchar(50)" json:"id"`
	Category         string          `gorm:"type:varchar(50);index;not null" json:"category"`
	Name             string          `gorm:"type:varchar(100);not null" json:"name"`
	Description      string          `gorm:"type:text" json:"description"`
	GeneratorConfig  JSONMap         `gorm:"type:json;not null" json:"generator_config"`
	QuestionCount    int             `gorm:"default:20" json:"question_count"`
	TimeLimit        int             `gorm:"default:120" json:"time_limit"`
	TargetTime       int             `gorm:"default:0" json:"target_time"`        // 目标完成时间（秒），0表示使用time_limit
	Difficulty       float64         `gorm:"type:decimal(3,2);default:1.00" json:"difficulty"`
	RewardPoints     int             `gorm:"default:0" json:"reward_points"`      // 完成奖励积分
	HPConfig         JSONMap         `gorm:"type:json" json:"hp_config"`
	GameMode         string          `gorm:"type:varchar(50);default:'battle'" json:"game_mode"`
	RecommendedModes JSONStringArray `gorm:"type:json" json:"recommended_modes"`
	ModeConfig       JSONMap         `gorm:"type:json" json:"mode_config"`
	Status           int8            `gorm:"default:1;index" json:"status"` // 0-禁用 1-正常
	SortOrder        int             `gorm:"default:0;index" json:"sort_order"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
}

// TableName 指定表名
func (Level) TableName() string {
	return "levels"
}

// UserLevelProgress 用户关卡进度模型
type UserLevelProgress struct {
	ID           uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID       uint64     `gorm:"index;not null" json:"user_id"`
	LevelID      string     `gorm:"type:varchar(50);index;not null" json:"level_id"`
	BestScore    int        `gorm:"default:0;index" json:"best_score"`
	BestTime     int        `gorm:"default:0" json:"best_time"`
	BestAccuracy float64    `gorm:"type:decimal(5,4);default:0" json:"best_accuracy"`
	PlayCount    int        `gorm:"default:0" json:"play_count"`
	TotalScore   int        `gorm:"default:0" json:"total_score"`
	TotalCorrect int        `gorm:"default:0" json:"total_correct"`
	TotalWrong   int        `gorm:"default:0" json:"total_wrong"`
	LastOutcome  string     `gorm:"type:enum('victory','defeat','timeout')" json:"last_outcome"`
	LastPlayedAt *time.Time `gorm:"index" json:"last_played_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	User         *User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Level        *Level     `gorm:"foreignKey:LevelID" json:"-"`
}

// TableName 指定表名
func (UserLevelProgress) TableName() string {
	return "user_level_progress"
}

