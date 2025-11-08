package service

import (
	"errors"
	"time"
	
	"github.com/yourusername/MentalMathGame/internal/dto"
	"github.com/yourusername/MentalMathGame/internal/repository"
)

type StatsService interface {
	GetUserStats(userID uint64) (*dto.UserStatsResponse, error)
	GetUserProgress(userID uint64, category string) ([]dto.LevelProgressResponse, error)
	GetUserHistory(userID uint64, historyType string, days int) (*dto.GameHistoryResponse, error)
	GetUserAchievements(userID uint64, completed *bool) ([]dto.UserAchievementResponse, error)
}

type statsService struct {
	statsRepo       repository.StatsRepository
	gameRepo        repository.GameRepository
	levelRepo       repository.LevelRepository
	achievementRepo repository.AchievementRepository
}

func NewStatsService(
	statsRepo repository.StatsRepository,
	gameRepo repository.GameRepository,
	levelRepo repository.LevelRepository,
	achievementRepo repository.AchievementRepository,
) StatsService {
	return &statsService{
		statsRepo:       statsRepo,
		gameRepo:        gameRepo,
		levelRepo:       levelRepo,
		achievementRepo: achievementRepo,
	}
}

func (s *statsService) GetUserStats(userID uint64) (*dto.UserStatsResponse, error) {
	stats, err := s.statsRepo.GetUserStats(userID)
	if err != nil {
		return nil, err
	}
	if stats == nil {
		return nil, errors.New("统计数据未找到")
	}
	
	// 计算平均正确率
	avgAccuracy := 0.0
	if stats.TotalPlays > 0 {
		avgAccuracy = float64(stats.TotalCorrect) / float64(stats.TotalCorrect+stats.TotalWrong)
	}
	
	// 计算胜率
	winRate := 0.0
	if stats.TotalPlays > 0 {
		winRate = float64(stats.VictoryCount) / float64(stats.TotalPlays)
	}
	
	return &dto.UserStatsResponse{
		TotalScore:    stats.TotalScore,
		TotalPlays:    stats.TotalPlays,
		TotalCorrect:  stats.TotalCorrect,
		TotalWrong:    stats.TotalWrong,
		TotalTimeSec:  stats.TotalTimeSec,
		BestCombo:     stats.BestCombo,
		VictoryCount:  stats.VictoryCount,
		DefeatCount:   stats.DefeatCount,
		CurrentStreak: stats.CurrentStreak,
		BestStreak:    stats.BestStreak,
		Level:         stats.Level,
		Experience:    stats.Experience,
		AvgAccuracy:   avgAccuracy,
		WinRate:       winRate,
	}, nil
}

func (s *statsService) GetUserProgress(userID uint64, category string) ([]dto.LevelProgressResponse, error) {
	progressList, err := s.gameRepo.GetAllLevelProgress(userID, category)
	if err != nil {
		return nil, err
	}
	
	result := make([]dto.LevelProgressResponse, 0, len(progressList))
	
	for _, p := range progressList {
		level, err := s.levelRepo.FindByID(p.LevelID)
		if err != nil {
			continue
		}
		
		lastPlayedAt := ""
		if !p.LastPlayedAt.IsZero() {
			lastPlayedAt = p.LastPlayedAt.Format(time.RFC3339)
		}
		
		result = append(result, dto.LevelProgressResponse{
			LevelID:       p.LevelID,
			LevelName:     level.Name,
			Category:      level.Category,
			BestScore:     p.BestScore,
			BestTime:      p.BestTime,
			BestAccuracy:  p.BestAccuracy,
			PlayCount:     p.PlayCount,
			TotalScore:    p.TotalScore,
			TotalCorrect:  p.TotalCorrect,
			TotalWrong:    p.TotalWrong,
			LastOutcome:   p.LastOutcome,
			LastPlayedAt:  lastPlayedAt,
		})
	}
	
	return result, nil
}

