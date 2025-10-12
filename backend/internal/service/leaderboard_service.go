package service

import (
	"errors"
	"time"
	
	"github.com/yourusername/MentalMathGame/internal/dto"
	"github.com/yourusername/MentalMathGame/internal/repository"
)

type LeaderboardService interface {
	GetGlobalLeaderboard(leaderboardType string, limit int) (*dto.LeaderboardResponse, error)
	GetLevelLeaderboard(levelID string, leaderboardType string, limit int) (*dto.LeaderboardResponse, error)
	GetWeeklyLeaderboard(leaderboardType string, limit int) (*dto.LeaderboardResponse, error)
	GetMonthlyLeaderboard(leaderboardType string, limit int) (*dto.LeaderboardResponse, error)
}

type leaderboardService struct {
	statsRepo repository.StatsRepository
}

func NewLeaderboardService(statsRepo repository.StatsRepository) LeaderboardService {
	return &leaderboardService{
		statsRepo: statsRepo,
	}
}

func (s *leaderboardService) GetGlobalLeaderboard(leaderboardType string, limit int) (*dto.LeaderboardResponse, error) {
	if limit <= 0 {
		limit = 50
	}
	
	var results []repository.LeaderboardResult
	var err error
	
	switch leaderboardType {
	case "total_score":
		results, err = s.statsRepo.GetTopUsersByScore(limit)
	case "level":
		results, err = s.statsRepo.GetTopUsersByLevel(limit)
	case "victory_count":
		results, err = s.statsRepo.GetTopUsersByVictoryCount(limit)
	default:
		return nil, errors.New("不支持的排行榜类型")
	}
	
	if err != nil {
		return nil, err
	}
	
	entries := make([]dto.LeaderboardEntry, len(results))
	for i, r := range results {
		entry := dto.LeaderboardEntry{
			Rank:      i + 1,
			UserID:    r.UserID,
			Username:  r.Username,
			Nickname:  r.Nickname,
			AvatarURL: r.AvatarURL,
			UpdatedAt: r.UpdatedAt.Format(time.RFC3339),
		}
		
		switch leaderboardType {
		case "total_score":
			entry.Score = r.Score
		case "level":
			entry.Level = r.Level
			entry.Value = r.Value
		case "victory_count":
			entry.Value = r.Value
		}
		
		entries[i] = entry
	}
	
	return &dto.LeaderboardResponse{
		Type:    leaderboardType,
		Records: entries,
	}, nil
}

func (s *leaderboardService) GetLevelLeaderboard(levelID string, leaderboardType string, limit int) (*dto.LeaderboardResponse, error) {
	if limit <= 0 {
		limit = 50
	}
	
	var results []repository.LeaderboardResult
	var err error
	
	switch leaderboardType {
	case "score":
		results, err = s.statsRepo.GetTopUsersByLevelScore(levelID, limit)
	case "time":
		results, err = s.statsRepo.GetTopUsersByLevelTime(levelID, limit)
	case "accuracy":
		results, err = s.statsRepo.GetTopUsersByLevelAccuracy(levelID, limit)
	default:
		return nil, errors.New("不支持的排行榜类型")
	}
	
	if err != nil {
		return nil, err
	}
	
	entries := make([]dto.LeaderboardEntry, len(results))
	for i, r := range results {
		entry := dto.LeaderboardEntry{
			Rank:      i + 1,
			UserID:    r.UserID,
			Username:  r.Username,
			Nickname:  r.Nickname,
			AvatarURL: r.AvatarURL,
			UpdatedAt: r.UpdatedAt.Format(time.RFC3339),
		}
		
		switch leaderboardType {
		case "score":
			entry.Score = r.Score
		case "time":
			entry.Time = r.Time
		case "accuracy":
			entry.Accuracy = r.Accuracy
		}
		
		entries[i] = entry
	}
	
	return &dto.LeaderboardResponse{
		Type:    leaderboardType,
		Records: entries,
	}, nil
}

func (s *leaderboardService) GetWeeklyLeaderboard(leaderboardType string, limit int) (*dto.LeaderboardResponse, error) {
	// TODO: 实现基于时间段的排行榜
	// 需要使用 Redis 或其他缓存来实现周排行榜
	// 暂时返回全局排行榜
	response, err := s.GetGlobalLeaderboard(leaderboardType, limit)
	if err != nil {
		return nil, err
	}
	response.Period = "weekly"
	return response, nil
}

func (s *leaderboardService) GetMonthlyLeaderboard(leaderboardType string, limit int) (*dto.LeaderboardResponse, error) {
	// TODO: 实现基于时间段的排行榜
	// 需要使用 Redis 或其他缓存来实现月排行榜
	// 暂时返回全局排行榜
	response, err := s.GetGlobalLeaderboard(leaderboardType, limit)
	if err != nil {
		return nil, err
	}
	response.Period = "monthly"
	return response, nil
}

