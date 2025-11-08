import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLevelsContext } from '../context/LevelsContext';
import { useGame } from '../context/GameContext';
import { Level } from '../lib/types';
import styles from '../styles/LevelsPage.module.css';

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

export const LevelsPage = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { progress } = useGame();
  const { levels, loading, error } = useLevelsContext();

  const categories = useMemo(() => {
    // 将levels按category分组
    const map = new Map<string, Level[]>();
    levels.forEach((level) => {
      if (!map.has(level.category)) map.set(level.category, []);
      map.get(level.category)!.push(level);
    });
    
    const allCategories = Array.from(map.entries()).map(([name, items]) => ({ 
      name, 
      items 
    }));
    
    // 应用搜索过滤
    const keyword = search.trim();
    if (!keyword) return allCategories;
    
    return allCategories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          [item.name, item.desc, item.category, item.id].some((text) => 
            text.includes(keyword)
          )
        )
      }))
      .filter((category) => category.items.length > 0);
  }, [levels, search]);

  // 加载状态
  if (loading) {
    return (
      <div className="fade-in">
        <div className="glass-card">
          <p>⏳ 加载关卡中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="fade-in">
        <div className="glass-card">
          <h3>❌ 加载失败</h3>
          <p>{error}</p>
          <button className="btn" onClick={() => window.location.reload()}>
            🔄 重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <section className={`glass-card ${styles.searchCard}`}>
        <div>
          <h2>🧩 选择你的战场</h2>
          <p>筛选关卡，逐个突破，提升战力。</p>
        </div>
        <div className={styles.searchBox}>
          <input
            value={search}
            onChange={(evt) => setSearch(evt.target.value)}
            placeholder="输入关键词（加法、乘法、进位...）"
          />
        </div>
      </section>

      {categories.map((category) => (
        <section key={category.name} className="glass-card">
          <header className={styles.categoryHeader}>
            <h3>{category.name}</h3>
            <span className="tag">共 {category.items.length} 个挑战</span>
          </header>
          <div className={styles.levelGrid}>
            {category.items.map((level, index) => {
              const levelProgress = progress.find(p => p.levelId === level.id);
              const isCompleted = levelProgress && levelProgress.lastOutcome === 'victory';
              const playCount = levelProgress?.playCount || 0;
              
              return (
                <div key={level.id} className={`${styles.levelCard} ${isCompleted ? styles.completed : ''}`}>
                  <div className={styles.levelHeader}>
                    <span className={styles.levelNumber}>第 {index + 1} 关</span>
                    {level.gameMode && (
                      <span className={styles.gameModeBadge}>
                        {getGameModeIcon(level.gameMode)} {getGameModeName(level.gameMode)}
                      </span>
                    )}
                  </div>
                  
                  {isCompleted && (
                    <div className={styles.completedBadge}>
                      ✓ 已完成
                    </div>
                  )}
                  
                  <div className={styles.levelInfo}>
                    <h4>{level.name}</h4>
                    {/* 只显示第一行描述，简化显示 */}
                    <p>{level.desc.split('\n')[0]}</p>
                  </div>
                  
                  <div className={styles.levelStats}>
                    <span title="题目数量">📝 {level.count}题</span>
                    <span title="时间限制">⏱️ {level.timeSec}秒</span>
                    <span title="难度系数">⭐ 难度{level.difficulty.toFixed(1)}</span>
                  </div>
                  
                  {/* 奖励积分显示 */}
                  {level.rewardPoints && level.rewardPoints > 0 ? (
                    <div className={styles.rewardInfo}>
                      <span className={styles.rewardBadge}>
                        🎁 奖励 {level.rewardPoints} 积分
                      </span>
                      <span className={styles.rewardCondition}>
                        （全对且{level.targetTime || level.timeSec}秒内完成）
                      </span>
                    </div>
                  ) : (
                    <div className={styles.rewardInfo}>
                      <span className={styles.noReward}>无积分奖励</span>
                    </div>
                  )}
                  
                  {levelProgress && (
                    <div className={styles.progressInfo}>
                      <div className={styles.progressStat}>
                        <span className={styles.progressLabel}>最高分</span>
                        <span className={styles.progressValue}>{levelProgress.bestScore}</span>
                      </div>
                      <div className={styles.progressStat}>
                        <span className={styles.progressLabel}>最高正确率</span>
                        <span className={styles.progressValue}>{Math.round(levelProgress.bestAccuracy * 100)}%</span>
                      </div>
                      <div className={styles.progressStat}>
                        <span className={styles.progressLabel}>练习次数</span>
                        <span className={styles.progressValue}>{playCount}次</span>
                      </div>
                    </div>
                  )}
                  
                  <button className="btn small" onClick={() => navigate(`/play/${level.id}`)}>
                    {isCompleted ? '🔁 重复练习' : '🎮 开始挑战'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {!categories.length && (
        <div className={`glass-card ${styles.empty}`}>没有符合条件的关卡，换个关键词试试。</div>
      )}
    </div>
  );
};
