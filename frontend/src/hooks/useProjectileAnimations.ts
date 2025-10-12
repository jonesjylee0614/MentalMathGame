import { useCallback, useEffect, useRef, useState } from 'react';

type TimeoutHandle = ReturnType<typeof setTimeout>;

type ProjectileKind = 'plant' | 'zombie';

type SpawnTimerRecord = {
  handle: TimeoutHandle;
  kind: ProjectileKind;
};

type CleanupTimerRecord = {
  handle: TimeoutHandle;
  kind: ProjectileKind;
};

const createProjectileId = () => Date.now() + Math.random();

const removeProjectile = (ids: number[], id: number) => ids.filter((item) => item !== id);

export const useProjectileAnimations = () => {
  const [plantProjectiles, setPlantProjectiles] = useState<number[]>([]);
  const [zombieProjectiles, setZombieProjectiles] = useState<number[]>([]);

  const spawnTimers = useRef<SpawnTimerRecord[]>([]);
  const cleanupTimers = useRef<Map<number, CleanupTimerRecord>>(new Map());

  const clearTimersByKind = useCallback((kind?: ProjectileKind) => {
    spawnTimers.current = spawnTimers.current.filter((record) => {
      if (!kind || record.kind === kind) {
        clearTimeout(record.handle);
        return false;
      }
      return true;
    });

    cleanupTimers.current.forEach((record, id) => {
      if (!kind || record.kind === kind) {
        clearTimeout(record.handle);
        cleanupTimers.current.delete(id);
      }
    });
  }, []);

  const scheduleProjectile = useCallback(
    (kind: ProjectileKind, index: number, interval: number, lifespan: number) => {
      const spawnTimer = setTimeout(() => {
        spawnTimers.current = spawnTimers.current.filter((record) => record.handle !== spawnTimer);

        const id = createProjectileId();
        if (kind === 'plant') {
          setPlantProjectiles((prev) => [...prev, id]);
        } else {
          setZombieProjectiles((prev) => [...prev, id]);
        }

        const cleanupTimer = setTimeout(() => {
          cleanupTimers.current.delete(id);
          if (kind === 'plant') {
            setPlantProjectiles((prev) => removeProjectile(prev, id));
          } else {
            setZombieProjectiles((prev) => removeProjectile(prev, id));
          }
        }, lifespan);

        cleanupTimers.current.set(id, { handle: cleanupTimer, kind });
      }, index * interval);

      spawnTimers.current.push({ handle: spawnTimer, kind });
    },
    []
  );

  const fireBurst = useCallback(
    (kind: ProjectileKind, count: number, interval: number, lifespan: number) => {
      for (let i = 0; i < count; i += 1) {
        scheduleProjectile(kind, i, interval, lifespan);
      }
    },
    [scheduleProjectile]
  );

  const firePlantBurst = useCallback(
    (count = 5, interval = 200, lifespan = 1200) => {
      fireBurst('plant', count, interval, lifespan);
    },
    [fireBurst]
  );

  const fireZombieBurst = useCallback(
    (count = 4, interval = 180, lifespan = 1000) => {
      fireBurst('zombie', count, interval, lifespan);
    },
    [fireBurst]
  );

  const clearPlantProjectiles = useCallback(() => {
    clearTimersByKind('plant');
    setPlantProjectiles([]);
  }, [clearTimersByKind]);

  const clearZombieProjectiles = useCallback(() => {
    clearTimersByKind('zombie');
    setZombieProjectiles([]);
  }, [clearTimersByKind]);

  const resetProjectiles = useCallback(() => {
    clearTimersByKind();
    setPlantProjectiles([]);
    setZombieProjectiles([]);
  }, [clearTimersByKind]);

  useEffect(() => {
    return () => {
      clearTimersByKind();
    };
  }, [clearTimersByKind]);

  return {
    plantProjectiles,
    zombieProjectiles,
    firePlantBurst,
    fireZombieBurst,
    clearPlantProjectiles,
    clearZombieProjectiles,
    resetProjectiles,
  };
};

