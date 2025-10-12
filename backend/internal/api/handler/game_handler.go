package handler

import (
	"strconv"
	
	"github.com/gin-gonic/gin"
	"github.com/yourusername/MentalMathGame/internal/api/middleware"
	"github.com/yourusername/MentalMathGame/internal/dto"
	"github.com/yourusername/MentalMathGame/internal/pkg/response"
	"github.com/yourusername/MentalMathGame/internal/service"
)

type GameHandler struct {
	gameService service.GameService
}

func NewGameHandler(gameService service.GameService) *GameHandler {
	return &GameHandler{
		gameService: gameService,
	}
}

// SubmitResult 提交游戏结果
func (h *GameHandler) SubmitResult(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	var req dto.SubmitGameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	
	result, err := h.gameService.SubmitGameResult(userID, &req)
	if err != nil {
		response.InternalError(c, "提交游戏结果失败: "+err.Error())
		return
	}
	
	response.Success(c, result)
}

// GetRecords 获取游戏记录列表
func (h *GameHandler) GetRecords(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	levelID := c.Query("level_id")
	outcome := c.Query("outcome")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	
	result, err := h.gameService.GetGameRecords(userID, levelID, outcome, page, pageSize)
	if err != nil {
		response.InternalError(c, "获取游戏记录失败")
		return
	}
	
	response.Success(c, result)
}

// GetRecordDetail 获取游戏记录详情
func (h *GameHandler) GetRecordDetail(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	recordID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的记录ID")
		return
	}
	
	result, err := h.gameService.GetGameRecordDetail(userID, recordID)
	if err != nil {
		response.NotFound(c, "游戏记录未找到")
		return
	}
	
	response.Success(c, result)
}

