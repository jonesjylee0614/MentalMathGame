# 心算游戏 API 接口文档

**版本**: v1.0  
**Base URL**: `http://localhost:8080/api/v1`  
**认证方式**: JWT Bearer Token

---

## 目录

- [1. 通用说明](#1-通用说明)
- [2. 认证模块 (Auth)](#2-认证模块-auth)
- [3. 用户模块 (User)](#3-用户模块-user)
- [4. 关卡模块 (Levels)](#4-关卡模块-levels)
- [5. 游戏模块 (Game)](#5-游戏模块-game)
- [6. 统计模块 (Stats)](#6-统计模块-stats)
- [7. 排行榜模块 (Leaderboard)](#7-排行榜模块-leaderboard)
- [8. 成就模块 (Achievements)](#8-成就模块-achievements)
- [9. 每日任务模块 (Daily Quests)](#9-每日任务模块-daily-quests)
- [10. 家长模式 (Parent Mode)](#10-家长模式-parent-mode)
- [11. 错误码说明](#11-错误码说明)

---

## 1. 通用说明

### 1.1 请求头

所有需要认证的接口都需要携带 Token：

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### 1.2 统一响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1702345678
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "username",
      "message": "用户名长度必须在 3-20 之间"
    }
  ],
  "timestamp": 1702345678
}
```

### 1.3 分页参数

使用分页的接口统一采用以下参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码，从 1 开始 |
| page_size | int | 否 | 20 | 每页数量，最大 100 |

分页响应格式：
```json
{
  "code": 200,
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

---

## 2. 认证模块 (Auth)

### 2.1 用户注册

**接口**: `POST /auth/register`  
**认证**: 否

#### 请求参数
```json
{
  "username": "player123",        // string, 必填, 3-20字符, 字母数字下划线
  "email": "player@example.com",  // string, 必填, 合法邮箱格式
  "password": "Password123!",     // string, 必填, 8-32字符, 至少包含大小写字母、数字
  "nickname": "小勇士"             // string, 必填, 1-20字符
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user_id": 12345,
    "username": "player123",
    "email": "player@example.com",
    "nickname": "小勇士",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "timestamp": 1702345678
}
```

#### 错误码
| Code | Message | 说明 |
|------|---------|------|
| 400 | 参数错误 | 请求参数格式不正确 |
| 409 | 用户名已存在 | 该用户名已被注册 |
| 409 | 邮箱已存在 | 该邮箱已被注册 |

---

### 2.2 用户登录

**接口**: `POST /auth/login`  
**认证**: 否

#### 请求参数
```json
{
  "username": "player123",     // string, 必填, 用户名或邮箱
  "password": "Password123!"   // string, 必填
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": 1702345678,
    "user": {
      "id": 12345,
      "username": "player123",
      "nickname": "小勇士",
      "email": "player@example.com",
      "avatar_url": "https://example.com/avatar/123.jpg",
      "role": "student",
      "level": 5,
      "experience": 1200,
      "created_at": "2024-01-01T00:00:00Z",
      "last_login_at": "2024-01-10T10:30:00Z"
    }
  },
  "timestamp": 1702345678
}
```

#### 错误码
| Code | Message | 说明 |
|------|---------|------|
| 400 | 参数错误 | 缺少必填参数 |
| 401 | 用户名或密码错误 | 认证失败 |
| 403 | 账号已被禁用 | 账号状态异常 |
| 429 | 登录尝试过于频繁 | 短时间内登录失败次数过多 |

---

### 2.3 刷新 Token

**接口**: `POST /auth/refresh`  
**认证**: 是

#### 请求参数
无（从 Header 中获取当前 Token）

#### 响应示例
```json
{
  "code": 200,
  "message": "Token 刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": 1702345678
  },
  "timestamp": 1702345678
}
```

---

### 2.4 登出

**接口**: `POST /auth/logout`  
**认证**: 是

#### 请求参数
无

#### 响应示例
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null,
  "timestamp": 1702345678
}
```

---

### 2.5 重置密码

**接口**: `POST /auth/reset-password`  
**认证**: 否

#### 请求参数（步骤1：请求重置）
```json
{
  "email": "player@example.com"
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "重置邮件已发送",
  "data": {
    "reset_token_expires_at": 1702345678
  },
  "timestamp": 1702345678
}
```

#### 请求参数（步骤2：确认重置）
```json
{
  "reset_token": "abc123def456",
  "new_password": "NewPassword123!"
}
```

---

## 3. 用户模块 (User)

### 3.1 获取当前用户信息

**接口**: `GET /users/me`  
**认证**: 是

#### 请求参数
无

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "id": 12345,
    "username": "player123",
    "nickname": "小勇士",
    "email": "player@example.com",
    "avatar_url": "https://example.com/avatar/123.jpg",
    "role": "student",
    "parent_id": null,
    "level": 5,
    "experience": 1200,
    "next_level_exp": 1500,
    "status": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "last_login_at": "2024-01-10T10:30:00Z"
  },
  "timestamp": 1702345678
}
```

---

### 3.2 更新用户信息

**接口**: `PUT /users/me`  
**认证**: 是

#### 请求参数
```json
{
  "nickname": "数学小天才",    // string, 可选
  "email": "new@example.com"   // string, 可选
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 12345,
    "username": "player123",
    "nickname": "数学小天才",
    "email": "new@example.com",
    "updated_at": "2024-01-10T10:30:00Z"
  },
  "timestamp": 1702345678
}
```

---

### 3.3 上传头像

**接口**: `PUT /users/me/avatar`  
**认证**: 是  
**Content-Type**: `multipart/form-data`

#### 请求参数
```
avatar: (file) // 图片文件，支持 jpg/png/gif，最大 2MB
```

#### 响应示例
```json
{
  "code": 200,
  "message": "头像上传成功",
  "data": {
    "avatar_url": "https://example.com/avatar/123_new.jpg"
  },
  "timestamp": 1702345678
}
```

---

### 3.4 获取用户设置

**接口**: `GET /users/me/settings`  
**认证**: 是

#### 请求参数
无

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "audio_enabled": true,
    "shake_enabled": true,
    "colorblind_mode": false,
    "font_scale": 1.0,
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "timestamp": 1702345678
}
```

---

### 3.5 更新用户设置

**接口**: `PUT /users/me/settings`  
**认证**: 是

#### 请求参数
```json
{
  "audio_enabled": false,       // boolean, 可选
  "shake_enabled": true,        // boolean, 可选
  "colorblind_mode": false,     // boolean, 可选
  "font_scale": 1.2             // float, 可选, 0.8-2.0
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "设置已更新",
  "data": {
    "audio_enabled": false,
    "shake_enabled": true,
    "colorblind_mode": false,
    "font_scale": 1.2,
    "updated_at": "2024-01-10T10:30:00Z"
  },
  "timestamp": 1702345678
}
```

---

### 3.6 修改密码

**接口**: `PUT /users/me/password`  
**认证**: 是

#### 请求参数
```json
{
  "old_password": "OldPassword123!",
  "new_password": "NewPassword123!"
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null,
  "timestamp": 1702345678
}
```

---

### 3.7 数据迁移（localStorage 同步）

**接口**: `POST /users/me/migrate`  
**认证**: 是

#### 请求参数
```json
{
  "profile": {
    "name": "小勇士",
    "createdAt": 1702345678000
  },
  "progress": [
    {
      "levelId": "add_1_5",
      "bestScore": 980,
      "bestTimeSec": 42,
      "bestAccuracy": 1.0,
      "playCount": 5,
      "lastPlayedAt": 1702345678000,
      "lastOutcome": "victory"
    }
  ],
  "stats": {
    "totalScore": 5000,
    "totalPlays": 50,
    "totalCorrect": 950,
    "totalWrong": 50,
    "totalTimeSec": 3000,
    "bestCombo": 15
  },
  "settings": {
    "audio": true,
    "shake": true,
    "colorblind": false,
    "fontScale": 1.0
  }
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "数据迁移成功",
  "data": {
    "migrated_progress_count": 15,
    "migrated_stats": true,
    "migrated_settings": true,
    "conflicts": [],
    "warnings": []
  },
  "timestamp": 1702345678
}
```

---

## 4. 关卡模块 (Levels)

### 4.1 获取关卡列表

**接口**: `GET /levels`  
**认证**: 是

#### 请求参数（Query）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 关卡分类，如 "基础入门" |
| status | int | 否 | 关卡状态，1-启用 |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "total": 79,
    "categories": [
      {
        "name": "基础入门",
        "count": 30,
        "levels": [
          {
            "id": "add_1_5",
            "category": "基础入门",
            "name": "5以内的加法",
            "description": "例：2+3=?",
            "question_count": 20,
            "time_limit": 300,
            "difficulty": 1.0,
            "sort_order": 1,
            "user_progress": {
              "played": true,
              "best_score": 980,
              "best_time": 42,
              "best_accuracy": 1.0,
              "play_count": 5,
              "last_played_at": "2024-01-10T10:30:00Z",
              "last_outcome": "victory"
            }
          }
        ]
      },
      {
        "name": "进阶拓展",
        "count": 49,
        "levels": [ ... ]
      }
    ]
  },
  "timestamp": 1702345678
}
```

---

### 4.2 获取关卡详情

**接口**: `GET /levels/:levelId`  
**认证**: 是

#### 请求参数
无（levelId 在 URL 中）

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "id": "add_1_5",
    "category": "基础入门",
    "name": "5以内的加法",
    "description": "例：2+3=?\n\n本关卡帮助孩子掌握 5 以内的加法运算...",
    "generator_config": {
      "type": "addsub",
      "ops": ["+"],
      "max": 5
    },
    "question_count": 20,
    "time_limit": 300,
    "difficulty": 1.0,
    "hp_config": {
      "player": 100,
      "monster": 100
    },
    "sort_order": 1,
    "status": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "user_progress": {
      "played": true,
      "best_score": 980,
      "best_time": 42,
      "best_accuracy": 1.0,
      "play_count": 5,
      "total_score": 4500,
      "total_correct": 95,
      "total_wrong": 5,
      "last_played_at": "2024-01-10T10:30:00Z",
      "last_outcome": "victory"
    },
    "leaderboard": {
      "top_players": [
        {
          "rank": 1,
          "user": {
            "id": 123,
            "nickname": "数学之王",
            "avatar_url": ""
          },
          "score": 1000,
          "time": 30,
          "accuracy": 1.0
        }
      ],
      "my_rank": 42
    }
  },
  "timestamp": 1702345678
}
```

---

### 4.3 获取关卡进度

**接口**: `GET /levels/:levelId/progress`  
**认证**: 是

#### 请求参数
无

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "level_id": "add_1_5",
    "best_score": 980,
    "best_time": 42,
    "best_accuracy": 1.0,
    "play_count": 5,
    "total_score": 4500,
    "total_correct": 95,
    "total_wrong": 5,
    "last_played_at": "2024-01-10T10:30:00Z",
    "last_outcome": "victory",
    "history": [
      {
        "record_id": 123456,
        "score": 980,
        "correct_count": 20,
        "total_questions": 20,
        "accuracy": 1.0,
        "time_used": 42,
        "outcome": "victory",
        "played_at": "2024-01-10T10:30:00Z"
      }
    ]
  },
  "timestamp": 1702345678
}
```

---

## 5. 游戏模块 (Game)

### 5.1 开始游戏（可选接口）

**接口**: `POST /games/start`  
**认证**: 是

> **说明**: 此接口可选。如果前端自行生成题目，可以不调用此接口。  
> 如果需要后端生成题目（防作弊场景），则调用此接口获取题目。

#### 请求参数
```json
{
  "level_id": "add_1_5"
}
```

#### 响应示例（方案1：后端生成题目）
```json
{
  "code": 200,
  "data": {
    "session_id": "game_session_abc123",
    "level": {
      "id": "add_1_5",
      "name": "5以内的加法",
      "question_count": 20,
      "time_limit": 300,
      "difficulty": 1.0
    },
    "questions": [
      {
        "id": "q1",
        "text": "2 + 3 = ?",
        "kind": "normal"
        // 不包含答案
      },
      {
        "id": "q2",
        "text": "5 - 1 = ?",
        "kind": "normal"
      }
      // ... 共 20 题
    ],
    "started_at": "2024-01-10T10:30:00Z"
  },
  "timestamp": 1702345678
}
```

#### 响应示例（方案2：前端生成题目）
```json
{
  "code": 200,
  "data": {
    "session_id": "game_session_abc123",
    "level": {
      "id": "add_1_5",
      "name": "5以内的加法",
      "question_count": 20,
      "time_limit": 300,
      "difficulty": 1.0
    },
    "started_at": "2024-01-10T10:30:00Z"
  },
  "timestamp": 1702345678
}
```

---

### 5.2 提交游戏结果

**接口**: `POST /games/submit`  
**认证**: 是

#### 请求参数
```json
{
  "session_id": "game_session_abc123",  // string, 可选, 如果调用了 /games/start
  "level_id": "add_1_5",                // string, 必填
  "score": 980,                         // int, 必填, 最终得分
  "correct_count": 19,                  // int, 必填, 正确数量
  "total_questions": 20,                // int, 必填, 总题数
  "max_combo": 12,                      // int, 必填, 最大连击
  "accuracy": 0.95,                     // float, 必填, 正确率
  "time_used": 42,                      // int, 必填, 用时（秒）
  "time_left": 258,                     // int, 必填, 剩余时间（秒）
  "outcome": "victory",                 // string, 必填, victory/defeat/timeout
  "answers_history": [                  // array, 必填, 答题历史
    {
      "question_id": "q1",
      "correct": true,
      "user_answer": "5",
      "expected_answer": "5",
      "time_spent": 2
    },
    {
      "question_id": "q2",
      "correct": false,
      "user_answer": "3",
      "expected_answer": "4",
      "time_spent": 3
    }
    // ... 共 20 条
  ]
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "游戏结果已记录",
  "data": {
    "record_id": 123456,
    "is_best_score": true,
    "is_best_time": true,
    "is_best_accuracy": false,
    "previous_best": {
      "score": 900,
      "time": 50,
      "accuracy": 0.90
    },
    "rewards": {
      "exp_gained": 50,
      "score_gained": 980,
      "level_up": false,
      "new_level": 5,
      "new_exp": 1250,
      "next_level_exp": 1500
    },
    "unlocked_achievements": [
      {
        "id": "first_victory_add_1_5",
        "name": "初战告捷",
        "description": "首次完成 5 以内加法关卡",
        "icon_url": "https://example.com/achievements/first_victory.png",
        "reward_exp": 10
      }
    ],
    "completed_quests": [
      {
        "id": 12345,
        "quest_type": "daily_play_3",
        "description": "今日完成 3 场游戏",
        "reward_exp": 30,
        "reward_score": 100
      }
    ],
    "rank_change": {
      "global_rank": {
        "previous": 45,
        "current": 42,
        "change": 3
      },
      "level_rank": {
        "previous": 10,
        "current": 8,
        "change": 2
      }
    }
  },
  "timestamp": 1702345678
}
```

#### 错误码
| Code | Message | 说明 |
|------|---------|------|
| 400 | 参数错误 | 缺少必填参数或格式错误 |
| 400 | 数据异常 | 分数/时间不合理（防作弊检测） |
| 404 | 关卡不存在 | levelId 无效 |

---

### 5.3 获取游戏记录列表

**接口**: `GET /games/records`  
**认证**: 是

#### 请求参数（Query）
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| level_id | string | 否 | - | 筛选指定关卡 |
| outcome | string | 否 | - | 筛选结果：victory/defeat/timeout |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 20 | 每页数量 |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 123456,
        "level": {
          "id": "add_1_5",
          "name": "5以内的加法",
          "category": "基础入门"
        },
        "score": 980,
        "correct_count": 19,
        "total_questions": 20,
        "max_combo": 12,
        "accuracy": 0.95,
        "time_used": 42,
        "time_left": 258,
        "outcome": "victory",
        "created_at": "2024-01-10T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 50,
      "total_pages": 3
    }
  },
  "timestamp": 1702345678
}
```

---

### 5.4 获取游戏记录详情

**接口**: `GET /games/records/:recordId`  
**认证**: 是

#### 请求参数
无（recordId 在 URL 中）

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "id": 123456,
    "user": {
      "id": 12345,
      "username": "player123",
      "nickname": "小勇士"
    },
    "level": {
      "id": "add_1_5",
      "name": "5以内的加法",
      "category": "基础入门",
      "difficulty": 1.0
    },
    "score": 980,
    "correct_count": 19,
    "total_questions": 20,
    "max_combo": 12,
    "accuracy": 0.95,
    "time_used": 42,
    "time_left": 258,
    "outcome": "victory",
    "answers_history": [
      {
        "question_id": "q1",
        "correct": true,
        "user_answer": "5",
        "expected_answer": "5",
        "time_spent": 2
      }
      // ... 共 20 条
    ],
    "created_at": "2024-01-10T10:30:00Z"
  },
  "timestamp": 1702345678
}
```

---

## 6. 统计模块 (Stats)

### 6.1 获取用户统计

**接口**: `GET /stats/me`  
**认证**: 是

#### 请求参数
无

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "total_score": 50000,
    "total_plays": 200,
    "total_correct": 3800,
    "total_wrong": 200,
    "total_time_sec": 12000,
    "best_combo": 25,
    "victory_count": 180,
    "defeat_count": 20,
    "current_streak": 5,
    "best_streak": 12,
    "level": 10,
    "experience": 5000,
    "next_level_exp": 6000,
    "accuracy_rate": 0.95,
    "avg_time_per_game": 60,
    "avg_score_per_game": 250,
    "favorite_category": "基础入门",
    "mastered_levels": [
      {
        "level_id": "add_1_5",
        "level_name": "5以内的加法",
        "mastery": 1.0
      }
    ],
    "weak_levels": [
      {
        "level_id": "mul_9",
        "level_name": "9以内的乘法口诀",
        "mastery": 0.6
      }
    ],
    "updated_at": "2024-01-10T10:30:00Z"
  },
  "timestamp": 1702345678
}
```

---

### 6.2 获取所有关卡进度

**接口**: `GET /stats/me/progress`  
**认证**: 是

#### 请求参数（Query）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 筛选分类 |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "total_levels": 79,
    "played_levels": 25,
    "mastered_levels": 10,
    "progress": [
      {
        "level_id": "add_1_5",
        "level_name": "5以内的加法",
        "category": "基础入门",
        "best_score": 980,
        "best_time": 42,
        "best_accuracy": 1.0,
        "play_count": 5,
        "last_played_at": "2024-01-10T10:30:00Z",
        "mastery": 1.0,
        "stars": 3
      }
    ]
  },
  "timestamp": 1702345678
}
```

