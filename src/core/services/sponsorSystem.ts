import type { Sponsor } from '@/types';
import { sponsors } from '@/data/sponsors';

// 赞助商合同状态
export interface SponsorContract {
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
export interface SponsorHistory {
  sponsorId: string;
  sponsorName: string;
  startWeek: number;
  endWeek: number;
  totalEarned: number;
  terminated: boolean;
  terminationReason?: string;
}

// 赞助商要求检查结果
export interface SponsorCheckResult {
  allRequirementsMet: boolean;
  details: {
    type: 'win_rate' | 'ranking' | 'fans';
    target: number;
    current: number;
    met: boolean;
  }[];
  shouldTerminate: boolean;
}

// 赞助商系统服务
export class SponsorSystem {
  private availableSponsors: Sponsor[] = [];
  private currentContract: SponsorContract | null = null;
  private sponsorHistory: SponsorHistory[] = [];

  // 初始化
  initialize(): void {
    this.availableSponsors = [...sponsors];
  }

  // 获取所有可用赞助商
  getAvailableSponsors(): Sponsor[] {
    return this.availableSponsors;
  }

  // 根据声望匹配赞助商
  matchSponsorsByReputation(reputation: number): Sponsor[] {
    if (reputation >= 80) {
      return this.availableSponsors.filter(s => s.weeklyPayment >= 80);
    } else if (reputation >= 60) {
      return this.availableSponsors.filter(s => s.weeklyPayment >= 50 && s.weeklyPayment < 80);
    } else {
      return this.availableSponsors.filter(s => s.weeklyPayment < 50);
    }
  }

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
  }

  // 签约赞助商
  signSponsor(
    sponsor: Sponsor,
    currentWeek: number,
    contractWeeks: number = 12
  ): { success: boolean; message: string; contract?: SponsorContract } {
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
  }

  // 终止合同
  terminateSponsor(currentWeek: number, reason: string): { success: boolean; penalty: number } {
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
  }

  // 检查赞助商要求
  checkRequirements(
    currentRanking: number,
    winRate: number,
    fans: number
  ): SponsorCheckResult {
    if (!this.currentContract) {
      return {
        allRequirementsMet: false,
        details: [],
        shouldTerminate: false,
      };
    }

    const details: SponsorCheckResult['details'] = [];
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

    // 连续4周不满足要求则终止合同
    const shouldTerminate = violations > 0 && this.currentContract.violations >= 3;

    return {
      allRequirementsMet: violations === 0,
      details,
      shouldTerminate,
    };
  }

  // 处理周结算
  processWeeklySettlement(
    currentWeek: number,
    currentRanking: number,
    winRate: number,
    fans: number
  ): {
    income: number;
    bonus: number;
    requirementsMet: boolean;
    terminated: boolean;
    message: string;
  } {
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
    const checkResult = this.checkRequirements(currentRanking, winRate, fans);

    if (checkResult.shouldTerminate) {
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

    if (checkResult.allRequirementsMet) {
      // 满足所有要求，获得奖金
      bonus = this.currentContract.sponsor.bonus / 4; // 奖金分4周发放
      this.currentContract.bonusesEarned += bonus;
      this.currentContract.violations = 0;
    } else {
      // 不满足要求，收入减少50%
      income = income * 0.5;
      this.currentContract.violations++;
    }

    this.currentContract.totalEarned += income + bonus;
    this.currentContract.requirementsMet = checkResult.allRequirementsMet;

    return {
      income,
      bonus,
      requirementsMet: checkResult.allRequirementsMet,
      terminated: false,
      message: checkResult.allRequirementsMet
        ? `获得赞助收入 ${income} 万，奖金 ${bonus} 万`
        : `未满足赞助商要求，获得减半收入 ${income} 万`,
    };
  }

  // 获取当前合同
  getCurrentContract(): SponsorContract | null {
    return this.currentContract;
  }

  // 获取赞助历史
  getSponsorHistory(): SponsorHistory[] {
    return this.sponsorHistory;
  }

  // 计算赞助商满意度
  getSponsorSatisfaction(): number {
    if (!this.currentContract) return 0;

    const violationFactor = Math.max(0, 1 - this.currentContract.violations * 0.2);
    const requirementFactor = this.currentContract.requirementsMet ? 1 : 0.5;

    return Math.round(100 * violationFactor * requirementFactor);
  }

  // 续约赞助商
  renewSponsor(additionalWeeks: number = 12): { success: boolean; message: string } {
    if (!this.currentContract) {
      return { success: false, message: '没有可续约的赞助商合同' };
    }

    // 检查满意度
    const satisfaction = this.getSponsorSatisfaction();
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
  }

  // 获取赞助商统计
  getSponsorStats(): {
    totalContracts: number;
    totalEarned: number;
    currentContractWeeks: number;
    averageSatisfaction: number;
  } {
    const totalEarned = this.sponsorHistory.reduce((sum, h) => sum + h.totalEarned, 0) +
      (this.currentContract?.totalEarned || 0);

    const satisfactionSum = this.sponsorHistory.length > 0
      ? 100 // 历史合同默认满意度100（已完成）
      : 0;
    const currentSatisfaction = this.getSponsorSatisfaction();
    const totalContracts = this.sponsorHistory.length + (this.currentContract ? 1 : 0);
    const averageSatisfaction = totalContracts > 0
      ? (satisfactionSum + currentSatisfaction) / totalContracts
      : 0;

    return {
      totalContracts,
      totalEarned,
      currentContractWeeks: this.currentContract
        ? this.currentContract.endWeek - this.currentContract.startWeek
        : 0,
      averageSatisfaction,
    };
  }
}

// 创建单例实例
export const sponsorSystem = new SponsorSystem();
