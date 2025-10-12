import { useState } from 'react';
import { useMigration } from '../hooks/useMigration';
import styles from '../styles/MigrationPrompt.module.css';

export const MigrationPrompt = () => {
  const { needMigration, migrating, migrated, migrate } = useMigration();
  const [dismissed, setDismissed] = useState(false);

  if (!needMigration || dismissed || migrated) return null;

  const handleMigrate = async () => {
    try {
      await migrate();
      alert('数据迁移成功！');
    } catch (error) {
      alert('数据迁移失败，请稍后重试');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>检测到本地数据</h2>
        <p>您之前在本地保存了游戏数据，是否要同步到云端？</p>
        <p className={styles.note}>
          同步后，您可以在任何设备上继续游戏。
        </p>
        <div className={styles.actions}>
          <button onClick={handleMigrate} disabled={migrating}>
            {migrating ? '同步中...' : '立即同步'}
          </button>
          <button onClick={() => setDismissed(true)} className={styles.secondary}>
            稍后再说
          </button>
        </div>
      </div>
    </div>
  );
};