---

### 6.3 获取游戏历史（图表数据）

**接口**: `GET /stats/me/history`  
**认证**: 是

#### 请求参数（Query）
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | string | 否 | daily | daily/weekly/monthly |
| days | int | 否 | 30 | 最近 N 天 |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "type": "daily",
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-30"
    },
    "chart_data": {
      "dates": ["2024-01-01", "2024-01-02", "2024-01-03"],
      "scores": [500, 600, 700],
      "play_counts": [5, 6, 7],
      "accuracy_rates": [0.90, 0.92, 0.95],
      "avg_times": [60, 55, 50]
    },
    "summary": {
      "total_plays": 200,
      "total_score": 50000,
      "avg_score": 250,
      "total_time": 12000,
      "avg_accuracy": 0.95
    }
  },
  "timestamp": 1702345678
}
```

---

### 6.4 获取成就列表

**接口**: `GET /stats/me/achievements`  
**认证**: 是

#### 请求参数（Query）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| completed | bool | 否 | 是否只显示已完成 |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "total_achievements": 50,
    "completed_count": 12,
    "completion_rate": 0.24,
    "categories": [
      {
        "category": "新手入门",
        "achievements": [
          {
            "id": "first_login",
            "name": "初来乍到",
            "description": "首次登录游戏",
            "icon_url": "https://example.com/achievements/first_login.png",
            "category": "新手入门",
            "reward_exp": 10,
            "progress": 1,
            "target": 1,
            "completed": true,
            "completed_at": "2024-01-01T00:00:00Z"
          }
        ]
      }
    ]
  },
  "timestamp": 1702345678
}
```

