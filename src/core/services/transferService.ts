// 转会系统服务

import { useClubStore } from '@/stores/club';
import { AIService } from './aiService';
import type { Club } from '@/core/models/Club';
import type { Player } from '@/core/models/Player';
import type { Position } from '@/types';

export interface TransferBid {
  clubId: string;
  clubName: string;
  amount: number;
  timestamp: Date;
}

export interface TransferOffer {
  playerId: string;
  playerName: string;
  position: Position;
  currentClubId: string;
  currentClubName: string;
  buyoutClause: number;
  bids: TransferBid[];
  highestBid: number;
  leadingClubId: string | null;
  status: 'active' | 'completed' | 'expired' | 'withdrawn';
  deadline: Date;
  interestedClubs: string[];
}

export interface TransferRequest {
  playerId: string;
  fromClubId: string;
  toClubId: string;
  offerAmount: number;
  timestamp: Date;
}

export interface TransferResult {
  success: boolean;
  playerId: string;
  playerName: string;
  fromClubId: string;
  fromClubName: string;
  toClubId: string;
  toClubName: string;
  transferFee: number;
  reason?: string;
}

export class TransferService {
  private static transferMarket: Map<string, TransferOffer> = new Map();
  private static transferHistory: TransferResult[] = [];
  private static pendingRequests: TransferRequest[] = [];

  static getTransferMarket(): TransferOffer[] {
    return Array.from(this.transferMarket.values());
  }

  static getTransferHistory(): TransferResult[] {
    return [...this.transferHistory];
  }

  static getPendingRequests(): TransferRequest[] {
    return [...this.pendingRequests];
  }

  static listPlayerForTransfer(player: Player, club: Club, duration: number = 7): TransferOffer {
    const offer: TransferOffer = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      currentClubId: club.id,
      currentClubName: club.name,
      buyoutClause: player.contract.buyoutClause,
      bids: [],
      highestBid: 0,
      leadingClubId: null,
      status: 'active',
      deadline: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      interestedClubs: [],
    };

