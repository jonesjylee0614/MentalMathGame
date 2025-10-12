package handler

import (
	"strconv"
	
	"github.com/gin-gonic/gin"
	"github.com/yourusername/MentalMathGame/internal/api/middleware"
	"github.com/yourusername/MentalMathGame/internal/pkg/response"
	"github.com/yourusername/MentalMathGame/internal/service"
)

type StatsHandler struct {
	statsService service.StatsService
}

func NewStatsHandler(statsService service.StatsService) *StatsHandler {
	return &StatsHandler{
		statsService: statsService,
	}
}

// GetMyStats 获取用户统计
func (h *StatsHandler) GetMyStats(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	stats, err := h.statsService.GetUserStats(userID)
	if err != nil {
		response.InternalError(c, "获取统计数据失败")
		return
	}
	
	response.Success(c, stats)
}

// GetMyProgress 获取用户关卡进度
func (h *StatsHandler) GetMyProgress(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	category := c.Query("category")
	
	progress, err := h.statsService.GetUserProgress(userID, category)
	if err != nil {
		response.InternalError(c, "获取进度数据失败")
		return
	}
	
	response.Success(c, progress)
}

// GetMyHistory 获取用户游戏历史
func (h *StatsHandler) GetMyHistory(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	historyType := c.DefaultQuery("type", "daily")
	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))
	
	history, err := h.statsService.GetUserHistory(userID, historyType, days)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	response.Success(c, history)
}

// GetMyAchievements 获取用户成就
func (h *StatsHandler) GetMyAchievements(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	var completed *bool
	if completedStr := c.Query("completed"); completedStr != "" {
		val := completedStr == "true"
		completed = &val
	}
	
	achievements, err := h.statsService.GetUserAchievements(userID, completed)
	if err != nil {
		response.InternalError(c, "获取成就数据失败")
		return
	}
	
	response.Success(c, achievements)
}

