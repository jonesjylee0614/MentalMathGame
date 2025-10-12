import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, userApi, type User, type LoginRequest, type RegisterRequest } from '../api';

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
    const token = localStorage.getItem('auth_token');
    if (token) {
      // 验证 Token 并获取用户信息
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // 获取用户信息
  const fetchUser = async () => {
    try {
      const response = await userApi.getMe();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
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
      const response = await authApi.login(credentials);
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
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
      await authApi.logout();
    } catch (error) {
      console.error('登出失败', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
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


