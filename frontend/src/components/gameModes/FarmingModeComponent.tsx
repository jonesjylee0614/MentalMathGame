import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import { GROWTH_STAGES } from '../../lib/gameModes/modes/FarmingMode';
import styles from '../../styles/gameModes/FarmingMode.module.css';

/**
 * 种植模式组件
 * 显示花园、植物生长、浇水动画等视觉效果
 */
export const FarmingModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  snapshot,
  question,
  feedback
}) => {
  const { 
    plants,
    gardenType,
    currentGrowthStage,
    isWatering,
    hasBug,
    bugPosition,
    isComplete,
    successMsg,
    bugMsg,
    completionMsg,
    waterDrops,
    correctCount,
    totalQuestions,
  } = state.data;

  // 计算整体进度
  const overallProgress = totalQuestions > 0 
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0;

  return (
    <div className={styles.farmingScene}>
      {/* 花园背景 */}
      <div className={`${styles.garden} ${styles[gardenType]} ${isComplete ? styles.complete : ''}`}>
        {/* 太阳/天气效果 */}
        <div className={styles.sky}>
          <div className={`${styles.sun} ${isWatering ? styles.shining : ''}`}>☀️</div>
          {isWatering && (
            <div className={styles.rainCloud}>☁️</div>
          )}
        </div>

        {/* 植物区域 */}
        <div className={styles.plantsContainer}>
          {plants?.map((plant: any) => {
            const stage = GROWTH_STAGES[plant.growthStage] || GROWTH_STAGES[0];
            
            return (
              <div
                key={plant.id}
                className={`${styles.plantWrapper} ${plant.isActive ? styles.active : ''}`}
                style={{
                  left: `${plant.position.x}%`,
                  top: `${plant.position.y}%`,
                }}
              >
                {/* 植物本体 */}
                <div 
                  className={`${styles.plant} ${isWatering && plant.isActive ? styles.growing : ''}`}
                  style={{
                    filter: `drop-shadow(0 2px 4px ${stage.color}40)`,
                  }}
                >
                  <div className={styles.plantEmoji}>
                    {stage.emoji}
                  </div>
                </div>

                {/* 生长阶段标签 */}
                {plant.isActive && (
                  <div className={styles.stageName}>
                    {stage.name}
                  </div>
                )}

                {/* 激活指示器 */}
                {plant.isActive && (
                  <div className={styles.activeIndicator}>
                    <div className={styles.pulseRing}></div>
                  </div>
                )}

                {/* 土壤 */}
                <div className={styles.soil}></div>
              </div>
            );
          })}
        </div>

        {/* 浇水效果 */}
        {isWatering && waterDrops && (
          <div className={styles.wateringEffect}>
            {waterDrops.map((drop: any) => (
              <div
                key={drop.id}
                className={styles.waterDrop}
                style={{
                  left: `${drop.x}%`,
                  top: `${drop.y}%`,
                  animationDelay: `${drop.delay}s`,
                }}
              >
                💧
              </div>
            ))}
          </div>
        )}

        {/* 害虫动画 */}
        {hasBug && (
          <div
            className={styles.bug}
            style={{
              left: `${bugPosition.x}%`,
              top: `${bugPosition.y}%`,
            }}
          >
            🐛
          </div>
        )}

        {/* 完成时的特效 */}
        {isComplete && (
          <div className={styles.celebrationEffect}>
            <div className={styles.butterflies}>
              <span className={styles.butterfly} style={{ animationDelay: '0s' }}>🦋</span>
              <span className={styles.butterfly} style={{ animationDelay: '0.3s' }}>🦋</span>
              <span className={styles.butterfly} style={{ animationDelay: '0.6s' }}>🦋</span>
            </div>
            <div className={styles.sparkles}>
              <span>✨</span>
              <span>✨</span>
              <span>✨</span>
              <span>✨</span>
            </div>
          </div>
        )}
      </div>

      {/* 花园信息面板 */}
      <div className={styles.infoPanel}>
        {/* 整体进度 */}
        <div className={styles.overallProgress}>
          <div className={styles.progressLabel}>
            🌱 花园进度
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${overallProgress}%`,
                background: `linear-gradient(90deg, #90EE90, ${GROWTH_STAGES[Math.min(4, currentGrowthStage)].color})`,
              }}
            >
              <span className={styles.progressText}>{overallProgress}%</span>
            </div>
          </div>
        </div>

        {/* 植物计数 */}
        <div className={styles.plantsInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🌺</span>
            <span className={styles.infoText}>
              {plants?.filter((p: any) => p.growthStage >= GROWTH_STAGES.length - 1).length} / {plants?.length}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>💧</span>
            <span className={styles.infoText}>
              {correctCount} 次浇水
            </span>
          </div>
        </div>
      </div>

      {/* 成功消息 */}
      {successMsg && !isComplete && (
        <div className={`${styles.successMessage} ${styles.fadeIn}`}>
          {successMsg}
        </div>
      )}

      {/* 害虫消息 */}
      {bugMsg && (
        <div className={`${styles.bugMessage} ${styles.shake}`}>
          {bugMsg}
        </div>
      )}

      {/* 完成横幅 */}
      {isComplete && completionMsg && (
        <div className={`${styles.completionBanner} ${styles.celebrate}`}>
          <div className={styles.bannerContent}>
            {completionMsg}
          </div>
          <div className={styles.gardenStats}>
            <div>🌺 {plants?.length} 朵花盛开</div>
            <div>💧 浇水 {correctCount} 次</div>
          </div>
        </div>
      )}

      {/* 答题反馈 */}
      {feedback && !isComplete && (
        <div className={`${styles.feedback} ${feedback.correct ? styles.correct : styles.wrong}`}>
          {feedback.correct ? '✅ 太棒了！' : `❌ 错了，答案是 ${feedback.expected}`}
        </div>
      )}
    </div>
  );
};
