import { useClubStore } from '@/stores/club';
import { AIService } from './aiService';
import type { Club } from '@/core/models/Club';
import type { Player } from '@/core/models/Player';
import type { Position } from '@/types';
import {
  type TransferWindow,
  type TransferBid,
  type TransferNegotiation,
  type TransferResult,
  type TransferAgreement,
  type BidEntry,
  type NegotiationRound,
  type PlayerTransferPreference,
  type TransferWindowRules,
  type TransferClause,
  DEFAULT_TRANSFER_WINDOW_RULES,
  SUMMER_WINDOW_MONTHS,
  WINTER_WINDOW_MONTHS,
  getTransferWindowStatus,
  isBidValid,
  calculateBidIncrement,
} from '@/types/transferWindow';

export class TransferWindowService {
  private static currentWindow: TransferWindow | null = null;
  private static activeBids: Map<string, TransferBid> = new Map();
  private static negotiations: Map<string, TransferNegotiation> = new Map();
  private static transferHistory: TransferResult[] = [];

  static initializeTransferWindow(year: number, type: 'summer' | 'winter'): TransferWindow {
    const months = type === 'summer' ? SUMMER_WINDOW_MONTHS : WINTER_WINDOW_MONTHS;
    
    const startDate = new Date(year, months.start, 1);
    const endDate = new Date(year, months.end + 1, 0);
    
    const window: TransferWindow = {
      id: `tw_${year}_${type}`,
      type,
      year,
      startDate,
      endDate,
      status: 'upcoming',
      statistics: {
        totalTransfers: 0,
        totalFees: 0,
        averageFee: 0,
        biggestTransfer: null,
        mostActiveClub: null,
      },
      rules: { ...DEFAULT_TRANSFER_WINDOW_RULES },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    window.status = getTransferWindowStatus(window);
    this.currentWindow = window;
    
    return window;
  }

  static checkWindowStatus(): TransferWindow | null {
    if (!this.currentWindow) {
      return null;
    }
    
    this.currentWindow.status = getTransferWindowStatus(this.currentWindow);
    this.currentWindow.updatedAt = new Date();
    
    if (this.currentWindow.status === 'closed') {
      this.processExpiredBids();
      this.expireAllNegotiations();
    }
    
    return this.currentWindow;
  }

  static getCurrentWindow(): TransferWindow | null {
    return this.currentWindow;
  }

  static isWindowOpen(): boolean {
    const window = this.checkWindowStatus();
    return window !== null && (window.status === 'active' || window.status === 'closing');
  }

  static placeBid(
    playerId: string,
    clubId: string,
    amount: number,
    type: 'open' | 'sealed' = 'open'
  ): { success: boolean; bid?: TransferBid; reason?: string } {
    if (!this.isWindowOpen()) {
      return { success: false, reason: '转会窗口未开放' };
    }
    
    const clubStore = useClubStore();
    const club = clubStore.getClub(clubId);
    if (!club) {
      return { success: false, reason: '俱乐部不存在' };
    }
    
    let bid = this.activeBids.get(playerId);
    
    if (!bid) {
      const playerClub = this.findPlayerClub(playerId);
      if (!playerClub) {
        return { success: false, reason: '选手不存在或已退役' };
      }
      
      const player = playerClub.roster.find((p: any) => p.id === playerId);
      if (!player) {
        return { success: false, reason: '选手不存在' };
      }
      
      if (playerClub.id === clubId) {
        return { success: false, reason: '不能对自己的选手出价' };
      }
      
      bid = this.createBid(player, playerClub, type);
    }
    
    if (bid.currentClubId === clubId) {
      return { success: false, reason: '不能对自己的选手出价' };
    }
    
    const validation = isBidValid(amount, bid.highestBid, club.funds, this.currentWindow!.rules);
    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }
    
    const bidEntry: BidEntry = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clubId,
      clubName: club.name,
      amount,
      timestamp: new Date(),
      status: 'leading',
    };
    
    if (bid.leadingClubId && bid.leadingClubId !== clubId) {
      bid.bids.forEach(b => {
        if (b.clubId === bid.leadingClubId) {
          b.status = 'outbid';
        }
      });
    }
    
    bid.bids.push(bidEntry);
    bid.highestBid = amount;
    bid.leadingClubId = clubId;
    bid.updatedAt = new Date();
    
    this.activeBids.set(playerId, bid);
    
