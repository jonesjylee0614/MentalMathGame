import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Game } from '../lib/engine';
import { findLevel } from '../lib/levels';
import { formatTime } from '../lib/utils';
import { useFeedbackSound } from '../lib/sound';
import { GameResult, GameSnapshot, Question } from '../lib/types';
import styles from '../styles/PlayPage.module.css';

const encouragingMessages = [
  '✅ 太棒了！答对啦！',
  '🌟 你真聪明！',
  '🎉 太厉害了！',
  '💪 做得好！',
  '👏 完美答案！',
  '🚀 你是数学小天才！',
  '⭐ 真棒！继续加油！',
  '🎯 正确！太准了！',
];

export const PlayPage = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const level = useMemo(() => (levelId ? findLevel(levelId) : null), [levelId]);
  const { settings, recordResult, setLastResult } = useGame();
  const [state, setState] = useState<'idle' | 'preparing' | 'playing' | 'result'>('idle');
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; expected?: string } | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [plantAttacking, setPlantAttacking] = useState(false);
  const [zombieAttacking, setZombieAttacking] = useState(false);
  const [zombieDamaged, setZombieDamaged] = useState(false);
  const [playerDamaged, setPlayerDamaged] = useState(false);
  const [showProjectile, setShowProjectile] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [encouragingMsg, setEncouragingMsg] = useState('');
  const playSound = useFeedbackSound(settings.audio);

  useEffect(() => {
    if (!level) {
      setError('未找到关卡，返回关卡列表');
      return;
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state !== 'playing') return;
      
      // Number keys (0-9) and numpad
      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(e.key);
        e.preventDefault();
      }
      // Enter key for submit
      else if (e.key === 'Enter' && answer.trim()) {
        handleSubmit();
        e.preventDefault();
      }
      // Backspace for delete
      else if (e.key === 'Backspace') {
        handleDelete();
        e.preventDefault();
      }
      // Escape for clear
      else if (e.key === 'Escape') {
        handleClear();
        e.preventDefault();
      }
      // Minus key
      else if (e.key === '-') {
        handleNumberClick('-');
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const unsubState = Game.on('statechange', ({ state: nextState }) => setState(nextState));
    const unsubQuestion = Game.on('question', (next) => {
      setQuestion(next);
      setAnswer('');
      setFeedback(null); // Clear feedback when moving to next question
    });
    const unsubUpdate = Game.on('update', (snap) => setSnapshot(snap));
    const unsubFeedback = Game.on('feedback', (fb) => {
      setFeedback(fb);
      playSound(fb.correct ? 'success' : 'error');

      // Trigger animations
      if (fb.correct) {
        const randomMsg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        setEncouragingMsg(randomMsg);
        setPlantAttacking(true);
        setShowProjectile(true);
        setShowStars(true);
        setTimeout(() => {
          setZombieDamaged(true);
          setShowProjectile(false);
        }, 300);
        setTimeout(() => {
          setPlantAttacking(false);
          setZombieDamaged(false);
          setShowStars(false);
        }, 1000);
      } else {
        setZombieAttacking(true);
        setTimeout(() => {
          setPlayerDamaged(true);
        }, 300);
        setTimeout(() => {
          setZombieAttacking(false);
          setPlayerDamaged(false);
        }, 600);
      }
    });
    const unsubFinish = Game.on('finish', (result) => {
      if (!level) return;
      const enriched: GameResult & { levelId: string } = {
        ...result,
        levelId: level.id,
        levelName: level.name
      };
      recordResult(enriched);
      setLastResult(enriched);
      navigate('/result');
    });

    Game.init(level);
    Game.start();
    setError(null);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubState();
      unsubQuestion();
      unsubUpdate();
      unsubFeedback();
      unsubFinish();
      Game.reset();
    };
  }, [level, navigate, playSound, recordResult, setLastResult, state, answer, handleNumberClick, handleSubmit, handleDelete, handleClear]);

  if (!level) {
    return (
      <div className="glass-card">
        <p>{error}</p>
        <button className="btn" onClick={() => navigate('/levels')}>
          返回关卡列表
        </button>
      </div>
    );
  }

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    if (!answer.trim() || state !== 'playing') return;
    Game.submit(answer);
    setFeedback(null);
  };

  const handleNumberClick = useCallback((num: string) => {
    if (state !== 'playing') return;
    setAnswer((prev) => prev + num);
  }, [state]);

  const handleDelete = useCallback(() => {
    setAnswer((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setAnswer('');
  }, []);

  const handleSubmit = useCallback(() => {
    if (!answer.trim() || state !== 'playing') return;
    Game.submit(answer);
    setFeedback(null);
  }, [answer, state]);

  const handleExit = useCallback(() => {
    if (showExitConfirm) {
      Game.reset();
      navigate('/levels');
    } else {
      setShowExitConfirm(true);
      setTimeout(() => setShowExitConfirm(false), 3000);
    }
  }, [showExitConfirm, navigate]);

  return (
    <div className={`fade-in ${styles.wrapper}`}>
      <div className={styles.panel}>
        {/* Left Section - Question and Answer Area */}
        <div className={styles.leftSection}>
          <div className={`glass-card`}>
            <div className={styles.controlButtons}>
              <button className="btn secondary" onClick={() => navigate('/levels')}>
                ⬅️ 返回关卡
              </button>
              <button 
                className="btn secondary" 
                onClick={handleExit}
                style={{ background: showExitConfirm ? 'linear-gradient(135deg, #ef4444, #dc2626)' : undefined }}
              >
                {showExitConfirm ? '⚠️ 确认退出？' : '❌ 退出关卡'}
              </button>
            </div>

            <header className={styles.panelHeader}>
              <div>
                <span className="tag">{level.category}</span>
                <h2>{level.name}</h2>
                <p>{level.desc}</p>
              </div>
              <div className={styles.meta}>
                <span>题量 {level.count}</span>
                <span>时限 {level.timeSec}s</span>
                <span>难度 {level.difficulty.toFixed(1)}</span>
              </div>
            </header>
          </div>

          <div className={`glass-card ${styles.questionArea}`} style={{ position: 'relative' }}>
            {showStars && <div className={styles.stars}>⭐✨🌟</div>}
            {question ? (
              <div className={styles.questionCard}>
                <span className={styles.counter}>
                  第 {snapshot ? snapshot.questionIndex + 1 : 1}/{snapshot ? snapshot.questionTotal : level.count} 题
                </span>
                <p className={styles.questionText}>{question.text}</p>
                {feedback && (
                  <p
                    className={
                      feedback.correct
                        ? styles.feedbackOk
                        : settings.shake
                        ? styles.feedbackNg
                        : styles.feedbackPlain
                    }
                  >
                    {feedback.correct ? encouragingMsg : `❌ 正确答案：${feedback.expected}`}
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.questionCard}>🎮 准备开始...</div>
            )}
          </div>

          <div className={`glass-card`}>
            <div className={styles.answerForm}>
              <input
                value={answer}
                onChange={(evt) => setAnswer(evt.target.value)}
                placeholder="请输入答案"
                readOnly
                style={{ textAlign: 'center' }}
              />
              <div className={styles.numberPad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    className={styles.numButton}
                    onClick={() => handleNumberClick(num.toString())}
                    type="button"
                  >
                    {num}
                  </button>
                ))}
                <button
                  className={`${styles.numButton} ${styles.special}`}
                  onClick={() => handleNumberClick('-')}
                  type="button"
                >
                  −
                </button>
                <button
                  className={styles.numButton}
                  onClick={() => handleNumberClick('0')}
                  type="button"
                >
                  0
                </button>
                <button
                  className={`${styles.numButton} ${styles.delete}`}
                  onClick={handleDelete}
                  type="button"
                >
                  ⌫
                </button>
                <button
                  className={`${styles.numButton} ${styles.submit}`}
                  onClick={handleSubmit}
                  type="button"
                >
                  ✓ 提交答案
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Battle Animation and Stats */}
        <div className={styles.rightSection}>
          <div className={`glass-card`}>
            <div className={styles.battleField}>
              <div className={styles.characterWrapper}>
                <div className={`${styles.hpBar} ${((snapshot?.hp.player ?? level.hp?.player ?? 100) / (snapshot?.hpMax.player ?? level.hp?.player ?? 100)) <= 0.3 ? styles.lowHp : ''}`}>
                  <div
                    className={`${styles.hpFill} ${styles.player}`}
                    style={{ width: `${((snapshot?.hp.player ?? level.hp?.player ?? 100) / (snapshot?.hpMax.player ?? level.hp?.player ?? 100)) * 100}%` }}
                  />
                </div>
                <div className={`${styles.character} ${styles.plant} ${plantAttacking ? styles.attacking : ''} ${playerDamaged ? styles.damaged : ''}`}>
                  🌻
                </div>
              </div>
              {showProjectile && <div className={styles.projectile}>🌰</div>}
              <div className={styles.characterWrapper}>
                <div className={`${styles.hpBar} ${((snapshot?.hp.monster ?? level.hp?.monster ?? 100) / (snapshot?.hpMax.monster ?? level.hp?.monster ?? 100)) <= 0.3 ? styles.lowHp : ''}`}>
                  <div
                    className={`${styles.hpFill} ${styles.monster}`}
                    style={{ width: `${((snapshot?.hp.monster ?? level.hp?.monster ?? 100) / (snapshot?.hpMax.monster ?? level.hp?.monster ?? 100)) * 100}%` }}
                  />
                </div>
                <div className={`${styles.character} ${styles.zombie} ${zombieAttacking ? styles.attacking : ''} ${zombieDamaged ? styles.damaged : ''}`}>
                  🧟
                </div>
              </div>
            </div>
          </div>

          <div className={`glass-card`}>
            <div className={styles.statsArea}>
              <div className={`${styles.timer} ${(snapshot?.timeLeft ?? level.timeSec) <= 10 ? styles.warning : ''}`}>
                ⏱️ {formatTime(snapshot?.timeLeft ?? level.timeSec)}
              </div>
              {snapshot && snapshot.combo > 0 && (
                <div className={`${styles.comboDisplay} ${snapshot.combo >= 10 ? styles.ultra : snapshot.combo >= 5 ? styles.high : ''}`}>
                  🔥 连击 x{snapshot.combo} 🔥
                </div>
              )}
              <div className={styles.statItem}>
                <span className={styles.statLabel}>当前题目</span>
                <span className={styles.statValue}>
                  {snapshot ? snapshot.questionIndex + 1 : 1} / {snapshot ? snapshot.questionTotal : level.count}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>正确率</span>
                <span className={styles.statValue}>
                  {snapshot ? Math.round((snapshot.correctCount / Math.max(1, snapshot.questionIndex)) * 100) : 0}%
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>当前得分</span>
                <span className={styles.statValue}>{snapshot?.score ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
