import { CSSProperties, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Game } from '../lib/engine';
import { useLevel } from '../hooks/useLevel';
import { useLevelsContext } from '../context/LevelsContext';
import { formatTime } from '../lib/utils';
import { useFeedbackSound } from '../lib/sound';
import { GameResult, GameSnapshot, Question } from '../lib/types';
import { GameModeManager } from '../lib/gameModes/GameModeManager';
import { IGameMode, GameModeState } from '../lib/gameModes/IGameMode';
import { EventBus } from '../lib/eventBus';
import styles from '../styles/PlayPage.module.css';

// 获取关卡在分类中的序号
const getLevelNumber = (levelId: string, category: string, allLevels: any[]): number => {
  const categoryLevels = allLevels.filter(l => l.category === category);
  const index = categoryLevels.findIndex(item => item.id === levelId);
  return index >= 0 ? index + 1 : 0;
};

// 游戏模式图标映射
const getGameModeIcon = (mode: string): string => {
  const icons: Record<string, string> = {
    battle: '⚔️',
    collection: '🎁',
    fishing: '🎣',
    building: '🏗️',
    farming: '🌱',
    music: '🎵',
    puzzle: '🧩',
    racing: '🏃',
    cooking: '🍳',
    adventure: '🗺️',
    defense: '🛡️',
  };
  return icons[mode] || '🎮';
};

// 游戏模式名称映射
const getGameModeName = (mode: string): string => {
  const names: Record<string, string> = {
    battle: '战斗',
    collection: '收集',
    fishing: '钓鱼',
    building: '建造',
    farming: '种植',
    music: '音乐',
    puzzle: '解密',
    racing: '赛跑',
    cooking: '烹饪',
    adventure: '探险',
    defense: '防守',
  };
  return names[mode] || mode;
};

