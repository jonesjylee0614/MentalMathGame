import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Layout.module.css';

const links = [
  { to: '/', label: '🏠 首页', public: true },
  { to: '/levels', label: '🧩 关卡', public: false },
  { to: '/stats', label: '📊 统计', public: false },
  { to: '/settings', label: '⚙️ 设置', public: false },
  { to: '/leaderboard', label: '🏆 排行榜', public: false },
  { to: '/achievements', label: '🎖️ 成就', public: false }
];

export const Layout = () => {
  const { profile, stats, settings } = useGame();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
          <p className={styles.profileName}>{isAuthenticated ? user?.nickname : profile.name}</p>
          <p className={styles.profileMeta}>
            {isAuthenticated && user ? `Lv.${user.level} (${user.experience} EXP)` : `累计积分 ${stats.totalScore}`}
          </p>
        </div>
        <nav className={styles.nav}>
          {links.filter(link => link.public || isAuthenticated).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? `${styles.navItem} ${styles.active}` : styles.navItem)}
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <button className={styles.navItem} onClick={handleLogout}>
              🚪 登出
            </button>
          ) : (
            <NavLink to="/login" className={styles.navItem}>
              🔑 登录
            </NavLink>
          )}
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
              <span className={styles.userName}>{isAuthenticated ? user?.nickname : profile.name}</span>
              <span className={styles.userScore}>
                {isAuthenticated && user ? `Lv.${user.level}` : `${stats.totalScore} 分`}
              </span>
            </div>
            {isAuthenticated && (
              <button className={styles.profileButton} onClick={() => navigate('/profile')}>
                👤
              </button>
            )}
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
                {links.filter(link => link.public || isAuthenticated).map((link) => (
                  <button key={link.to} className={styles.menuItem} onClick={() => handleMenuClick(link.to)}>
                    <span className={styles.menuIcon}>{link.label.split(' ')[0]}</span>
                    <span>{link.label.split(' ')[1]}</span>
                  </button>
                ))}
                {isAuthenticated ? (
                  <>
                    <button className={styles.menuItem} onClick={() => handleMenuClick('/profile')}>
                      <span className={styles.menuIcon}>👤</span>
                      <span>个人中心</span>
                    </button>
                    <button className={styles.menuItem} onClick={handleLogout}>
                      <span className={styles.menuIcon}>🚪</span>
                      <span>登出</span>
                    </button>
                  </>
                ) : (
                  <button className={styles.menuItem} onClick={() => handleMenuClick('/login')}>
                    <span className={styles.menuIcon}>🔑</span>
                    <span>登录</span>
                  </button>
                )}
              </div>
              <div className={styles.menuFooter}>
                <div className={styles.profileInfo}>
                  <p className={styles.profileName}>{isAuthenticated ? user?.nickname : profile.name}</p>
                  <p className={styles.profileScore}>
                    {isAuthenticated && user ? `等级: ${user.level} | EXP: ${user.experience}` : `累计积分: ${stats.totalScore}`}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className={styles.content}>
          <Outlet />
        </div>
        <nav className={styles.mobileNav}>
          {links.filter(link => link.public || isAuthenticated).slice(0, 4).map((link) => (
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
