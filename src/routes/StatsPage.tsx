import { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { findLevel } from '../lib/levels';
import { formatPercent, formatTime } from '../lib/utils';
import styles from '../styles/StatsPage.module.css';

export const StatsPage = () => {
  const { stats, progress } = useGame();

  const totalAccuracy = useMemo(() => {
    const total = stats.totalCorrect + stats.totalWrong;
    return total === 0 ? '—' : formatPercent(stats.totalCorrect / total);
  }, [stats]);

  const topLevels = useMemo(() => {
    return [...progress].sort((a, b) => b.bestScore - a.bestScore).slice(0, 5);
  }, [progress]);

  return (
    <div className="fade-in">
      <section className={`glass-card ${styles.summary}`}> 
        <div>
          <h3>累计积分</h3>
          <p className={styles.value}>{stats.totalScore}</p>
          <span>完成 {stats.totalPlays} 场挑战</span>
        </div>
        <div>
          <h3>正确率</h3>
          <p className={styles.value}>{totalAccuracy}</p>
          <span>
            正确 {stats.totalCorrect} ｜ 错误 {stats.totalWrong}
          </span>
        </div>
        <div>
          <h3>累计用时</h3>
          <p className={styles.value}>{formatTime(stats.totalTimeSec)}</p>
          <span>最佳连击 {stats.bestCombo}</span>
        </div>
      </section>

      <section className="glass-card">
        <header className={styles.sectionHeader}>
          <h3>🏆 最高分关卡</h3>
          <p>看看你征服了哪些战场</p>
        </header>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.head}`}>
            <span>关卡</span>
            <span>最佳成绩</span>
            <span>最佳时间</span>
            <span>正确率</span>
            <span>战斗记录</span>
          </div>
          {topLevels.length ? (
            topLevels.map((entry) => {
              const level = findLevel(entry.levelId);
              return (
                <div key={entry.levelId} className={styles.row}>
                  <span>{level?.name ?? entry.levelId}</span>
                  <span>{entry.bestScore}</span>
                  <span>{entry.bestTimeSec}s</span>
                  <span>{formatPercent(entry.bestAccuracy)}</span>
                  <span>{entry.playCount} 次</span>
                </div>
              );
            })
          ) : (
            <div className={styles.empty}>暂无数据，先完成一次挑战吧！</div>
          )}
        </div>
      </section>
    </div>
  );
};
