import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import styles from '../../styles/gameModes/PuzzleMode.module.css';

/**
 * 解密模式组件
 * 显示拼图揭示、解锁、宝箱打开等视觉效果
 */
export const PuzzleModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  snapshot,
  question,
  feedback
}) => {
  const { 
    revealProgress, 
    puzzleType, 
    isRevealing,
    isComplete,
    successMsg,
    completionMsg,
    lockLayers,
    puzzlePieces,
    chestOpenness
  } = state.data;

  // 渲染不同类型的解密场景
  const renderPuzzleContent = () => {
    switch (puzzleType) {
      case 'lock':
        return renderLockMode();
      case 'chest':
        return renderChestMode();
      case 'image':
      default:
        return renderImageMode();
    }
  };

  // 图片揭示模式
  const renderImageMode = () => {
    const opacity = 1 - (revealProgress / 100);
    
    return (
      <div className={styles.imageContainer}>
        {/* 目标图片（背景） */}
        <div className={styles.targetImage}>
          <div className={styles.mysteryImage}>
            🖼️
          </div>
        </div>

        {/* 模糊遮罩（逐渐消失） */}
        <div 
          className={`${styles.blurOverlay} ${isComplete ? styles.complete : ''}`}
          style={{ 
            opacity: opacity,
            filter: `blur(${opacity * 20}px)`
          }}
        >
          <div className={styles.questionMark}>❓</div>
        </div>

        {/* 拼图网格 */}
        <div className={styles.puzzleGrid}>
          {puzzlePieces?.map((piece: any) => (
            <div
              key={piece.id}
              className={`${styles.puzzlePiece} ${piece.revealed ? styles.revealed : styles.hidden}`}
            >
              {piece.revealed && <span className={styles.pieceIcon}>✨</span>}
            </div>
          ))}
        </div>

        {/* 进度条 */}
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            解密进度
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${revealProgress}%` }}
            >
              <span className={styles.progressText}>{Math.round(revealProgress)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 解锁模式
  const renderLockMode = () => {
    return (
      <div className={styles.lockContainer}>
        {/* 锁的主体 */}
        <div className={`${styles.lockBody} ${isComplete ? styles.unlocked : ''}`}>
          <div className={styles.lockIcon}>
            {isComplete ? '🔓' : '🔒'}
          </div>
          
          {/* 锁的层级 */}
          <div className={styles.lockLayers}>
            {lockLayers?.map((layer: any, index: number) => (
              <div
                key={layer.id}
                className={`${styles.lockLayer} ${layer.unlocked ? styles.unlocked : styles.locked}`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  zIndex: lockLayers.length - index
                }}
              >
                <div className={styles.layerNumber}>{layer.id}</div>
                {layer.unlocked && (
                  <div className={styles.unlockEffect}>✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 进度显示 */}
        <div className={styles.lockProgress}>
          <div className={styles.lockProgressText}>
            已解锁: {lockLayers?.filter((l: any) => l.unlocked).length} / {lockLayers?.length}
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${revealProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // 宝箱模式
  const renderChestMode = () => {
    const rotation = (chestOpenness / 100) * 45; // 最多旋转45度
    
    return (
      <div className={styles.chestContainer}>
        {/* 宝箱 */}
        <div className={`${styles.chest} ${isComplete ? styles.open : ''}`}>
          {/* 宝箱盖子 */}
          <div 
            className={styles.chestLid}
            style={{ 
              transform: `rotateX(-${rotation}deg)`,
            }}
          >
            <div className={styles.chestTop}>📦</div>
          </div>
          
          {/* 宝箱底部 */}
          <div className={styles.chestBase}>
            {isComplete && (
              <div className={styles.treasure}>
                💎✨🏆
              </div>
            )}
          </div>

          {/* 光芒效果 */}
          {chestOpenness > 30 && (
            <div 
              className={styles.chestGlow}
              style={{ opacity: chestOpenness / 100 }}
            />
          )}
        </div>

        {/* 开启进度 */}
        <div className={styles.chestProgress}>
          <div className={styles.chestProgressLabel}>
            开启进度
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${chestOpenness}%` }}
            >
              <span className={styles.progressText}>{Math.round(chestOpenness)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.puzzleScene}>
      {/* 解密内容区域 */}
      <div className={`${styles.puzzleContent} ${isRevealing ? styles.revealing : ''}`}>
        {renderPuzzleContent()}
      </div>

      {/* 成功消息 */}
      {successMsg && !isComplete && (
        <div className={`${styles.successMessage} ${styles.fadeIn}`}>
          {successMsg}
        </div>
      )}

      {/* 完成横幅 */}
      {isComplete && completionMsg && (
        <div className={`${styles.completionBanner} ${styles.celebrate}`}>
          <div className={styles.bannerContent}>
            {completionMsg}
          </div>
          <div className={styles.fireworks}>
            <span>🎆</span>
            <span>🎇</span>
            <span>✨</span>
            <span>🌟</span>
          </div>
        </div>
      )}

      {/* 答题反馈 */}
      {feedback && !isComplete && (
        <div className={`${styles.feedback} ${feedback.correct ? styles.correct : styles.wrong}`}>
          {feedback.correct ? '✅ 正确！' : `❌ 错误，正确答案是 ${feedback.expected}`}
        </div>
      )}
    </div>
  );
};