export const PlayPage = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { level, loading: levelLoading, error: levelError } = useLevel(levelId);
  const { levels } = useLevelsContext();
  const { settings, recordResult, setLastResult } = useGame();
  const [state, setState] = useState<'idle' | 'preparing' | 'playing' | 'result'>('idle');
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; expected?: string } | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // 游戏模式状态
  const [gameMode, setGameMode] = useState<IGameMode | null>(null);
  const [modeState, setModeState] = useState<GameModeState | null>(null);
  const [currentModeId, setCurrentModeId] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorListOpen, setErrorListOpen] = useState(false);
  const playSound = useFeedbackSound(settings.audio);

  const handleNumberClick = useCallback(
    (num: string) => {
      if (state !== 'playing' || isSubmitting) return;
      setAnswer((prev) => prev + num);
    },
    [state, isSubmitting]
  );

  const handleDelete = useCallback(() => {
    setAnswer((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setAnswer('');
  }, []);

  const handleSubmit = useCallback(() => {
    if (!answer.trim() || state !== 'playing' || isSubmitting) return;
    setIsSubmitting(true);
    Game.submit(answer);
    setFeedback(null);
  }, [answer, state, isSubmitting]);

  useEffect(() => {
    // 等待level加载完成
    if (levelLoading) {
      return;
    }
    
    // level未加载或加载失败
    if (!level) {
      setError(levelError || '未找到关卡，返回关卡列表');
      return;
    }

    // 清除之前的错误
    setError(null);
    
    // 调试：打印关卡配置
    console.log('🎮 准备启动游戏，关卡配置:', {
      id: level.id,
      name: level.name,
      generator: level.generator,
      count: level.count,
      timeSec: level.timeSec
    });

    // 创建事件总线
    const eventBus = new EventBus();
    
    // 创建音效播放器
    const soundPlayer = {
      play: (sound: 'success' | 'error') => playSound(sound)
    };

    // 创建游戏模式实例 - 从推荐模式中随机选择
    let modeId: string;
    if (level.recommendedModes && level.recommendedModes.length > 0) {
      // 从推荐模式列表中随机选择一个
      const randomIndex = Math.floor(Math.random() * level.recommendedModes.length);
      modeId = level.recommendedModes[randomIndex];
    } else {
      // 如果没有推荐模式，使用默认模式或battle
      modeId = level.gameMode || level.defaultMode || 'battle';
    }
    
    // 保存当前使用的模式ID
    setCurrentModeId(modeId);
    
    const manager = GameModeManager.getInstance();
    
    const mode = manager.create(
      modeId,
      {
        level,
        modeConfig: level.modeConfig,
        settings
      },
      {
        engine: Game,
        eventBus,
        soundPlayer
      }
    );

    manager.activate(mode);
    setGameMode(mode);

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

    // 监听游戏引擎事件并转发给游戏模式
    const unsubState = Game.on('statechange', ({ state: nextState }) => setState(nextState));
    
    const unsubQuestion = Game.on('question', (next) => {
      setQuestion(next);
      setFeedback(null);
    });
    
    const unsubUpdate = Game.on('update', (snap) => {
      setSnapshot(snap);
      mode.onUpdate(snap);
      setModeState(mode.getState());
    });
    
    const unsubFeedback = Game.on('feedback', (fb) => {
      setFeedback(fb);
      
      // Clear answer after a short delay to let user see the result
      setTimeout(() => {
        setAnswer('');
        setIsSubmitting(false);
      }, 800);

      const currentQuestion = Game.getCurrentQuestion();
      const currentSnapshot = snapshot || Game.snapshot();
      
      // 将反馈转发给游戏模式
      if (fb.correct && currentQuestion) {
        mode.onCorrectAnswer(currentQuestion, currentSnapshot);
      } else if (!fb.correct && currentQuestion) {
        mode.onWrongAnswer(
          currentQuestion,
          currentSnapshot,
          answer,
          fb.expected || ''
        );
      }
      
      setModeState(mode.getState());
    });
    
    const unsubFinish = Game.on('finish', (result) => {
      if (!level) return;
      mode.onGameEnd(result);
      const enriched: GameResult & { levelId: string } = {
        ...result,
        levelId: level.id,
        levelName: level.name
      };
      recordResult(enriched);
      setLastResult(enriched);
      navigate('/result');
    });

    // 启动游戏
    Game.init(level);
    mode.onGameStart(level.count);
    Game.start();
    setModeState(mode.getState());
    setError(null);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubState();
      unsubQuestion();
      unsubUpdate();
      unsubFeedback();
      unsubFinish();
      manager.deactivate();
      Game.reset();
    };
  }, [level, levelLoading, levelError, navigate, playSound, recordResult, setLastResult, settings]);

  // 所有hooks必须在条件return之前调用
  const handleExit = useCallback(() => {
    if (showExitConfirm) {
      Game.reset();
      navigate('/levels');
    } else {
      setShowExitConfirm(true);
      setTimeout(() => setShowExitConfirm(false), 3000);
    }
  }, [showExitConfirm, navigate]);

  const motivationalMessage = useMemo(() => {
    if (!snapshot || !level) return '';
    const totalQuestions = snapshot?.questionTotal ?? level.count;
    const answeredQuestions = snapshot?.questionIndex ?? 0;
    const remaining = totalQuestions - answeredQuestions;
    const monsterHpPercent = snapshot?.hp.monster && snapshot?.hpMax.monster 
      ? Math.max(0, Math.round((snapshot.hp.monster / snapshot.hpMax.monster) * 100))
      : 0;
    const playerHpPercent = snapshot?.hp.player && snapshot?.hpMax.player
      ? Math.max(0, Math.round((snapshot.hp.player / snapshot.hpMax.player) * 100))
      : 0;
    
    if (remaining === 0) return '最后冲刺！';
    if (remaining <= 3) return `再对 ${remaining} 题就能获胜！`;
    if (snapshot && snapshot.combo >= 3) return '完美连击！保持节奏！';
    if (monsterHpPercent <= 30) return '怪兽快被打败了！';
    if (playerHpPercent <= 30) return '小心！继续加油！';
    return `还有 ${remaining} 题，继续战斗！`;
  }, [snapshot, level]);

  // 加载状态
  if (levelLoading) {
    return (
      <div className="glass-card">
        <p>⏳ 加载关卡中...</p>
      </div>
    );
  }

  // 错误状态或关卡不存在
  if (!level || error || levelError) {
    return (
      <div className="glass-card">
        <h3>❌ {error || levelError || '未找到关卡'}</h3>
        <button className="btn" onClick={() => navigate('/levels')}>
          ⬅️ 返回关卡列表
        </button>
      </div>
    );
  }

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    // 只有有答案且游戏进行中且未提交时才处理
    if (!answer.trim() || state !== 'playing' || isSubmitting) return;
    handleSubmit();
  };

  const totalQuestions = snapshot?.questionTotal ?? level.count;
  const currentQuestion = snapshot ? snapshot.questionIndex + 1 : question ? 1 : 0;
  const answeredQuestions = snapshot?.questionIndex ?? 0;
  const progressPercent = totalQuestions > 0 ? Math.min(100, (answeredQuestions / totalQuestions) * 100) : 0;
  const timeLeft = snapshot?.timeLeft ?? level.timeSec;
  const timeTotal = snapshot?.timeTotal ?? level.timeSec;
  const playerHp = snapshot?.hp.player ?? level.hp?.player ?? 100;
  const playerHpMax = snapshot?.hpMax.player ?? level.hp?.player ?? 100;
  const monsterHp = snapshot?.hp.monster ?? level.hp?.monster ?? 100;
  const monsterHpMax = snapshot?.hpMax.monster ?? level.hp?.monster ?? 100;
  const playerHpPercent = Math.max(0, Math.round((playerHp / playerHpMax) * 100));
  const monsterHpPercent = Math.max(0, Math.round((monsterHp / monsterHpMax) * 100));
  const accuracy = snapshot && snapshot.questionIndex > 0
    ? Math.round((snapshot.correct / snapshot.questionIndex) * 100)
    : snapshot?.correct
    ? 100
    : 0;
  const timerAngle = timeTotal > 0 ? Math.round((Math.max(0, timeLeft) / timeTotal) * 360) : 360;

  const keypadButtons: Array<
    | { key: string; label: string; onPress: () => void; type?: 'button' | 'submit'; variant?: 'action' | 'submit'; span?: 'wide'; }
  > = [
    { key: '7', label: '7', onPress: () => handleNumberClick('7'), type: 'button' },
    { key: '8', label: '8', onPress: () => handleNumberClick('8'), type: 'button' },
    { key: '9', label: '9', onPress: () => handleNumberClick('9'), type: 'button' },
    { key: 'del', label: '⌫', onPress: handleDelete, variant: 'action', type: 'button' },
    { key: '4', label: '4', onPress: () => handleNumberClick('4'), type: 'button' },
    { key: '5', label: '5', onPress: () => handleNumberClick('5'), type: 'button' },
    { key: '6', label: '6', onPress: () => handleNumberClick('6'), type: 'button' },
    { key: 'clear', label: 'C', onPress: handleClear, variant: 'action', type: 'button' },
    { key: '1', label: '1', onPress: () => handleNumberClick('1'), type: 'button' },
    { key: '2', label: '2', onPress: () => handleNumberClick('2'), type: 'button' },
    { key: '3', label: '3', onPress: () => handleNumberClick('3'), type: 'button' },
    { key: 'minus', label: '−', onPress: () => handleNumberClick('-'), variant: 'action', type: 'button' },
    { key: '0', label: '0', onPress: () => handleNumberClick('0'), span: 'wide', type: 'button' },
    {
      key: 'submit',
      label: '✓ 提交',
      onPress: handleSubmit,
      type: 'submit',
      variant: 'submit',
      span: 'wide'
    }
  ];

  // motivationalMessage已移至hooks顶部

  const wrongAnswers = snapshot?.history.filter(h => !h.correct) || [];

  return (
    <div className={`fade-in ${styles.wrapper}`}>
      {/* 错误题目清单 */}
      {state === 'playing' && (
        <div className={styles.errorPanel}>
          {!errorListOpen && (
            <button
              className={`${styles.errorToggle} ${wrongAnswers.length > 0 ? styles.hasErrors : ''}`}
              onClick={() => setErrorListOpen(true)}
              aria-label="查看错误题目"
            >
              ❌ 错题 {wrongAnswers.length > 0 && `(${wrongAnswers.length})`}
            </button>
          )}
          {errorListOpen && (
            <div className={styles.errorList}>
              <div className={styles.errorListHeader}>
                <span className={styles.errorListTitle}>❌ 错题清单</span>
                <span className={styles.errorCount}>{wrongAnswers.length}</span>
                <button
                  onClick={() => setErrorListOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0 4px',
                    color: '#991b1b',
                  }}
                  aria-label="关闭"
                >
                  ×
                </button>
              </div>
              {wrongAnswers.length === 0 ? (
                <div className={styles.emptyMessage}>
                  🎉 太棒了！<br />还没有错题
                </div>
              ) : (
                <div className={styles.errorItems}>
                  {wrongAnswers.map((item, idx) => {
                    const q = snapshot?.level && question ? 
                      (Game as any).questions?.find((qu: Question) => qu.id === item.id) || null : null;
                    return (
                      <div key={`${item.id}-${idx}`} className={styles.errorItem}>
                        <div className={styles.errorQuestionText}>
                          {q?.text || '题目'}
                        </div>
                        <div className={styles.errorAnswerRow}>
                          <div className={styles.yourAnswerWrong}>
                            你的答案：{item.answer || '空'}
                          </div>
                          <div className={styles.correctAnswerShow}>
                            ✓ 正确答案：{item.expected}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 顶部状态区：关卡名 + 进度 + 倒计时 */}
      <header className={`glass-card ${styles.topBar}`}>
        <div className={styles.levelInfo}>
          <div className={styles.levelTitleRow}>
            <span className={styles.levelNumber}>第 {getLevelNumber(level.id, level.category, levels)} 关</span>
            <span className={styles.levelCategory}>🏁 {level.name}</span>
            {currentModeId && (
              <span className={styles.gameModeBadge}>
                {getGameModeIcon(currentModeId)} {getGameModeName(currentModeId)}模式
              </span>
            )}
          </div>
          <div className={styles.levelProgress}>
            <span>第 {currentQuestion || 1}/{totalQuestions} 题</span>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
        <div
          className={`${styles.timerOrb} ${timeLeft <= 10 ? styles.timerCritical : ''}`}
          style={{ '--timer-angle': `${timerAngle}deg` } as CSSProperties}
        >
          <div className={styles.timerCore}>
            <span className={styles.timerLabel}>倒计时</span>
            <strong>{formatTime(timeLeft)}</strong>
          </div>
        </div>
        <span className={styles.motivationalText}>{motivationalMessage}</span>
      </header>

      {/* 游戏模式区：动态渲染不同的游戏模式 */}
      {gameMode && modeState && snapshot && (
        (() => {
          const ModeComponent = gameMode.getComponent();
          return (
            <ModeComponent
              state={modeState}
              snapshot={snapshot}
              question={question}
              feedback={feedback}
            />
          );
        })()
      )}

      {/* 主区：题目(左) + 输入区(右) */}
      <main className={styles.stage}>
        <div className={`glass-card ${styles.questionPanel}`}>
          <div className={styles.questionHeader}>
            <span className={styles.questionIndex}>第 {currentQuestion || 1} 题</span>
          </div>
          <div className={styles.questionBody}>
            {question ? (
              <p className={styles.questionText}>{question.text}</p>
            ) : (
              <p className={styles.readyText}>🎮 准备开始...</p>
            )}
          </div>
          {feedback && (
            <>
              <div className={`${styles.feedbackOverlay} ${feedback.correct ? styles.overlayCorrect : styles.overlayWrong}`} />
              <div
                className={`${
                  feedback.correct
                    ? styles.feedbackPositive
                    : settings.shake
                    ? styles.feedbackNegative
                    : styles.feedbackNeutral
                } ${styles.feedbackToast} ${styles.feedbackLarge}`}
              >
                <div className={styles.feedbackIcon}>
                  {feedback.correct ? '✅' : '❌'}
                </div>
                <div className={styles.feedbackText}>
                  {feedback.correct ? (
                    <>
                      <div className={styles.feedbackTitle}>答对了！！！</div>
                      <div className={styles.feedbackMsg}>
                        {modeState?.data?.encouragingMsg || '太棒了！'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.feedbackTitle}>❌ 错了 ❌</div>
                      <div className={styles.feedbackMsg}>
                        <div className={styles.wrongAnswer}>你答的是：{answer || '空'}</div>
                        <div className={styles.correctAnswer}>正确答案：{feedback.expected}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.inputArea}>
          <div className={`glass-card ${styles.answerPanel}`}>
            <label className={styles.answerLabel}>你的答案</label>
            <div className={styles.answerDisplay}>
              <input
                value={answer}
                placeholder="请输入答案"
                readOnly
                className={answer ? styles.hasValue : ''}
              />
            </div>
          </div>

          <form className={`glass-card ${styles.keypadPanel}`} onSubmit={onSubmit}>
            <div className={styles.padGrid}>
              {keypadButtons.map(({ key, label, onPress, type = 'button', variant, span }) => {
                const variantClass =
                  variant === 'action' ? styles.padAction : variant === 'submit' ? styles.padSubmit : '';
                const spanClass = span === 'wide' ? styles.padWide : '';
                const classes = [styles.padButton, variantClass, spanClass].filter(Boolean).join(' ');

                return (
                  <button
                    key={key}
                    type={type}
                    onClick={(evt) => {
                      evt.preventDefault(); // 阻止所有按钮的默认行为
                      evt.stopPropagation(); // 阻止事件冒泡
                      if (type === 'submit') {
                        // 提交按钮：检查答案和状态
                        if (!answer.trim() || state !== 'playing' || isSubmitting) return;
                      } else {
                        // 数字/操作按钮：如果正在提交中则禁止输入
                        if (isSubmitting) return;
                      }
                      onPress();
                    }}
                    disabled={type === 'submit' && (!answer.trim() || state !== 'playing' || isSubmitting)}
                    className={classes}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </form>
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className={`glass-card ${styles.bottomPanel}`}>
        <div className={styles.bottomStats}>
          <div>
            <span className={styles.statLabel}>进度</span>
            <strong className={styles.statValue}>
              {answeredQuestions}/{totalQuestions}
            </strong>
          </div>
          <div>
            <span className={styles.statLabel}>正确率</span>
            <strong className={styles.statValue}>{accuracy}%</strong>
          </div>
          <div>
            <span className={styles.statLabel}>最高连击</span>
            <strong className={styles.statValue}>{snapshot?.maxCombo ?? 0}</strong>
          </div>
        </div>
        <div className={styles.actionRow}>
          <button className="btn secondary" onClick={() => navigate('/levels')}>
            ⬅️ 返回关卡
          </button>
          <button
            className="btn secondary"
            onClick={handleExit}
            style={{ background: showExitConfirm ? 'linear-gradient(135deg, #ef4444, #dc2626)' : undefined }}
          >
            {showExitConfirm ? '⚠️ 确认退出？' : '❌ 退出'}
          </button>
        </div>
      </footer>
    </div>
  );
};
