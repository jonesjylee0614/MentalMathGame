import { useState, useEffect } from 'react';
import { levelsApi } from '../api/levels';
import { Level } from '../lib/types';

interface UseLevelResult {
  level: Level | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching a single level detail from backend API
 * Requires network connection
 * @param levelId - Level ID to fetch
 * @returns Level data, loading state, and error
 */
export const useLevel = (levelId: string | undefined): UseLevelResult => {
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!levelId) {
      setLevel(null);
      setLoading(false);
      return;
    }

    const fetchLevel = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await levelsApi.getLevelDetail(levelId);
        
        if (response.success && response.data) {
          // 转换数据格式
          const transformedLevel: Level = {
            id: response.data.id,
            category: response.data.category,
            name: response.data.name,
            desc: response.data.description || '',
            generator: response.data.generator_config || {},
            count: response.data.question_count || 20,
            timeSec: response.data.time_limit || 120,
            targetTime: response.data.target_time || 0,
            difficulty: response.data.difficulty || 1.0,
            rewardPoints: response.data.reward_points || 0,
            gameMode: response.data.game_mode,
            recommendedModes: response.data.recommended_modes || [],
            modeConfig: response.data.mode_config || {},
          };
          
          setLevel(transformedLevel);
        } else {
          setError(response.message || '关卡未找到');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '网络错误';
        setError(errorMsg);
        console.error('Failed to fetch level:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, [levelId]);

  return { level, loading, error };
};

