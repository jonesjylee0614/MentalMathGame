import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import styles from '../../styles/gameModes/BuildingMode.module.css';

interface Block {
  id: string;
  type: 'block';
  emoji: string;
  level: number;
}

/**
 * 建造模式组件
 * 显示积木堆叠动画和建筑进度
 */
export const BuildingModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  snapshot,
  question,
  feedback
}) => {
  const { 
    blocks = [], 
    buildingHeight = 0, 
    targetHeight = 0, 
    buildingType = 'tower', 
    lastBlockShake = false,
    isComplete = false
  } = state.data;

  const progressPercent = targetHeight > 0 
    ? Math.round((buildingHeight / targetHeight) * 100) 
    : 0;

  // 建筑类型对应的emoji
  const buildingEmoji = {
    castle: '🏰',
    tower: '🏢',
    bridge: '🌉'
  }[buildingType as string] || '🏢';

  // 建筑类型名称
  const buildingName = {
    castle: '城堡',
    tower: '高楼',
    bridge: '桥梁'
  }[buildingType as string] || '建筑';

  return (
    <div className={styles.buildingScene}>
      {/* 目标建筑轮廓 */}
      <div className={styles.targetBuilding}>
        <div className={styles.targetIcon}>
          {buildingEmoji}
        </div>
        <div className={styles.targetLabel}>
          目标：{buildingName}
        </div>
      </div>

      {/* 进度指示 */}
      <div className={styles.buildingProgress}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ height: `${progressPercent}%` }}
          >
            {progressPercent > 0 && (
              <span className={styles.progressText}>{progressPercent}%</span>
            )}
          </div>
        </div>
        <div className={styles.progressLabel}>
          <span className={styles.progressCount}>
            {buildingHeight} / {targetHeight}
          </span>
          <span className={styles.progressDesc}>已建造</span>
        </div>
      </div>

      {/* 积木堆叠区 */}
      <div className={styles.blocksContainer}>
        <div className={styles.blockStack}>
          {(blocks as Block[]).map((block, index) => (
            <div
              key={block.id}
              className={`${styles.block} ${
                index === blocks.length - 1 && lastBlockShake ? styles.shake : ''
              }`}
              style={{
                bottom: `${index * 40}px`,
                animationDelay: `${index * 0.05}s`
              }}
            >
              {block.emoji}
            </div>
          ))}
        </div>
        
        {/* 地基 */}
        <div className={styles.foundation}>
          <div className={styles.ground}>━━━━━━━━━━━━</div>
        </div>
      </div>

      {/* 反馈动画 */}
      {feedback && (
        <div className={`${styles.feedback} ${feedback.correct ? styles.correct : styles.wrong}`}>
          {feedback.correct ? (
            <>
              <span className={styles.feedbackIcon}>✅</span>
              <span className={styles.feedbackText}>添加一层！</span>
            </>
          ) : (
            <>
              <span className={styles.feedbackIcon}>❌</span>
              <span className={styles.feedbackText}>再试一次！</span>
            </>
          )}
        </div>
      )}

      {/* 完成庆祝 */}
      {isComplete && (
        <div className={styles.completionOverlay}>
          <div className={styles.completionBanner}>
            <div className={styles.completionIcon}>🎉</div>
            <div className={styles.completionText}>
              {buildingName}建成！
            </div>
            <div className={styles.fireworks}>
              <span className={styles.firework}>✨</span>
              <span className={styles.firework}>🎆</span>
              <span className={styles.firework}>✨</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

