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

  return (
    <div className="fade-in">
      <section className={`glass-card ${styles.card}`}>
        <h2>{level?.name ?? lastResult.levelName ?? '挑战结果'}</h2>
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