    this.transferMarket.set(player.id, offer);
    return offer;
  }

  static removePlayerFromMarket(playerId: string): void {
    const offer = this.transferMarket.get(playerId);
    if (offer) {
      offer.status = 'withdrawn';
      this.transferMarket.set(playerId, offer);
    }
  }

  static expressInterest(clubId: string, playerId: string): void {
    const offer = this.transferMarket.get(playerId);
    if (offer && !offer.interestedClubs.includes(clubId)) {
      offer.interestedClubs.push(clubId);
      this.transferMarket.set(playerId, offer);
    }
  }

  static placeBid(club: Club, playerId: string, amount: number): { success: boolean; reason?: string } {
    const offer = this.transferMarket.get(playerId);
    
    if (!offer) {
      return { success: false, reason: 'Player not on transfer market' };
    }

    if (offer.status !== 'active') {
      return { success: false, reason: 'Transfer offer is no longer active' };
    }

    if (new Date() > offer.deadline) {
      offer.status = 'expired';
      this.transferMarket.set(playerId, offer);
      return { success: false, reason: 'Transfer deadline has passed' };
    }

    if (club.id === offer.currentClubId) {
      return { success: false, reason: 'Club cannot bid for its own player' };
    }

    if (amount <= offer.highestBid) {
      return { success: false, reason: 'Bid must be higher than current highest bid' };
    }

    if (club.funds < amount) {
      return { success: false, reason: 'Insufficient funds' };
    }

    const bid: TransferBid = {
      clubId: club.id,
      clubName: club.name,
      amount,
      timestamp: new Date(),
    };

    offer.bids.push(bid);
    offer.highestBid = amount;
    offer.leadingClubId = club.id;

    this.transferMarket.set(playerId, offer);

    return { success: true };
  }

  static acceptBid(playerId: string, acceptingClubId?: string): TransferResult | null {
    const offer = this.transferMarket.get(playerId);
    
    if (!offer || offer.status !== 'active') {
      return null;
    }

    const clubStore = useClubStore();
    const sellingClub = clubStore.getClub(offer.currentClubId);
    
    if (!sellingClub) {
      return null;
    }

    let acceptingClubIdToUse = acceptingClubId || offer.leadingClubId;
    
    if (!acceptingClubIdToUse) {
      return null;
    }

    const buyingClub = clubStore.getClub(acceptingClubIdToUse);
    
    if (!buyingClub) {
      return null;
    }

    const player = sellingClub.roster.find(p => p.id === playerId);
    
    if (!player) {
      return null;
    }

    if (buyingClub.funds < offer.highestBid) {
      return {
        success: false,
        playerId,
        playerName: player.name,
        fromClubId: sellingClub.id,
        fromClubName: sellingClub.name,
        toClubId: buyingClub.id,
        toClubName: buyingClub.name,
        transferFee: offer.highestBid,
        reason: 'Buying club has insufficient funds',
      };
    }

    buyingClub.funds -= offer.highestBid;
    sellingClub.funds += offer.highestBid;

    sellingClub.removePlayer(playerId);
    buyingClub.addPlayer(player, false);

    const newContract = {
      ...player.contract,
      buyoutClause: offer.highestBid * 1.5,
      salary: player.contract.salary * 1.2,
    };
    player.contract = newContract;

    player.condition.morale = Math.min(100, player.condition.morale + 10);

    const result: TransferResult = {
      success: true,
      playerId: player.id,
      playerName: player.name,
      fromClubId: sellingClub.id,
      fromClubName: sellingClub.name,
      toClubId: buyingClub.id,
      toClubName: buyingClub.name,
      transferFee: offer.highestBid,
    };

    this.transferHistory.push(result);
    offer.status = 'completed';
    this.transferMarket.set(playerId, offer);

    return result;
  }

  static makeTransferOffer(targetPlayer: Player, targetClub: Club, offeringClub: Club, offerAmount: number): TransferResult | null {
    if (offeringClub.funds < offerAmount) {
      return {
        success: false,
        playerId: targetPlayer.id,
        playerName: targetPlayer.name,
        fromClubId: targetClub.id,
        fromClubName: targetClub.name,
        toClubId: offeringClub.id,
        toClubName: offeringClub.name,
        transferFee: offerAmount,
        reason: 'Insufficient funds',
      };
    }

    const baseAcceptanceChance = 50;
    const offerRatio = offerAmount / targetPlayer.contract.buyoutClause;
    const acceptanceBonus = (offerRatio - 1) * 30;
    
    const moralePenalty = (targetPlayer.condition.morale - 50) * 0.3;
    
    const clubReputationDiff = offeringClub.reputation - targetClub.reputation;
    const reputationBonus = clubReputationDiff * 0.2;
    
    const aiProfile = AIService.getAIProfile(targetClub.id);
    const aggressionPenalty = aiProfile ? aiProfile.personality.aggressiveness * 0.1 : 0;
    
    const acceptanceChance = baseAcceptanceChance + acceptanceBonus - moralePenalty + reputationBonus - aggressionPenalty;
    
    const roll = Math.random() * 100;
    
    if (roll > acceptanceChance) {
      return {
        success: false,
        playerId: targetPlayer.id,
        playerName: targetPlayer.name,
        fromClubId: targetClub.id,
        fromClubName: targetClub.name,
        toClubId: offeringClub.id,
        toClubName: offeringClub.name,
        transferFee: offerAmount,
        reason: 'Transfer offer rejected',
      };
    }

    offeringClub.funds -= offerAmount;
    targetClub.funds += offerAmount;

    targetClub.removePlayer(targetPlayer.id);
    offeringClub.addPlayer(targetPlayer, false);

    const newContract = {
      ...targetPlayer.contract,
      buyoutClause: offerAmount * 1.5,
      salary: targetPlayer.contract.salary * 1.2,
    };
    targetPlayer.contract = newContract;

    targetPlayer.condition.morale = Math.min(100, targetPlayer.condition.morale + 10);

    const result: TransferResult = {
      success: true,
      playerId: targetPlayer.id,
      playerName: targetPlayer.name,
      fromClubId: targetClub.id,
      fromClubName: targetClub.name,
      toClubId: offeringClub.id,
      toClubName: offeringClub.name,
      transferFee: offerAmount,
    };

    this.transferHistory.push(result);

    return result;
  }

  static processAIWeek(clubs: Club[], availablePlayers: Player[]): void {
    clubs.forEach(club => {
      const ai = AIService.getAIProfile(club.id);
      if (!ai) return;

      const transferChance = ai.personality.aggressiveness / 100;
      if (Math.random() < transferChance) {
        const decision = AIService.makeTransferDecision(club, availablePlayers);
        
        if (decision.type === 'bid' && decision.playerId && decision.price) {
          const targetPlayer = availablePlayers.find(p => p.id === decision.playerId);
          
          if (targetPlayer) {
            const targetClub = clubs.find(c => c.roster.some(p => p.id === targetPlayer.id));
            
            if (targetClub && targetClub.id !== club.id) {
              const offerAmount = decision.price * (0.9 + Math.random() * 0.2);
              this.makeTransferOffer(targetPlayer, targetClub, club, offerAmount);
            }
          }
        }
      }
    });
  }

  static getInterestedClubs(playerId: string): string[] {
    const offer = this.transferMarket.get(playerId);
    return offer ? offer.interestedClubs : [];
  }

  static getHighestBid(playerId: string): { amount: number; clubId: string | null } {
    const offer = this.transferMarket.get(playerId);
    if (!offer) {
      return { amount: 0, clubId: null };
    }
    
    return {
      amount: offer.highestBid,
      clubId: offer.leadingClubId,
    };
  }

  static getActiveOffers(): TransferOffer[] {
    return this.getTransferMarket().filter(offer => offer.status === 'active');
  }

  static getOffersByClub(clubId: string): TransferOffer[] {
    return this.getTransferMarket().filter(offer => offer.currentClubId === clubId);
  }

  static getBidsByClub(clubId: string): TransferOffer[] {
    return this.getTransferMarket().filter(offer => 
      offer.bids.some(bid => bid.clubId === clubId)
    );
  }

  static clearExpiredOffers(): void {
    const now = new Date();
    this.transferMarket.forEach((offer, playerId) => {
      if (offer.status === 'active' && now > offer.deadline) {
        offer.status = 'expired';
        this.transferMarket.set(playerId, offer);
      }
    });
  }

  static reset(): void {
    this.transferMarket.clear();
    this.transferHistory = [];
    this.pendingRequests = [];
  }
}

export const transferService = TransferService;
