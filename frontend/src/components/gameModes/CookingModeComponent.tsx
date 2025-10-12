import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import styles from '../../styles/gameModes/CookingMode.module.css';

/**
 * 烹饪模式组件
 * 显示做菜、烹饪的场景
 */
export const CookingModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  feedback
}) => {
  const {
    recipe,
    ingredientsAdded,
    targetIngredients,
    currentIngredient,
    ingredientFlying,
    ingredientBurned,
    potShaking,
    cookingMsg,
    dishComplete,
    steamEffect,
    sparkles
  } = state.data;

  // 计算完成度
  const progressPercent = targetIngredients > 0 
    ? Math.round((ingredientsAdded.length / targetIngredients) * 100)
    : 0;

  return (
    <section className={`glass-card ${styles.cookingZone}`}>
      {/* 菜谱标题 */}
      <div className={styles.recipeTitle}>
        {recipe?.emoji} {recipe?.name}
      </div>

      {/* 厨房场景 */}
      <div className={styles.kitchen}>
        {/* 炊具/锅 */}
        <div className={`${styles.cookware} ${potShaking ? styles.shake : ''}`}>
          {dishComplete ? recipe?.finalDish : recipe?.cookware}
          
          {/* 完成闪光效果 */}
          {sparkles && (
            <div className={styles.sparkles}>
              <span>✨</span>
              <span>✨</span>
              <span>✨</span>
              <span>⭐</span>
            </div>
          )}
        </div>

        {/* 蒸汽效果 */}
        {steamEffect && (
          <div className={styles.steam}>
            <span>💨</span>
            <span>💨</span>
            <span>💨</span>
          </div>
        )}

        {/* 当前食材准备区 */}
        {currentIngredient && !dishComplete && (
          <div className={`${styles.currentIngredient} ${ingredientFlying ? styles.flying : ''} ${ingredientBurned ? styles.burned : ''}`}>
            {currentIngredient}
            {ingredientBurned && (
              <div className={styles.burnEffect}>🔥</div>
            )}
          </div>
        )}

        {/* 已添加的食材显示 */}
        {!dishComplete && ingredientsAdded.length > 0 && (
          <div className={styles.ingredientsInPot}>
            {ingredientsAdded.slice(-3).map((ingredient: string, index: number) => (
              <span 
                key={`${ingredient}-${index}`}
                className={styles.ingredientInPot}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  zIndex: index
                }}
              >
                {ingredient}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 进度条 */}
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          料理进度: {ingredientsAdded.length} / {targetIngredients}
        </div>
        <div className={styles.progressBar}>
          <div 
            className={`${styles.progressFill} ${dishComplete ? styles.complete : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={styles.progressPercent}>{progressPercent}%</div>
      </div>

      {/* 食材列表展示 */}
      <div className={styles.ingredientsList}>
        <div className={styles.ingredientsLabel}>食材清单:</div>
        <div className={styles.ingredientsGrid}>
          {recipe?.ingredients.map((ingredient: string, index: number) => {
            const addedCount = ingredientsAdded.filter((i: string) => i === ingredient).length;
            return (
              <div 
                key={index}
                className={`${styles.ingredientCard} ${addedCount > 0 ? styles.used : ''}`}
              >
                <div className={styles.ingredientIcon}>{ingredient}</div>
                {addedCount > 0 && (
                  <div className={styles.ingredientCount}>×{addedCount}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 烹饪消息 */}
      {cookingMsg && (
        <div className={`${styles.cookingMsg} ${dishComplete ? styles.complete : ''}`}>
          {cookingMsg}
        </div>
      )}

      {/* 答题反馈 */}
      {feedback && !dishComplete && (
        <div className={`${styles.feedback} ${feedback.correct ? styles.correct : styles.wrong}`}>
          {feedback.correct ? '✅ 食材加入！' : '❌ 哎呀，烧焦了！'}
        </div>
      )}

      {/* 完成横幅 */}
      {dishComplete && (
        <div className={styles.completeBanner}>
          <div className={styles.completeDish}>{recipe?.finalDish}</div>
          <div className={styles.completeText}>料理完成！</div>
          <div className={styles.completeStars}>
            {'⭐'.repeat(Math.min(5, Math.ceil((progressPercent / 100) * 5)))}
          </div>
        </div>
      )}
    </section>
  );
};

