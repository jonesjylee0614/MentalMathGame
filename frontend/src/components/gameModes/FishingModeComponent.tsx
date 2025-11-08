import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import type { Fish, FishingState } from '../../lib/gameModes/modes/FishingMode';
import styles from '../../styles/gameModes/FishingMode.module.css';

/**
 * 钓鱼模式组件
 * 显示钓鱼场景：海洋、鱼竿、鱼类、收获
 */
export const FishingModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  snapshot,
  feedback
}) => {
  const {
    fishingState,
    currentFish,
    caughtFish,
    totalScore,
    combo,
    bestCombo,
    fishEscaped,
    totalQuestions,
    answeredQuestions,
    showCelebration,
    showEscape,
    encouragingMsg,
    waterRipple,
    rodCasting,
    rodPulling
  } = state.data;

  // 计算进度
  const progress = totalQuestions > 0 
    ? Math.round((answeredQuestions / totalQuestions) * 100) 
    : 0;

  // 计算稀有度统计
  const rarityStats = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0
  };
  
  caughtFish?.forEach((fish: Fish) => {
    rarityStats[fish.rarity]++;
  });

  // 获取稀有度颜色
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#999';
      case 'rare': return '#4fc3f7';
      case 'epic': return '#ba68c8';
      case 'legendary': return '#ffd700';
      default: return '#999';
    }
  };

  // 获取稀有度中文名
  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return '普通';
      case 'rare': return '稀有';
      case 'epic': return '史诗';
      case 'legendary': return '传说';
      default: return '未知';
    }
  };

  return (
    <section className={`glass-card ${styles.fishingScene}`}>
      {/* 海洋背景 */}
      <div className={styles.ocean}>
        {/* 波浪动画 */}
        <div className={styles.waves}>
          <div className={`${styles.wave} ${styles.wave1}`} />
          <div className={`${styles.wave} ${styles.wave2}`} />
          <div className={`${styles.wave} ${styles.wave3}`} />
        </div>

        {/* 水纹效果 */}
        {waterRipple && (
          <div className={styles.rippleEffect}>
            <div className={styles.ripple} />
            <div className={styles.ripple} />
            <div className={styles.ripple} />
          </div>
        )}

        {/* 气泡 */}
        <div className={styles.bubbles}>
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className={styles.bubble}
              style={{
                left: `${10 + i * 12}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.3}s`
              }}
            />
          ))}
        </div>

        {/* 钓鱼竿 */}
        <div className={`${styles.fishingRod} ${rodCasting ? styles.casting : ''} ${rodPulling ? styles.pulling : ''}`}>
          <div className={styles.rodHandle}>🎣</div>
          <div className={styles.rodLine} />
          <div className={styles.rodHook}>🪝</div>
        </div>

        {/* 当前鱼（钓到或逃跑） */}
        {currentFish && (
          <div 
            className={`${styles.currentFish} ${
              fishingState === 'caught' ? styles.fishCaught : 
              fishingState === 'escaped' ? styles.fishEscaped :
              styles.fishBiting
            }`}
            style={{ 
              color: getRarityColor(currentFish.rarity),
              filter: `drop-shadow(0 0 10px ${getRarityColor(currentFish.rarity)})`
            }}
          >
            <div className={styles.fishEmoji}>{currentFish.emoji}</div>
            <div className={styles.fishName}>
              {currentFish.name}
              <span className={styles.fishRarity} style={{ color: getRarityColor(currentFish.rarity) }}>
                ({getRarityName(currentFish.rarity)})
              </span>
            </div>
          </div>
        )}

        {/* 庆祝特效 */}
        {showCelebration && currentFish && (
          <div className={styles.celebration}>
            <div className={styles.confetti}>
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i}
                  className={styles.confettiPiece}
                  style={{
                    left: `${50 + (Math.random() - 0.5) * 60}%`,
                    animationDelay: `${Math.random() * 0.3}s`,
                    background: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#6c5ce7'][i % 5]
                  }}
                />
              ))}
            </div>
            {currentFish.rarity === 'legendary' && (
              <div className={styles.legendaryEffect}>
                <div className={styles.starBurst}>✨</div>
                <div className={styles.starBurst}>⭐</div>
                <div className={styles.starBurst}>🌟</div>
                <div className={styles.starBurst}>💫</div>
              </div>
            )}
          </div>
        )}

        {/* 逃跑特效 */}
        {showEscape && (
          <div className={styles.escapeEffect}>
            <div className={styles.escapeText}>💨 跑了...</div>
          </div>
        )}
      </div>

      {/* 右侧面板 */}
      <div className={styles.rightPanel}>
        {/* 钓鱼统计面板 */}
        <div className={styles.statsPanel}>
          {/* 总分 */}
          <div className={styles.statBox}>
            <div className={styles.statLabel}>总分</div>
            <div className={styles.statValue}>{totalScore}</div>
          </div>

          {/* 已钓数量 */}
          <div className={styles.statBox}>
            <div className={styles.statLabel}>已钓</div>
            <div className={styles.statValue}>
              {caughtFish?.length || 0}/{totalQuestions}
            </div>
          </div>

          {/* 连击 */}
          <div className={`${styles.statBox} ${combo > 0 ? styles.comboActive : ''}`}>
            <div className={styles.statLabel}>连击</div>
            <div className={styles.statValue}>
              {combo > 0 ? `🔥 ${combo}` : '0'}
            </div>
          </div>

          {/* 最佳连击 */}
          <div className={styles.statBox}>
            <div className={styles.statLabel}>最佳</div>
            <div className={styles.statValue}>⭐ {bestCombo}</div>
          </div>
        </div>

        {/* 稀有度统计 */}
        <div className={styles.rarityStats}>
          <div className={styles.rarityItem}>
            <span className={styles.rarityDot} style={{ background: getRarityColor('common') }} />
            <span className={styles.rarityLabel}>普通: {rarityStats.common}</span>
          </div>
          <div className={styles.rarityItem}>
            <span className={styles.rarityDot} style={{ background: getRarityColor('rare') }} />
            <span className={styles.rarityLabel}>稀有: {rarityStats.rare}</span>
          </div>
          <div className={styles.rarityItem}>
            <span className={styles.rarityDot} style={{ background: getRarityColor('epic') }} />
            <span className={styles.rarityLabel}>史诗: {rarityStats.epic}</span>
          </div>
          <div className={styles.rarityItem}>
            <span className={styles.rarityDot} style={{ background: getRarityColor('legendary') }} />
            <span className={styles.rarityLabel}>传说: {rarityStats.legendary}</span>
          </div>
        </div>

        {/* 鱼篓（已钓到的鱼） */}
        <div className={styles.fishBasket}>
          <div className={styles.basketHeader}>
            🧺 鱼篓 ({caughtFish?.length || 0})
          </div>
          <div className={styles.basketContent}>
            {caughtFish && caughtFish.length > 0 ? (
              caughtFish.slice(-8).reverse().map((fish: Fish) => (
                <div 
                  key={fish.id} 
                  className={styles.basketFish}
                  style={{ 
                    borderColor: getRarityColor(fish.rarity),
                    boxShadow: `0 0 10px ${getRarityColor(fish.rarity)}40`
                  }}
                >
                  <span className={styles.basketFishEmoji}>{fish.emoji}</span>
                  <span className={styles.basketFishScore}>+{fish.score}</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyBasket}>还没有钓到鱼...</div>
            )}
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          >
            <span className={styles.progressEmoji}>🎣</span>
          </div>
        </div>
        <div className={styles.progressLabel}>
          钓鱼进度: {answeredQuestions}/{totalQuestions} ({progress}%)
        </div>
      </div>

      {/* 反馈消息 */}
      {feedback && encouragingMsg && (
        <div className={`${styles.feedback} ${
          showCelebration ? styles.success : 
          showEscape ? styles.failure : ''
        }`}>
          {encouragingMsg}
        </div>
      )}

      {/* 提示信息 */}
      {/* <div className={styles.hints}>
        <div className={styles.hint}>💡 答对钓鱼，答错跑鱼</div>
        <div className={styles.hint}>🔥 连击增加稀有鱼概率和分数加成</div>
      </div> */}
    </section>
  );
};
