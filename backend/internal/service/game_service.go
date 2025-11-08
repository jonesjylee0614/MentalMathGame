package service

import (
	"errors"
	"math"
	"time"
	
	"github.com/yourusername/MentalMathGame/internal/dto"
	"github.com/yourusername/MentalMathGame/internal/model"
	"github.com/yourusername/MentalMathGame/internal/repository"
	"gorm.io/gorm"
)

type GameService interface {
	SubmitGameResult(userID uint64, req *dto.SubmitGameRequest) (*dto.SubmitGameResponse, error)
	GetGameRecords(userID uint64, levelID, outcome string, page, pageSize int) (*dto.PaginationResponse, error)
	GetGameRecordDetail(userID uint64, recordID uint64) (*dto.GameRecordResponse, error)
}

type gameService struct {
	gameRepo        repository.GameRepository
	levelRepo       repository.LevelRepository
	statsRepo       repository.StatsRepository
	achievementRepo repository.AchievementRepository
	db              *gorm.DB
}

func NewGameService(
	gameRepo repository.GameRepository,
	levelRepo repository.LevelRepository,
	statsRepo repository.StatsRepository,
	achievementRepo repository.AchievementRepository,
	db *gorm.DB,
) GameService {
	return &gameService{
		gameRepo:        gameRepo,
		levelRepo:       levelRepo,
		statsRepo:       statsRepo,
		achievementRepo: achievementRepo,
		db:              db,
	}
}

