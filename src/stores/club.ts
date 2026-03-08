import { defineStore } from 'pinia';
import { Club } from '@/core/models/Club';
import type { Player } from '@/core/models/Player';
import type { Facilities } from '@/types';
import { getClubTotalPower } from '@/utils/clubUtils';

interface ClubState {
  currentClub: Club | null;
  clubs: Club[];
}

function calculateWeeklyIncome(club: Club | null): number {
  if (!club) return 0;
  const sponsorIncome = club.sponsorshipIncome || 0;
  const merchandiseIncome = Math.floor((club.fans || 0) * 0.01);
  const prizeIncome = club.prizeMoney || 0;
  return sponsorIncome + merchandiseIncome + prizeIncome;
}

function calculateWeeklyExpense(club: Club | null): number {
  if (!club) return 0;
  const salaryExpense = club.roster?.reduce((sum, p) => sum + (p.contract?.salary || 0), 0) || 0;
  const facilityExpense = club.facilities ? 
    (club.facilities.training + club.facilities.medical + club.facilities.analysis + club.facilities.youth) * 5 : 0;
  return salaryExpense + facilityExpense;
}

export const useClubStore = defineStore('club', {
  state: (): ClubState => ({
    currentClub: null,
    clubs: [],
  }),
  
  getters: {
    weeklyIncome: (state) => {
      return calculateWeeklyIncome(state.currentClub);
    },
    
    weeklyExpense: (state) => {
      return calculateWeeklyExpense(state.currentClub);
    },
    
    totalFacilityLevel: (state) => {
      if (!state.currentClub) return 0;
      const f = state.currentClub.facilities;
      return f.training + f.medical + f.analysis + f.youth;
    },
    
    fixedRoster: (state) => {
      if (!state.currentClub) return [];
      return state.currentClub.roster.map((p: any) => ({
        ...p,
        condition: {
          stamina: p.condition?.stamina ?? 100,
          mentality: p.condition?.mentality ?? 80,
          injury: p.condition?.injury ?? 0,
          morale: p.condition?.morale ?? 75,
        },
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
        condition: {
          stamina: p.condition?.stamina ?? 100,
          mentality: p.condition?.mentality ?? 80,
          injury: p.condition?.injury ?? 0,
          morale: p.condition?.morale ?? 75,
        },
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
    signPlayer(player: Player, isYouth: boolean = false): { success: boolean; message?: string; competingClubs?: string[] } {
      if (!this.currentClub) return { success: false };
      
      const { transferService } = require('@/core/services/transferService');
      const { AIService } = require('@/core/services/aiService');
      
      const playerMarketPrice = player.contract.buyoutClause;
      let finalPrice = playerMarketPrice;
      const competingClubs: string[] = [];
      let biddingWar = false;
      
      const marketOffer = transferService.getTransferMarket().find(offer => offer.playerId === player.id && offer.status === 'active');
      
      if (marketOffer) {
        const aiClubs = this.clubs.filter(c => c.id !== this.currentClub?.id);
        
        aiClubs.forEach(club => {
          const aiProfile = AIService.getAIProfile(club.id);
          if (!aiProfile) return;
          
          const needScore = AIService.evaluatePositionNeed(club, player.position, aiProfile);
          const playerValue = AIService.evaluatePlayerValue(player, aiProfile);
          const maxBudget = club.funds * (aiProfile.personality.riskTolerance / 100);
          
          if (needScore > 50 && playerValue >= playerMarketPrice * 0.8 && maxBudget >= playerMarketPrice) {
            competingClubs.push(club.name);
            
            if (aiProfile.personality.aggressiveness > 60) {
              const aiBid = playerMarketPrice * (1 + Math.random() * 0.2);
              if (aiBid > finalPrice) {
                finalPrice = aiBid;
                biddingWar = true;
              }
            }
          }
        });
        
        if (marketOffer.highestBid > 0) {
          finalPrice = Math.max(finalPrice, marketOffer.highestBid * 1.1);
          biddingWar = true;
        }
      } else {
        const aiClubs = this.clubs.filter(c => c.id !== this.currentClub?.id);
        
        aiClubs.forEach(club => {
          const aiProfile = AIService.getAIProfile(club.id);
          if (!aiProfile) return;
          
          const needScore = AIService.evaluatePositionNeed(club, player.position, aiProfile);
          const playerValue = AIService.evaluatePlayerValue(player, aiProfile);
          const maxBudget = club.funds * (aiProfile.personality.riskTolerance / 100);
          
          if (needScore > 70 && playerValue >= playerMarketPrice * 0.9 && maxBudget >= playerMarketPrice * 0.9) {
            if (Math.random() < aiProfile.personality.aggressiveness / 100) {
              competingClubs.push(club.name);
              
              const aiBid = playerMarketPrice * (0.95 + Math.random() * 0.15);
              if (aiBid > finalPrice) {
                finalPrice = aiBid;
                biddingWar = true;
              }
            }
          }
        });
      }
      
      if (finalPrice > playerMarketPrice) {
        finalPrice = Math.ceil(finalPrice);
      }
      
      if (!this.spendFunds(finalPrice)) {
        return { 
          success: false, 
          message: `资金不足！需要 ${finalPrice}万，但俱乐部只有 ${this.currentClub.funds}万`,
          competingClubs: competingClubs.length > 0 ? competingClubs : undefined
        };
      }
      
      this.currentClub.addPlayer(player, isYouth);
      
      let message = `成功签约 ${player.name}！`;
      if (biddingWar) {
        message += ` 经过激烈竞价，最终以 ${finalPrice}万成交！`;
      }
      if (competingClubs.length > 0) {
        message += ` 参与竞价的俱乐部：${competingClubs.join('、')}`;
      }
      
      return { 
        success: true, 
        message,
        competingClubs: competingClubs.length > 0 ? competingClubs : undefined
      };
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
    
    // 给指定俱乐部添加资金
    addFundsToClub(clubId: string, amount: number) {
      const club = this.clubs.find(c => c.id === clubId);
      if (club) {
        club.funds += amount;
      }
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
