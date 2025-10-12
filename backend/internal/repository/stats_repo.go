package repository

import (
	"time"
	
	"github.com/yourusername/MentalMathGame/internal/model"
	"gorm.io/gorm"
)

type StatsRepository interface {
	GetUserStats(userID uint64) (*model.UserStats, error)
	UpsertUserStats(stats *model.UserStats) error
	UpdateUserStats(userID uint64, updates map[string]interface{}) error
	
	// 游戏历史统计
	GetDailyStats(userID uint64, days int) ([]DailyStatsResult, error)
	GetWeeklyStats(userID uint64, weeks int) ([]WeeklyStatsResult, error)
	GetMonthlyStats(userID uint64, months int) ([]MonthlyStatsResult, error)
	
	// 排行榜相关
	GetTopUsersByScore(limit int) ([]LeaderboardResult, error)
	GetTopUsersByLevel(limit int) ([]LeaderboardResult, error)
	GetTopUsersByVictoryCount(limit int) ([]LeaderboardResult, error)
	GetTopUsersByLevelScore(levelID string, limit int) ([]LeaderboardResult, error)
	GetTopUsersByLevelTime(levelID string, limit int) ([]LeaderboardResult, error)
	GetTopUsersByLevelAccuracy(levelID string, limit int) ([]LeaderboardResult, error)
	GetUserRankByScore(userID uint64) (int, error)
	GetUserRankByLevel(userID uint64) (int, error)
	GetUserRankByLevelScore(userID uint64, levelID string) (int, error)
}

type DailyStatsResult struct {
	Date         string
	PlayCount    int
	VictoryCount int
	TotalScore   int
	AvgAccuracy  float64
}

type WeeklyStatsResult struct {
	Week         string
	PlayCount    int
	VictoryCount int
	TotalScore   int
	AvgAccuracy  float64
}

type MonthlyStatsResult struct {
	Month        string
	PlayCount    int
	VictoryCount int
	TotalScore   int
	AvgAccuracy  float64
}

type LeaderboardResult struct {
	UserID    uint64
	Username  string
	Nickname  string
	AvatarURL string
	Score     int
	Level     int
	Value     int
	Time      int
	Accuracy  float64
	UpdatedAt time.Time
}

type statsRepository struct {
	db *gorm.DB
}

func NewStatsRepository(db *gorm.DB) StatsRepository {
	return &statsRepository{db: db}
}

func (r *statsRepository) GetUserStats(userID uint64) (*model.UserStats, error) {
	var stats model.UserStats
	err := r.db.Where("user_id = ?", userID).First(&stats).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &stats, nil
}

func (r *statsRepository) UpsertUserStats(stats *model.UserStats) error {
	var existing model.UserStats
	err := r.db.Where("user_id = ?", stats.UserID).First(&existing).Error
	
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(stats).Error
	}
	if err != nil {
		return err
	}
	
	stats.ID = existing.ID
	return r.db.Save(stats).Error
}

func (r *statsRepository) UpdateUserStats(userID uint64, updates map[string]interface{}) error {
	return r.db.Model(&model.UserStats{}).Where("user_id = ?", userID).Updates(updates).Error
}

func (r *statsRepository) GetDailyStats(userID uint64, days int) ([]DailyStatsResult, error) {
	var results []DailyStatsResult
	err := r.db.Raw(`
		SELECT 
			DATE(created_at) as date,
			COUNT(*) as play_count,
			SUM(CASE WHEN outcome = 'victory' THEN 1 ELSE 0 END) as victory_count,
			SUM(score) as total_score,
			AVG(accuracy) as avg_accuracy
		FROM game_records
		WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
		GROUP BY DATE(created_at)
		ORDER BY date DESC
	`, userID, days).Scan(&results).Error
	return results, err
}

func (r *statsRepository) GetWeeklyStats(userID uint64, weeks int) ([]WeeklyStatsResult, error) {
	var results []WeeklyStatsResult
	err := r.db.Raw(`
		SELECT 
			DATE_FORMAT(created_at, '%Y-W%u') as week,
			COUNT(*) as play_count,
			SUM(CASE WHEN outcome = 'victory' THEN 1 ELSE 0 END) as victory_count,
			SUM(score) as total_score,
			AVG(accuracy) as avg_accuracy
		FROM game_records
		WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? WEEK)
		GROUP BY DATE_FORMAT(created_at, '%Y-W%u')
		ORDER BY week DESC
	`, userID, weeks).Scan(&results).Error
	return results, err
}

func (r *statsRepository) GetMonthlyStats(userID uint64, months int) ([]MonthlyStatsResult, error) {
	var results []MonthlyStatsResult
	err := r.db.Raw(`
		SELECT 
			DATE_FORMAT(created_at, '%Y-%m') as month,
			COUNT(*) as play_count,
			SUM(CASE WHEN outcome = 'victory' THEN 1 ELSE 0 END) as victory_count,
			SUM(score) as total_score,
			AVG(accuracy) as avg_accuracy
		FROM game_records
		WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
		GROUP BY DATE_FORMAT(created_at, '%Y-%m')
		ORDER BY month DESC
	`, userID, months).Scan(&results).Error
	return results, err
}

