import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { MusicModeComponent } from '../../../components/gameModes/MusicModeComponent';

const encouragingMessages = [
  '🎵 完美音符！',
  '🎶 真好听！',
  '✨ 音乐天才！',
  '🎼 节奏感真好！',
  '🎹 弹得真棒！',
];

const missMessages = [
  '🎵 差一点点！',
  '🎶 再试一次！',
  '😅 音没对上！',
];

/**
 * 音符定义
 * 每个音符对应一个频率和位置
 */
const MUSICAL_NOTES = [
  { note: 'C4', frequency: 261.63, emoji: '🎵', position: 5, name: 'Do' },
  { note: 'D4', frequency: 293.66, emoji: '🎶', position: 4, name: 'Re' },
  { note: 'E4', frequency: 329.63, emoji: '🎵', position: 3, name: 'Mi' },
  { note: 'F4', frequency: 349.23, emoji: '🎶', position: 2, name: 'Fa' },
  { note: 'G4', frequency: 392.00, emoji: '🎵', position: 1, name: 'Sol' },
  { note: 'A4', frequency: 440.00, emoji: '🎶', position: 2, name: 'La' },
  { note: 'B4', frequency: 493.88, emoji: '🎵', position: 3, name: 'Si' },
  { note: 'C5', frequency: 523.25, emoji: '🎶', position: 4, name: 'Do高' },
];

/**
 * 预设旋律
 * 简单的儿歌旋律
 */
const MELODIES = {
  'twinkle': { // 小星星
    name: '小星星',
    notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'],
    emoji: '⭐'
  },
  'happy': { // 欢乐颂
    name: '欢乐颂',
    notes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4'],
    emoji: '😊'
  },
  'simple': { // 简单旋律
    name: '快乐旋律',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'],
    emoji: '🎉'
  }
};

/**
 * 音乐模式
 * 通过答题演奏音符，组成一首完整的曲子
 */
export class MusicMode extends BaseGameMode {
  readonly id = 'music';
  readonly name = '音乐模式';

  private timers: number[] = []; // 存储所有定时器，用于清理
  private audioContext: AudioContext | null = null; // Web Audio API 上下文

  protected initState() {
    // 从配置中获取旋律类型
    const melodyType = this.config.modeConfig?.melody || 'simple';
    const melody = MELODIES[melodyType as keyof typeof MELODIES] || MELODIES.simple;
    
    return {
      totalQuestions: 0,
      correctCount: 0,
      currentNoteIndex: 0, // 当前演奏到第几个音符
      melody, // 选中的旋律
      playedNotes: [] as any[], // 已演奏的音符
      isPlaying: false, // 是否正在播放音符
      currentNote: null, // 当前播放的音符
      pianoKeys: [], // 钢琴键盘状态
      isComplete: false, // 是否完成
      successMsg: '',
      missMsg: '',
      completionMsg: '',
      soundWaves: [] as any[], // 音波效果
    };
  }

  onGameStart(totalQuestions: number): void {
    super.onGameStart(totalQuestions);
    
    // 初始化钢琴键盘（8个键）
    const pianoKeys = MUSICAL_NOTES.map((note, index) => ({
      id: index,
      note: note.note,
      name: note.name,
      active: false,
    }));

    this.setState({
      totalQuestions,
      correctCount: 0,
      currentNoteIndex: 0,
      playedNotes: [],
      pianoKeys,
    });

    // 初始化音频上下文（首次用户交互后才能创建）
    this.initAudioContext();
  }

