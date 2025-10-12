import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import styles from '../../styles/gameModes/DefenseMode.module.css';

/**
 * 防守模式组件
 * 显示塔防场景：城堡、敌人、防御效果
 */
export const DefenseModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  snapshot,
  question,
  feedback
}) => {
  const {
    castleHP,
    maxCastleHP,
    enemies,
    enemiesDefeated,
    totalEnemies,
    showExplosion,
    showDamage,
    showVictory
  } = state.data;

  // 计算血量百分比
  const hpPercent = maxCastleHP > 0 
    ? Math.max(0, Math.round((castleHP / maxCastleHP) * 100)) 
    : 100;

  // 计算危险等级
  const dangerLevel = hpPercent > 60 ? 'safe' : hpPercent > 30 ? 'warning' : 'critical';

  // 计算防守进度
  const defenseProgress = totalEnemies > 0
    ? Math.round((enemiesDefeated / totalEnemies) * 100)
    : 0;

  return (
    <section className={`glass-card ${styles.defenseScene}`}>
      {/* 背景战场 */}
      <div className={styles.battlefield}>
        {/* 路径指示线 */}
        <div className={styles.pathLine} />

        {/* 城堡（左侧） */}
        <div className={`${styles.castle} ${showDamage ? styles.damaged : ''} ${styles[dangerLevel]}`}>
          <div className={styles.castleIcon}>🏰</div>
          <div className={styles.castleHP}>
            <div className={styles.hpBar}>
              <div 
                className={styles.hpFill}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <span className={styles.hpText}>{castleHP}/{maxCastleHP}</span>
          </div>
          
          {/* 城堡状态指示 */}
          {dangerLevel === 'critical' && (
            <div className={styles.criticalAlert}>⚠️ 危险！</div>
          )}
        </div>

        {/* 防御塔（中间） */}
        <div className={styles.defenderTower}>
          <div className={styles.towerIcon}>
            🗼
          </div>
          <div className={styles.towerLabel}>防御塔</div>
        </div>

        {/* 敌人波次（右侧到左侧移动） */}
        <div className={styles.enemiesLayer}>
          {enemies?.map((enemy: any) => (
            <div
              key={enemy.id}
              className={`${styles.enemy} ${enemy.defeated ? styles.defeated : ''}`}
              style={{
                left: `${enemy.position}%`,
                transition: 'left 1s linear'
              }}
            >
              <div className={styles.enemyIcon}>{enemy.emoji}</div>
              {enemy.question && (
                <div className={styles.enemyQuestion}>
                  题目 #{enemy.question.id}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 激光射击效果（答对时） */}
        {showExplosion && enemies && enemies.length > 0 && (
          <>
            <div className={styles.laserBeam} />
            <div 
              className={styles.explosion}
              style={{ left: `${enemies[0]?.position || 50}%` }}
            >
              💥
            </div>
          </>
        )}

        {/* 受伤特效 */}
        {showDamage && (
          <div className={styles.damageEffect}>
            <div className={styles.damageText}>-20 HP</div>
          </div>
        )}
      </div>

      {/* 防守状态栏 */}
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>击退敌人：</span>
          <span className={styles.statusValue}>
            {enemiesDefeated}/{totalEnemies}
          </span>
        </div>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${defenseProgress}%` }}
          />
          <span className={styles.progressText}>{defenseProgress}%</span>
        </div>

        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>城堡血量：</span>
          <span className={`${styles.statusValue} ${styles[dangerLevel]}`}>
            {hpPercent}%
          </span>
        </div>
      </div>

      {/* 操作提示 */}
      {enemies && enemies.length > 0 && (
        <div className={styles.actionHint}>
          ⚔️ 快速答题击退敌人！
        </div>
      )}

      {/* 反馈消息 */}
      {feedback && (
        <div className={`${styles.feedback} ${feedback.correct ? styles.correct : styles.wrong}`}>
          {feedback.correct ? (
            <>
              <span className={styles.feedbackIcon}>🎯</span>
              <span>命中！敌人被击退！</span>
            </>
          ) : (
            <>
              <span className={styles.feedbackIcon}>❌</span>
              <span>小心！继续答题！</span>
            </>
          )}
        </div>
      )}

      {/* 胜利横幅 */}
      {showVictory && (
        <div className={styles.victoryBanner}>
          <div className={styles.victoryContent}>
            <div className={styles.victoryIcon}>🏆</div>
            <div className={styles.victoryText}>防守成功！</div>
            <div className={styles.victorySubtext}>城堡安全！</div>
          </div>
        </div>
      )}

      {/* 战斗音效提示 */}
      <div className={styles.battleInfo}>
        <div className={styles.infoRow}>
          <span>💡 提示：答对题目发射激光击退敌人</span>
        </div>
        <div className={styles.infoRow}>
          <span>⚠️ 注意：敌人到达城堡会造成20点伤害</span>
        </div>
      </div>
    </section>
  );
};
