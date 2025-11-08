import apiClient, { UnifiedResponse } from './client';

export const levelsApi = {
  // 获取关卡列表
  getLevels: (params?: {
    category?: string;
    status?: number;
  }): Promise<UnifiedResponse<any>> => {
    return apiClient.get('/levels', { params });
  },

  // 获取关卡详情
  getLevelDetail: (levelId: string): Promise<UnifiedResponse<any>> => {
    return apiClient.get(`/levels/${levelId}`);
  },

  // 获取关卡进度
  getLevelProgress: (levelId: string): Promise<UnifiedResponse<any>> => {
    return apiClient.get(`/levels/${levelId}/progress`);
  },
};


