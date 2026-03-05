import { useClubStore } from '@/stores/club';
import { useGameStore } from '@/stores/game';
import { useMatchStore } from '@/stores/match';
import { useHeroStore } from '@/stores/hero';
import { useSponsorStore } from '@/stores/sponsor';
import { useFanReputationStore } from '@/stores/fanReputation';
import { usePlayerStore } from '@/stores/player';
import { Player } from '@/core/models/Player';

// AI 俱乐部名称列表
const aiClubNames = [
  '武汉 eStarPro',
  '重庆狼队',
  '成都 AG 超玩会',
  '广州 TTG',
  '北京 WB',
  '南京 Hero 久竞',
  '上海 EDG.M',
  '深圳 DYG',
  '杭州 LGD 大鹅',
  '西安 WE',
  '长沙 TES',
  '苏州 KSG',
  '佛山 DRG',
  '厦门 VG',
];

// 生成随机选手
function generateRandomPlayer(position: string, ageRange: [number, number], minPotential: number): Player {
  const positions = ['top', 'jungle', 'mid', 'adc', 'support'] as const;
  const pos = position || positions[Math.floor(Math.random() * positions.length)];
  const age = ageRange[0] + Math.floor(Math.random() * (ageRange[1] - ageRange[0] + 1));
  const potential = minPotential + Math.floor(Math.random() * (95 - minPotential));
  
  const firstNames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴'];
  const lastNames = ['伟', '芳', '娜', '敏', '静', '强', '磊', '洋', '勇', '军', '杰', '明'];
  const name = firstNames[Math.floor(Math.random() * firstNames.length)] + 
               lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return new Player(name, age, pos, potential);
}

// 为俱乐部生成初始阵容
function generateInitialRoster(club: any, isPlayerClub: boolean = false) {
  const positions = ['top', 'jungle', 'mid', 'adc', 'support'];
  const ageRange: [number, number] = isPlayerClub ? [18, 22] : [18, 28];
  const minPotential = isPlayerClub ? 65 : 50;
  
  // 生成主力阵容（5人）
  positions.forEach(pos => {
    const player = generateRandomPlayer(pos, ageRange, minPotential);
    player.contract.salary = 10 + Math.floor(Math.random() * 20);
    club.roster.push(player);
  });
  
  // 生成替补（2-3人）
  const benchCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < benchCount; i++) {
    const pos = positions[Math.floor(Math.random() * positions.length)];
    const player = generateRandomPlayer(pos, ageRange, minPotential - 10);
    player.contract.salary = 5 + Math.floor(Math.random() * 10);
    club.roster.push(player);
  }
}

// 初始化游戏服务
export class InitService {
  // 开始新游戏
  static newGame(clubName: string, difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
    try {
      const gameStore = useGameStore();
      const clubStore = useClubStore();
      const playerStore = usePlayerStore();
      const heroStore = useHeroStore();
      const sponsorStore = useSponsorStore();
      const fanReputationStore = useFanReputationStore();

      console.log('开始初始化新游戏...');

      // 初始化游戏状态
      gameStore.newGame(clubName, difficulty);
      console.log('游戏状态初始化完成');

      // 初始化玩家俱乐部
      clubStore.initClub(clubName);
      console.log('俱乐部初始化完成，俱乐部 ID:', clubStore.currentClub?.id);

      // 为玩家俱乐部生成初始阵容
      if (clubStore.currentClub) {
        generateInitialRoster(clubStore.currentClub, true);
        console.log('玩家俱乐部初始阵容生成完成，选手数:', clubStore.currentClub.roster.length);
      }

      // 给玩家初始资金用于招募和运营
      clubStore.addFunds(500);
      console.log('发放初始资金：500万');

      // 生成 AI 俱乐部
      aiClubNames.forEach(name => {
        clubStore.addAIClub(name);
      });
      console.log('AI 俱乐部生成完成，总数:', clubStore.clubs.length);

      // 为AI俱乐部生成初始阵容
      clubStore.clubs.forEach(club => {
        if (club.id !== clubStore.currentClub?.id && club.roster.length === 0) {
          generateInitialRoster(club, false);
        }
      });
      console.log('AI俱乐部初始阵容生成完成');

      // 初始化英雄系统
      heroStore.initialize();
      console.log('英雄系统初始化完成');

      // 初始化赞助商系统
      sponsorStore.initialize();
      console.log('赞助商系统初始化完成');

      // 初始化粉丝声望系统
      fanReputationStore.initialize(10000, 30);
      console.log('粉丝声望系统初始化完成');

      // 同步粉丝和声望到俱乐部
      if (clubStore.currentClub) {
        clubStore.currentClub.fans = fanReputationStore.totalFans;
        clubStore.currentClub.reputation = fanReputationStore.reputation;
      }

      // 生成一些初始比赛
      this.generateInitialMatches();
      console.log('初始比赛生成完成');

      return {
        clubId: clubStore.currentClub?.id,
        message: '游戏初始化成功',
      };
    } catch (error) {
      console.error('游戏初始化失败:', error);
      throw error;
    }
  }
  
  // 生成初始比赛
  private static generateInitialMatches() {
    const clubStore = useClubStore();
    const matchStore = useMatchStore();
    
    if (!clubStore.currentClub) return;
    
    const tournamentId = 'tournament_spring_2024';
    const playerClub = clubStore.currentClub;
    
    // 生成 5 场初始比赛
    for (let i = 0; i < 5; i++) {
      const aiClub = clubStore.clubs.find(c => c.id !== playerClub.id);
      if (aiClub) {
        matchStore.createMatch(playerClub.id, aiClub.id, tournamentId);
      }
    }
  }
  
  // 继续游戏（读取存档）
  static continueGame(saveId: string) {
    const gameStore = useGameStore();
    gameStore.loadGame(saveId);
  }
  
  // 检查是否有存档
  static hasSave(): boolean {
    const saves = Object.keys(localStorage).filter(k => k.startsWith('save_'));
    return saves.length > 0;
  }
  
  // 获取最新存档
  static getLatestSave(): string | null {
    const saves = Object.keys(localStorage).filter(k => k.startsWith('save_'));
    if (saves.length === 0) return null;
    return saves.sort().pop() || null;
  }
}
