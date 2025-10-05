import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Game } from '../lib/engine';
import { findLevel } from '../lib/levels';
import { formatTime } from '../lib/utils';
import { useFeedbackSound } from '../lib/sound';
import { GameResult, GameSnapshot, Question } from '../lib/types';
import styles from '../styles/PlayPage.module.css';

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
  const playSound = useFeedbackSound(settings.audio);

  useEffect(() => {
    if (!level) {
      setError('未找到关卡，返回关卡列表');
      return;
    }
    const unsubState = Game.on('statechange', ({ state: nextState }) => setState(nextState));
    const unsubQuestion = Game.on('question', (next) => {
      setQuestion(next);
      setAnswer('');
    });
    const unsubUpdate = Game.on('update', (snap) => setSnapshot(snap));
    const unsubFeedback = Game.on('feedback', (fb) => {
      setFeedback(fb);
      playSound(fb.correct ? 'success' : 'error');
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
      unsubState();
      unsubQuestion();
      unsubUpdate();
      unsubFeedback();
      unsubFinish();
      Game.reset();
    };
  }, [level, navigate, playSound, recordResult, setLastResult]);

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
    if (!answer.trim()) return;
    Game.submit(answer);
  };

  return (
    <div className={`fade-in ${styles.wrapper}`}>
      <section className={`glass-card ${styles.panel}`}>
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

        <div className={styles.progressArea}>
          <div className={styles.barGroup}>
            <label>怪兽 HP</label>
            <div className={styles.progressBar}>
              <div
                className={styles.barFill}
                style={{ width: `${((snapshot?.hp.monster ?? level.hp?.monster ?? 100) / (snapshot?.hpMax.monster ?? level.hp?.monster ?? 100)) * 100}%` }}
              />
            </div>
          </div>
          <div className={styles.barGroup}>
            <label>勇士 HP</label>
            <div className={styles.progressBar}>
              <div
                className={`${styles.barFill} ${styles.player}`}
                style={{ width: `${((snapshot?.hp.player ?? level.hp?.player ?? 100) / (snapshot?.hpMax.player ?? level.hp?.player ?? 100)) * 100}%` }}
              />
            </div>
          </div>
          <div className={styles.timer}>⏱️ {formatTime(snapshot?.timeLeft ?? level.timeSec)}</div>
        </div>

        <div className={styles.questionArea}>
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
                  {feedback.correct ? '✅ 回答正确！' : `❌ 正确答案：${feedback.expected}`}
                </p>
              )}
            </div>
          ) : (
            <div className={styles.questionCard}>加载题目中...</div>
          )}
        </div>

        <form className={styles.answerForm} onSubmit={onSubmit}>
          <input
            value={answer}
            onChange={(evt) => setAnswer(evt.target.value)}
            placeholder="输入答案，按回车提交"
            autoFocus
          />
          <button className="btn" type="submit">
            提交
          </button>
        </form>
      </section>
    </div>
  );
};
