import apiClient, { ApiResponse } from './client';
import type { User } from './auth';

export interface UserSettings {
  audio_enabled: boolean;
  shake_enabled: boolean;
  colorblind_mode: boolean;
  font_scale: number;
}

export interface MigrationData {
  profile: {
    name: string;
    createdAt: number;
  };
  progress: any[];
  stats: any;
  settings: any;
}

export const userApi = {
  // 获取当前用户信息
  getMe: (): Promise<ApiResponse<User>> => {
    return apiClient.get('/users/me');
  },

  // 更新用户信息
  updateMe: (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.put('/users/me', data);
  },

  // 上传头像
  uploadAvatar: (file: File): Promise<ApiResponse<{ avatar_url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.put('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 获取用户设置
  getSettings: (): Promise<ApiResponse<UserSettings>> => {
    return apiClient.get('/users/me/settings');
  },

  // 更新用户设置
  updateSettings: (data: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> => {
    return apiClient.put('/users/me/settings', data);
  },

  // 修改密码
  changePassword: (oldPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    return apiClient.put('/users/me/password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  // 数据迁移
  migrate: (data: MigrationData): Promise<ApiResponse<any>> => {
    return apiClient.post('/users/me/migrate', data);
  },
};


