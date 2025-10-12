import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCategories } from '../lib/levels';
import styles from '../styles/LevelsPage.module.css';

export const LevelsPage = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const keyword = search.trim();
    if (!keyword) return listCategories();
    return listCategories()
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          [item.name, item.desc, item.category, item.id].some((text) => text.includes(keyword))
        )
      }))
      .filter((category) => category.items.length > 0);
  }, [search]);

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
            {category.items.map((level) => (
              <div key={level.id} className={styles.levelCard}>
                <div className={styles.levelInfo}>
                  <h4>{level.name}</h4>
                  <p>{level.desc}</p>
                </div>
                <div className={styles.levelStats}>
                  <span>题量 {level.count}</span>
                  <span>时限 {level.timeSec}s</span>
                  <span>难度 {level.difficulty.toFixed(1)}</span>
                </div>
                <button className="btn small" onClick={() => navigate(`/play/${level.id}`)}>
                  开始挑战
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {!categories.length && (
        <div className={`glass-card ${styles.empty}`}>没有符合条件的关卡，换个关键词试试。</div>
      )}
    </div>
  );
};
