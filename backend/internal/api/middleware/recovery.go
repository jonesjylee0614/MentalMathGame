package middleware

import (
	"net/http"
	
	"github.com/gin-gonic/gin"
	"github.com/yourusername/MentalMathGame/internal/pkg/logger"
	"github.com/yourusername/MentalMathGame/internal/pkg/response"
	"go.uber.org/zap"
)

// RecoveryMiddleware 异常恢复中间件
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("Panic recovered",
					zap.Any("error", err),
					zap.String("path", c.Request.URL.Path),
					zap.String("method", c.Request.Method),
				)
				
				response.Error(c, http.StatusInternalServerError, "服务器内部错误")
				c.Abort()
			}
		}()
		c.Next()
	}
}

