import React, { createContext, useContext, useState, useEffect } from 'react';
import { levelsApi } from '../api/levels';
import { Level } from '../lib/types';
import { setLevels } from '../lib/levels';

interface LevelsContextValue {
  levels: Level[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const LevelsContext = createContext<LevelsContextValue | undefined>(undefined);

/**
 * Provider for global levels data management
 * Fetches levels from API - requires network connection
 */
export const LevelsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [levels, setLevelsState] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 开始加载关卡数据...');
      const response = await levelsApi.getLevels({ status: 1 });
      
      console.log('📦 LevelsContext 收到响应:', response);
      
      if (response.success && response.data && response.data.length > 0) {
        // 转换后端数据格式到前端格式
        const transformedLevels = response.data.map((level: any) => {
          // 解析generator_config（可能是JSON字符串）
          let generator = level.generator_config || {};
          if (typeof generator === 'string') {
            try {
              generator = JSON.parse(generator);
            } catch (e) {
              console.error(`解析generator_config失败 [${level.id}]:`, e, generator);
              generator = {};
            }
          }
          
          console.log(`关卡 [${level.id}] generator:`, generator);
          
          return {
            id: level.id,
            category: level.category,
            name: level.name,
            desc: level.description || '',
            generator,
            count: level.question_count || 20,
            timeSec: level.time_limit || 120,
            targetTime: level.target_time || 0,
            difficulty: level.difficulty || 1.0,
            rewardPoints: level.reward_points || 0,
            gameMode: level.game_mode,
            recommendedModes: level.recommended_modes || [],
            modeConfig: level.mode_config || {},
          };
        });
        
        setLevelsState(transformedLevels);
        setLevels(transformedLevels); // 更新全局缓存供工具函数使用
        console.log('✅ 成功从API加载关卡数据', transformedLevels.length, '个关卡');
        console.log('📋 前3个关卡示例:', transformedLevels.slice(0, 3));
      } else {
        const errorMsg = response.message || 'API返回数据为空';
        setError(errorMsg);
        console.error('❌ API响应不符合预期:', { success: response.success, dataLength: response.data?.length });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '网络错误';
      setError(errorMsg);
      console.error('❌ API请求失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  return (
    <LevelsContext.Provider value={{ levels, loading, error, refresh: fetchLevels }}>
      {children}
    </LevelsContext.Provider>
  );
};

/**
 * Hook to access levels context
 * Must be used within LevelsProvider
 */
export const useLevelsContext = () => {
  const context = useContext(LevelsContext);
  if (!context) {
    throw new Error('useLevelsContext must be used within LevelsProvider');
  }
  return context;
};