  /**
   * 初始化 Web Audio API
   */
  private initAudioContext(): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);
    
    const randomMsg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    
    // 增加答对计数
    const newCorrectCount = this.state.correctCount + 1;
    
    // 获取下一个要演奏的音符
    const noteIndex = this.state.currentNoteIndex;
    const melody = this.state.melody;
    
    if (noteIndex < melody.notes.length) {
      const noteName = melody.notes[noteIndex];
      const noteInfo = MUSICAL_NOTES.find(n => n.note === noteName);
      
      if (noteInfo) {
        // 播放音符
        this.playNote(noteInfo.frequency, noteInfo.note);
        
        // 添加到已演奏列表
        const playedNote = {
          id: `note-${Date.now()}`,
          note: noteInfo.note,
          emoji: noteInfo.emoji,
          name: noteInfo.name,
          position: noteInfo.position,
          index: noteIndex,
        };
        
        this.state.playedNotes.push(playedNote);
        
        // 更新状态
        this.setState({
          isPlaying: true,
          currentNote: playedNote,
          successMsg: randomMsg,
          correctCount: newCorrectCount,
          currentNoteIndex: noteIndex + 1,
          playedNotes: [...this.state.playedNotes],
        });

        // 添加音波效果
        this.addSoundWave();

        // 激活对应的钢琴键
        this.activatePianoKey(noteInfo.note);
      }
    }

    // 检查是否完成整首曲子
    if (this.state.currentNoteIndex >= melody.notes.length - 1) {
      const timer1 = window.setTimeout(() => {
        this.completeSong();
      }, 1000);
      this.timers.push(timer1);
    }

    // 1.5秒后重置动画状态
    const timer2 = window.setTimeout(() => {
      this.setState({
        isPlaying: false,
        currentNote: null,
        successMsg: '',
        soundWaves: [],
      });
    }, 1500);
    this.timers.push(timer2);

    this.emit('notePlayed', { note: noteInfo, index: noteIndex });
  }

  onWrongAnswer(
    question: Question, 
    snapshot: GameSnapshot, 
    userAnswer: string, 
    correctAnswer: string
  ): void {
    super.onWrongAnswer(question, snapshot, userAnswer, correctAnswer);
    
    const randomMsg = missMessages[Math.floor(Math.random() * missMessages.length)];
    
    // 播放不和谐音
    this.playDissonance();
    
    this.setState({
      missMsg: randomMsg,
    });

    this.emit('noteMissed', {});

    // 1.5秒后清除消息
    const timer = window.setTimeout(() => {
      this.setState({
        missMsg: '',
      });
    }, 1500);
    this.timers.push(timer);
  }

  /**
   * 播放音符
   */
  private playNote(frequency: number, noteName: string): void {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine'; // 正弦波，柔和的音色
      oscillator.frequency.value = frequency;
      
      // 音量包络（ADSR）
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.3); // Decay & Sustain
      gainNode.gain.linearRampToValueAtTime(0, now + 0.5); // Release
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(now);
      oscillator.stop(now + 0.5);
    } catch (error) {
      console.warn('Error playing note:', error);
    }
  }

  /**
   * 播放不和谐音（答错时）
   */
  private playDissonance(): void {
    if (!this.audioContext) return;

    try {
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator1.type = 'sawtooth';
      oscillator2.type = 'sawtooth';
      oscillator1.frequency.value = 200; // 不和谐的频率组合
      oscillator2.frequency.value = 211;
      
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator1.start(now);
      oscillator2.start(now);
      oscillator1.stop(now + 0.3);
      oscillator2.stop(now + 0.3);
    } catch (error) {
      console.warn('Error playing dissonance:', error);
    }
  }

  /**
   * 激活钢琴键
   */
  private activatePianoKey(noteName: string): void {
    const keys = this.state.pianoKeys.map((key: any) => ({
      ...key,
      active: key.note === noteName,
    }));
    
    this.setState({ pianoKeys: keys });

    // 0.5秒后恢复
    const timer = window.setTimeout(() => {
      const restoredKeys = this.state.pianoKeys.map((key: any) => ({
        ...key,
        active: false,
      }));
      this.setState({ pianoKeys: restoredKeys });
    }, 500);
    this.timers.push(timer);
  }

  /**
   * 添加音波效果
   */
  private addSoundWave(): void {
    const wave = {
      id: `wave-${Date.now()}`,
      x: 50,
      y: 50,
    };

    this.setState({
      soundWaves: [...this.state.soundWaves, wave],
    });
  }

  /**
   * 完成整首曲子
   */
  private completeSong(): void {
    const melody = this.state.melody;
    
    this.setState({
      isComplete: true,
      completionMsg: `🎉 《${melody.name}》演奏完成！`,
    });

    // 播放完整曲子（快速回放）
    this.playCompleteMelody();

    this.emit('songComplete', { melody });
  }

  /**
   * 播放完整曲子（庆祝用）
   */
  private playCompleteMelody(): void {
    if (!this.audioContext) return;

    const melody = this.state.melody;
    melody.notes.forEach((noteName, index) => {
      const noteInfo = MUSICAL_NOTES.find(n => n.note === noteName);
      if (noteInfo) {
        const timer = window.setTimeout(() => {
          this.playNote(noteInfo.frequency, noteInfo.note);
        }, index * 200); // 每个音符间隔200ms
        this.timers.push(timer);
      }
    });
  }

  onGameEnd(result: GameResult): void {
    super.onGameEnd(result);
    // 确保完成动画
    if (!this.state.isComplete) {
      this.completeSong();
    }
  }

  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    
    // 关闭音频上下文
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    super.destroy();
  }

  getComponent() {
    return MusicModeComponent;
  }
}

/**
 * 音乐模式工厂
 */
export const MusicModeFactory = {
  modeId: 'music',
  name: '音乐模式工厂',
  create: (config: any, context: any) => {
    const mode = new MusicMode();
    mode.init(config, context);
    return mode;
  }
};

// 导出常量供组件使用
export { MUSICAL_NOTES, MELODIES };

