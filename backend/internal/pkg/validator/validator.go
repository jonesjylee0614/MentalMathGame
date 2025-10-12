package validator

import (
	"regexp"
)

var (
	// UsernameRegex 用户名正则：3-20位字母数字下划线
	UsernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]{3,20}$`)
	// EmailRegex 邮箱正则
	EmailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	// PasswordRegex 密码正则：8-32位，至少包含大小写字母和数字
	PasswordRegex = regexp.MustCompile(`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,32}$`)
)

// ValidateUsername 验证用户名
func ValidateUsername(username string) bool {
	return UsernameRegex.MatchString(username)
}

// ValidateEmail 验证邮箱
func ValidateEmail(email string) bool {
	return EmailRegex.MatchString(email)
}

// ValidatePassword 验证密码
func ValidatePassword(password string) bool {
	return PasswordRegex.MatchString(password)
}

// ValidateNickname 验证昵称
func ValidateNickname(nickname string) bool {
	return len(nickname) >= 1 && len(nickname) <= 20
}

