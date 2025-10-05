import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { LEVELS, findLevel } from '../lib/levels';
import { formatDate } from '../lib/utils';
import styles from '../styles/HomePage.module.css';

export const HomePage = () => {
  const navigate = useNavigate();
  const { profile, stats, progress } = useGame();

  const lastPlayed = useMemo(() => {
    if (!progress.length) return null;
    return [...progress].sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0))[0];
  }, [progress]);

  const bestScore = useMemo(() => {
    if (!progress.length) return null;
    return [...progress].sort((a, b) => b.bestScore - a.bestScore)[0];
  }, [progress]);

  const lastLevel = lastPlayed ? findLevel(lastPlayed.levelId) : null;

  return (
    <div className="fade-in">
      <section className={`glass-card ${styles.hero}`}>
        <div>
          <p className={styles.welcome}>你好，{profile.name}</p>
          <h2>累计积分 {stats.totalScore}</h2>
          <p>
            共完成 <strong>{stats.totalPlays}</strong> 场挑战，最佳连击 <strong>{stats.bestCombo}</strong>。
          </p>
          <div className={styles.actions}>
            <button className="btn" onClick={() => navigate('/levels')}>
              🚀 开始挑战
            </button>
            {lastLevel && (
              <button className="btn secondary" onClick={() => navigate(`/play/${lastLevel.id}`)}>
                继续 {lastLevel.name}
              </button>
            )}
            <button className="btn secondary" onClick={() => navigate('/stats')}>
              查看统计
            </button>
          </div>
        </div>
        <div className={styles.badges}>
          <div>
            <span className="tag">创建于</span>
            <p>{formatDate(profile.createdAt)}</p>
          </div>
          {bestScore ? (
            <div>
              <span className="tag">最高分</span>
              <p>
                {bestScore.bestScore} 分 @ {bestScore.levelId}
              </p>
            </div>
          ) : (
            <div>
              <span className="tag">新冒险者</span>
              <p>快去挑战第一个关卡吧！</p>
            </div>
          )}
        </div>
      </section>

      <section className="glass-card">
        <div className={styles.sectionHeader}>
          <h3>🔥 热门推荐</h3>
          <p>根据难度与玩法精选</p>
        </div>
        <div className={styles.levelList}>
          {LEVELS.slice(0, 6).map((level) => (
            <button key={level.id} className={styles.levelItem} onClick={() => navigate(`/play/${level.id}`)}>
              <div>
                <h4>{level.name}</h4>
                <p>{level.desc}</p>
              </div>
              <div className={styles.levelMeta}>
                <span>题量 {level.count}</span>
                <span>时限 {level.timeSec}s</span>
                <span>难度 {level.difficulty.toFixed(1)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {lastPlayed && lastLevel && (
        <section className="glass-card">
          <div className={styles.sectionHeader}>
            <h3>🕒 最近挑战</h3>
            <p>上次征战 {formatDate(lastPlayed.lastPlayedAt)}</p>
          </div>
          <div className={styles.recentCard}>
            <div>
              <h4>{lastLevel.name}</h4>
              <p>{lastLevel.desc}</p>
            </div>
            <div className={styles.recentMeta}>
              <span>最佳成绩 {lastPlayed.bestScore}</span>
              <span>最佳时间 {lastPlayed.bestTimeSec}s</span>
              <span>正确率 {(lastPlayed.bestAccuracy * 100).toFixed(0)}%</span>
            </div>
            <button className="btn" onClick={() => navigate(`/play/${lastLevel.id}`)}>
              立即重战
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
