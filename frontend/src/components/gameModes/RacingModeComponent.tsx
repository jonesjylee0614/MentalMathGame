import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import styles from '../../styles/gameModes/RacingMode.module.css';

/**
 * 赛跑模式组件
 * 显示跑步比赛、赛车或游泳的竞速场景
 */
export const RacingModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  feedback
}) => {
  const {
    playerPosition,
    opponentPosition,
    playerRunning,
    opponentRunning,
    showSpeedLines,
    encouragingMsg,
    theme,
    raceFinished,
    winner
  } = state.data;

  // 计算排名
  const playerLeading = playerPosition > opponentPosition;
  const gap = Math.abs(playerPosition - opponentPosition);
  const isClose = gap < 10; // 差距小于10%算势均力敌

  return (
    <section className={`glass-card ${styles.racingZone}`}>
      {/* 主题标题 */}
      <div className={styles.themeTitle}>
        {theme?.name || '竞速比赛'}
      </div>

      {/* 赛道容器 */}
      <div className={styles.trackContainer}>
        {/* 玩家赛道 */}
        <div className={styles.track}>
          <div className={styles.trackLabel}>你</div>
          <div className={styles.trackLine}>
            {/* 进度条背景 */}
            <div className={styles.progressBg}>
              <div 
                className={styles.progressFill}
                style={{ width: `${playerPosition}%` }}
              />
            </div>
            
            {/* 起点 */}
            <div className={styles.startLine}>🏁</div>
            
            {/* 玩家角色 */}
            <div 
              className={`${styles.racer} ${styles.player} ${playerRunning ? styles.running : ''}`}
              style={{ left: `${playerPosition}%` }}
            >
              {theme?.player || '🏃'}
              {showSpeedLines && (
                <div className={styles.speedLines}>
                  <span>💨</span>
                  <span>💨</span>
                  <span>💨</span>
                </div>
              )}
            </div>
            
            {/* 终点 */}
            <div className={styles.finishLine}>🏆</div>
          </div>
          <div className={styles.trackProgress}>{playerPosition.toFixed(0)}%</div>
        </div>

        {/* 对手赛道 */}
        <div className={styles.track}>
          <div className={styles.trackLabel}>对手</div>
          <div className={styles.trackLine}>
            {/* 进度条背景 */}
            <div className={styles.progressBg}>
              <div 
                className={`${styles.progressFill} ${styles.opponent}`}
                style={{ width: `${opponentPosition}%` }}
              />
            </div>
            
            {/* 起点 */}
            <div className={styles.startLine}>🏁</div>
            
            {/* 对手角色 */}
            <div 
              className={`${styles.racer} ${styles.opponentRacer} ${opponentRunning ? styles.running : ''}`}
              style={{ left: `${opponentPosition}%` }}
            >
              {theme?.opponent || '🐢'}
            </div>
            
            {/* 终点 */}
            <div className={styles.finishLine}>🏆</div>
          </div>
          <div className={styles.trackProgress}>{opponentPosition.toFixed(0)}%</div>
        </div>
      </div>

      {/* 排名指示 */}
      {!raceFinished && (
        <div className={styles.rankingInfo}>
          {playerLeading ? (
            <span className={styles.leading}>
              🥇 {isClose ? '势均力敌！加油！' : `领先 ${gap.toFixed(0)}%`}
            </span>
          ) : (
            <span className={styles.behind}>
              ⚠️ {isClose ? '快追上了！' : `落后 ${gap.toFixed(0)}%`}
            </span>
          )}
        </div>
      )}

      {/* 比赛结束横幅 */}
      {raceFinished && (
        <div className={`${styles.finishBanner} ${winner === 'player' ? styles.victory : styles.defeat}`}>
          {winner === 'player' ? (
            <>
              <div className={styles.bannerEmoji}>🎉</div>
              <div className={styles.bannerText}>胜利！你赢了！</div>
            </>
          ) : (
            <>
              <div className={styles.bannerEmoji}>😢</div>
              <div className={styles.bannerText}>对手赢了！下次加油！</div>
            </>
          )}
        </div>
      )}

      {/* 鼓励消息 */}
      {feedback && feedback.correct && encouragingMsg && (
        <div className={styles.encouragement}>
          {encouragingMsg}
        </div>
      )}
    </section>
  );
};

