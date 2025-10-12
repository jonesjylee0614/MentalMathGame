# Mental Math Game Backend

Go + Gin + GORM + MySQL 5.7 + Redis 实现的心算游戏后端

## 📁 项目结构

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # 入口文件
├── internal/
│   ├── api/
│   │   ├── handler/             # HTTP 处理器
│   │   ├── middleware/          # 中间件
│   │   └── router/              # 路由配置
│   ├── model/                   # 数据模型
│   ├── repository/              # 数据访问层
│   ├── service/                 # 业务逻辑层
│   ├── dto/                     # 数据传输对象
│   ├── config/                  # 配置管理
│   └── pkg/                     # 工具包
├── migrations/                  # 数据库迁移
├── configs/                     # 配置文件
├── scripts/                     # 脚本文件
└── go.mod

```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
go mod download
```

### 2. 配置数据库

编辑 `configs/config.yaml`，修改数据库配置：

```yaml
database:
  host: localhost
  port: 3306
  username: root
  password: your-password
  database: mental_math_game
```

### 3. 创建数据库

```sql
CREATE DATABASE mental_math_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 执行数据库迁移

```bash
# 使用mysql命令行工具
mysql -u root -p mental_math_game < migrations/000001_init_schema.up.sql
mysql -u root -p mental_math_game < migrations/000002_init_data.up.sql
```

或者使用 golang-migrate 工具：

```bash
migrate -path migrations -database "mysql://root:password@tcp(localhost:3306)/mental_math_game" up
```

### 5. 运行服务器

```bash
go run main.go

# 或者编译后运行
go build -o bin/server main.go
./bin/server
```

服务将在 `http://localhost:8080` 启动

## 📝 已完成的模块

### ✅ 基础设施
- [x] 数据库表结构设计（10张表）
- [x] 初始化数据（72个关卡 + 31个成就）
- [x] 配置管理系统
- [x] 日志系统（Zap）
- [x] JWT认证工具
- [x] 统一响应格式
- [x] 数据验证器

### ✅ 数据模型（Model）
- [x] User（用户）
- [x] UserSettings（用户设置）
- [x] Level（关卡）
- [x] UserLevelProgress（关卡进度）
- [x] GameRecord（游戏记录）
- [x] UserStats（用户统计）
- [x] Achievement（成就）
- [x] UserAchievement（用户成就）
- [x] DailyQuest（每日任务）
- [x] UserDailyQuest（用户任务）

### ✅ DTO层（数据传输对象）
- [x] auth_dto.go - 认证相关DTO
- [x] user_dto.go - 用户相关DTO
- [x] game_dto.go - 游戏相关DTO
- [x] stats_dto.go - 统计相关DTO
- [x] level_dto.go - 关卡相关DTO
- [x] leaderboard_dto.go - 排行榜相关DTO

### ✅ Repository层（数据访问）
- [x] user_repo.go - 用户数据访问
- [x] game_repo.go - 游戏记录和关卡进度
- [x] level_repo.go - 关卡数据访问
- [x] stats_repo.go - 统计数据和排行榜
- [x] achievement_repo.go - 成就数据访问
- [x] settings_repo.go - 用户设置数据访问

### ✅ Service层（业务逻辑）
- [x] auth_service.go - 认证服务（注册、登录、Token）
- [x] user_service.go - 用户服务（信息、设置、迁移）
- [x] game_service.go - 游戏服务（提交结果、统计更新）
- [x] stats_service.go - 统计服务
- [x] level_service.go - 关卡服务
- [x] leaderboard_service.go - 排行榜服务

### ✅ Middleware层（中间件）
- [x] auth.go - JWT认证中间件
- [x] cors.go - CORS中间件
- [x] logger.go - 日志中间件
- [x] recovery.go - 异常恢复中间件
- [x] rate_limit.go - 限流中间件

### ✅ Handler层（HTTP处理）
- [x] auth_handler.go - 认证接口
- [x] user_handler.go - 用户接口
- [x] game_handler.go - 游戏接口
- [x] stats_handler.go - 统计接口
- [x] level_handler.go - 关卡接口
- [x] leaderboard_handler.go - 排行榜接口

### ✅ 路由配置
- [x] router.go - 统一路由配置
- [x] wire.go - 依赖注入配置

### ✅ 主程序入口
- [x] cmd/server/main.go - 主入口

## 🎯 已实现的API接口

### 认证接口 (/api/v1/auth/)
- POST /auth/register - 用户注册
- POST /auth/login - 用户登录
- POST /auth/logout - 用户登出
- POST /auth/refresh - 刷新Token

### 用户接口 (/api/v1/users/)
- GET /users/me - 获取当前用户信息
- PUT /users/me - 更新用户信息
- PUT /users/me/avatar - 上传头像
- GET /users/me/settings - 获取用户设置
- PUT /users/me/settings - 更新用户设置
- PUT /users/me/password - 修改密码
- POST /users/me/migrate - 数据迁移

### 游戏接口 (/api/v1/games/)
- POST /games/submit - 提交游戏结果
- GET /games/records - 获取游戏记录列表
- GET /games/records/:id - 获取游戏记录详情

### 统计接口 (/api/v1/stats/)
- GET /stats/me - 获取用户统计
- GET /stats/me/progress - 获取关卡进度
- GET /stats/me/history - 获取游戏历史
- GET /stats/me/achievements - 获取用户成就