---

## 7. 排行榜模块 (Leaderboard)

### 7.1 全局排行榜

**接口**: `GET /leaderboard/global`  
**认证**: 是

#### 请求参数（Query）
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | string | 否 | total_score | total_score/level/victory_count |
| limit | int | 否 | 50 | 返回前 N 名，最大 100 |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "type": "total_score",
    "ranking": [
      {
        "rank": 1,
        "user": {
          "id": 123,
          "username": "top_player",
          "nickname": "数学之王",
          "avatar_url": "https://example.com/avatar/123.jpg",
          "level": 20
        },
        "score": 100000,
        "level": 20,
        "victory_count": 500
      },
      {
        "rank": 2,
        "user": {
          "id": 456,
          "username": "second_player",
          "nickname": "计算达人",
          "avatar_url": "",
          "level": 18
        },
        "score": 90000,
        "level": 18,
        "victory_count": 450
      }
      // ... 共 50 条
    ],
    "my_rank": {
      "rank": 42,
      "score": 50000,
      "level": 10,
      "victory_count": 180
    },
    "updated_at": "2024-01-10T10:30:00Z"
  },
  "timestamp": 1702345678
}
```

---

### 7.2 关卡排行榜

**接口**: `GET /leaderboard/level/:levelId`  
**认证**: 是

#### 请求参数（Query）
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | string | 否 | score | score/time/accuracy |
| limit | int | 否 | 50 | 返回前 N 名 |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "level": {
      "id": "add_1_5",
      "name": "5以内的加法",
      "category": "基础入门"
    },
    "type": "score",
    "ranking": [
      {
        "rank": 1,
        "user": {
          "id": 123,
          "nickname": "数学之王",
          "avatar_url": ""
        },
        "score": 1000,
        "time": 30,
        "accuracy": 1.0,
        "play_count": 10,
        "played_at": "2024-01-10T10:30:00Z"
      }
    ],
    "my_rank": {
      "rank": 8,
      "score": 980,
      "time": 42,
      "accuracy": 0.95
    },
    "updated_at": "2024-01-10T10:30:00Z"
  },
  "timestamp": 1702345678
}
```

