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
        <div className={styles.heroMain}>
          <div>
            <p className={styles.welcome}>你好，{profile.name}</p>
            <h2>累计积分 {stats.totalScore}</h2>
            <p>
              共完成 <strong>{stats.totalPlays}</strong> 场挑战，最佳连击 <strong>{stats.bestCombo}</strong>。
            </p>
          </div>

          <div className={styles.heroSummary}>
            <div className={styles.progressBlock}>
              <div className={styles.progressHeader}>
                <span>关卡探索进度</span>
                <strong>
                  {LEVELS.length ? Math.round((Math.min(progress.length, LEVELS.length) / LEVELS.length) * 100) : 0}%
                </strong>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${LEVELS.length ? (Math.min(progress.length, LEVELS.length) / LEVELS.length) * 100 : 0}%`
                  }}
                />
              </div>
              <p className={styles.progressHint}>
                已解锁 <strong>{progress.length}</strong> / {LEVELS.length} 个关卡
              </p>
            </div>
            <div className={styles.statHighlights}>
              <div className={styles.statChip}>
                <span>平均正确率</span>
                <strong>
                  {stats.totalCorrect + stats.totalWrong
                    ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100)
                    : 0}
                  %
                </strong>
              </div>
              <div className={styles.statChip}>
                <span>总答题数</span>
                <strong>{stats.totalCorrect + stats.totalWrong}</strong>
              </div>
              <div className={styles.statChip}>
                <span>累计时长</span>
                <strong>{Math.round(stats.totalTimeSec / 60)} 分钟</strong>
              </div>
            </div>
          </div>

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
        <div className={styles.heroAside}>
          <div className={styles.badgeCard}>
            <span className="tag">加入勇者团</span>
            <p className={styles.badgeValue}>{formatDate(profile.createdAt)}</p>
            <small>保持每日训练，打造最强心算力！</small>
          </div>
          {bestScore ? (
            <div className={styles.badgeCard}>
              <span className="tag">最高得分记录</span>
              <p className={styles.badgeValue}>{bestScore.bestScore} 分</p>
              <small>来自关卡 {bestScore.levelId}</small>
            </div>
          ) : (
            <div className={styles.badgeCard}>
              <span className="tag">新冒险者</span>
              <p className={styles.badgeValue}>探索从现在开始</p>
              <small>试试基础关卡热热身 🔥</small>
            </div>
          )}
          {lastLevel ? (
            <div className={`${styles.badgeCard} ${styles.nextChallenge}`}>
              <span className="tag">下一个目标</span>
              <p className={styles.badgeValue}>{lastLevel.name}</p>
              <small>{lastLevel.desc}</small>
            </div>
          ) : (
            <div className={`${styles.badgeCard} ${styles.nextChallenge}`}>
              <span className="tag">今日建议</span>
              <p className={styles.badgeValue}>完成首个挑战</p>
              <small>任选一个关卡开启旅程 ✨</small>
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
