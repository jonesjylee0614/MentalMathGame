import { useState, useEffect } from 'react';
import { levelsApi } from '../api/levels';
import { Level } from '../lib/types';

interface UseLevelsResult {
  levels: Level[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching levels from backend API
 * Requires network connection
 * @param category - Optional category filter
 * @returns Levels data, loading state, error, and refresh function
 */
export const useLevels = (category?: string): UseLevelsResult => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await levelsApi.getLevels({ category, status: 1 });
      
      if (response.success && response.data && response.data.length > 0) {
        // 转换后端数据格式到前端格式
        const transformedLevels = response.data.map((level: any) => ({
          id: level.id,
          category: level.category,
          name: level.name,
          desc: level.description || '',
          generator: level.generator_config || {},
          count: level.question_count || 20,
          timeSec: level.time_limit || 120,
          targetTime: level.target_time || 0,
          difficulty: level.difficulty || 1.0,
          rewardPoints: level.reward_points || 0,
          gameMode: level.game_mode,
          recommendedModes: level.recommended_modes || [],
          modeConfig: level.mode_config || {},
        }));
        
        setLevels(transformedLevels);
      } else {
        setError(response.message || 'API返回数据为空');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '网络错误';
      setError(errorMsg);
      console.error('Failed to fetch levels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, [category]);

  return {
    levels,
    loading,
    error,
    refresh: fetchLevels,
  };
};