---

### 7.3 周排行榜

**接口**: `GET /leaderboard/weekly`  
**认证**: 是

#### 请求参数（Query）
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | string | 否 | score | score/plays |
| limit | int | 否 | 50 | 返回前 N 名 |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "period": {
      "start_date": "2024-01-08",
      "end_date": "2024-01-14",
      "week_number": 2
    },
    "type": "score",
    "ranking": [
      {
        "rank": 1,
        "user": {
          "id": 123,
          "nickname": "本周之星",
          "avatar_url": ""
        },
        "weekly_score": 5000,
        "weekly_plays": 50,
        "weekly_victories": 45
      }
    ],
    "my_rank": {
      "rank": 15,
      "weekly_score": 2000,
      "weekly_plays": 20,
      "weekly_victories": 18
    },
    "updated_at": "2024-01-10T10:30:00Z"
  },
  "timestamp": 1702345678
}
```

---

### 7.4 月排行榜

**接口**: `GET /leaderboard/monthly`  
**认证**: 是

#### 响应格式同周排行榜，period 字段为月份信息

---

## 8. 成就模块 (Achievements)

### 8.1 获取所有成就

**接口**: `GET /achievements`  
**认证**: 是

#### 请求参数（Query）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 筛选分类 |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "total": 50,
    "categories": [
      {
        "category": "新手入门",
        "count": 5,
        "achievements": [
          {
            "id": "first_login",
            "name": "初来乍到",
            "description": "首次登录游戏",
            "icon_url": "https://example.com/achievements/first_login.png",
            "category": "新手入门",
            "condition_type": "login_count",
            "condition_value": { "count": 1 },
            "reward_exp": 10,
            "sort_order": 1
          }
        ]
      },
      {
        "category": "关卡挑战",
        "count": 20,
        "achievements": [ ... ]
      }
    ]
  },
  "timestamp": 1702345678
}
```

