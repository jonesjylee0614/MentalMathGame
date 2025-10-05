import { CSSProperties, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { findLevel } from '../lib/levels';
import { formatPercent } from '../lib/utils';
import styles from '../styles/ResultPage.module.css';

export const ResultPage = () => {
  const navigate = useNavigate();
  const { lastResult } = useGame();
  const level = useMemo(() => (lastResult?.levelId ? findLevel(lastResult.levelId) : null), [lastResult?.levelId]);

  if (!lastResult) {
    return (
      <div className="glass-card">
        <p>暂无战斗结果，请先完成一次挑战。</p>
        <button className="btn" onClick={() => navigate('/levels')}>
          去选择关卡
        </button>
      </div>
    );
  }

  const isVictory = lastResult.outcome === 'victory';
  const isDefeat = lastResult.outcome === 'defeat' || lastResult.outcome === 'timeout';
  const answered = lastResult.history?.length ?? lastResult.total;
  const progressPercent = lastResult.total > 0 ? Math.round((answered / lastResult.total) * 100) : 0;

  const progressStyle = { '--progress': `${progressPercent}%` } as CSSProperties;

  const mood = (() => {
    if (isVictory) {
      return {
        icon: '🏆',
        title: '胜利啦！',
        subtitle: '太棒了！你成功击败了算术怪兽！',
        encouragement: '保持热度，继续挑战更高难度吧！'
      };
    }

    const accuracyValue = lastResult.total > 0 ? lastResult.correct / lastResult.total : 0;
    let subtitle = '被怪兽压制了，不过战斗经验+1！';
    if (lastResult.outcome === 'timeout') {
      subtitle = '时间耗尽了，不过你离胜利只差一点！';
    }
    if (accuracyValue === 0) {
      subtitle = '别灰心，先熟悉题型，再来复仇！';
    }

    let encouragement = '加油！再战一次你一定能击败算术怪兽！';
    if (accuracyValue >= 0.7) {
      encouragement = '只差一点点，再坚持几题就能赢！';
    } else if (accuracyValue >= 0.4) {
      encouragement = '已经掌握一半了，调匀节奏继续冲！';
    }

    return {
      icon: '😢',
      title: '挑战失败',
      subtitle,
      encouragement
    };
  })();

  return (
    <div className={`fade-in ${styles.wrapper}`}>
      <section className={`glass-card ${styles.board} ${isVictory ? styles.victory : ''} ${isDefeat ? styles.defeat : ''}`}>
        <header className={styles.moodSection}>
          <div className={styles.moodIcon}>{mood.icon}</div>
          <div>
            <h2 className={styles.moodTitle}>{mood.title}</h2>
            <p className={styles.moodSubtitle}>{mood.subtitle}</p>
          </div>
        </header>

        <p className={styles.encouragement}>{mood.encouragement}</p>

        <div className={styles.scoreCard}>
          <div className={styles.levelBadge}>{level?.name ?? lastResult.levelName ?? '挑战结果'}</div>
          <div className={styles.statGrid}>
            <div>
              <span className={styles.statLabel}>得分</span>
              <strong className={styles.statValue}>{lastResult.score}</strong>
            </div>
            <div>
              <span className={styles.statLabel}>正确率</span>
              <strong className={styles.statValue}>{formatPercent(lastResult.accuracy)}</strong>
            </div>
            <div>
              <span className={styles.statLabel}>最高连击</span>
              <strong className={styles.statValue}>{lastResult.comboMax}</strong>
            </div>
            <div>
              <span className={styles.statLabel}>用时</span>
              <strong className={styles.statValue}>{lastResult.timeUsed}s</strong>
            </div>
          </div>
          <div className={styles.progressCard}>
            <div className={styles.progressInfo}>
              <span>进度</span>
              <strong>
                {answered}/{lastResult.total}
              </strong>
            </div>
            <div className={styles.progressTrack} style={progressStyle}>
              <div className={styles.progressFill} />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className="btn" onClick={() => navigate(`/play/${lastResult.levelId}`)}>
            🔁 再战一次
          </button>
          <button className="btn secondary" onClick={() => navigate('/levels')}>
            🎯 选择新关卡
          </button>
          <button className="btn secondary" onClick={() => navigate('/')}>🏠 返回首页</button>
        </div>
      </section>
    </div>
  );
};
