import { useState, useCallback } from 'react';
import { userApi } from '../api';

export const useMigration = () => {
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);

  const checkNeedMigration = useCallback(() => {
    // 检查是否有 localStorage 数据
    const hasOldData = localStorage.getItem('mentalGame:v2:profile') !== null;
    const hasMigrated = localStorage.getItem('data_migrated') === 'true';
    
    return hasOldData && !hasMigrated;
  }, []);

  const migrate = useCallback(async () => {
    if (!checkNeedMigration()) return;

    setMigrating(true);

    try {
      // 收集 localStorage 数据
      const profile = JSON.parse(localStorage.getItem('mentalGame:v2:profile') || '{}');
      const progress = JSON.parse(localStorage.getItem('mentalGame:v2:progress') || '[]');
      const stats = JSON.parse(localStorage.getItem('mentalGame:v2:stats') || '{}');
      const settings = JSON.parse(localStorage.getItem('mentalGame:v2:settings') || '{}');

      // 提交到服务器
      const response = await userApi.migrate({
        profile,
        progress,
        stats,
        settings,
      });

      console.log('数据迁移成功', response);

      // 标记已迁移
      localStorage.setItem('data_migrated', 'true');
      setMigrated(true);
    } catch (error) {
      console.error('数据迁移失败', error);
      throw error;
    } finally {
      setMigrating(false);
    }
  }, [checkNeedMigration]);

  return {
    needMigration: checkNeedMigration(),
    migrating,
    migrated,
    migrate,
  };
};