---

### 8.2 获取我的成就进度

**接口**: `GET /achievements/me`  
**认证**: 是

#### 请求参数
无

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "total_achievements": 50,
    "completed_count": 12,
    "completion_rate": 0.24,
    "total_exp_earned": 300,
    "achievements": [
      {
        "id": "first_login",
        "name": "初来乍到",
        "description": "首次登录游戏",
        "icon_url": "https://example.com/achievements/first_login.png",
        "category": "新手入门",
        "reward_exp": 10,
        "progress": 1,
        "target": 1,
        "completed": true,
        "completed_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": "win_10_games",
        "name": "小试牛刀",
        "description": "累计胜利 10 场游戏",
        "icon_url": "https://example.com/achievements/win_10_games.png",
        "category": "游戏成就",
        "reward_exp": 30,
        "progress": 7,
        "target": 10,
        "completed": false,
        "completed_at": null
      }
    ]
  },
  "timestamp": 1702345678
}
```

---

### 8.3 领取成就奖励

**接口**: `POST /achievements/:achievementId/claim`  
**认证**: 是

#### 请求参数
无（achievementId 在 URL 中）

#### 响应示例
```json
{
  "code": 200,
  "message": "成就奖励已领取",
  "data": {
    "achievement_id": "first_login",
    "reward_exp": 10,
    "new_exp": 1210,
    "level_up": false,
    "new_level": 5
  },
  "timestamp": 1702345678
}
```

---

## 9. 每日任务模块 (Daily Quests)

### 9.1 获取今日任务

**接口**: `GET /quests/daily`  
**认证**: 是

#### 请求参数
无

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "quest_date": "2024-01-10",
    "total_quests": 3,
    "completed_count": 1,
    "quests": [
      {
        "id": 12345,
        "quest_type": "daily_play_3",
        "description": "今日完成 3 场游戏",
        "reward_exp": 30,
        "reward_score": 100,
        "progress": 1,
        "target": 3,
        "completed": false,
        "completed_at": null
      },
      {
        "id": 12346,
        "quest_type": "daily_win_5",
        "description": "今日胜利 5 场游戏",
        "reward_exp": 50,
        "reward_score": 200,
        "progress": 3,
        "target": 5,
        "completed": false,
        "completed_at": null
      },
      {
        "id": 12347,
        "quest_type": "daily_perfect",
        "description": "今日完成一场满分游戏",
        "reward_exp": 100,
        "reward_score": 500,
        "progress": 1,
        "target": 1,
        "completed": true,
        "completed_at": "2024-01-10T10:30:00Z"
      }
    ]
  },
  "timestamp": 1702345678
}
```

