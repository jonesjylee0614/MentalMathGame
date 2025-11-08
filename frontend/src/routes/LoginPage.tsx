import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { persistentLogger } from '../lib/persistentLogger';
import styles from '../styles/LoginPage.module.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    persistentLogger.info('=== 登录表单提交 ===', { username });
    
    setError('');
    setLoading(true);

    try {
      persistentLogger.info('调用login函数', { username });
      await login({ username, password });
      persistentLogger.info('login函数执行成功，准备跳转');
      
      persistentLogger.info('开始导航到首页');
      navigate('/');
      persistentLogger.info('navigate函数已调用');
    } catch (err: any) {
      persistentLogger.error('登录过程中捕获错误', { 
        error: err.message || err,
        errorType: err.constructor?.name 
      });
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
      persistentLogger.info('登录流程结束（finally块）', { 
        hasError: !!error 
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>登录</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.field}>
            <label htmlFor="username">用户名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            还没有账号？ <Link to="/register">立即注册</Link>
          </p>
          <p>
            <Link to="/" className={styles.guestLink}>
              游客模式（离线体验）
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};


