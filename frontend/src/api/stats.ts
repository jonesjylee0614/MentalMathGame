import apiClient, { ApiResponse } from './client';

export const statsApi = {
  // 获取用户统计
  getMyStats: (): Promise<ApiResponse<any>> => {
    return apiClient.get('/stats/me');
  },

  // 获取所有关卡进度
  getMyProgress: (category?: string): Promise<ApiResponse<any>> => {
    return apiClient.get('/stats/me/progress', {
      params: { category },
    });
  },

  // 获取游戏历史
  getMyHistory: (params?: {
    type?: 'daily' | 'weekly' | 'monthly';
    days?: number;
  }): Promise<ApiResponse<any>> => {
    return apiClient.get('/stats/me/history', { params });
  },

  // 获取成就列表
  getMyAchievements: (completed?: boolean): Promise<ApiResponse<any>> => {
    return apiClient.get('/stats/me/achievements', {
      params: { completed },
    });
  },
};


