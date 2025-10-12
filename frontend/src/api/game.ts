import apiClient, { ApiResponse } from './client';

export interface SubmitGameRequest {
  session_id?: string;
  level_id: string;
  score: number;
  correct_count: number;
  total_questions: number;
  max_combo: number;
  accuracy: number;
  time_used: number;
  time_left: number;
  outcome: 'victory' | 'defeat' | 'timeout';
  answers_history: Array<{
    question_id: string;
    correct: boolean;
    user_answer: string;
    expected_answer: string;
    time_spent?: number;
  }>;
}

export interface SubmitGameResponse {
  record_id: number;
  is_best_score: boolean;
  is_best_time: boolean;
  is_best_accuracy: boolean;
  previous_best: {
    score: number;
    time: number;
    accuracy: number;
  };
  rewards: {
    exp_gained: number;
    score_gained: number;
    level_up: boolean;
    new_level: number;
    new_exp: number;
    next_level_exp: number;
  };
  unlocked_achievements: any[];
  completed_quests: any[];
  rank_change: {
    global_rank: {
      previous: number;
      current: number;
      change: number;
    };
    level_rank: {
      previous: number;
      current: number;
      change: number;
    };
  };
}

export const gameApi = {
  // 提交游戏结果
  submitResult: (data: SubmitGameRequest): Promise<ApiResponse<SubmitGameResponse>> => {
    return apiClient.post('/games/submit', data);
  },

  // 获取游戏记录
  getRecords: (params?: {
    level_id?: string;
    outcome?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<any>> => {
    return apiClient.get('/games/records', { params });
  },

  // 获取游戏记录详情
  getRecordDetail: (recordId: number): Promise<ApiResponse<any>> => {
    return apiClient.get(`/games/records/${recordId}`);
  },
};


