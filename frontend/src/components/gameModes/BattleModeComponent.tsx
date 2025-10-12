import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import styles from '../../styles/gameModes/BattleMode.module.css';

/**
 * 战斗模式组件
 * 显示植物vs僵尸的战斗场景
 */
export const BattleModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  snapshot,
  feedback
}) => {
  const {
    plantAttacking,
    zombieAttacking,
    zombieDamaged,
    playerDamaged,
    showStars,
    encouragingMsg,
    projectiles
  } = state.data;

  // 计算血量百分比
  const playerHpPercent = snapshot?.hp.player && snapshot?.hpMax.player
    ? Math.max(0, Math.round((snapshot.hp.player / snapshot.hpMax.player) * 100))
    : 100;
    
  const monsterHpPercent = snapshot?.hp.monster && snapshot?.hpMax.monster
    ? Math.max(0, Math.round((snapshot.hp.monster / snapshot.hpMax.monster) * 100))
    : 100;

  return (
    <section className={`glass-card ${styles.battleZone}`}>
      {/* 子弹层 - 在battleRow之外 */}
      {projectiles?.plant?.map((id: string) => (
        <div key={id} className={styles.bullet}>🟢</div>
      ))}
      {projectiles?.zombie?.map((id: string) => (
        <div key={id} className={styles.zombieBullet}>🟤</div>
      ))}
      
      <div className={styles.battleRow}>
        {/* 玩家角色（植物） */}
        <div className={styles.characterWrapper}>
          <div className={styles.characterHpTop}>
            <div className={styles.hpBar}>
              <div
                className={`${styles.hpFill} ${playerDamaged ? styles.hpDamaged : ''}`}
                style={{ width: `${playerHpPercent}%` }}
              />
            </div>
            <span className={styles.hpLabel}>{playerHpPercent}%</span>
          </div>
          <span className={`${styles.characterIcon} ${plantAttacking ? styles.attacking : ''}`}>
            🌻
          </span>
        </div>

        {/* 连击Badge */}
        {snapshot && snapshot.combo > 0 && (
          <div className={styles.comboBadge}>
            🔥 连击 x{snapshot.combo}
          </div>
        )}

        {/* 敌人角色（僵尸） */}
        <div className={styles.characterWrapper}>
          <div className={styles.characterHpTop}>
            <div className={styles.hpBar}>
              <div
                className={`${styles.hpFill} ${styles.enemy} ${zombieDamaged ? styles.hpDamaged : ''}`}
                style={{ width: `${monsterHpPercent}%` }}
              />
            </div>
            <span className={styles.hpLabel}>{monsterHpPercent}%</span>
          </div>
          <span className={`${styles.characterIcon} ${zombieAttacking ? styles.attacking : ''}`}>
            🧟
          </span>
        </div>
      </div>

      {/* 星星特效 */}
      {showStars && (
        <div className={styles.starBurst} aria-hidden="true" />
      )}

      {/* 反馈消息 */}
      {feedback && (
        <div className={`${styles.feedback} ${feedback.correct ? styles.correct : styles.wrong}`}>
          {feedback.correct ? encouragingMsg : ''}
        </div>
      )}
    </section>
  );
};

