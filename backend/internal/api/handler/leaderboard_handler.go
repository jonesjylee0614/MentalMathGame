package handler

import (
	"strconv"
	
	"github.com/gin-gonic/gin"
	"github.com/yourusername/MentalMathGame/internal/pkg/response"
	"github.com/yourusername/MentalMathGame/internal/service"
)

type LeaderboardHandler struct {
	leaderboardService service.LeaderboardService
}

func NewLeaderboardHandler(leaderboardService service.LeaderboardService) *LeaderboardHandler {
	return &LeaderboardHandler{
		leaderboardService: leaderboardService,
	}
}

// GetGlobalLeaderboard 获取全局排行榜
func (h *LeaderboardHandler) GetGlobalLeaderboard(c *gin.Context) {
	leaderboardType := c.DefaultQuery("type", "total_score")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	
	result, err := h.leaderboardService.GetGlobalLeaderboard(leaderboardType, limit)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	response.Success(c, result)
}

// GetLevelLeaderboard 获取关卡排行榜
func (h *LeaderboardHandler) GetLevelLeaderboard(c *gin.Context) {
	levelID := c.Param("id")
	leaderboardType := c.DefaultQuery("type", "score")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	
	result, err := h.leaderboardService.GetLevelLeaderboard(levelID, leaderboardType, limit)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	response.Success(c, result)
}

// GetWeeklyLeaderboard 获取周排行榜
func (h *LeaderboardHandler) GetWeeklyLeaderboard(c *gin.Context) {
	leaderboardType := c.DefaultQuery("type", "score")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	
	result, err := h.leaderboardService.GetWeeklyLeaderboard(leaderboardType, limit)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	response.Success(c, result)
}

// GetMonthlyLeaderboard 获取月排行榜
func (h *LeaderboardHandler) GetMonthlyLeaderboard(c *gin.Context) {
	leaderboardType := c.DefaultQuery("type", "score")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	
	result, err := h.leaderboardService.GetMonthlyLeaderboard(leaderboardType, limit)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	response.Success(c, result)
}

