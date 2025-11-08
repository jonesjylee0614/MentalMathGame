import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, userApi, type User, type LoginRequest, type RegisterRequest } from '../api';
import { persistentLogger } from '../lib/persistentLogger';

interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：检查是否已登录
  useEffect(() => {
    persistentLogger.info('AuthContext初始化');
    const token = localStorage.getItem('auth_token');
    if (token) {
      persistentLogger.info('发现已存储的token，尝试获取用户信息', { tokenPrefix: token.substring(0, 20) + '...' });
      // 验证 Token 并获取用户信息
      fetchUser();
    } else {
      persistentLogger.info('未发现token，跳过自动登录');
      setLoading(false);
    }
  }, []);

  // 获取用户信息
  const fetchUser = async () => {
    try {
      persistentLogger.info('开始获取用户信息');
      const response = await userApi.getMe();
      persistentLogger.info('获取用户信息成功', { 
        user: { 
          id: response.data.id, 
          username: response.data.username,
          nickname: response.data.nickname 
        } 
      });
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error: any) {
      persistentLogger.error('获取用户信息失败', { error: error.message || error });
      console.error('获取用户信息失败', error);
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      persistentLogger.info('开始登录', { username: credentials.username });
      
      const response = await authApi.login(credentials);
      persistentLogger.info('登录API调用成功，收到响应', { 
        responseStructure: {
          hasData: !!response.data,
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user,
          tokenLength: response.data?.token?.length
        }
      });
      
      if (!response.data || !response.data.token) {
        persistentLogger.error('登录响应格式错误：缺少token', { response });
        throw new Error('登录响应格式错误');
      }
      
      persistentLogger.info('保存token到localStorage', {
        tokenPrefix: response.data.token.substring(0, 20) + '...'
      });
      localStorage.setItem('auth_token', response.data.token);
      
      persistentLogger.info('设置用户信息到状态', { 
        user: {
          id: response.data.user.id,
          username: response.data.user.username,
          nickname: response.data.user.nickname
        }
      });
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      persistentLogger.info('登录流程完成，状态已更新');
    } catch (error: any) {
      persistentLogger.error('登录失败', { 
        error: error.message || error,
        errorType: error.constructor?.name,
        errorStack: error.stack
      });
      throw error;
    }
  }, []);

  // 注册
  const register = useCallback(async (data: RegisterRequest) => {
    try {
      await authApi.register(data);
      // 注册成功后自动登录
      await login({
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      throw error;
    }
  }, [login]);

  // 登出
  const logout = useCallback(async () => {
    try {
      persistentLogger.info('开始登出');
      await authApi.logout();
      persistentLogger.info('登出API调用成功');
    } catch (error: any) {
      persistentLogger.error('登出失败', { error: error.message || error });
      console.error('登出失败', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      persistentLogger.info('登出完成，已清除本地状态');
    }
  }, []);

  // 更新用户信息
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
    }),
    [isAuthenticated, user, loading, login, register, logout, updateUser, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