    return { success: true, bid };
  }

  static processBidding(playerId: string): TransferResult | null {
    const bid = this.activeBids.get(playerId);
    if (!bid || !bid.leadingClubId) {
      return null;
    }
    
    const clubStore = useClubStore();
    const buyingClub = clubStore.getClub(bid.leadingClubId);
    const sellingClub = clubStore.getClub(bid.currentClubId);
    
    if (!buyingClub || !sellingClub) {
      return null;
    }
    
    const player = sellingClub.roster.find((p: any) => p.id === playerId);
    if (!player) {
      return null;
    }
    
    if (buyingClub.funds < bid.highestBid) {
      return {
        success: false,
        negotiationId: '',
        playerId,
        playerName: bid.playerName,
        fromClubId: sellingClub.id,
        fromClubName: sellingClub.name,
        toClubId: buyingClub.id,
        toClubName: buyingClub.name,
        transferFee: bid.highestBid,
        clauses: [],
        reason: '买家资金不足',
        timestamp: new Date(),
      };
    }
    
    const playerConsent = this.checkPlayerConsent(player, buyingClub, bid.playerPreference);
    if (!playerConsent) {
      return {
        success: false,
        negotiationId: '',
        playerId,
        playerName: bid.playerName,
        fromClubId: sellingClub.id,
        fromClubName: sellingClub.name,
        toClubId: buyingClub.id,
        toClubName: buyingClub.name,
        transferFee: bid.highestBid,
        clauses: [],
        reason: '选手拒绝转会',
        timestamp: new Date(),
      };
    }
    
    return this.executeTransfer(player, sellingClub, buyingClub, bid.highestBid, []);
  }

  static startNegotiation(
    playerId: string,
    buyingClubId: string,
    sellingClubId: string
  ): TransferNegotiation | null {
    if (!this.isWindowOpen()) {
      return null;
    }
    
    const clubStore = useClubStore();
    const buyingClub = clubStore.getClub(buyingClubId);
    const sellingClub = clubStore.getClub(sellingClubId);
    
    if (!buyingClub || !sellingClub) {
      return null;
    }
    
    const player = sellingClub.roster.find((p: any) => p.id === playerId);
    if (!player) {
      return null;
    }
    
    const existingNegotiation = Array.from(this.negotiations.values()).find(
      n => n.playerId === playerId && 
           n.buyingClubId === buyingClubId && 
           n.status === 'in_progress'
    );
    
    if (existingNegotiation) {
      return existingNegotiation;
    }
    
    const negotiation: TransferNegotiation = {
      id: `neg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      playerName: player.name,
      position: player.position,
      buyingClubId,
      buyingClubName: buyingClub.name,
      sellingClubId,
      sellingClubName: sellingClub.name,
      rounds: [],
      status: 'in_progress',
      agreement: null,
      playerConsent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    
    this.negotiations.set(negotiation.id, negotiation);
    
    return negotiation;
  }

  static processNegotiationRound(
    negotiationId: string,
    offer: {
      fee: number;
      playerExchangeId?: string;
      loanDuration?: number;
      salaryContribution?: number;
    }
  ): { negotiation: TransferNegotiation | null; aiResponse?: string } {
    const negotiation = this.negotiations.get(negotiationId);
    if (!negotiation || negotiation.status !== 'in_progress') {
      return { negotiation: null };
    }
    
    const rules = this.currentWindow?.rules || DEFAULT_TRANSFER_WINDOW_RULES;
    
    if (negotiation.rounds.length >= rules.maxNegotiationRounds) {
      negotiation.status = 'rejected';
      negotiation.updatedAt = new Date();
      this.negotiations.set(negotiationId, negotiation);
      return { negotiation, aiResponse: '谈判次数已达上限，转会失败' };
    }
    
    const clubStore = useClubStore();
    const sellingClub = clubStore.getClub(negotiation.sellingClubId);
    const buyingClub = clubStore.getClub(negotiation.buyingClubId);
    
    if (!sellingClub || !buyingClub) {
      return { negotiation: null };
    }
    
    const player = sellingClub.roster.find((p: any) => p.id === negotiation.playerId);
    if (!player) {
      return { negotiation: null };
    }
    
    const round: NegotiationRound = {
      round: negotiation.rounds.length + 1,
      initiator: 'buyer',
      offerType: offer.playerExchangeId ? 'player_exchange' : 'fee',
      feeOffer: offer.fee,
      playerExchangeId: offer.playerExchangeId,
      loanDuration: offer.loanDuration,
      salaryContribution: offer.salaryContribution,
      response: 'pending',
      timestamp: new Date(),
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    
    const aiDecision = this.getAINegotiationDecision(
      sellingClub,
      buyingClub,
      player,
      offer,
      negotiation.rounds.length
    );
    
    round.response = aiDecision.response;
    round.counterOffer = aiDecision.counterOffer;
    round.aiReasoning = aiDecision.reasoning;
    
    negotiation.rounds.push(round);
    
    if (aiDecision.response === 'accept') {
      negotiation.status = 'agreed';
      negotiation.agreement = {
        fee: offer.fee,
        playerExchangeId: offer.playerExchangeId,
        loanDuration: offer.loanDuration,
        salaryContribution: offer.salaryContribution,
        clauses: [],
        agreedAt: new Date(),
      };
      negotiation.playerConsent = this.checkPlayerConsent(
        player,
        buyingClub,
        this.generatePlayerPreference(player)
      );
    } else if (aiDecision.response === 'reject') {
      negotiation.status = 'rejected';
    }
    
    negotiation.updatedAt = new Date();
    this.negotiations.set(negotiationId, negotiation);
    
    return { negotiation, aiResponse: aiDecision.reasoning };
  }

  static completeTransfer(negotiationId: string): TransferResult | null {
    const negotiation = this.negotiations.get(negotiationId);
    if (!negotiation || negotiation.status !== 'agreed' || !negotiation.agreement) {
      return null;
    }
    
    if (!negotiation.playerConsent) {
      return {
        success: false,
        negotiationId,
        playerId: negotiation.playerId,
        playerName: negotiation.playerName,
        fromClubId: negotiation.sellingClubId,
        fromClubName: negotiation.sellingClubName,
        toClubId: negotiation.buyingClubId,
        toClubName: negotiation.buyingClubName,
        transferFee: negotiation.agreement.fee,
        clauses: negotiation.agreement.clauses,
        reason: '选手拒绝转会',
        timestamp: new Date(),
      };
    }
    
    const clubStore = useClubStore();
    const sellingClub = clubStore.getClub(negotiation.sellingClubId);
    const buyingClub = clubStore.getClub(negotiation.buyingClubId);
    
    if (!sellingClub || !buyingClub) {
      return null;
    }
    
    const player = sellingClub.roster.find((p: any) => p.id === negotiation.playerId);
    if (!player) {
      return null;
    }
    
    if (buyingClub.funds < negotiation.agreement.fee) {
      return {
        success: false,
        negotiationId,
        playerId: negotiation.playerId,
        playerName: negotiation.playerName,
        fromClubId: sellingClub.id,
        fromClubName: sellingClub.name,
        toClubId: buyingClub.id,
        toClubName: buyingClub.name,
        transferFee: negotiation.agreement.fee,
        clauses: negotiation.agreement.clauses,
        reason: '买家资金不足',
        timestamp: new Date(),
      };
    }
    
    const result = this.executeTransfer(
      player,
      sellingClub,
      buyingClub,
      negotiation.agreement.fee,
      negotiation.agreement.clauses
    );
    
    if (result.success) {
      negotiation.status = 'agreed';
      this.negotiations.set(negotiationId, negotiation);
    }
    
    return result;
  }

  private static createBid(player: any, playerClub: Club, type: 'open' | 'sealed'): TransferBid {
    return {
      id: `tb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      currentClubId: playerClub.id,
      currentClubName: playerClub.name,
      type,
      status: 'pending',
      bids: [],
      highestBid: 0,
      leadingClubId: null,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      playerPreference: this.generatePlayerPreference(player),
      buyoutClause: player.contract?.buyoutClause || 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private static generatePlayerPreference(player: any): PlayerTransferPreference {
    return {
      preferredDestinations: [],
      rejectedClubs: [],
      minSalaryRequirement: (player.contract?.salary || 30) * 1.2,
      wantsStartingRole: player.stats && player.getAverageStats() > 70,
      openToLoan: player.age < 22,
      priorityFactors: ['money', 'playing_time'],
    };
  }

  private static findPlayerClub(playerId: string): Club | null {
    const clubStore = useClubStore();
    const clubs = clubStore.allClubs;
    
    for (const club of clubs) {
      if (club.roster && club.roster.some((p: any) => p.id === playerId)) {
        return club;
      }
    }
    
    return null;
  }

  private static checkPlayerConsent(
    player: any,
    targetClub: Club,
    preference: PlayerTransferPreference
  ): boolean {
    if (preference.rejectedClubs.includes(targetClub.id)) {
      return false;
    }
    
    const targetSalary = (player.contract?.salary || 30) * 1.1;
    if (targetSalary < preference.minSalaryRequirement) {
      return false;
    }
    
    const consentChance = 70;
    return Math.random() * 100 < consentChance;
  }

  private static getAINegotiationDecision(
    sellingClub: Club,
    buyingClub: Club,
    player: any,
    offer: { fee: number; playerExchangeId?: string; loanDuration?: number },
    currentRounds: number
  ): { response: 'accept' | 'counter' | 'reject'; counterOffer?: { fee: number }; reasoning: string } {
    const aiProfile = AIService.getAIProfile(sellingClub.id);
    
    const buyoutClause = player.contract?.buyoutClause || 100;
    const offerRatio = offer.fee / buyoutClause;
    
    let acceptThreshold = 0.9;
    let counterThreshold = 0.7;
    
    if (aiProfile) {
      const aggression = aiProfile.personality === 'big-spender' ? 0.8 : 
                         aiProfile.personality === 'survivor' ? 1.2 : 1.0;
      acceptThreshold *= aggression;
      counterThreshold *= aggression;
    }
    
    if (offerRatio >= acceptThreshold) {
      return {
        response: 'accept',
        reasoning: `报价 ${offer.fee} 万已达到心理预期，同意转会。`,
      };
    }
    
    if (offerRatio < 0.5 || currentRounds >= 4) {
      return {
        response: 'reject',
        reasoning: `报价 ${offer.fee} 万远低于选手价值，拒绝转会。`,
      };
    }
    
    const counterFee = Math.round(buyoutClause * (0.9 + Math.random() * 0.2));
    return {
      response: 'counter',
      counterOffer: { fee: counterFee },
      reasoning: `报价偏低，期望转会费 ${counterFee} 万。`,
    };
  }

  private static executeTransfer(
    player: any,
    sellingClub: Club,
    buyingClub: Club,
    fee: number,
    clauses: TransferClause[]
  ): TransferResult {
    buyingClub.funds -= fee;
    sellingClub.funds += fee;
    
    sellingClub.removePlayer(player.id);
    buyingClub.addPlayer(player, false);
    
    const newContract = {
      ...player.contract,
      buyoutClause: fee * 1.5,
      salary: Math.round(player.contract?.salary * 1.2 || fee * 0.1),
    };
    player.contract = newContract;
    
    if (player.condition) {
      player.condition.morale = Math.min(100, (player.condition.morale || 70) + 10);
    }
    
    const result: TransferResult = {
      success: true,
      negotiationId: '',
      playerId: player.id,
      playerName: player.name,
      fromClubId: sellingClub.id,
      fromClubName: sellingClub.name,
      toClubId: buyingClub.id,
      toClubName: buyingClub.name,
      transferFee: fee,
      clauses,
      timestamp: new Date(),
    };
    
    this.transferHistory.push(result);
    this.updateWindowStatistics(result);
    
    return result;
  }

  private static updateWindowStatistics(result: TransferResult): void {
    if (!this.currentWindow) return;
    
    this.currentWindow.statistics.totalTransfers++;
    this.currentWindow.statistics.totalFees += result.transferFee;
    this.currentWindow.statistics.averageFee = 
      Math.round(this.currentWindow.statistics.totalFees / this.currentWindow.statistics.totalTransfers);
    
    if (!this.currentWindow.statistics.biggestTransfer || 
        result.transferFee > this.currentWindow.statistics.biggestTransfer.fee) {
      this.currentWindow.statistics.biggestTransfer = {
        playerId: result.playerId,
        playerName: result.playerName,
        fee: result.transferFee,
      };
    }
    
    this.currentWindow.updatedAt = new Date();
  }

  private static processExpiredBids(): void {
    const now = new Date();
    this.activeBids.forEach((bid, playerId) => {
      if (bid.deadline < now && bid.status === 'pending') {
        if (bid.leadingClubId) {
          this.processBidding(playerId);
        } else {
          bid.status = 'lost';
        }
      }
    });
  }

  private static expireAllNegotiations(): void {
    this.negotiations.forEach((negotiation) => {
      if (negotiation.status === 'in_progress') {
        negotiation.status = 'expired';
      }
    });
  }

  static getActiveBids(): TransferBid[] {
    return Array.from(this.activeBids.values()).filter(b => b.status === 'pending');
  }

  static getBidsByClub(clubId: string): TransferBid[] {
    return Array.from(this.activeBids.values()).filter(b => 
      b.bids.some(bid => bid.clubId === clubId)
    );
  }

  static getNegotiationsByClub(clubId: string): TransferNegotiation[] {
    return Array.from(this.negotiations.values()).filter(
      n => n.buyingClubId === clubId || n.sellingClubId === clubId
    );
  }

  static getTransferHistory(): TransferResult[] {
    return [...this.transferHistory];
  }

  static reset(): void {
    this.currentWindow = null;
    this.activeBids.clear();
    this.negotiations.clear();
    this.transferHistory = [];
  }
}

export const transferWindowService = TransferWindowService;
