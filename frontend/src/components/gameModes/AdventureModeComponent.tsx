import React from 'react';
import { GameModeRenderProps } from '../../lib/gameModes/IGameMode';
import { MapNode } from '../../lib/gameModes/modes/AdventureMode';
import styles from '../../styles/gameModes/AdventureMode.module.css';

/**
 * 探险模式组件
 */
export const AdventureModeComponent: React.FC<GameModeRenderProps> = ({
  state,
  snapshot,
  question,
  feedback
}) => {
  const {
    mapNodes = [],
    currentNodeIndex = 0,
    playerPosition = { x: 0, y: 0 },
    isMoving = false,
    showObstacle = false,
    showTreasure = false,
    obstacleNode = null,
    completedNodes = 0,
    totalNodes = 0
  } = state.data;

  const currentNode = mapNodes[currentNodeIndex];
  const progressPercent = totalNodes > 0
    ? Math.round((completedNodes / totalNodes) * 100)
    : 0;

  // 绘制路径连线
  const renderPaths = () => {
    const paths: JSX.Element[] = [];
    for (let i = 0; i < mapNodes.length - 1; i++) {
      const node1 = mapNodes[i];
      const node2 = mapNodes[i + 1];
      
      const isUnlocked = node2.unlocked;
      const isVisited = node1.visited && node2.visited;
      
      paths.push(
        <line
          key={`path-${i}`}
          x1={`${node1.x}%`}
          y1={`${node1.y}%`}
          x2={`${node2.x}%`}
          y2={`${node2.y}%`}
          className={`${styles.path} ${isVisited ? styles.pathVisited : ''} ${isUnlocked ? styles.pathUnlocked : ''}`}
          strokeWidth="4"
          strokeDasharray={isVisited ? '0' : '8,8'}
        />
      );
    }
    return paths;
  };

  return (
    <div className={styles.adventureScene}>
      {/* 标题和进度 */}
      <div className={styles.header}>
        <div className={styles.title}>🗺️ 探险地图</div>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {completedNodes} / {totalNodes} ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* 地图容器 */}
      <div className={styles.mapContainer}>
        {/* SVG路径 */}
        <svg className={styles.pathsSvg}>
          {renderPaths()}
        </svg>

        {/* 地图节点 */}
        {mapNodes.map((node: MapNode, index: number) => (
          <div
            key={node.id}
            className={`${styles.mapNode} ${styles[`node-${node.type}`]} ${
              node.visited ? styles.visited : ''
            } ${
              !node.unlocked ? styles.locked : ''
            } ${
              index === currentNodeIndex ? styles.current : ''
            }`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`
            }}
          >
            <div className={styles.nodeIcon}>
              {!node.unlocked ? '🔒' : node.emoji}
            </div>
            
            {/* 节点编号 */}
            <div className={styles.nodeNumber}>{node.id}</div>

            {/* 路障动画 */}
            {showObstacle && obstacleNode === index && (
              <div className={styles.obstacle}>
                🚧
              </div>
            )}

            {/* 节点类型标签 */}
            {node.type === 'treasure' && node.unlocked && (
              <div className={styles.nodeLabel}>宝箱</div>
            )}
            {node.type === 'trap' && node.unlocked && (
              <div className={styles.nodeLabel}>陷阱</div>
            )}
            {node.type === 'boss' && node.unlocked && (
              <div className={styles.nodeLabel}>Boss</div>
            )}
            {node.type === 'checkpoint' && node.unlocked && (
              <div className={styles.nodeLabel}>检查点</div>
            )}
          </div>
        ))}

        {/* 玩家位置指示器 */}
        <div
          className={`${styles.player} ${isMoving ? styles.moving : ''}`}
          style={{
            left: `${playerPosition.x}%`,
            top: `${playerPosition.y}%`
          }}
        >
          🧙
        </div>
      </div>

      {/* 宝箱动画 */}
      {showTreasure && (
        <div className={styles.treasurePopup}>
          <div className={styles.treasureIcon}>🎁</div>
          <div className={styles.treasureText}>发现宝箱！</div>
        </div>
      )}

      {/* 当前节点信息 */}
      {currentNode && (
        <div className={styles.currentNodeInfo}>
          <div className={styles.currentNodeIcon}>{currentNode.emoji}</div>
          <div className={styles.currentNodeText}>
            {currentNode.type === 'start' && '起点 - 开始冒险！'}
            {currentNode.type === 'normal' && '前进中...'}
            {currentNode.type === 'treasure' && '宝箱 - 额外奖励！'}
            {currentNode.type === 'trap' && '陷阱 - 小心！'}
            {currentNode.type === 'checkpoint' && '检查点 - 继续努力！'}
            {currentNode.type === 'boss' && 'Boss战 - 全力以赴！'}
            {currentNode.type === 'end' && '终点 - 胜利在望！'}
          </div>
        </div>
      )}

      {/* 反馈提示 */}
      {feedback && (
        <div className={`${styles.feedback} ${feedback.correct ? styles.success : styles.error}`}>
          {feedback.correct ? (
            <>
              <span className={styles.feedbackIcon}>✅</span>
              <span>前进！</span>
            </>
          ) : (
            <>
              <span className={styles.feedbackIcon}>❌</span>
              <span>被路障挡住了！</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