---

### 9.2 领取任务奖励

**接口**: `POST /quests/daily/:questId/claim`  
**认证**: 是

#### 请求参数
无（questId 在 URL 中）

#### 响应示例
```json
{
  "code": 200,
  "message": "任务奖励已领取",
  "data": {
    "quest_id": 12347,
    "reward_exp": 100,
    "reward_score": 500,
    "new_exp": 1310,
    "new_total_score": 50500,
    "level_up": false,
    "new_level": 5
  },
  "timestamp": 1702345678
}
```

---

## 10. 家长模式 (Parent Mode)

### 10.1 获取子账号列表

**接口**: `GET /parent/children`  
**认证**: 是（仅家长角色）

#### 请求参数
无

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "total": 2,
    "children": [
      {
        "id": 123,
        "username": "child1",
        "nickname": "小明",
        "avatar_url": "",
        "level": 5,
        "experience": 1200,
        "total_score": 10000,
        "total_plays": 50,
        "created_at": "2024-01-01T00:00:00Z",
        "last_login_at": "2024-01-10T10:30:00Z"
      },
      {
        "id": 124,
        "username": "child2",
        "nickname": "小红",
        "avatar_url": "",
        "level": 3,
        "experience": 500,
        "total_score": 5000,
        "total_plays": 20,
        "created_at": "2024-01-05T00:00:00Z",
        "last_login_at": "2024-01-09T15:00:00Z"
      }
    ]
  },
  "timestamp": 1702345678
}
```

---

### 10.2 添加子账号关联

**接口**: `POST /parent/children`  
**认证**: 是（仅家长角色）

#### 请求参数
```json
{
  "child_username": "child1",  // 子账号用户名
  "relation_code": "abc123"    // 关联码（由子账号生成）
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "子账号关联成功",
  "data": {
    "child": {
      "id": 123,
      "username": "child1",
      "nickname": "小明"
    }
  },
  "timestamp": 1702345678
}
```

---

### 10.3 获取子账号学习报告

**接口**: `GET /parent/children/:childId/report`  
**认证**: 是（仅家长角色）

#### 请求参数（Query）
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| period | string | 否 | week | week/month/all |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "child": {
      "id": 123,
      "nickname": "小明",
      "level": 5
    },
    "period": {
      "type": "week",
      "start_date": "2024-01-08",
      "end_date": "2024-01-14"
    },
    "summary": {
      "total_plays": 20,
      "total_time_minutes": 60,
      "total_score": 5000,
      "victory_count": 18,
      "defeat_count": 2,
      "avg_accuracy": 0.95,
      "best_score": 980,
      "best_level": {
        "id": "add_1_5",
        "name": "5以内的加法"
      }
    },
    "category_performance": [
      {
        "category": "基础入门",
        "plays": 15,
        "victories": 14,
        "avg_accuracy": 0.96,
        "mastery": "excellent"
      },
      {
        "category": "进阶拓展",
        "plays": 5,
        "victories": 4,
        "avg_accuracy": 0.88,
        "mastery": "good"
      }
    ],
    "recent_activities": [
      {
        "level_name": "5以内的加法",
        "score": 980,
        "outcome": "victory",
        "played_at": "2024-01-10T10:30:00Z"
      }
    ],
    "recommendations": [
      {
        "level_id": "mul_6",
        "level_name": "6以内的乘法口诀",
        "reason": "建议加强练习"
      }
    ]
  },
  "timestamp": 1702345678
}
```

