import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import styles from '../../styles/gameModes/CollectionMode.module.css';

/**
 * 收集模式组件
 */
export const CollectionModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  snapshot,
  question,
  feedback
}) => {
  const {
    theme,
    themeConfig,
    basket,
    targetCount,
    collectingItem,
    droppingItem,
    showSuccess,
    showError
  } = state.data;

  const collectedCount = basket?.length || 0;
  const progressPercent = targetCount > 0
    ? Math.round((collectedCount / targetCount) * 100)
    : 0;

  return (
    <div
      className={styles.collectionScene}
      style={{ background: themeConfig?.background }}
    >
      {/* 主题标题 */}
      <div className={styles.themeTitle}>
        <span className={styles.themeName}>{themeConfig?.name}</span>
      </div>

      {/* 收集区域 */}
      <div className={styles.collectionArea}>
        {/* 容器（篮子/矿车/水桶） */}
        <div className={styles.container}>
          <div className={styles.containerIcon}>
            {themeConfig?.container}
          </div>
          <div className={styles.containerLabel}>
            {themeConfig?.containerName}
          </div>

          {/* 已收集的物品 */}
          <div className={styles.itemsGrid}>
            {basket?.map((item: any, index: number) => (
              <div
                key={item.id}
                className={styles.collectedItem}
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {item.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* 物品收集动画 */}
        {collectingItem && (
          <div className={styles.collectingItem}>
            {collectingItem}
          </div>
        )}

        {/* 物品掉落动画 */}
        {droppingItem && (
          <div className={styles.droppingItem}>
            {droppingItem}
          </div>
        )}
      </div>

      {/* 进度显示 */}
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={styles.progressText}>
          {collectedCount} / {targetCount}
          <span className={styles.progressPercent}>({progressPercent}%)</span>
        </div>
      </div>

      {/* 反馈提示 */}
      {showSuccess && (
        <div className={`${styles.feedback} ${styles.success}`}>
          <div className={styles.feedbackIcon}>✅</div>
          <div className={styles.feedbackText}>太棒了！收集成功！</div>
        </div>
      )}

      {showError && (
        <div className={`${styles.feedback} ${styles.error}`}>
          <div className={styles.feedbackIcon}>❌</div>
          <div className={styles.feedbackText}>
            {basket?.length > 0 ? '哎呀！掉出一个！' : '答错了，再想想！'}
          </div>
        </div>
      )}

      {/* 物品展示区（显示可收集的物品类型） */}
      <div className={styles.itemShowcase}>
        <div className={styles.showcaseLabel}>可收集物品：</div>
        <div className={styles.showcaseItems}>
          {themeConfig?.items?.map((item: string, index: number) => (
            <span key={index} className={styles.showcaseItem}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

