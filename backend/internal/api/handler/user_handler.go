package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/yourusername/MentalMathGame/internal/api/middleware"
	"github.com/yourusername/MentalMathGame/internal/dto"
	"github.com/yourusername/MentalMathGame/internal/pkg/response"
	"github.com/yourusername/MentalMathGame/internal/service"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// GetMe 获取当前用户信息
func (h *UserHandler) GetMe(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		response.InternalServerError(c, "获取用户信息失败")
		return
	}
	
	response.Success(c, user)
}

// UpdateMe 更新当前用户信息
func (h *UserHandler) UpdateMe(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	
	user, err := h.userService.UpdateUser(userID, &req)
	if err != nil {
		response.InternalServerError(c, "更新用户信息失败")
		return
	}
	
	response.Success(c, user)
}

// UploadAvatar 上传头像
func (h *UserHandler) UploadAvatar(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	// TODO: 实现文件上传逻辑
	// 1. 接收文件
	// 2. 验证文件类型和大小
	// 3. 保存到OSS或本地
	// 4. 更新用户头像URL
	
	response.Success(c, gin.H{
		"avatar_url": "https://example.com/avatars/" + string(rune(userID)) + ".jpg",
	})
}

// GetSettings 获取用户设置
func (h *UserHandler) GetSettings(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	settings, err := h.userService.GetUserSettings(userID)
	if err != nil {
		response.InternalServerError(c, "获取用户设置失败")
		return
	}
	
	response.Success(c, settings)
}

// UpdateSettings 更新用户设置
func (h *UserHandler) UpdateSettings(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	var req dto.UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	
	settings, err := h.userService.UpdateUserSettings(userID, &req)
	if err != nil {
		response.InternalServerError(c, "更新用户设置失败")
		return
	}
	
	response.Success(c, settings)
}

// ChangePassword 修改密码
func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	
	if err := h.userService.ChangePassword(userID, &req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	
	response.SuccessWithMessage(c, "密码修改成功", nil)
}

// Migrate 数据迁移
func (h *UserHandler) Migrate(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "无效的用户信息")
		return
	}
	
	var req dto.MigrationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	
	result, err := h.userService.MigrateData(userID, &req)
	if err != nil {
		response.InternalServerError(c, "数据迁移失败: "+err.Error())
		return
	}
	
	response.Success(c, result)
}

