import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// 创建 Axios 实例
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理响应和错误
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // 转换为统一格式：{ success, data, message }
    const apiResponse = response.data;
    console.log('✅ API响应:', apiResponse);
    
    // 后端成功响应code可能是0或200
    const isSuccess = apiResponse.code === 0 || apiResponse.code === 200;
    
    return {
      success: isSuccess,
      data: apiResponse.data,
      message: apiResponse.message || '',
    };
  },
  (error: AxiosError<ApiErrorResponse>) => {
    console.error('❌ API错误:', error);
    
    // Token 过期，跳转登录
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    
    // 网络错误（无响应）
    if (!error.response) {
      console.error('❌ 网络错误：无法连接到服务器');
      return Promise.reject(new Error('无法连接到服务器，请检查网络或后端服务'));
    }
    
    // 其他错误统一处理
    const message = error.response?.data?.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

// 后端API响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 前端统一响应类型
export interface UnifiedResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  code: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: number;
}

export default apiClient;


