package dto

// LeaderboardResponse 排行榜响应
type LeaderboardResponse struct {
	Type    string             `json:"type"`
	Period  string             `json:"period,omitempty"`
	Records []LeaderboardEntry `json:"records"`
}

// LeaderboardEntry 排行榜条目
type LeaderboardEntry struct {
	Rank      int     `json:"rank"`
	UserID    uint64  `json:"user_id"`
	Username  string  `json:"username"`
	Nickname  string  `json:"nickname"`
	AvatarURL string  `json:"avatar_url"`
	Score     int     `json:"score,omitempty"`
	Level     int     `json:"level,omitempty"`
	Value     int     `json:"value,omitempty"`
	Time      int     `json:"time,omitempty"`
	Accuracy  float64 `json:"accuracy,omitempty"`
	UpdatedAt string  `json:"updated_at,omitempty"`
}

