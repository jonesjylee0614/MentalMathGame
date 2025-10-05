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
    <div className="fade-in">
      <section className={`glass-card ${styles.card}`}>
        <h3>👤 玩家档案</h3>
        <form className={styles.form} onSubmit={onSubmit}>
          <label>
            <span>昵称</span>
            <input value={name} onChange={(evt) => setName(evt.target.value)} placeholder="输入你的勇士昵称" />
          </label>
          <button className="btn" type="submit">
            保存昵称
          </button>
        </form>
      </section>

      <section className={`glass-card ${styles.card}`}>
        <h3>🎛️ 游戏偏好</h3>
        <div className={styles.toggles}>
          <label className={styles.toggleRow}>
            <span>音效反馈</span>
            <input
              type="checkbox"
              checked={settings.audio}
              onChange={(evt) => updateSettings({ audio: evt.target.checked })}
            />
          </label>
          <label className={styles.toggleRow}>
            <span>震动动画</span>
            <input
              type="checkbox"
              checked={settings.shake}
              onChange={(evt) => updateSettings({ shake: evt.target.checked })}
            />
          </label>
          <label className={styles.toggleRow}>
            <span>色盲模式</span>
            <input
              type="checkbox"
              checked={settings.colorblind}
              onChange={(evt) => updateSettings({ colorblind: evt.target.checked })}
            />
          </label>
          <label className={styles.toggleRow}>
            <span>字体缩放</span>
            <input
              type="range"
              min={0.8}
              max={1.4}
              step={0.1}
              value={settings.fontScale}
              onChange={(evt) => updateSettings({ fontScale: Number(evt.target.value) })}
            />
          </label>
        </div>
      </section>
    </div>
  );
};
