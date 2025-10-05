import { Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './routes/HomePage';
import { LevelsPage } from './routes/LevelsPage';
import { PlayPage } from './routes/PlayPage';
import { StatsPage } from './routes/StatsPage';
import { SettingsPage } from './routes/SettingsPage';
import { ResultPage } from './routes/ResultPage';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/levels" element={<LevelsPage />} />
        <Route path="/play/:levelId" element={<PlayPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
