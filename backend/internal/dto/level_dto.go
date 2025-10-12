package dto

// LevelResponse 关卡响应
type LevelResponse struct {
	ID              string                 `json:"id"`
	Category        string                 `json:"category"`
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	GeneratorConfig map[string]interface{} `json:"generator_config"`
	QuestionCount   int                    `json:"question_count"`
	TimeLimit       int                    `json:"time_limit"`
	Difficulty      float64                `json:"difficulty"`
	HPConfig        map[string]interface{} `json:"hp_config,omitempty"`
	Status          int                    `json:"status"`
	SortOrder       int                    `json:"sort_order"`
}

// LevelDetailResponse 关卡详情响应
type LevelDetailResponse struct {
	LevelResponse
	UserProgress *LevelProgressInfo `json:"user_progress,omitempty"`
}

// LevelProgressInfo 关卡进度信息
type LevelProgressInfo struct {
	BestScore    int     `json:"best_score"`
	BestTime     int     `json:"best_time"`
	BestAccuracy float64 `json:"best_accuracy"`
	PlayCount    int     `json:"play_count"`
	LastOutcome  string  `json:"last_outcome"`
	LastPlayedAt string  `json:"last_played_at"`
}

