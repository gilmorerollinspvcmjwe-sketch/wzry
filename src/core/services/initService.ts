import { useClubStore } from '@/stores/club';
import { useGameStore } from '@/stores/game';
import { useMatchStore } from '@/stores/match';

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

// 初始化游戏服务
export class InitService {
  // 开始新游戏
  static newGame(clubName: string, difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
    try {
      const gameStore = useGameStore();
      const clubStore = useClubStore();
      
      console.log('开始初始化新游戏...');
      
      // 初始化游戏状态
      gameStore.newGame(clubName, difficulty);
      console.log('游戏状态初始化完成');
      
      // 初始化玩家俱乐部
      clubStore.initClub(clubName);
      console.log('俱乐部初始化完成，俱乐部 ID:', clubStore.currentClub?.id);
      
      // 初始阵容为空，需要玩家自行招募
      console.log('初始阵容为空，请前往转会市场招募选手');
      
      // 给玩家初始资金用于招募
      clubStore.addFunds(500);
      console.log('发放初始招募资金：500万');
      
      // 生成 AI 俱乐部
      aiClubNames.forEach(name => {
        clubStore.addAIClub(name);
      });
      console.log('AI 俱乐部生成完成，总数:', clubStore.clubs.length);
      
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