### 关卡接口 (/api/v1/levels/)
- GET /levels - 获取关卡列表
- GET /levels/:id - 获取关卡详情
- GET /levels/:id/progress - 获取关卡进度

### 排行榜接口 (/api/v1/leaderboard/)
- GET /leaderboard/global - 全局排行榜
- GET /leaderboard/level/:id - 关卡排行榜
- GET /leaderboard/weekly - 周排行榜
- GET /leaderboard/monthly - 月排行榜

## 📚 项目特点

### 技术栈
- **Web框架**: Gin
- **ORM**: GORM
- **数据库**: MySQL 5.7+
- **认证**: JWT
- **日志**: Zap
- **配置**: Viper
- **密码加密**: bcrypt

### 架构设计
```
├── cmd/server/          # 应用入口
├── internal/
│   ├── api/
│   │   ├── handler/     # HTTP请求处理
│   │   ├── middleware/  # 中间件
│   │   └── router/      # 路由配置
│   ├── dto/             # 数据传输对象
│   ├── model/           # 数据模型
│   ├── repository/      # 数据访问层
│   ├── service/         # 业务逻辑层
│   ├── config/          # 配置管理
│   └── pkg/             # 工具包
├── configs/             # 配置文件
└── migrations/          # 数据库迁移文件
```

### 核心功能
1. **用户系统**: 注册、登录、JWT认证、用户信息管理
2. **游戏系统**: 游戏结果提交、经验值计算、等级系统
3. **统计系统**: 用户统计、关卡进度、游戏历史
4. **排行榜系统**: 全局排行榜、关卡排行榜
5. **成就系统**: 成就进度跟踪
6. **数据迁移**: 支持从本地存储迁移数据到服务器

### 待优化项
- [ ] 成就自动检测和解锁逻辑
- [ ] 每日任务系统
- [ ] Redis缓存排行榜
- [ ] 文件上传服务（头像）
- [ ] 数据统计图表API
- [ ] 管理后台接口

## 🔍 代码示例

### Service层示例（auth_service.go）

```go
package service

import (
	"errors"
	"golang.org/x/crypto/bcrypt"
	"github.com/yourusername/MentalMathGame/internal/config"
	"github.com/yourusername/MentalMathGame/internal/model"
	"github.com/yourusername/MentalMathGame/internal/pkg/jwt"
	"github.com/yourusername/MentalMathGame/internal/pkg/validator"
	"github.com/yourusername/MentalMathGame/internal/repository"
)

type AuthService interface {
	Register(username, email, password, nickname string) error
	Login(username, password string) (string, *model.User, error)
}

type authService struct {
	userRepo repository.UserRepository
}

func NewAuthService(userRepo repository.UserRepository) AuthService {
	return &authService{userRepo: userRepo}
}

func (s *authService) Register(username, email, password, nickname string) error {
	// 1. 验证参数
	if !validator.ValidateUsername(username) {
		return errors.New("用户名格式错误")
	}
	if !validator.ValidateEmail(email) {
		return errors.New("邮箱格式错误")
	}
	if !validator.ValidatePassword(password) {
		return errors.New("密码格式错误")
	}
	if !validator.ValidateNickname(nickname) {
		return errors.New("昵称格式错误")
	}

	// 2. 检查用户名和邮箱是否已存在
	if _, err := s.userRepo.FindByUsername(username); err == nil {
		return errors.New("用户名已存在")
	}
	if _, err := s.userRepo.FindByEmail(email); err == nil {
		return errors.New("邮箱已存在")
	}

	// 3. 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 4. 创建用户
	user := &model.User{
		Username:     username,
		Email:        email,
		PasswordHash: string(hashedPassword),
		Nickname:     nickname,
		Role:         "student",
		Status:       1,
	}

	return s.userRepo.Create(user)
}

func (s *authService) Login(username, password string) (string, *model.User, error) {
	// 1. 查找用户
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		return "", nil, errors.New("用户名或密码错误")
	}

	// 2. 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", nil, errors.New("用户名或密码错误")
	}

	// 3. 检查状态
	if user.Status != 1 {
		return "", nil, errors.New("账号已被禁用")
	}

	// 4. 生成Token
	token, err := jwt.GenerateToken(
		user.ID,
		user.Username,
		user.Role,
		config.AppConfig.JWT.Secret,
		config.AppConfig.JWT.ExpireHours,
	)
	if err != nil {
		return "", nil, err
	}

	// 5. 更新最后登录时间
	s.userRepo.UpdateLastLogin(user.ID)

	return token, user, nil
}
```

### Handler层示例（auth_handler.go）

```go
package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/yourusername/MentalMathGame/internal/pkg/response"
	"github.com/yourusername/MentalMathGame/internal/service"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	Nickname string `json:"nickname" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	err := h.authService.Register(req.Username, req.Email, req.Password, req.Nickname)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.SuccessWithMessage(c, "注册成功", nil)
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	token, user, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"token": token,
		"user":  user,
	})
}
```

## 🔗 相关文档

- [后端开发规划](../docs/后端开发规划.md)
- [API接口文档](../docs/API接口文档.md)
- [数据库设计](./migrations/)

## 📄 许可证

本项目仅供学习交流使用。