func (s *gameService) SubmitGameResult(userID uint64, req *dto.SubmitGameRequest) (*dto.SubmitGameResponse, error) {
	// 1. 验证关卡是否存在
	level, err := s.levelRepo.FindByID(req.LevelID)
	if err != nil {
		return nil, errors.New("关卡不存在")
	}
	
	// 2. 准备响应数据
	response := &dto.SubmitGameResponse{
		UnlockedAchievements: []dto.AchievementInfo{},
		CompletedQuests:      []dto.QuestInfo{},
	}
	
	// 使用事务处理所有更新
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// 3. 保存游戏记录
		// 将[]AnswerRecord转换为JSONArray ([]interface{})
		answersHistory := make(model.JSONArray, len(req.AnswersHistory))
		for i, answer := range req.AnswersHistory {
			answersHistory[i] = answer
		}
		
		record := &model.GameRecord{
			UserID:         userID,
			LevelID:        req.LevelID,
			Score:          req.Score,
			CorrectCount:   req.CorrectCount,
			TotalQuestions: req.TotalQuestions,
			MaxCombo:       req.MaxCombo,
			Accuracy:       req.Accuracy,
			TimeUsed:       req.TimeUsed,
			TimeLeft:       req.TimeLeft,
			Outcome:        req.Outcome,
			AnswersHistory: answersHistory,
		}
		
		if err := tx.Create(record).Error; err != nil {
			return err
		}
		response.RecordID = record.ID
		
		// 4. 更新关卡进度
		progress, err := s.gameRepo.GetLevelProgress(userID, req.LevelID)
		if err != nil {
			return err
		}
		
		if progress == nil {
			progress = &model.UserLevelProgress{
				UserID:  userID,
				LevelID: req.LevelID,
			}
		}
		
		// 保存之前的最佳记录
		response.PreviousBest = dto.PreviousBestInfo{
			Score:    progress.BestScore,
			Time:     progress.BestTime,
			Accuracy: progress.BestAccuracy,
		}
		
		// 更新最佳记录
		if req.Score > progress.BestScore {
			progress.BestScore = req.Score
			response.IsBestScore = true
		}
		if req.TimeUsed > 0 && (progress.BestTime == 0 || req.TimeUsed < progress.BestTime) {
			progress.BestTime = req.TimeUsed
			response.IsBestTime = true
		}
		if req.Accuracy > progress.BestAccuracy {
			progress.BestAccuracy = req.Accuracy
			response.IsBestAccuracy = true
		}
		
		progress.PlayCount++
		progress.TotalScore += req.Score
		progress.TotalCorrect += req.CorrectCount
		progress.TotalWrong += req.TotalQuestions - req.CorrectCount
		progress.LastOutcome = req.Outcome
		now := time.Now()
		progress.LastPlayedAt = &now
		
		if err := s.gameRepo.UpsertLevelProgress(progress); err != nil {
			return err
		}
		
		// 5. 更新用户统计
		stats, err := s.statsRepo.GetUserStats(userID)
		if err != nil {
			return err
		}
		if stats == nil {
			return errors.New("用户统计数据未找到")
		}
		
		// 计算经验值和积分奖励
		expGained := s.calculateExp(req, level)
		
		// 计算积分奖励：只有全对且在目标时间内完成才奖励
		scoreGained := s.calculateRewardPoints(req, level)
		
		stats.TotalScore += scoreGained
		stats.TotalPlays++
		stats.TotalCorrect += req.CorrectCount
		stats.TotalWrong += req.TotalQuestions - req.CorrectCount
		stats.TotalTimeSec += req.TimeUsed
		
		if req.MaxCombo > stats.BestCombo {
			stats.BestCombo = req.MaxCombo
		}
		
		// 更新连胜
		if req.Outcome == "victory" {
			stats.VictoryCount++
			stats.CurrentStreak++
			if stats.CurrentStreak > stats.BestStreak {
				stats.BestStreak = stats.CurrentStreak
			}
		} else {
			stats.DefeatCount++
			stats.CurrentStreak = 0
		}
		
		// 升级逻辑
		oldLevel := stats.Level
		stats.Experience += expGained
		newLevel, newExp := s.calculateLevel(stats.Experience)
		stats.Level = newLevel
		stats.Experience = newExp
		
		if err := tx.Save(stats).Error; err != nil {
			return err
		}
		
		// 计算下一级所需经验
		nextLevelExp := s.getExpForLevel(newLevel + 1)
		
		// 判断是否获得全额奖励
		targetTime := level.TargetTime
		if targetTime == 0 {
			targetTime = level.TimeLimit
		}
		isFullReward := scoreGained > 0 && 
			req.CorrectCount == req.TotalQuestions && 
			req.TimeUsed <= targetTime
		
		response.Rewards = dto.RewardsInfo{
			ExpGained:    expGained,
			ScoreGained:  req.Score,           // 游戏得分
			PointsGained: scoreGained,         // 奖励积分
			IsFullReward: isFullReward,
			LevelUp:      newLevel > oldLevel,
			NewLevel:     newLevel,
			NewExp:       newExp,
			NextLevelExp: nextLevelExp,
		}
		
		// 6. 检查成就
		// TODO: 实现成就检测逻辑
		
		// 7. 计算排名变化
		globalRank, _ := s.statsRepo.GetUserRankByScore(userID)
		levelRank, _ := s.statsRepo.GetUserRankByLevelScore(userID, req.LevelID)
		
		response.RankChange = dto.RankChangeInfo{
			GlobalRank: dto.RankInfo{
				Current: globalRank,
				Change:  0, // TODO: 需要缓存之前的排名
			},
			LevelRank: dto.RankInfo{
				Current: levelRank,
				Change:  0,
			},
		}
		
		return nil
	})
	
	if err != nil {
		return nil, err
	}
	
	return response, nil
}