---

### 10.4 获取子账号统计

**接口**: `GET /parent/children/:childId/stats`  
**认证**: 是（仅家长角色）

#### 请求参数
无

#### 响应格式同 [6.1 获取用户统计](#61-获取用户统计)

---

## 11. 错误码说明

### 11.1 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或 Token 无效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如用户名已存在） |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 11.2 业务错误码

| Code | Message | 说明 |
|------|---------|------|
| 10001 | 用户名或密码错误 | 登录失败 |
| 10002 | 用户名已存在 | 注册失败 |
| 10003 | 邮箱已存在 | 注册失败 |
| 10004 | Token 已过期 | 需要重新登录 |
| 10005 | Token 无效 | 需要重新登录 |
| 10006 | 账号已被禁用 | 账号状态异常 |
| 20001 | 关卡不存在 | levelId 无效 |
| 20002 | 游戏数据异常 | 防作弊检测 |
| 20003 | 游戏会话不存在 | sessionId 无效 |
| 30001 | 成就未完成 | 不能领取奖励 |
| 30002 | 奖励已领取 | 重复领取 |
| 40001 | 权限不足 | 无权访问该资源 |
| 40002 | 子账号不存在 | childId 无效 |
| 40003 | 非家长账号 | 只有家长角色才能访问 |

