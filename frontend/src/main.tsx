import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { registerGameModes } from './lib/gameModes/registry';
import './styles/global.css';

// 应用启动时注册所有游戏模式
registerGameModes();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
