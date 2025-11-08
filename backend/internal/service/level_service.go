package service

import (
	"errors"
	"time"
	
	"github.com/yourusername/MentalMathGame/internal/dto"
	"github.com/yourusername/MentalMathGame/internal/repository"
)

type LevelService interface {
	GetLevels(category string, status int) ([]dto.LevelResponse, error)
	GetLevelDetail(levelID string, userID uint64) (*dto.LevelDetailResponse, error)
	GetLevelProgress(levelID string, userID uint64) (*dto.LevelProgressInfo, error)
}

type levelService struct {
	levelRepo repository.LevelRepository
	gameRepo  repository.GameRepository
}

func NewLevelService(
	levelRepo repository.LevelRepository,
	gameRepo repository.GameRepository,
) LevelService {
	return &levelService{
		levelRepo: levelRepo,
		gameRepo:  gameRepo,
	}
}

func (s *levelService) GetLevels(category string, status int) ([]dto.LevelResponse, error) {
	levels, err := s.levelRepo.FindAll(category, status)
	if err != nil {
		return nil, err
	}
	
	result := make([]dto.LevelResponse, len(levels))
	for i, l := range levels {
		generatorConfig := map[string]interface{}(l.GeneratorConfig)
		
		var hpConfig map[string]interface{}
		if l.HPConfig != nil {
			hpConfig = map[string]interface{}(l.HPConfig)
		}
		
		var modeConfig map[string]interface{}
		if l.ModeConfig != nil {
			modeConfig = map[string]interface{}(l.ModeConfig)
		}
		
		result[i] = dto.LevelResponse{
			ID:               l.ID,
			Category:         l.Category,
			Name:             l.Name,
			Description:      l.Description,
			GeneratorConfig:  generatorConfig,
			QuestionCount:    l.QuestionCount,
			TimeLimit:        l.TimeLimit,
			Difficulty:       l.Difficulty,
			HPConfig:         hpConfig,
			GameMode:         l.GameMode,
			RecommendedModes: []string(l.RecommendedModes),
			ModeConfig:       modeConfig,
			Status:           int(l.Status),
			SortOrder:        l.SortOrder,
		}
	}
	
	return result, nil
}

func (s *levelService) GetLevelDetail(levelID string, userID uint64) (*dto.LevelDetailResponse, error) {
	level, err := s.levelRepo.FindByID(levelID)
	if err != nil {
		return nil, errors.New("关卡未找到")
	}
	
	generatorConfig := map[string]interface{}(level.GeneratorConfig)
	
	var hpConfig map[string]interface{}
	if level.HPConfig != nil {
		hpConfig = map[string]interface{}(level.HPConfig)
	}
	
	var modeConfig map[string]interface{}
	if level.ModeConfig != nil {
		modeConfig = map[string]interface{}(level.ModeConfig)
	}
	
	response := &dto.LevelDetailResponse{
		LevelResponse: dto.LevelResponse{
			ID:               level.ID,
			Category:         level.Category,
			Name:             level.Name,
			Description:      level.Description,
			GeneratorConfig:  generatorConfig,
			QuestionCount:    level.QuestionCount,
			TimeLimit:        level.TimeLimit,
			Difficulty:       level.Difficulty,
			HPConfig:         hpConfig,
			GameMode:         level.GameMode,
			RecommendedModes: []string(level.RecommendedModes),
			ModeConfig:       modeConfig,
			Status:           int(level.Status),
			SortOrder:        level.SortOrder,
		},
	}
	
	// 获取用户进度
	if userID > 0 {
		progress, _ := s.gameRepo.GetLevelProgress(userID, levelID)
		if progress != nil {
			lastPlayedAt := ""
			if !progress.LastPlayedAt.IsZero() {
				lastPlayedAt = progress.LastPlayedAt.Format(time.RFC3339)
			}
			
			response.UserProgress = &dto.LevelProgressInfo{
				BestScore:    progress.BestScore,
				BestTime:     progress.BestTime,
				BestAccuracy: progress.BestAccuracy,
				PlayCount:    progress.PlayCount,
				LastOutcome:  progress.LastOutcome,
				LastPlayedAt: lastPlayedAt,
			}
		}
	}
	
	return response, nil
}

func (s *levelService) GetLevelProgress(levelID string, userID uint64) (*dto.LevelProgressInfo, error) {
	// 验证关卡是否存在
	_, err := s.levelRepo.FindByID(levelID)
	if err != nil {
		return nil, errors.New("关卡未找到")
	}
	
	progress, err := s.gameRepo.GetLevelProgress(userID, levelID)
	if err != nil {
		return nil, err
	}
	
	if progress == nil {
		return &dto.LevelProgressInfo{
			BestScore:    0,
			BestTime:     0,
			BestAccuracy: 0,
			PlayCount:    0,
			LastOutcome:  "",
			LastPlayedAt: "",
		}, nil
	}
	
	lastPlayedAt := ""
	if !progress.LastPlayedAt.IsZero() {
		lastPlayedAt = progress.LastPlayedAt.Format(time.RFC3339)
	}
	
	return &dto.LevelProgressInfo{
		BestScore:    progress.BestScore,
		BestTime:     progress.BestTime,
		BestAccuracy: progress.BestAccuracy,
		PlayCount:    progress.PlayCount,
		LastOutcome:  progress.LastOutcome,
		LastPlayedAt: lastPlayedAt,
	}, nil
}