func (r *statsRepository) GetTopUsersByScore(limit int) ([]LeaderboardResult, error) {
	var results []LeaderboardResult
	err := r.db.Raw(`
		SELECT 
			u.id as user_id,
			u.username,
			u.nickname,
			u.avatar_url,
			s.total_score as score,
			s.level,
			s.updated_at
		FROM user_stats s
		JOIN users u ON u.id = s.user_id
		WHERE u.status = 1
		ORDER BY s.total_score DESC
		LIMIT ?
	`, limit).Scan(&results).Error
	return results, err
}

func (r *statsRepository) GetTopUsersByLevel(limit int) ([]LeaderboardResult, error) {
	var results []LeaderboardResult
	err := r.db.Raw(`
		SELECT 
			u.id as user_id,
			u.username,
			u.nickname,
			u.avatar_url,
			s.level,
			s.experience as value,
			s.updated_at
		FROM user_stats s
		JOIN users u ON u.id = s.user_id
		WHERE u.status = 1
		ORDER BY s.level DESC, s.experience DESC
		LIMIT ?
	`, limit).Scan(&results).Error
	return results, err
}

func (r *statsRepository) GetTopUsersByVictoryCount(limit int) ([]LeaderboardResult, error) {
	var results []LeaderboardResult
	err := r.db.Raw(`
		SELECT 
			u.id as user_id,
			u.username,
			u.nickname,
			u.avatar_url,
			s.victory_count as value,
			s.updated_at
		FROM user_stats s
		JOIN users u ON u.id = s.user_id
		WHERE u.status = 1
		ORDER BY s.victory_count DESC
		LIMIT ?
	`, limit).Scan(&results).Error
	return results, err
}

func (r *statsRepository) GetTopUsersByLevelScore(levelID string, limit int) ([]LeaderboardResult, error) {
	var results []LeaderboardResult
	err := r.db.Raw(`
		SELECT 
			u.id as user_id,
			u.username,
			u.nickname,
			u.avatar_url,
			p.best_score as score,
			p.updated_at
		FROM user_level_progress p
		JOIN users u ON u.id = p.user_id
		WHERE p.level_id = ? AND u.status = 1
		ORDER BY p.best_score DESC
		LIMIT ?
	`, levelID, limit).Scan(&results).Error
	return results, err
}

func (r *statsRepository) GetTopUsersByLevelTime(levelID string, limit int) ([]LeaderboardResult, error) {
	var results []LeaderboardResult
	err := r.db.Raw(`
		SELECT 
			u.id as user_id,
			u.username,
			u.nickname,
			u.avatar_url,
			p.best_time as time,
			p.updated_at
		FROM user_level_progress p
		JOIN users u ON u.id = p.user_id
		WHERE p.level_id = ? AND p.best_time > 0 AND u.status = 1
		ORDER BY p.best_time ASC
		LIMIT ?
	`, levelID, limit).Scan(&results).Error
	return results, err
}

func (r *statsRepository) GetTopUsersByLevelAccuracy(levelID string, limit int) ([]LeaderboardResult, error) {
	var results []LeaderboardResult
	err := r.db.Raw(`
		SELECT 
			u.id as user_id,
			u.username,
			u.nickname,
			u.avatar_url,
			p.best_accuracy as accuracy,
			p.updated_at
		FROM user_level_progress p
		JOIN users u ON u.id = p.user_id
		WHERE p.level_id = ? AND u.status = 1
		ORDER BY p.best_accuracy DESC
		LIMIT ?
	`, levelID, limit).Scan(&results).Error
	return results, err
}

func (r *statsRepository) GetUserRankByScore(userID uint64) (int, error) {
	var rank int
	err := r.db.Raw(`
		SELECT COUNT(*) + 1 as rank
		FROM user_stats s
		JOIN users u ON u.id = s.user_id
		WHERE u.status = 1 AND s.total_score > (
			SELECT total_score FROM user_stats WHERE user_id = ?
		)
	`, userID).Scan(&rank).Error
	return rank, err
}

func (r *statsRepository) GetUserRankByLevel(userID uint64) (int, error) {
	var rank int
	err := r.db.Raw(`
		SELECT COUNT(*) + 1 as rank
		FROM user_stats s
		JOIN users u ON u.id = s.user_id
		WHERE u.status = 1 AND (
			s.level > (SELECT level FROM user_stats WHERE user_id = ?)
			OR (s.level = (SELECT level FROM user_stats WHERE user_id = ?) 
				AND s.experience > (SELECT experience FROM user_stats WHERE user_id = ?))
		)
	`, userID, userID, userID).Scan(&rank).Error
	return rank, err
}

func (r *statsRepository) GetUserRankByLevelScore(userID uint64, levelID string) (int, error) {
	var rank int
	err := r.db.Raw(`
		SELECT COUNT(*) + 1 as rank
		FROM user_level_progress p
		JOIN users u ON u.id = p.user_id
		WHERE p.level_id = ? AND u.status = 1 AND p.best_score > (
			SELECT best_score FROM user_level_progress WHERE user_id = ? AND level_id = ?
		)
	`, levelID, userID, levelID).Scan(&rank).Error
	return rank, err
}

