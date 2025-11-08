package dto

// SubmitGameRequest 提交游戏结果请求
type SubmitGameRequest struct {
	SessionID      string         `json:"session_id"`
	LevelID        string         `json:"level_id" binding:"required"`
	Score          int            `json:"score" binding:"required,min=0"`
	CorrectCount   int            `json:"correct_count" binding:"required,min=0"`
	TotalQuestions int            `json:"total_questions" binding:"required,min=1"`
	MaxCombo       int            `json:"max_combo" binding:"min=0"`
	Accuracy       float64        `json:"accuracy" binding:"required,min=0,max=1"`
	TimeUsed       int            `json:"time_used" binding:"required,min=0"`
	TimeLeft       int            `json:"time_left" binding:"min=0"`
	Outcome        string         `json:"outcome" binding:"required,oneof=victory defeat timeout"`
	AnswersHistory []AnswerRecord `json:"answers_history"`
}

// AnswerRecord 答题记录
type AnswerRecord struct {
	QuestionID     string  `json:"question_id"`
	Correct        bool    `json:"correct"`
	UserAnswer     string  `json:"user_answer"`
	ExpectedAnswer string  `json:"expected_answer"`
	TimeSpent      float64 `json:"time_spent"`
}

// SubmitGameResponse 提交游戏结果响应
type SubmitGameResponse struct {
	RecordID             uint64                   `json:"record_id"`
	IsBestScore          bool                     `json:"is_best_score"`
	IsBestTime           bool                     `json:"is_best_time"`
	IsBestAccuracy       bool                     `json:"is_best_accuracy"`
	PreviousBest         PreviousBestInfo         `json:"previous_best"`
	Rewards              RewardsInfo              `json:"rewards"`
	UnlockedAchievements []AchievementInfo        `json:"unlocked_achievements"`
	CompletedQuests      []QuestInfo              `json:"completed_quests"`
	RankChange           RankChangeInfo           `json:"rank_change"`
}

type PreviousBestInfo struct {
	Score    int     `json:"score"`
	Time     int     `json:"time"`
	Accuracy float64 `json:"accuracy"`
}

type RewardsInfo struct {
	ExpGained      int  `json:"exp_gained"`
	ScoreGained    int  `json:"score_gained"`
	PointsGained   int  `json:"points_gained"`     // 奖励积分
	IsFullReward   bool `json:"is_full_reward"`    // 是否获得全额奖励（全对+在目标时间内）
	LevelUp        bool `json:"level_up"`
	NewLevel       int  `json:"new_level"`
	NewExp         int  `json:"new_exp"`
	NextLevelExp   int  `json:"next_level_exp"`
}

type AchievementInfo struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	RewardExp   int    `json:"reward_exp"`
}

type QuestInfo struct {
	ID        uint64 `json:"id"`
	Type      string `json:"type"`
	RewardExp int    `json:"reward_exp"`
}

type RankChangeInfo struct {
	GlobalRank RankInfo `json:"global_rank"`
	LevelRank  RankInfo `json:"level_rank"`
}

type RankInfo struct {
	Previous int `json:"previous"`
	Current  int `json:"current"`
	Change   int `json:"change"`
}

// GameRecordResponse 游戏记录响应
type GameRecordResponse struct {
	ID             uint64  `json:"id"`
	LevelID        string  `json:"level_id"`
	LevelName      string  `json:"level_name"`
	Score          int     `json:"score"`
	CorrectCount   int     `json:"correct_count"`
	TotalQuestions int     `json:"total_questions"`
	MaxCombo       int     `json:"max_combo"`
	Accuracy       float64 `json:"accuracy"`
	TimeUsed       int     `json:"time_used"`
	TimeLeft       int     `json:"time_left"`
	Outcome        string  `json:"outcome"`
	CreatedAt      string  `json:"created_at"`
}

// PaginationResponse 分页响应
type PaginationResponse struct {
	Total       int64       `json:"total"`
	Page        int         `json:"page"`
	PageSize    int         `json:"page_size"`
	TotalPages  int         `json:"total_pages"`
	Records     interface{} `json:"records"`
}

