import { BaseGameMode } from '../BaseGameMode';
import { Question, GameSnapshot, GameResult } from '../../types';
import { AdventureModeComponent } from '../../../components/gameModes/AdventureModeComponent';

/**
 * 地图节点类型
 */
export type NodeType = 'start' | 'normal' | 'treasure' | 'trap' | 'checkpoint' | 'boss' | 'end';

/**
 * 地图节点
 */
export interface MapNode {
  id: number;
  type: NodeType;
  emoji: string;
  x: number; // 0-100%
  y: number; // 0-100%
  unlocked: boolean;
  visited: boolean;
}

/**
 * 探险模式
 * 走迷宫、爬山、探索地图
 */
export class AdventureMode extends BaseGameMode {
  readonly id = 'adventure';
  readonly name = '探险模式';

  private timers: number[] = [];

  protected initState() {
    return {
      mapNodes: [] as MapNode[],
      currentNodeIndex: 0,
      playerPosition: { x: 0, y: 0 },
      isMoving: false,
      showObstacle: false,
      showTreasure: false,
      obstacleNode: null as number | null,
      completedNodes: 0,
      totalNodes: 0
    };
  }

  onGameStart(totalQuestions: number): void {
    super.onGameStart(totalQuestions);
    
    // 生成地图节点
    const nodes = this.generateMap(totalQuestions);
    
    this.setState({
      mapNodes: nodes,
      totalNodes: nodes.length,
      currentNodeIndex: 0,
      playerPosition: { x: nodes[0].x, y: nodes[0].y },
      completedNodes: 0
    });

    // 标记起点为已访问
    this.state.mapNodes[0].visited = true;
    this.state.mapNodes[0].unlocked = true;
    
    // 解锁第二个节点
    if (this.state.mapNodes.length > 1) {
      this.state.mapNodes[1].unlocked = true;
    }
  }

  /**
   * 生成地图节点
   */
  private generateMap(totalQuestions: number): MapNode[] {
    const nodes: MapNode[] = [];
    const nodeCount = Math.min(totalQuestions, 20); // 最多20个节点
    
    // 计算每个节点的位置（沿着S形路径）
    for (let i = 0; i < nodeCount; i++) {
      const progress = i / (nodeCount - 1);
      
      // S形路径
      const x = 10 + progress * 80; // 从10%到90%
      const y = 50 + Math.sin(progress * Math.PI * 2) * 20; // S形曲线
      
      let type: NodeType = 'normal';
      let emoji = '🛤️';
      
      // 特殊节点
      if (i === 0) {
        type = 'start';
        emoji = '🏠';
      } else if (i === nodeCount - 1) {
        type = 'end';
        emoji = '🏆';
      } else if (i === Math.floor(nodeCount * 0.67)) {
        type = 'boss';
        emoji = '👹';
      } else if (i % 5 === 0) {
        type = 'checkpoint';
        emoji = '🏁';
      } else if (i % 7 === 3) {
        type = 'treasure';
        emoji = '🎁';
      } else if (i % 8 === 5) {
        type = 'trap';
        emoji = '⚠️';
      }
      
      nodes.push({
        id: i + 1,
        type,
        emoji,
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(20, Math.min(80, y)),
        unlocked: false,
        visited: false
      });
    }
    
    return nodes;
  }

  onCorrectAnswer(question: Question, snapshot: GameSnapshot): void {
    super.onCorrectAnswer(question, snapshot);

    const currentNode = this.state.mapNodes[this.state.currentNodeIndex];
    const nextIndex = this.state.currentNodeIndex + 1;
    
    // 如果是宝箱节点，显示宝箱动画
    if (currentNode.type === 'treasure') {
      this.setState({ showTreasure: true });
      
      const timer1 = window.setTimeout(() => {
        this.setState({ showTreasure: false });
      }, 1500);
      this.timers.push(timer1);
    }

    // 移动到下一个节点
    if (nextIndex < this.state.mapNodes.length) {
      const nextNode = this.state.mapNodes[nextIndex];
      
      this.setState({
        isMoving: true
      });

      // 300ms后到达新节点
      const timer2 = window.setTimeout(() => {
        this.state.mapNodes[this.state.currentNodeIndex].visited = true;
        this.state.currentNodeIndex = nextIndex;
        this.state.mapNodes[nextIndex].visited = true;
        this.state.mapNodes[nextIndex].unlocked = true;
        
        // 解锁下一个节点
        if (nextIndex + 1 < this.state.mapNodes.length) {
          this.state.mapNodes[nextIndex + 1].unlocked = true;
        }

        this.setState({
          currentNodeIndex: nextIndex,
          playerPosition: { x: nextNode.x, y: nextNode.y },
          isMoving: false,
          completedNodes: this.state.completedNodes + 1
        });

        this.emit('nodeReached', { node: nextNode });
      }, 600);
      this.timers.push(timer2);
    } else {
      // 到达终点
      this.state.mapNodes[this.state.currentNodeIndex].visited = true;
      this.setState({
        completedNodes: this.state.completedNodes + 1
      });
    }
  }

  onWrongAnswer(
    question: Question,
    snapshot: GameSnapshot,
    userAnswer: string,
    correctAnswer: string
  ): void {
    super.onWrongAnswer(question, snapshot, userAnswer, correctAnswer);

    const currentNode = this.state.mapNodes[this.state.currentNodeIndex];
    
    // 显示路障
    this.setState({
      showObstacle: true,
      obstacleNode: this.state.currentNodeIndex
    });

    // 如果是陷阱节点，增强效果
    if (currentNode.type === 'trap') {
      this.emit('trapTriggered', { node: currentNode });
    }

    // 1秒后隐藏路障
    const timer = window.setTimeout(() => {
      this.setState({
        showObstacle: false,
        obstacleNode: null
      });
    }, 1000);
    this.timers.push(timer);
  }

  destroy(): void {
    // 清理所有定时器
    this.timers.forEach(timer => window.clearTimeout(timer));
    this.timers = [];
    super.destroy();
  }

  getComponent() {
    return AdventureModeComponent;
  }
}

/**
 * 探险模式工厂
 */
export const AdventureModeFactory = {
  modeId: 'adventure',
  name: '探险模式工厂',
  create: (config: any, context: any) => {
    const mode = new AdventureMode();
    mode.init(config, context);
    return mode;
  }
};

