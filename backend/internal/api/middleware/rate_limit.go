package middleware

import (
	"sync"
	"time"
	
	"github.com/gin-gonic/gin"
	"github.com/yourusername/MentalMathGame/internal/pkg/response"
)

// 简单的内存限流器
type rateLimiter struct {
	requests map[string][]time.Time
	mu       sync.RWMutex
	rate     int           // 允许的请求数
	window   time.Duration // 时间窗口
}

func newRateLimiter(rate int, window time.Duration) *rateLimiter {
	limiter := &rateLimiter{
		requests: make(map[string][]time.Time),
		rate:     rate,
		window:   window,
	}
	
	// 定期清理过期数据
	go limiter.cleanup()
	
	return limiter
}

func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, times := range rl.requests {
			// 过滤掉超出时间窗口的请求
			validTimes := make([]time.Time, 0)
			for _, t := range times {
				if now.Sub(t) <= rl.window {
					validTimes = append(validTimes, t)
				}
			}
			if len(validTimes) == 0 {
				delete(rl.requests, key)
			} else {
				rl.requests[key] = validTimes
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *rateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	now := time.Now()
	
	// 获取该key的请求历史
	times, exists := rl.requests[key]
	if !exists {
		times = make([]time.Time, 0)
	}
	
	// 过滤掉超出时间窗口的请求
	validTimes := make([]time.Time, 0)
	for _, t := range times {
		if now.Sub(t) <= rl.window {
			validTimes = append(validTimes, t)
		}
	}
	
	// 检查是否超过限制
	if len(validTimes) >= rl.rate {
		return false
	}
	
	// 添加当前请求
	validTimes = append(validTimes, now)
	rl.requests[key] = validTimes
	
	return true
}

var globalLimiter = newRateLimiter(100, time.Minute) // 每分钟100次

// RateLimitMiddleware 限流中间件
func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 使用IP作为限流key
		key := c.ClientIP()
		
		if !globalLimiter.allow(key) {
			response.Error(c, 429, "请求过于频繁，请稍后再试", nil)
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// RateLimitByUser 按用户限流
func RateLimitByUser(rate int, window time.Duration) gin.HandlerFunc {
	limiter := newRateLimiter(rate, window)
	
	return func(c *gin.Context) {
		userID, exists := GetUserID(c)
		if !exists {
			c.Next()
			return
		}
		
		key := string(rune(userID))
		
		if !limiter.allow(key) {
			response.Error(c, 429, "请求过于频繁，请稍后再试", nil)
			c.Abort()
			return
		}
		
		c.Next()
	}
}

