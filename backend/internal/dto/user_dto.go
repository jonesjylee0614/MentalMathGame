package dto

// UpdateUserRequest 更新用户信息请求
type UpdateUserRequest struct {
	Nickname  string `json:"nickname" binding:"omitempty,min=2,max=50"`
	AvatarURL string `json:"avatar_url" binding:"omitempty"`
}

// UpdateSettingsRequest 更新设置请求
type UpdateSettingsRequest struct {
	AudioEnabled    *bool    `json:"audio_enabled"`
	ShakeEnabled    *bool    `json:"shake_enabled"`
	ColorblindMode  *bool    `json:"colorblind_mode"`
	FontScale       *float64 `json:"font_scale" binding:"omitempty,min=0.5,max=2.0"`
}

// ChangePasswordRequest 修改密码请求
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

// UserSettingsResponse 用户设置响应
type UserSettingsResponse struct {
	AudioEnabled   bool    `json:"audio_enabled"`
	ShakeEnabled   bool    `json:"shake_enabled"`
	ColorblindMode bool    `json:"colorblind_mode"`
	FontScale      float64 `json:"font_scale"`
}

// MigrationRequest 数据迁移请求
type MigrationRequest struct {
	Profile  MigrationProfile  `json:"profile"`
	Progress []MigrationProgress `json:"progress"`
	Stats    MigrationStats    `json:"stats"`
	Settings MigrationSettings `json:"settings"`
}

type MigrationProfile struct {
	Name      string `json:"name"`
	CreatedAt int64  `json:"createdAt"`
}

type MigrationProgress struct {
	LevelID      string  `json:"levelId"`
	BestScore    int     `json:"bestScore"`
	BestTime     int     `json:"bestTime"`
	BestAccuracy float64 `json:"bestAccuracy"`
	PlayCount    int     `json:"playCount"`
}

type MigrationStats struct {
	TotalScore   int `json:"totalScore"`
	TotalPlays   int `json:"totalPlays"`
	TotalCorrect int `json:"totalCorrect"`
	TotalWrong   int `json:"totalWrong"`
	BestCombo    int `json:"bestCombo"`
	VictoryCount int `json:"victoryCount"`
	BestStreak   int `json:"bestStreak"`
}

type MigrationSettings struct {
	AudioEnabled   bool    `json:"audioEnabled"`
	ShakeEnabled   bool    `json:"shakeEnabled"`
	ColorblindMode bool    `json:"colorblindMode"`
	FontScale      float64 `json:"fontScale"`
}

// MigrationResponse 数据迁移响应
type MigrationResponse struct {
	Success       bool   `json:"success"`
	Message       string `json:"message"`
	ProgressCount int    `json:"progress_count"`
}

