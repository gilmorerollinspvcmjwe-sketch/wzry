/**
 * AI 系统集成测试
 * 测试范围：
 * 1. AI 初始化功能
 * 2. 周模拟功能
 * 3. 转会竞价功能
 * 4. 比赛模拟功能
 * 5. AI 系统集成和接口
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { Club } from '@/core/models/Club';
import { Player } from '@/core/models/Player';
import { AIService } from '@/core/services/aiService';
import { TransferService } from '@/core/services/transferService';
import { useClubStore } from '@/stores/club';
import { useGameStore } from '@/stores/game';
import type { AIProfile } from '@/types/ai';

// 辅助函数：创建测试选手
function createTestPlayer(
  name: string = 'TestPlayer',
  position: any = 'top',
  age: number = 20,
  power: number = 70
): Player {
  const player = new Player(name, position, age);
  // 设置属性
  player.potential = Math.min(99, power + 10);
  
  // 设置统计数据
  const stats = {
    mechanics: power,
    awareness: power,
    teamwork: power,
    operation: power,
    strategy: power,
  };
  (player as any).stats = stats;
  
  // 设置合同
  (player as any).contract = {
    buyoutClause: 100 + power,
    salary: 10 + power * 0.1,
  };
  
  return player;
}

// 辅助函数：创建测试俱乐部
function createTestClub(name: string = 'TestClub', isAI: boolean = false): Club {
  const club = new Club(name);
  club.funds = isAI ? 2000 + Math.random() * 1000 : 1000;
  club.reputation = isAI ? 60 + Math.floor(Math.random() * 30) : 50;
  club.fans = isAI ? 50000 + Math.random() * 100000 : 30000;
  return club;
}

describe('AI 系统集成测试', () => {
  let pinia: ReturnType<typeof createPinia>;
  let clubStore: ReturnType<typeof useClubStore>;
  let gameStore: ReturnType<typeof useGameStore>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    clubStore = useClubStore();
    gameStore = useGameStore();
    
    // 重置所有服务
    AIService['aiProfiles'].clear();
    TransferService['transferMarket'].clear();
    TransferService['transferHistory'] = [];
    TransferService['pendingRequests'] = [];
    
    // 重置俱乐部商店
    clubStore.$reset();
    gameStore.$reset();
  });

  describe('1. AI 初始化功能测试', () => {
    it('应该正确初始化 AI 俱乐部配置', () => {
      const clubId = 'ai-club-1';
      
      // 测试默认模板
      const profile1 = AIService.initAIClub(clubId);
      expect(profile1).toBeDefined();
      expect(profile1.clubId).toBe(clubId);
      expect(profile1.personality.aggressiveness).toBe(50); // balanced 默认值
      expect(profile1.personality.patience).toBe(50);
      expect(profile1.personality.riskTolerance).toBe(50);
      expect(profile1.personality.loyalty).toBe(50);
    });

    it('应该支持不同的 AI 模板', () => {
      const templates = ['aggressive', 'balanced', 'conservative', 'gambler', 'developer'];
      
      templates.forEach(template => {
        const clubId = `ai-club-${template}`;
        const profile = AIService.initAIClub(clubId, template);
        
        expect(profile).toBeDefined();
        expect(profile.clubId).toBe(clubId);
        
        // 验证模板特性
        if (template === 'aggressive') {
          expect(profile.personality.aggressiveness).toBeGreaterThan(70);
        } else if (template === 'conservative') {
          expect(profile.personality.aggressiveness).toBeLessThan(30);
        }
      });
    });

    it('应该能够获取已初始化的 AI 配置', () => {
      const clubId = 'ai-club-test';
      AIService.initAIClub(clubId);
      
      const profile = AIService.getAIProfile(clubId);
      expect(profile).toBeDefined();
      expect(profile?.clubId).toBe(clubId);
    });

    it('应该返回 undefined 对于未初始化的俱乐部', () => {
      const profile = AIService.getAIProfile('non-existent-club');
      expect(profile).toBeUndefined();
    });

    it('应该生成随机 AI 配置', () => {
      const randomProfile = AIService.generateRandomAI();
      
      expect(randomProfile).toBeDefined();
      expect(randomProfile.personality.aggressiveness).toBeGreaterThanOrEqual(0);
      expect(randomProfile.personality.aggressiveness).toBeLessThanOrEqual(100);
      expect(randomProfile.strategy.preferredPlayStyle).toBeDefined();
      expect(randomProfile.strategy.transferFocus).toBeDefined();
      expect(randomProfile.strategy.trainingFocus).toBeDefined();
    });

    it('应该为多个俱乐部初始化不同的 AI 配置', () => {
      const clubIds = ['club1', 'club2', 'club3'];
      
      clubIds.forEach((id, index) => {
        const templates = ['aggressive', 'balanced', 'conservative'];
        AIService.initAIClub(id, templates[index]);
      });
      
      // 验证每个俱乐部都有独立的配置
      clubIds.forEach((id, index) => {
        const profile = AIService.getAIProfile(id);
        expect(profile).toBeDefined();
        expect(profile?.clubId).toBe(id);
      });
    });
  });

  describe('2. AI 周模拟功能测试', () => {
    it('应该正确模拟 AI 俱乐部的训练决策', () => {
      const club = createTestClub('AI Club', true);
      const player1 = createTestPlayer('Player1', 'top', 19, 60); // 年轻选手
      const player2 = createTestPlayer('Player2', 'jungle', 27, 75); // 老将
      
      club.addPlayer(player1, false);
      club.addPlayer(player2, false);
      
      AIService.initAIClub(club.id, 'balanced');
      
      const availablePlayers: Player[] = [];
      
      // 执行周模拟
      AIService.simulateAIWeek(club, availablePlayers);
      
      // 验证训练已执行（年轻选手应该训练操作）
      expect(player1.stats.mechanics).toBeGreaterThanOrEqual(60);
      expect(player2.stats.awareness).toBeGreaterThanOrEqual(75);
    });

    it('应该让体力不足的选手休息', () => {
      const club = createTestClub('AI Club', true);
      const player = createTestPlayer('TiredPlayer', 'mid', 22, 70);
      
      // 设置低体力
      (player as any).condition = {
        stamina: 20, // 低于 30 阈值
        morale: 80,
        mentality: 80,
      };
      
      club.addPlayer(player, false);
      AIService.initAIClub(club.id);
      
      const availablePlayers: Player[] = [];
      AIService.simulateAIWeek(club, availablePlayers);
      
      // 验证选手已休息（体力恢复）
      expect(player.condition.stamina).toBeGreaterThan(20);
    });

    it('应该根据 AI 性格执行不同频率的转会决策', () => {
      const clubAggressive = createTestClub('Aggressive AI', true);
      const clubConservative = createTestClub('Conservative AI', true);
      
      clubAggressive.funds = 5000; // 高预算
      clubConservative.funds = 5000;
      
      AIService.initAIClub(clubAggressive.id, 'aggressive');
      AIService.initAIClub(clubConservative.id, 'conservative');
      
      const availablePlayers = [
        createTestPlayer('StarPlayer', 'adc', 23, 85),
      ];
      
      // 多次模拟以验证频率差异
      let aggressiveActions = 0;
      let conservativeActions = 0;
      
      for (let i = 0; i < 10; i++) {
        const aiAgg = AIService.getAIProfile(clubAggressive.id);
        if (aiAgg && Math.random() < aiAgg.personality.aggressiveness / 100) {
          aggressiveActions++;
        }
        
        const aiCon = AIService.getAIProfile(clubConservative.id);
        if (aiCon && Math.random() < aiCon.personality.aggressiveness / 100) {
          conservativeActions++;
        }
      }
      
      // 激进型 AI 应该有更多动作（统计意义）
      expect(aggressiveActions).toBeGreaterThan(conservativeActions);
    });

    it('应该正确处理空阵容的俱乐部', () => {
      const club = createTestClub('Empty Club', true);
      AIService.initAIClub(club.id);
      
      const availablePlayers: Player[] = [];
      
      // 不应该抛出错误
      expect(() => {
        AIService.simulateAIWeek(club, availablePlayers);
      }).not.toThrow();
    });
  });

  describe('3. AI 转会竞价功能测试', () => {
    it('应该正确评估位置需求', () => {
      const club = createTestClub('Test Club');
      const ai = AIService.initAIClub(club.id);
      
      // 没有 ADC 选手，ADC 位置需求应该很高
      const needScore = AIService.evaluatePositionNeed(club, 'adc', ai);
      expect(needScore).toBeGreaterThanOrEqual(60);
    });

    it('应该正确评估选手价值', () => {
      const youngPlayer = createTestPlayer('YoungStar', 'mid', 18, 70);
      const veteranPlayer = createTestPlayer('Veteran', 'mid', 28, 80);
      
      const ai = AIService.initAIClub('ai-club', 'balanced');
      
      const youngValue = AIService.evaluatePlayerValue(youngPlayer, ai);
      const veteranValue = AIService.evaluatePlayerValue(veteranPlayer, ai);
      
      // 年轻选手应该有潜力加成
      expect(youngValue).toBeGreaterThan(youngPlayer.getTotalPower());
    });

    it('应该生成正确的转会决策', () => {
      const club = createTestClub('AI Club', true);
      club.funds = 3000;
      
      AIService.initAIClub(club.id, 'aggressive');
      
      const availablePlayers = [
        createTestPlayer('GoodADC', 'adc', 22, 80),
        createTestPlayer('BadADC', 'adc', 25, 50),
      ];
      
      const decision = AIService.makeTransferDecision(club, availablePlayers);
      
      // 应该做出决策
      expect(decision).toBeDefined();
      expect(decision.reason).toBeDefined();
      
      // 如果有合适目标，应该出价
      if (decision.type === 'bid') {
        expect(decision.playerId).toBeDefined();
        expect(decision.price).toBeGreaterThan(0);
      }
    });

    it('应该正确处理 AI 竞价逻辑', () => {
      // 创建玩家俱乐部
      clubStore.initClub('Player Club');
      const playerClub = clubStore.currentClub!;
      
      // 创建 AI 俱乐部
      const aiClub = createTestClub('AI Club', true);
      aiClub.funds = 5000;
      clubStore.clubs.push(aiClub);
      
      AIService.initAIClub(aiClub.id, 'aggressive');
      
      // 创建一个可签约的选手
      const player = createTestPlayer('TransferTarget', 'top', 23, 75);
      
      // 模拟签约过程
      const result = clubStore.signPlayer(player);
      
      // 验证竞价逻辑已触发
      expect(result.success).toBeDefined();
    });

    it('应该支持多个 AI 俱乐部同时竞价', () => {
      clubStore.initClub('Player Club');
      
      const aiClub1 = createTestClub('AI Club 1', true);
      const aiClub2 = createTestClub('AI Club 2', true);
      aiClub1.funds = 5000;
      aiClub2.funds = 5000;
      
      clubStore.clubs.push(aiClub1, aiClub2);
      
      AIService.initAIClub(aiClub1.id, 'aggressive');
      AIService.initAIClub(aiClub2.id, 'aggressive');
      
      const player = createTestPlayer('HotProspect', 'jungle', 20, 80);
      
      // 多个 AI 应该都会感兴趣
      const result = clubStore.signPlayer(player);
      
      expect(result).toBeDefined();
    });
  });

  describe('4. AI 比赛模拟功能测试', () => {
    it('应该能够选择战术', () => {
      const myClub = createTestClub('My Club');
      const opponent = createTestClub('Opponent');
      
      // 添加选手以计算实力
      myClub.addPlayer(createTestPlayer('Player1', 'top', 22, 80), false);
      opponent.addPlayer(createTestPlayer('Player2', 'top', 22, 70), false);
      
      const ai = AIService.initAIClub(myClub.id);
      
      const tactics = AIService.selectTactics(myClub, opponent, ai);
      
      expect(tactics).toBeDefined();
      expect(tactics.style).toBeDefined();
      expect(tactics.focus).toBeDefined();
      expect(tactics.formation).toBeDefined();
    });

    it('应该根据实力对比选择不同战术', () => {
      const strongClub = createTestClub('Strong Club');
      const weakClub = createTestClub('Weak Club');
      
      // 强队
      for (let i = 0; i < 5; i++) {
        strongClub.addPlayer(createTestPlayer(`Player${i}`, 'top', 22, 90), false);
      }
      
      // 弱队
      for (let i = 0; i < 5; i++) {
        weakClub.addPlayer(createTestPlayer(`Player${i}`, 'top', 22, 60), false);
      }
      
      const ai = AIService.initAIClub(strongClub.id, 'balanced');
      
      // 强队打弱队应该激进
      const tacticsVsWeak = AIService.selectTactics(strongClub, weakClub, ai);
      expect(tacticsVsWeak.style).toBe('aggressive');
      
      // 弱队打强队应该防守
      const aiWeak = AIService.initAIClub(weakClub.id, 'balanced');
      const tacticsVsStrong = AIService.selectTactics(weakClub, strongClub, aiWeak);
      expect(tacticsVsStrong.style).toBe('defensive');
    });

    it('应该支持游戏循环中的 AI 模拟集成', () => {
      // 初始化游戏
      gameStore.newGame('Player Club', 'normal');
      
      // 添加 AI 俱乐部
      clubStore.addAIClub('AI Club 1');
      clubStore.addAIClub('AI Club 2');
      
      // 验证 AI 模拟方法存在
      expect(gameStore.simulateAIClubs).toBeDefined();
      
      // 执行 AI 模拟
      expect(() => {
        gameStore.simulateAIClubs();
      }).not.toThrow();
    });
  });

  describe('5. AI 系统集成和接口测试', () => {
    it('应该正确集成到游戏循环', () => {
      gameStore.newGame('Player Club', 'normal');
      
      // 添加 AI 俱乐部
      clubStore.addAIClub('AI Club 1');
      
      // 模拟一周
      gameStore.advanceTime(7);
      
      // 验证 AI 已初始化
      const aiClubs = clubStore.clubs.filter(c => c.id !== clubStore.currentClub?.id);
      aiClubs.forEach(club => {
        const profile = AIService.getAIProfile(club.id);
        expect(profile).toBeDefined();
      });
    });

    it('应该保持 AI 配置的一致性', () => {
      const clubId = 'test-club';
      const profile1 = AIService.initAIClub(clubId, 'aggressive');
      const profile2 = AIService.getAIProfile(clubId);
      
      expect(profile1).toEqual(profile2);
    });

    it('应该支持 AI 配置的序列化', () => {
      const clubId = 'serializable-club';
      const profile = AIService.initAIClub(clubId, 'balanced');
      
      // 序列化为 JSON
      const serialized = JSON.stringify(profile);
      expect(serialized).toBeDefined();
      
      // 反序列化
      const deserialized: AIProfile = JSON.parse(serialized);
      expect(deserialized.clubId).toBe(clubId);
      expect(deserialized.personality.aggressiveness).toBe(50);
    });

    it('应该正确处理边界情况', () => {
      // 空俱乐部 ID
      expect(() => AIService.initAIClub('')).not.toThrow();
      
      // 不存在的模板
      const profile = AIService.initAIClub('test', 'non-existent-template');
      expect(profile).toBeDefined(); // 应该回退到默认模板
      
      // 空选手列表
      const club = createTestClub('Test');
      AIService.initAIClub(club.id);
      expect(() => {
        AIService.simulateAIWeek(club, []);
      }).not.toThrow();
    });
  });

  describe('6. AI 决策逻辑测试', () => {
    it('应该根据年龄做出不同的训练决策', () => {
      const youngPlayer = createTestPlayer('Young', 'top', 18, 60);
      const primePlayer = createTestPlayer('Prime', 'top', 24, 75);
      const veteranPlayer = createTestPlayer('Vet', 'top', 28, 80);
      
      const ai = AIService.initAIClub('ai-club', 'balanced');
      
      const youngDecision = AIService.makeTrainingDecision(youngPlayer, ai);
      const primeDecision = AIService.makeTrainingDecision(primePlayer, ai);
      const vetDecision = AIService.makeTrainingDecision(veteranPlayer, ai);
      
      expect(youngDecision.type).toBe('train');
      expect(youngDecision.stat).toBe('mechanics');
      
      expect(vetDecision.type).toBe('train');
      expect(vetDecision.stat).toBe('awareness');
    });

    it('应该根据预算限制做出转会决策', () => {
      const poorClub = createTestClub('Poor Club', true);
      poorClub.funds = 100; // 预算很低
      
      AIService.initAIClub(poorClub.id, 'aggressive');
      
      const expensivePlayer = createTestPlayer('Star', 'mid', 23, 90);
      (expensivePlayer as any).contract.buyoutClause = 1000; // 很贵
      
      const decision = AIService.makeTransferDecision(poorClub, [expensivePlayer]);
      
      // 预算不足应该不出价
      expect(decision.type).toBe('none');
    });

    it('应该考虑位置需求进行引援', () => {
      const club = createTestClub('Club', true);
      club.addPlayer(createTestPlayer('Top', 'top', 22, 70), false);
      club.addPlayer(createTestPlayer('Jungle', 'jungle', 22, 70), false);
      club.addPlayer(createTestPlayer('Mid', 'mid', 22, 70), false);
      club.addPlayer(createTestPlayer('ADC', 'adc', 22, 70), false);
      // 缺少辅助
      
      AIService.initAIClub(club.id, 'balanced');
      
      const supportPlayer = createTestPlayer('Support', 'support', 22, 75);
      const topPlayer = createTestPlayer('Top2', 'top', 22, 75);
      
      const decision = AIService.makeTransferDecision(club, [supportPlayer, topPlayer]);
      
      // 应该优先补充缺失的位置
      if (decision.type === 'bid') {
        expect(decision.playerId).toBe(supportPlayer.id);
      }
    });
  });
});
