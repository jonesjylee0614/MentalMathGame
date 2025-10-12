import apiClient, { ApiResponse } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname: string;
}

export interface LoginResponse {
  token: string;
  expires_at: number;
  user: User;
}

export interface User {
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

export const authApi = {
  // 注册
  register: (data: RegisterRequest): Promise<ApiResponse<{ user_id: number }>> => {
    return apiClient.post('/auth/register', data);
  },

  // 登录
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post('/auth/login', data);
  },

  // 登出
  logout: (): Promise<ApiResponse<null>> => {
    return apiClient.post('/auth/logout');
  },

  // 刷新 Token
  refreshToken: (): Promise<ApiResponse<{ token: string; expires_at: number }>> => {
    return apiClient.post('/auth/refresh');
  },
};