func (s *gameService) GetGameRecords(userID uint64, levelID, outcome string, page, pageSize int) (*dto.PaginationResponse, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	
	var records []model.GameRecord
	var total int64
	var err error
	
	if levelID != "" {
		records, total, err = s.gameRepo.FindByUserAndLevel(userID, levelID, page, pageSize)
	} else if outcome != "" {
		records, total, err = s.gameRepo.FindByUserAndOutcome(userID, outcome, page, pageSize)
	} else {
		records, total, err = s.gameRepo.FindByUserID(userID, page, pageSize)
	}
	
	if err != nil {
		return nil, err
	}
	
	// 转换为响应格式
	recordsResp := make([]dto.GameRecordResponse, len(records))
	for i, r := range records {
		level, _ := s.levelRepo.FindByID(r.LevelID)
		levelName := r.LevelID
		if level != nil {
			levelName = level.Name
		}
		
		recordsResp[i] = dto.GameRecordResponse{
			ID:             r.ID,
			LevelID:        r.LevelID,
			LevelName:      levelName,
			Score:          r.Score,
			CorrectCount:   r.CorrectCount,
			TotalQuestions: r.TotalQuestions,
			MaxCombo:       r.MaxCombo,
			Accuracy:       r.Accuracy,
			TimeUsed:       r.TimeUsed,
			TimeLeft:       r.TimeLeft,
			Outcome:        r.Outcome,
			CreatedAt:      r.CreatedAt.Format(time.RFC3339),
		}
	}
	
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	
	return &dto.PaginationResponse{
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		Records:    recordsResp,
	}, nil
}

func (s *gameService) GetGameRecordDetail(userID uint64, recordID uint64) (*dto.GameRecordResponse, error) {
	record, err := s.gameRepo.FindByID(recordID)
	if err != nil {
		return nil, err
	}
	
	if record.UserID != userID {
		return nil, errors.New("无权访问此记录")
	}
	
	level, _ := s.levelRepo.FindByID(record.LevelID)
	levelName := record.LevelID
	if level != nil {
		levelName = level.Name
	}
	
	return &dto.GameRecordResponse{
		ID:             record.ID,
		LevelID:        record.LevelID,
		LevelName:      levelName,
		Score:          record.Score,
		CorrectCount:   record.CorrectCount,
		TotalQuestions: record.TotalQuestions,
		MaxCombo:       record.MaxCombo,
		Accuracy:       record.Accuracy,
		TimeUsed:       record.TimeUsed,
		TimeLeft:       record.TimeLeft,
		Outcome:        record.Outcome,
		CreatedAt:      record.CreatedAt.Format(time.RFC3339),
	}, nil
}

// 计算经验值
func (s *gameService) calculateExp(req *dto.SubmitGameRequest, level *model.Level) int {
	baseExp := 10
	difficultyBonus := int(level.Difficulty * 10)
	accuracyBonus := int(req.Accuracy * 20)
	comboBonus := req.MaxCombo / 5
	
	totalExp := baseExp + difficultyBonus + accuracyBonus + comboBonus
	
	if req.Outcome == "victory" {
		totalExp = int(float64(totalExp) * 1.5)
	}
	
	return totalExp
}

// 计算积分奖励：只有全对且在目标时间内完成才奖励
func (s *gameService) calculateRewardPoints(req *dto.SubmitGameRequest, level *model.Level) int {
	// 条件1：必须全对
	if req.CorrectCount != req.TotalQuestions {
		return 0
	}
	
	// 条件2：必须在目标时间内完成
	targetTime := level.TargetTime
	if targetTime == 0 {
		// 如果没有设置目标时间，使用时间上限
		targetTime = level.TimeLimit
	}
	
	// 检查是否在目标时间内完成
	if req.TimeUsed > targetTime {
		return 0
	}
	
	// 满足条件，返回奖励积分
	return level.RewardPoints
}

// 计算等级
func (s *gameService) calculateLevel(totalExp int) (level int, remainingExp int) {
	level = 1
	expNeeded := 0
	
	for {
		nextLevelExp := s.getExpForLevel(level + 1)
		if totalExp < expNeeded+nextLevelExp {
			return level, totalExp - expNeeded
		}
		expNeeded += nextLevelExp
		level++
	}
}

// 获取升到指定等级所需的经验
func (s *gameService) getExpForLevel(level int) int {
	return 100 + (level-1)*50
}

