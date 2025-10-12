import apiClient, { ApiResponse } from './client';

export const leaderboardApi = {
  // 全局排行榜
  getGlobalLeaderboard: (params?: {
    type?: 'total_score' | 'level' | 'victory_count';
    limit?: number;
  }): Promise<ApiResponse<any>> => {
    return apiClient.get('/leaderboard/global', { params });
  },

  // 关卡排行榜
  getLevelLeaderboard: (
    levelId: string,
    params?: {
      type?: 'score' | 'time' | 'accuracy';
      limit?: number;
    }
  ): Promise<ApiResponse<any>> => {
    return apiClient.get(`/leaderboard/level/${levelId}`, { params });
  },

  // 周排行榜
  getWeeklyLeaderboard: (params?: {
    type?: 'score' | 'plays';
    limit?: number;
  }): Promise<ApiResponse<any>> => {
    return apiClient.get('/leaderboard/weekly', { params });
  },

  // 月排行榜
  getMonthlyLeaderboard: (params?: {
    type?: 'score' | 'plays';
    limit?: number;
  }): Promise<ApiResponse<any>> => {
    return apiClient.get('/leaderboard/monthly', { params });
  },
};


