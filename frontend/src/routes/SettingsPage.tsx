import { FormEvent, useState } from 'react';
import { useGame } from '../context/GameContext';
import styles from '../styles/SettingsPage.module.css';

export const SettingsPage = () => {
  const { profile, setProfile, settings, updateSettings } = useGame();
  const [name, setName] = useState(profile.name);

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    if (!name.trim()) return;
    setProfile({ ...profile, name: name.trim() });
  };

  return (
    <div className={`fade-in ${styles.wrapper}`}>
      <section className={`glass-card ${styles.profileCard}`}>
        <header className={styles.cardHeader}>
          <div>
            <h3>👤 玩家档案</h3>
            <p>为勇士起一个响亮的名字吧，排行榜上更易被识别。</p>
          </div>
        </header>
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.inputRow}>
            <span>昵称</span>
            <input value={name} onChange={(evt) => setName(evt.target.value)} placeholder="输入你的勇士昵称" />
          </label>
          <button className="btn" type="submit">
            保存昵称
          </button>
        </form>
      </section>

      <section className={`glass-card ${styles.preferenceCard}`}>
        <header className={styles.cardHeader}>
          <div>
            <h3>🎛️ 游戏偏好</h3>
            <p>根据自己的习惯调整体验，保持专注与沉浸感。</p>
          </div>
        </header>
        <div className={styles.toggles}>
          <label className={styles.toggleRow}>
            <div>
              <strong>音效反馈</strong>
              <p>解题时播放提示音，强化节奏感。</p>
            </div>
            <div className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.audio}
                onChange={(evt) => updateSettings({ audio: evt.target.checked })}
              />
              <span />
            </div>
          </label>
          <label className={styles.toggleRow}>
            <div>
              <strong>震动动画</strong>
              <p>答错时轻微震动提醒，增强反馈。</p>
            </div>
            <div className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.shake}
                onChange={(evt) => updateSettings({ shake: evt.target.checked })}
              />
              <span />
            </div>
          </label>
          <label className={styles.toggleRow}>
            <div>
              <strong>色盲模式</strong>
              <p>启用高对比配色，让信息更易识别。</p>
            </div>
            <div className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.colorblind}
                onChange={(evt) => updateSettings({ colorblind: evt.target.checked })}
              />
              <span />
            </div>
          </label>
          <label className={`${styles.toggleRow} ${styles.sliderRow}`}>
            <div>
              <strong>字体缩放</strong>
              <p>调节界面文字大小，保护视力。</p>
            </div>
            <div className={styles.rangeControl}>
              <input
                type="range"
                min={0.8}
                max={1.4}
                step={0.1}
                value={settings.fontScale}
                onChange={(evt) => updateSettings({ fontScale: Number(evt.target.value) })}
              />
              <span>{settings.fontScale.toFixed(1)}x</span>
            </div>
          </label>
        </div>
      </section>
    </div>
  );
};
