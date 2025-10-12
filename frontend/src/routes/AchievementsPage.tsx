import { useState, useEffect } from 'react';
import { statsApi } from '../api';
import styles from '../styles/AchievementsPage.module.css';

export const AchievementsPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await statsApi.getMyAchievements();
      setData(response.data);
    } catch (error) {
      console.error('获取成就失败', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = data?.achievements?.filter((achievement: any) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return achievement.completed;
    if (filter === 'incomplete') return !achievement.completed;
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>成就系统</h1>

        {data && (
          <div className={styles.summary}>
            <div className={styles.stat}>
              <div className={styles.value}>{data.completed_count}</div>
              <div className={styles.label}>已完成</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.value}>{data.total_achievements}</div>
              <div className={styles.label}>总计</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.value}>{Math.round(data.completion_rate * 100)}%</div>
              <div className={styles.label}>完成率</div>
            </div>
          </div>
        )}

        <div className={styles.filters}>
          <button 
            className={filter === 'all' ? styles.active : ''}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button 
            className={filter === 'completed' ? styles.active : ''}
            onClick={() => setFilter('completed')}
          >
            已完成
          </button>
          <button 
            className={filter === 'incomplete' ? styles.active : ''}
            onClick={() => setFilter('incomplete')}
          >
            未完成
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : filteredAchievements ? (
          <div className={styles.list}>
            {filteredAchievements.map((achievement: any) => (
              <div 
                key={achievement.id} 
                className={`${styles.achievement} ${achievement.completed ? styles.completed : ''}`}
              >
                <div className={styles.icon}>
                  {achievement.icon_url ? (
                    <img src={achievement.icon_url} alt={achievement.name} />
                  ) : (
                    '🏆'
                  )}
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{achievement.name}</div>
                  <div className={styles.description}>{achievement.description}</div>
                  <div className={styles.progress}>
                    <div className={styles.bar}>
                      <div 
                        className={styles.fill} 
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      />
                    </div>
                    <span>{achievement.progress} / {achievement.target}</span>
                  </div>
                </div>
                <div className={styles.reward}>
                  +{achievement.reward_exp} EXP
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>暂无成就数据</div>
        )}
      </div>
    </div>
  );
};


