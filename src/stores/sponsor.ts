import { defineStore } from 'pinia';
import { sponsors } from '@/data/sponsors';
import type { Sponsor } from '@/types';

// 赞助商合同状态
interface SponsorContract {
  sponsor: Sponsor;
  startWeek: number;
  endWeek: number;
  weeklyPayment: number;
  totalEarned: number;
  requirementsMet: boolean;
  violations: number;
  bonusesEarned: number;
}

// 赞助记录
interface SponsorHistory {
  sponsorId: string;
  sponsorName: string;
  startWeek: number;
  endWeek: number;
  totalEarned: number;
  terminated: boolean;
  terminationReason?: string;
}

interface SponsorState {
  initialized: boolean;
  currentContract: SponsorContract | null;
  sponsorHistory: SponsorHistory[];
  availableSponsors: Sponsor[];
}

export const useSponsorStore = defineStore('sponsor', {
  state: (): SponsorState => ({
    initialized: false,
    currentContract: null,
    sponsorHistory: [],
    availableSponsors: [],
  }),

  getters: {
    // 是否有赞助商
    hasSponsor: (state) => !!state.currentContract,

    // 当前赞助商
    currentSponsor: (state) => state.currentContract?.sponsor || null,

    // 周赞助收入
    weeklyIncome: (state) => state.currentContract?.weeklyPayment || 0,

    // 赞助历史
    history: (state) => state.sponsorHistory,

    // 赞助商满意度
    satisfaction: (state) => {
      if (!state.currentContract) return 0;
      const violationFactor = Math.max(0, 1 - state.currentContract.violations * 0.2);
      const requirementFactor = state.currentContract.requirementsMet ? 1 : 0.5;
      return Math.round(100 * violationFactor * requirementFactor);
    },

    // 合同剩余周数
    remainingWeeks: (state) => {
      if (!state.currentContract) return 0;
      return Math.max(0, state.currentContract.endWeek - state.currentContract.startWeek);
    },

    // 累计获得赞助收入
    totalEarned: (state) => {
      const historyTotal = state.sponsorHistory.reduce((sum, h) => sum + h.totalEarned, 0);
      const currentTotal = state.currentContract?.totalEarned || 0;
      return historyTotal + currentTotal;
    },

    // 赞助商统计
    stats: (state) => {
      const totalEarned = state.sponsorHistory.reduce((sum, h) => sum + h.totalEarned, 0) +
        (state.currentContract?.totalEarned || 0);

      const satisfactionSum = state.sponsorHistory.length > 0 ? 100 : 0;
      const currentSatisfaction = state.currentContract ? 
        (Math.max(0, 1 - state.currentContract.violations * 0.2) * (state.currentContract.requirementsMet ? 1 : 0.5) * 100) : 0;
      const totalContracts = state.sponsorHistory.length + (state.currentContract ? 1 : 0);
      const averageSatisfaction = totalContracts > 0
        ? (satisfactionSum + currentSatisfaction) / totalContracts
        : 0;

      return {
        totalContracts,
        totalEarned,
        currentContractWeeks: state.currentContract
          ? state.currentContract.endWeek - state.currentContract.startWeek
          : 0,
        averageSatisfaction,
      };
    },
  },

  actions: {
    // 初始化
    initialize() {
      if (this.initialized) return;
      this.availableSponsors = [...sponsors];
      this.initialized = true;
    },

    // 根据声望匹配赞助商
    matchSponsorsByReputation(reputation: number): Sponsor[] {
      if (reputation >= 80) {
        return this.availableSponsors.filter(s => s.weeklyPayment >= 80);
      } else if (reputation >= 60) {
        return this.availableSponsors.filter(s => s.weeklyPayment >= 50 && s.weeklyPayment < 80);
      } else {
        return this.availableSponsors.filter(s => s.weeklyPayment < 50);
      }
    },

    // 根据排名匹配赞助商
    matchSponsorsByRanking(ranking: number): Sponsor[] {
      return this.availableSponsors.filter(s =>
        s.requirements.every(req => {
          if (req.type === 'ranking') {
            return ranking <= req.target;
          }
          return true;
        })
      );
    },

    // 签约赞助商
    signSponsor(sponsor: Sponsor, currentWeek: number, contractWeeks: number = 12) {
      // 检查是否已有赞助商
      if (this.currentContract) {
        return {
          success: false,
          message: '已有赞助商合同，请先终止当前合同',
        };
      }

      // 创建合同
      const contract: SponsorContract = {
        sponsor,
        startWeek: currentWeek,
        endWeek: currentWeek + contractWeeks,
        weeklyPayment: sponsor.weeklyPayment,
        totalEarned: 0,
        requirementsMet: true,
        violations: 0,
        bonusesEarned: 0,
      };

      this.currentContract = contract;

      return {
        success: true,
        message: `成功签约 ${sponsor.name}！`,
        contract,
      };
    },

    // 终止合同
    terminateSponsor(currentWeek: number, reason: string) {
      if (!this.currentContract) {
        return { success: false, penalty: 0 };
      }

      // 记录历史
      this.sponsorHistory.push({
        sponsorId: this.currentContract.sponsor.id,
        sponsorName: this.currentContract.sponsor.name,
        startWeek: this.currentContract.startWeek,
        endWeek: currentWeek,
        totalEarned: this.currentContract.totalEarned,
        terminated: true,
        terminationReason: reason,
      });

      // 计算违约金（剩余合同期 * 周薪 * 2）
      const remainingWeeks = Math.max(0, this.currentContract.endWeek - currentWeek);
      const penalty = remainingWeeks * this.currentContract.weeklyPayment * 2;

      this.currentContract = null;

      return { success: true, penalty };
    },

    // 处理周结算
    processWeeklySettlement(
      currentWeek: number,
      currentRanking: number,
      winRate: number,
      fans: number
    ) {
      if (!this.currentContract) {
        return {
          income: 0,
          bonus: 0,
          requirementsMet: false,
          terminated: false,
          message: '没有赞助商合同',
        };
      }

      // 检查合同是否到期
      if (currentWeek > this.currentContract.endWeek) {
        // 合同到期，记录历史
        this.sponsorHistory.push({
          sponsorId: this.currentContract.sponsor.id,
          sponsorName: this.currentContract.sponsor.name,
          startWeek: this.currentContract.startWeek,
          endWeek: this.currentContract.endWeek,
          totalEarned: this.currentContract.totalEarned,
          terminated: false,
        });

        const totalEarned = this.currentContract.totalEarned;
        this.currentContract = null;

        return {
          income: 0,
          bonus: 0,
          requirementsMet: true,
          terminated: true,
          message: `赞助商合同到期，累计获得 ${totalEarned} 万收入`,
        };
      }

      // 检查要求
      let violations = 0;
      let allRequirementsMet = true;

      for (const req of this.currentContract.sponsor.requirements) {
        let met = false;
        switch (req.type) {
          case 'ranking':
            met = currentRanking <= req.target;
            break;
          case 'win_rate':
            met = winRate >= req.target;
            break;
          case 'fans':
            met = fans >= req.target;
            break;
        }
        if (!met) {
          violations++;
          allRequirementsMet = false;
        }
      }

      // 连续4周不满足要求则终止合同
      const shouldTerminate = violations > 0 && this.currentContract.violations >= 3;

      if (shouldTerminate) {
        // 终止合同
        const result = this.terminateSponsor(currentWeek, '连续不满足赞助商要求');

        return {
          income: 0,
          bonus: 0,
          requirementsMet: false,
          terminated: true,
          message: `赞助商合同被终止，需支付违约金 ${result.penalty} 万`,
        };
      }

      // 计算收入
      let income = this.currentContract.weeklyPayment;
      let bonus = 0;

      if (allRequirementsMet) {
        // 满足所有要求，获得奖金
        bonus = this.currentContract.sponsor.bonus / 4;
        this.currentContract.bonusesEarned += bonus;
        this.currentContract.violations = 0;
        this.currentContract.requirementsMet = true;
      } else {
        // 不满足要求，收入减少50%
        income = income * 0.5;
        this.currentContract.violations++;
        this.currentContract.requirementsMet = false;
      }

      this.currentContract.totalEarned += income + bonus;

      return {
        income,
        bonus,
        requirementsMet: allRequirementsMet,
        terminated: false,
        message: allRequirementsMet
          ? `获得赞助收入 ${income} 万，奖金 ${bonus} 万`
          : `未满足赞助商要求，获得减半收入 ${income} 万`,
      };
    },

    // 续约
    renewSponsor(additionalWeeks: number = 12) {
      if (!this.currentContract) {
        return { success: false, message: '没有可续约的赞助商合同' };
      }

      // 检查满意度
      const satisfaction = this.satisfaction;
      if (satisfaction < 60) {
        return { success: false, message: '赞助商满意度不足，无法续约' };
      }

      // 延长合同
      this.currentContract.endWeek += additionalWeeks;

      // 满意度高则提升赞助费
      if (satisfaction >= 90) {
        this.currentContract.weeklyPayment = Math.round(
          this.currentContract.weeklyPayment * 1.1
        );
        return {
          success: true,
          message: `成功续约！周薪提升至 ${this.currentContract.weeklyPayment} 万`,
        };
      }

      return { success: true, message: '成功续约赞助商合同' };
    },

    // 检查要求
    checkRequirements(currentRanking: number, winRate: number, fans: number) {
      if (!this.currentContract) {
        return {
          allRequirementsMet: false,
          details: [],
          shouldTerminate: false,
        };
      }

      const details: { type: 'win_rate' | 'ranking' | 'fans'; target: number; current: number; met: boolean }[] = [];
      let violations = 0;

      for (const req of this.currentContract.sponsor.requirements) {
        let current = 0;
        let met = false;

        switch (req.type) {
          case 'ranking':
            current = currentRanking;
            met = currentRanking <= req.target;
            break;
          case 'win_rate':
            current = winRate;
            met = winRate >= req.target;
            break;
          case 'fans':
            current = fans;
            met = fans >= req.target;
            break;
        }

        if (!met) violations++;

        details.push({
          type: req.type,
          target: req.target,
          current,
          met,
        });
      }

      const shouldTerminate = violations > 0 && this.currentContract.violations >= 3;

      return {
        allRequirementsMet: violations === 0,
        details,
        shouldTerminate,
      };
    },

    // 重置
    reset() {
      this.currentContract = null;
      this.sponsorHistory = [];
      this.availableSponsors = [];
      this.initialized = false;
    },
  },

  persist: true,
});
