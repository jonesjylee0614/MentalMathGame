package dto

// UserStatsResponse 用户统计响应
type UserStatsResponse struct {
	TotalScore    int     `json:"total_score"`
	TotalPlays    int     `json:"total_plays"`
	TotalCorrect  int     `json:"total_correct"`
	TotalWrong    int     `json:"total_wrong"`
	TotalTimeSec  int     `json:"total_time_sec"`
	BestCombo     int     `json:"best_combo"`
	VictoryCount  int     `json:"victory_count"`
	DefeatCount   int     `json:"defeat_count"`
	CurrentStreak int     `json:"current_streak"`
	BestStreak    int     `json:"best_streak"`
	Level         int     `json:"level"`
	Experience    int     `json:"experience"`
	AvgAccuracy   float64 `json:"avg_accuracy"`
	WinRate       float64 `json:"win_rate"`
}

// LevelProgressResponse 关卡进度响应
type LevelProgressResponse struct {
	LevelID       string  `json:"level_id"`
	LevelName     string  `json:"level_name"`
	Category      string  `json:"category"`
	BestScore     int     `json:"best_score"`
	BestTime      int     `json:"best_time"`
	BestAccuracy  float64 `json:"best_accuracy"`
	PlayCount     int     `json:"play_count"`
	TotalScore    int     `json:"total_score"`
	TotalCorrect  int     `json:"total_correct"`
	TotalWrong    int     `json:"total_wrong"`
	LastOutcome   string  `json:"last_outcome"`
	LastPlayedAt  string  `json:"last_played_at"`
}

// GameHistoryResponse 游戏历史响应
type GameHistoryResponse struct {
	Type string              `json:"type"`
	Data []GameHistoryRecord `json:"data"`
}

type GameHistoryRecord struct {
	Date         string  `json:"date"`
	PlayCount    int     `json:"play_count"`
	VictoryCount int     `json:"victory_count"`
	TotalScore   int     `json:"total_score"`
	AvgAccuracy  float64 `json:"avg_accuracy"`
}

// UserAchievementResponse 用户成就响应
type UserAchievementResponse struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	IconURL       string  `json:"icon_url"`
	Category      string  `json:"category"`
	RewardExp     int     `json:"reward_exp"`
	Progress      int     `json:"progress"`
	Target        int     `json:"target"`
	Completed     bool    `json:"completed"`
	CompletedAt   string  `json:"completed_at"`
	ProgressRate  float64 `json:"progress_rate"`
}

