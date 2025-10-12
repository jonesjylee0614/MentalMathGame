import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api';
import styles from '../styles/ProfilePage.module.css';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await userApi.updateMe({ nickname });
      updateUser(response.data);
      setSuccess('更新成功');
      setEditing(false);
    } catch (err: any) {
      setError(err.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className={styles.container}>加载中...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>个人中心</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.info}>
          <div className={styles.avatar}>
            <img src={user.avatar_url || '/favicon.svg'} alt="头像" />
          </div>

          <div className={styles.details}>
            <div className={styles.field}>
              <label>用户名</label>
              <div>{user.username}</div>
            </div>

            <div className={styles.field}>
              <label>昵称</label>
              {editing ? (
                <input 
                  type="text" 
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)}
                />
              ) : (
                <div>{user.nickname}</div>
              )}
            </div>

            <div className={styles.field}>
              <label>邮箱</label>
              <div>{user.email}</div>
            </div>

            <div className={styles.field}>
              <label>等级</label>
              <div>Lv.{user.level} ({user.experience} EXP)</div>
            </div>

            <div className={styles.field}>
              <label>角色</label>
              <div>{user.role === 'student' ? '学生' : user.role}</div>
            </div>

            <div className={styles.field}>
              <label>注册时间</label>
              <div>{new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          {editing ? (
            <>
              <button onClick={handleSave} disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </button>
              <button onClick={() => setEditing(false)} className={styles.cancel}>
                取消
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}>编辑资料</button>
          )}
        </div>
      </div>
    </div>
  );
};


