import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { gameApi } from '../api';

export const useDataSync = () => {
  const { isAuthenticated } = useAuth();

  // 同步离线队列
  const syncOfflineQueue = useCallback(async () => {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    
    if (queue.length === 0) return;

    console.log(`开始同步 ${queue.length} 条离线数据...`);

    for (const result of queue) {
      try {
        await gameApi.submitResult({
          level_id: result.levelId,
          score: result.score,
          correct_count: result.correct,
          total_questions: result.total,
          max_combo: result.comboMax,
          accuracy: result.accuracy,
          time_used: result.timeUsed,
          time_left: result.timeLeft,
          outcome: result.outcome,
          answers_history: result.history || [],
        });
      } catch (error) {
        console.error('同步失败', error);
        break; // 停止同步，保留剩余数据
      }
    }

    // 清空队列
    localStorage.removeItem('offlineQueue');
    console.log('离线数据同步完成');
  }, []);

  // 登录后自动同步
  useEffect(() => {
    if (isAuthenticated) {
      syncOfflineQueue();
    }
  }, [isAuthenticated, syncOfflineQueue]);

  return { syncOfflineQueue };
};


