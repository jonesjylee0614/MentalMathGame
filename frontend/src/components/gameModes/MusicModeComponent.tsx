import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import { MUSICAL_NOTES } from '../../lib/gameModes/modes/MusicMode';
import styles from '../../styles/gameModes/MusicMode.module.css';

/**
 * 音乐模式组件
 * 显示五线谱、音符、钢琴键等音乐元素
 */
export const MusicModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  snapshot,
  question,
  feedback
}) => {
  const { 
    melody,
    playedNotes,
    currentNoteIndex,
    isPlaying,
    currentNote,
    pianoKeys,
    isComplete,
    successMsg,
    missMsg,
    completionMsg,
    soundWaves,
    correctCount,
    totalQuestions,
  } = state.data;

  // 计算进度
  const melodyLength = melody?.notes?.length || 1;
  const progress = Math.round((currentNoteIndex / melodyLength) * 100);

  return (
    <div className={styles.musicScene}>
      {/* 五线谱背景 */}
      <div className={styles.staffBackground}>
        {/* 五条线 */}
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={styles.staffLine} style={{ top: `${20 + i * 15}%` }} />
        ))}
      </div>

      {/* 主舞台区域 */}
      <div className={styles.stage}>
        {/* 音乐家角色 */}
        <div className={`${styles.musician} ${isPlaying ? styles.playing : ''}`}>
          <div className={styles.musicianEmoji}>🎤</div>
          <div className={styles.musicianLabel}>小音乐家</div>
        </div>

        {/* 已演奏的音符 */}
        <div className={styles.notesContainer}>
          {playedNotes?.map((note: any, index: number) => (
            <div
              key={note.id}
              className={`${styles.musicNote} ${
                currentNote?.id === note.id ? styles.active : ''
              }`}
              style={{
                left: `${10 + (index / melodyLength) * 80}%`,
                top: `${note.position * 10 + 20}%`,
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className={styles.noteEmoji}>{note.emoji}</div>
              <div className={styles.noteName}>{note.name}</div>
            </div>
          ))}
        </div>

        {/* 音波效果 */}
        {soundWaves?.map((wave: any) => (
          <div
            key={wave.id}
            className={styles.soundWave}
            style={{
              left: `${wave.x}%`,
              top: `${wave.y}%`,
            }}
          >
            <div className={styles.waveRing}></div>
            <div className={styles.waveRing} style={{ animationDelay: '0.2s' }}></div>
            <div className={styles.waveRing} style={{ animationDelay: '0.4s' }}></div>
          </div>
        ))}

        {/* 完成时的音符雨 */}
        {isComplete && (
          <div className={styles.noteRain}>
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className={styles.fallingNote}
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                {i % 2 === 0 ? '🎵' : '🎶'}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 钢琴键盘 */}
      <div className={styles.piano}>
        <div className={styles.pianoKeys}>
          {pianoKeys?.map((key: any) => (
            <div
              key={key.id}
              className={`${styles.pianoKey} ${key.active ? styles.pressed : ''}`}
            >
              <div className={styles.keyNote}>{key.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 信息面板 */}
      <div className={styles.infoPanel}>
        {/* 曲目信息 */}
        <div className={styles.songInfo}>
          <div className={styles.songIcon}>{melody?.emoji || '🎵'}</div>
          <div className={styles.songDetails}>
            <div className={styles.songName}>{melody?.name || '音乐之旅'}</div>
            <div className={styles.songProgress}>
              {currentNoteIndex} / {melodyLength} 音符
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            >
              <span className={styles.progressText}>{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 成功消息 */}
      {successMsg && !isComplete && (
        <div className={`${styles.successMessage} ${styles.bounce}`}>
          {successMsg}
        </div>
      )}

      {/* 错误消息 */}
      {missMsg && (
        <div className={`${styles.missMessage} ${styles.shake}`}>
          {missMsg}
        </div>
      )}

      {/* 完成横幅 */}
      {isComplete && completionMsg && (
        <div className={`${styles.completionBanner} ${styles.slideIn}`}>
          <div className={styles.bannerContent}>
            {completionMsg}
          </div>
          <div className={styles.bannerSubtitle}>
            完美演奏！🎼
          </div>
          <div className={styles.stars}>
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>
        </div>
      )}

      {/* 答题反馈 */}
      {feedback && !isComplete && (
        <div className={`${styles.feedback} ${feedback.correct ? styles.correct : styles.wrong}`}>
          {feedback.correct ? '✅ 音符正确！' : `❌ 再试一次`}
        </div>
      )}
    </div>
  );
};

