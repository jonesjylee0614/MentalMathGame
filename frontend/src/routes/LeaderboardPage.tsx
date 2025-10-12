import { useState, useEffect } from 'react';
import { leaderboardApi } from '../api';
import styles from '../styles/LeaderboardPage.module.css';

export const LeaderboardPage = () => {
  const [type, setType] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [rankType, setRankType] = useState<'total_score' | 'level' | 'victory_count'>('total_score');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [type, rankType]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'global') {
        response = await leaderboardApi.getGlobalLeaderboard({ type: rankType, limit: 50 });
      } else if (type === 'weekly') {
        response = await leaderboardApi.getWeeklyLeaderboard({ limit: 50 });
      } else {
        response = await leaderboardApi.getMonthlyLeaderboard({ limit: 50 });
      }
      setData(response.data);
    } catch (error) {
      console.error('获取排行榜失败', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>排行榜</h1>

        <div className={styles.tabs}>
          <button 
            className={type === 'global' ? styles.active : ''}
            onClick={() => setType('global')}
          >
            全球排行
          </button>
          <button 
            className={type === 'weekly' ? styles.active : ''}
            onClick={() => setType('weekly')}
          >
            周排行
          </button>
          <button 
            className={type === 'monthly' ? styles.active : ''}
            onClick={() => setType('monthly')}
          >
            月排行
          </button>
        </div>

        {type === 'global' && (
          <div className={styles.filters}>
            <select value={rankType} onChange={(e) => setRankType(e.target.value as any)}>
              <option value="total_score">总积分</option>
              <option value="level">等级</option>
              <option value="victory_count">胜利次数</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : data ? (
          <>
            <div className={styles.list}>
              {data.ranking?.map((item: any) => (
                <div key={item.rank} className={styles.item}>
                  <div className={styles.rank}>
                    {item.rank <= 3 ? (
                      <span className={styles[`medal${item.rank}`]}>🏆</span>
                    ) : (
                      item.rank
                    )}
                  </div>
                  <div className={styles.user}>
                    <img src={item.user.avatar_url || '/favicon.svg'} alt="" />
                    <span>{item.user.nickname}</span>
                  </div>
                  <div className={styles.score}>
                    {item.score || item.weekly_score || item.monthly_score}
                  </div>
                </div>
              ))}
            </div>

            {data.my_rank && (
              <div className={styles.myRank}>
                <h3>我的排名</h3>
                <div className={styles.item}>
                  <div className={styles.rank}>{data.my_rank.rank}</div>
                  <div className={styles.score}>
                    {data.my_rank.score || data.my_rank.weekly_score || data.my_rank.monthly_score}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>暂无数据</div>
        )}
      </div>
    </div>
  );
};


