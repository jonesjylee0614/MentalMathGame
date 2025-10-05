import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { PropsWithChildren, useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import styles from '../styles/Layout.module.css';

const links = [
  { to: '/', label: '🏠 首页' },
  { to: '/levels', label: '🧩 关卡' },
  { to: '/stats', label: '📊 统计' },
  { to: '/settings', label: '⚙️ 设置' }
];

export const Layout = ({ children }: PropsWithChildren) => {
  const { profile, stats, settings } = useGame();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const subtitle = useMemo(() => {
    if (location.pathname.startsWith('/levels')) return '选择一场新的冒险';
    if (location.pathname.startsWith('/stats')) return '回顾你的战绩';
    if (location.pathname.startsWith('/settings')) return '调校战斗准备';
    if (location.pathname.startsWith('/play')) return '迎战心算怪兽';
    return '欢迎回到心算勇士殿堂';
  }, [location.pathname]);

  const shellClass = settings.colorblind ? `${styles.shell} ${styles.colorblind}` : styles.shell;

  const handleMenuClick = (path: string) => {
    navigate(path);
    setShowMenu(false);
  };

  return (
    <div className={shellClass} style={{ fontSize: `${settings.fontScale}rem` }}>
      <aside className={styles.sidebar}>
        <div className={styles.brand} onClick={() => navigate('/')}>🧠 心算勇士</div>
        <div className={styles.profileCard}>
          <p className={styles.profileName}>{profile.name}</p>
          <p className={styles.profileMeta}>累计积分 {stats.totalScore}</p>
        </div>
        <nav className={styles.nav}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? `${styles.navItem} ${styles.active}` : styles.navItem)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarGlow} />
      </aside>
      <main className={styles.main}>
        <div className={styles.topBar}>
          <button className={styles.homeButton} onClick={() => navigate('/')}>
            🏠 首页 · Mental Math Arena
          </button>
          <div className={styles.topBarRight}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{profile.name}</span>
              <span className={styles.userScore}>{stats.totalScore} 分</span>
            </div>
            <button className={styles.menuButton} onClick={() => setShowMenu(!showMenu)}>
              ☰
            </button>
          </div>
        </div>

        {showMenu && (
          <>
            <div className={styles.menuOverlay} onClick={() => setShowMenu(false)} />
            <div className={styles.menuPanel}>
              <div className={styles.menuHeader}>
                <h3>菜单</h3>
                <button className={styles.closeButton} onClick={() => setShowMenu(false)}>×</button>
              </div>
              <div className={styles.menuItems}>
                <button className={styles.menuItem} onClick={() => handleMenuClick('/')}>
                  <span className={styles.menuIcon}>🏠</span>
                  <span>首页</span>
                </button>
                <button className={styles.menuItem} onClick={() => handleMenuClick('/levels')}>
                  <span className={styles.menuIcon}>🧩</span>
                  <span>关卡</span>
                </button>
                <button className={styles.menuItem} onClick={() => handleMenuClick('/stats')}>
                  <span className={styles.menuIcon}>📊</span>
                  <span>统计</span>
                </button>
                <button className={styles.menuItem} onClick={() => handleMenuClick('/settings')}>
                  <span className={styles.menuIcon}>⚙️</span>
                  <span>设置</span>
                </button>
              </div>
              <div className={styles.menuFooter}>
                <div className={styles.profileInfo}>
                  <p className={styles.profileName}>{profile.name}</p>
                  <p className={styles.profileScore}>累计积分: {stats.totalScore}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className={styles.content}>{children}</div>
        <nav className={styles.mobileNav}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? `${styles.mobileNavItem} ${styles.active}` : styles.mobileNavItem)}
            >
              <span className={styles.mobileNavIcon}>{link.label.split(' ')[0]}</span>
              <span>{link.label.split(' ')[1]}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
};
