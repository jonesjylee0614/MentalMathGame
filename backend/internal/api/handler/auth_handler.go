package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/yourusername/MentalMathGame/internal/api/middleware"
	"github.com/yourusername/MentalMathGame/internal/dto"
	"github.com/yourusername/MentalMathGame/internal/pkg/response"
	"github.com/yourusername/MentalMathGame/internal/service"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register 用户注册
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	
	userID, err := h.authService.Register(&req)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	response.Success(c, gin.H{
		"user_id": userID,
	})
}

// Login 用户登录
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	
	result, err := h.authService.Login(&req)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}
	
	response.Success(c, result)
}

// Logout 用户登出
func (h *AuthHandler) Logout(c *gin.Context) {
	// JWT无状态，登出由前端处理（删除token）
	response.SuccessWithMessage(c, "登出成功", nil)
}

// RefreshToken 刷新Token
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	result, err := h.authService.RefreshToken(userID)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}
	
	response.Success(c, result)
}

