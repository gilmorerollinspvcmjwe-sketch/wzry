import { defineStore } from 'pinia';
import { Club } from '@/core/models/Club';
import type { Player } from '@/core/models/Player';
import type { Facilities } from '@/types';

interface ClubState {
  currentClub: Club | null;
  clubs: Club[];
}

export const useClubStore = defineStore('club', {
  state: (): ClubState => ({
    currentClub: null,
    clubs: [],
  }),
  
  getters: {
    // 周收入
    weeklyIncome: (state) => {
      if (!state.currentClub) return 0;
      // 使用类型断言访问方法（Pinia持久化后方法会丢失）
      return (state.currentClub as any).getWeeklyIncome?.() || 0;
    },
    
    // 周支出
    weeklyExpense: (state) => {
      if (!state.currentClub) return 0;
      // 使用类型断言访问方法（Pinia持久化后方法会丢失）
      return (state.currentClub as any).getWeeklyExpense?.() || 0;
    },
    
    // 设施总等级
    totalFacilityLevel: (state) => {
      if (!state.currentClub) return 0;
      const f = state.currentClub.facilities;
      return f.training + f.medical + f.analysis + f.youth;
    },
    
    // 获取修复后的 roster（Pinia 持久化后方法会丢失，需要修复）
    fixedRoster: (state) => {
      if (!state.currentClub) return [];
      return state.currentClub.roster.map((p: any) => ({
        ...p,
        getTotalPower: () => {
          const stats = p.stats || {};
          const values = Object.values(stats) as number[];
          return values.reduce((a: number, b: number) => a + b, 0) / 5;
        }
      }));
    },
    
    // 获取修复后的青训队
    fixedYouthTeam: (state) => {
      if (!state.currentClub) return [];
      return (state.currentClub.youthTeam || []).map((p: any) => ({
        ...p,
        getTotalPower: () => {
          const stats = p.stats || {};
          const values = Object.values(stats) as number[];
          return values.reduce((a: number, b: number) => a + b, 0) / 5;
        }
      }));
    },
    
    // 所有俱乐部
    allClubs: (state) => state.clubs,
    
    // 玩家俱乐部
    playerClub: (state) => state.currentClub,
  },
  
  actions: {
    // 初始化俱乐部
    initClub(name: string, logo: string = '') {
      this.currentClub = new Club(name, logo);
      this.clubs.push(this.currentClub);
    },
    
    // 添加资金
    addFunds(amount: number) {
      if (this.currentClub) {
        this.currentClub.funds += amount;
      }
    },
    
    // 消耗资金
    spendFunds(amount: number): boolean {
      if (!this.currentClub || this.currentClub.funds < amount) {
        return false;
      }
      this.currentClub.funds -= amount;
      return true;
    },
    
    // 升级设施
    upgradeFacility(type: keyof Facilities) {
      if (!this.currentClub) return { success: false, cost: 0 };
      return this.currentClub.upgradeFacility(type);
    },
    
    // 签约选手
    signPlayer(player: Player, isYouth: boolean = false): boolean {
      if (!this.currentClub) return false;
      
      // 检查资金
      if (!this.spendFunds(player.contract.buyoutClause)) {
        return false;
      }
      
      this.currentClub.addPlayer(player, isYouth);
      return true;
    },
    
    // 解约选手
    releasePlayer(playerId: string): boolean {
      if (!this.currentClub) return false;
      
      const player = this.currentClub.removePlayer(playerId);
      if (!player) return false;
      
      // 支付违约金
      const penalty = player.contract.buyoutClause * 0.5;
      this.spendFunds(penalty);
      
      return true;
    },
    
    // 提拔青训选手
    promoteYouthPlayer(playerId: string): boolean {
      if (!this.currentClub) return false;
      
      const player = this.currentClub.removePlayer(playerId);
      if (!player) return false;
      
      this.currentClub.addPlayer(player, false);
      return true;
    },
    
    // 添加 AI 俱乐部
    addAIClub(name: string) {
      const club = new Club(name);
      // AI 俱乐部初始实力更强
      club.funds = 2000 + Math.random() * 1000;
      club.reputation = 60 + Math.floor(Math.random() * 30);
      club.fans = 50000 + Math.random() * 100000;
      this.clubs.push(club);
    },
    
    // 获取俱乐部
    getClub(clubId: string): Club | undefined {
      const club = this.clubs.find(c => c.id === clubId);
      return club as Club | undefined;
    },
    
    // 更新资金（用于事件后果）
    updateFunds(amount: number) {
      if (!this.currentClub) return;
      this.currentClub.funds += amount;
    },
    
    // 更新薪资（用于事件后果）
    updateSalary(amount: number) {
      if (!this.currentClub) return;
      // 这里需要更新选手合同薪资，暂时简化处理
      console.log('更新薪资:', amount);
    },
    
    // 更新声望（用于事件后果）
    updateReputation(amount: number) {
      if (!this.currentClub) return;
      this.currentClub.reputation += amount;
    },
    
    // 更新粉丝（用于事件后果）
    updateFans(amount: number) {
      if (!this.currentClub) return;
      this.currentClub.fans += amount;
    },
    
    // 更新士气（用于事件后果）
    updateMorale(amount: number) {
      if (!this.currentClub) return;
      // 更新所有选手士气
      this.currentClub.roster.forEach((player: any) => {
        if (player.condition) {
          player.condition.morale = Math.min(100, Math.max(0, player.condition.morale + amount));
        }
      });
    },
    
    // 更新体力（用于事件后果）
    updateStamina(amount: number) {
      if (!this.currentClub) return;
      // 更新所有选手体力
      this.currentClub.roster.forEach((player: any) => {
        if (player.condition) {
          player.condition.stamina = Math.min(100, Math.max(0, player.condition.stamina + amount));
        }
      });
    },
    
    // 更新心态（用于事件后果）
    updateMentality(amount: number) {
      if (!this.currentClub) return;
      // 更新所有选手心态
      this.currentClub.roster.forEach((player: any) => {
        if (player.condition) {
          player.condition.mentality = Math.min(100, Math.max(0, player.condition.mentality + amount));
        }
      });
    },
    
    // 更新特定选手士气（用于事件后果）
    updatePlayerMorale(playerId: string, amount: number) {
      if (!this.currentClub) return;
      const player = this.currentClub.roster.find((p: any) => p.id === playerId);
      if (player && player.condition) {
        player.condition.morale = Math.min(100, Math.max(0, player.condition.morale + amount));
      }
    },
  },
  
  persist: true,
});