---

## 附录

### A. 数据类型说明

#### User（用户）
```typescript
interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatar_url: string;
  role: 'student' | 'parent' | 'admin';
  level: number;
  experience: number;
  created_at: string;
  last_login_at: string;
}
```

#### Level（关卡）
```typescript
interface Level {
  id: string;
  category: string;
  name: string;
  description: string;
  question_count: number;
  time_limit: number;
  difficulty: number;
}
```

#### GameRecord（游戏记录）
```typescript
interface GameRecord {
  id: number;
  user_id: number;
  level_id: string;
  score: number;
  correct_count: number;
  total_questions: number;
  max_combo: number;
  accuracy: number;
  time_used: number;
  time_left: number;
  outcome: 'victory' | 'defeat' | 'timeout';
  created_at: string;
}
```

### B. 请求限流规则

| 接口类型 | 限制规则 |
|---------|---------|
| 登录 | 5 次/分钟/IP |
| 注册 | 3 次/小时/IP |
| 游戏提交 | 100 次/小时/用户 |
| 查询接口 | 1000 次/小时/用户 |
| 排行榜 | 60 次/小时/用户 |

### C. 环境变量配置

```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:8080/api/v1

# 生产环境
VITE_API_BASE_URL=https://api.example.com/api/v1
```

---

**文档版本**: v1.0  
**最后更新**: 2024-XX-XX  
**维护者**: 开发团队

