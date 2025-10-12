package handler

import (
	"strconv"
	
	"github.com/gin-gonic/gin"
	"github.com/yourusername/MentalMathGame/internal/api/middleware"
	"github.com/yourusername/MentalMathGame/internal/pkg/response"
	"github.com/yourusername/MentalMathGame/internal/service"
)

type LevelHandler struct {
	levelService service.LevelService
}

func NewLevelHandler(levelService service.LevelService) *LevelHandler {
	return &LevelHandler{
		levelService: levelService,
	}
}

// GetLevels 获取关卡列表
func (h *LevelHandler) GetLevels(c *gin.Context) {
	category := c.Query("category")
	status := -1
	if statusStr := c.Query("status"); statusStr != "" {
		status, _ = strconv.Atoi(statusStr)
	}
	
	levels, err := h.levelService.GetLevels(category, status)
	if err != nil {
		response.InternalError(c, "获取关卡列表失败")
		return
	}
	
	response.Success(c, levels)
}

// GetLevelDetail 获取关卡详情
func (h *LevelHandler) GetLevelDetail(c *gin.Context) {
	levelID := c.Param("id")
	
	var userID uint64
	if id, exists := middleware.GetUserID(c); exists {
		userID = id
	}
	
	detail, err := h.levelService.GetLevelDetail(levelID, userID)
	if err != nil {
		response.NotFound(c, "关卡未找到")
		return
	}
	
	response.Success(c, detail)
}

// GetLevelProgress 获取关卡进度
func (h *LevelHandler) GetLevelProgress(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	levelID := c.Param("id")
	
	progress, err := h.levelService.GetLevelProgress(levelID, userID)
	if err != nil {
		response.NotFound(c, "关卡未找到")
		return
	}
	
	response.Success(c, progress)
}

