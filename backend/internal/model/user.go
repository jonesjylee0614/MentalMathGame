package model

import (
	"time"
)

// User 用户模型
type User struct {
	ID          uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Username    string     `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	Email       string     `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"type:varchar(255);not null" json:"-"`
	Nickname    string     `gorm:"type:varchar(50);not null" json:"nickname"`
	AvatarURL   string     `gorm:"type:varchar(255);default:''" json:"avatar_url"`
	Role        string     `gorm:"type:enum('student','parent','admin');default:'student'" json:"role"`
	ParentID    *uint64    `gorm:"index" json:"parent_id"`
	Status      int8       `gorm:"default:1;index" json:"status"` // 0-禁用 1-正常
	CreatedAt   time.Time  `gorm:"index" json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	LastLoginAt *time.Time `json:"last_login_at"`
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}

// UserSettings 用户设置模型
type UserSettings struct {
	ID             uint64  `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID         uint64  `gorm:"uniqueIndex;not null" json:"user_id"`
	AudioEnabled   bool    `gorm:"default:true" json:"audio_enabled"`
	ShakeEnabled   bool    `gorm:"default:true" json:"shake_enabled"`
	ColorblindMode bool    `gorm:"default:false" json:"colorblind_mode"`
	FontScale      float64 `gorm:"type:decimal(3,2);default:1.00" json:"font_scale"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	User           *User   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName 指定表名
func (UserSettings) TableName() string {
	return "user_settings"
}