func (s *statsService) GetUserHistory(userID uint64, historyType string, days int) (*dto.GameHistoryResponse, error) {
	if days <= 0 {
		days = 30
	}
	
	var data []dto.GameHistoryRecord
	
	switch historyType {
	case "daily":
		results, err := s.statsRepo.GetDailyStats(userID, days)
		if err != nil {
			return nil, err
		}
		for _, r := range results {
			data = append(data, dto.GameHistoryRecord{
				Date:         r.Date,
				PlayCount:    r.PlayCount,
				VictoryCount: r.VictoryCount,
				TotalScore:   r.TotalScore,
				AvgAccuracy:  r.AvgAccuracy,
			})
		}
		
	case "weekly":
		weeks := days / 7
		if weeks == 0 {
			weeks = 4
		}
		results, err := s.statsRepo.GetWeeklyStats(userID, weeks)
		if err != nil {
			return nil, err
		}
		for _, r := range results {
			data = append(data, dto.GameHistoryRecord{
				Date:         r.Week,
				PlayCount:    r.PlayCount,
				VictoryCount: r.VictoryCount,
				TotalScore:   r.TotalScore,
				AvgAccuracy:  r.AvgAccuracy,
			})
		}
		
	case "monthly":
		months := days / 30
		if months == 0 {
			months = 3
		}
		results, err := s.statsRepo.GetMonthlyStats(userID, months)
		if err != nil {
			return nil, err
		}
		for _, r := range results {
			data = append(data, dto.GameHistoryRecord{
				Date:         r.Month,
				PlayCount:    r.PlayCount,
				VictoryCount: r.VictoryCount,
				TotalScore:   r.TotalScore,
				AvgAccuracy:  r.AvgAccuracy,
			})
		}
		
	default:
		return nil, errors.New("不支持的历史类型")
	}
	
	return &dto.GameHistoryResponse{
		Type: historyType,
		Data: data,
	}, nil
}

func (s *statsService) GetUserAchievements(userID uint64, completed *bool) ([]dto.UserAchievementResponse, error) {
	// 获取所有成就
	achievements, err := s.achievementRepo.FindAll("", 1)
	if err != nil {
		return nil, err
	}
	
	// 获取用户成就进度
	userAchievements, err := s.achievementRepo.GetUserAchievements(userID, completed)
	if err != nil {
		return nil, err
	}
	
	// 创建用户成就映射
	userAchMap := make(map[string]*dto.UserAchievementResponse)
	for _, ua := range userAchievements {
		userAchMap[ua.AchievementID] = &dto.UserAchievementResponse{
			Progress:    ua.Progress,
			Completed:   ua.Completed,
			CompletedAt: "",
		}
		if ua.Completed && ua.CompletedAt != nil {
			userAchMap[ua.AchievementID].CompletedAt = ua.CompletedAt.Format(time.RFC3339)
		}
	}
	
	result := make([]dto.UserAchievementResponse, 0, len(achievements))
	
	for _, a := range achievements {
		resp := dto.UserAchievementResponse{
			ID:          a.ID,
			Name:        a.Name,
			Description: a.Description,
			IconURL:     a.IconURL,
			Category:    a.Category,
			RewardExp:   a.RewardExp,
			Progress:    0,
			Target:      0,
			Completed:   false,
		}
		
		// 解析目标值
		conditionValue := map[string]interface{}(a.ConditionValue)
		
		if count, ok := conditionValue["count"].(float64); ok {
			resp.Target = int(count)
		} else if level, ok := conditionValue["level"].(float64); ok {
			resp.Target = int(level)
		} else if rate, ok := conditionValue["rate"].(float64); ok {
			resp.Target = int(rate * 100)
		}
		
		// 合并用户进度
		if ua, exists := userAchMap[a.ID]; exists {
			resp.Progress = ua.Progress
			resp.Completed = ua.Completed
			resp.CompletedAt = ua.CompletedAt
		}
		
		// 计算进度百分比
		if resp.Target > 0 {
			resp.ProgressRate = float64(resp.Progress) / float64(resp.Target)
			if resp.ProgressRate > 1.0 {
				resp.ProgressRate = 1.0
			}
		}
		
		// 如果指定了completed过滤
		if completed != nil {
			if *completed && !resp.Completed {
				continue
			}
			if !*completed && resp.Completed {
				continue
			}
		}
		
		result = append(result, resp)
	}
	
	return result, nil
}

