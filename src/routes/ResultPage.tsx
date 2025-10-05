import { useMemo } from 'react';
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

  return (
    <div className="fade-in">
      <section className={`glass-card ${styles.card} ${isVictory ? styles.victory : ''} ${isDefeat ? styles.defeat : ''}`}>
        <div className={styles.resultHeader}>
          {isVictory && (
            <div className={styles.victoryBanner}>
              <div className={styles.trophy}>🏆</div>
              <h2 className={styles.victoryTitle}>胜利！</h2>
              <p className={styles.victorySubtitle}>太棒了！你成功击败了僵尸！</p>
            </div>
          )}
          {isDefeat && (
            <div className={styles.defeatBanner}>
              <div className={styles.defeatIcon}>😢</div>
              <h2 className={styles.defeatTitle}>失败了</h2>
              <p className={styles.defeatSubtitle}>
                {lastResult.outcome === 'timeout' ? '时间耗尽了，再接再厉！' : '被僵尸打败了，下次加油！'}
              </p>
            </div>
          )}
        </div>

        <h3 className={styles.levelName}>{level?.name ?? lastResult.levelName ?? '挑战结果'}</h3>

        <div className={styles.summary}>
          <div>
            <span className="tag">得分</span>
            <p>{lastResult.score}</p>
          </div>
          <div>
            <span className="tag">正确率</span>
            <p>{formatPercent(lastResult.accuracy)}</p>
          </div>
          <div>
            <span className="tag">连击</span>
            <p>{lastResult.comboMax}</p>
          </div>
          <div>
            <span className="tag">用时</span>
            <p>{lastResult.timeUsed}s</p>
          </div>
        </div>
        <div className={styles.actions}>
          <button className="btn" onClick={() => navigate(`/play/${lastResult.levelId}`)}>
            再战一次
          </button>
          <button className="btn secondary" onClick={() => navigate('/levels')}>
            选择新关卡
          </button>
        </div>
      </section>
    </div>
  );
};
