import { Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './routes/HomePage';
import { LoginPage } from './routes/LoginPage';
import { RegisterPage } from './routes/RegisterPage';
import { ProfilePage } from './routes/ProfilePage';
import { LeaderboardPage } from './routes/LeaderboardPage';
import { AchievementsPage } from './routes/AchievementsPage';
import { LevelsPage } from './routes/LevelsPage';
import { PlayPage } from './routes/PlayPage';
import { StatsPage } from './routes/StatsPage';
import { SettingsPage } from './routes/SettingsPage';
import { ResultPage } from './routes/ResultPage';
import { LogViewerPage } from './routes/LogViewerPage';

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/logs" element={<LogViewerPage />} />
        
        {/* 需要布局的路由 */}
        <Route element={<Layout />}>
          {/* 游客可访问 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/play/:levelId" element={<PlayPage />} />
          <Route path="/result" element={<ResultPage />} />
          
          {/* 需要登录 */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/levels"
            element={
              <PrivateRoute>
                <LevelsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <PrivateRoute>
                <StatsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <LeaderboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <PrivateRoute>
                <AchievementsPage />
              </PrivateRoute>
            }
          />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
