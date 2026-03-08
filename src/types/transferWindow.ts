export type TransferWindowType = 'summer' | 'winter';

export type TransferWindowStatus = 'upcoming' | 'active' | 'closing' | 'closed';

export type BiddingType = 'open' | 'sealed';

export type BidStatus = 'pending' | 'leading' | 'won' | 'lost' | 'withdrawn';

export type NegotiationStatus = 'pending' | 'in_progress' | 'agreed' | 'rejected' | 'expired';

export type TransferClauseType = 
  | 'buyout' 
  | 'release_clause' 
  | 'sell_on_percentage'
  | 'appearance_fee'
  | 'loyalty_bonus';

export interface TransferClause {
  type: TransferClauseType;
  value: number;
  triggered: boolean;
  description?: string;
}

export interface TransferWindowStatistics {
  totalTransfers: number;
  totalFees: number;
  averageFee: number;
  biggestTransfer: {
    playerId: string;
    playerName: string;
    fee: number;
  } | null;
  mostActiveClub: {
    clubId: string;
    clubName: string;
    transfers: number;
  } | null;
}

export interface TransferWindowRules {
  maxForeignPlayers: number;
  minHomegrownPlayers: number;
  squadSizeLimit: number;
  youthAgeLimit: number;
  bidIncrementPercentage: number;
  minBidAmount: number;
  maxNegotiationRounds: number;
}

export interface TransferWindow {
  id: string;
  type: TransferWindowType;
  year: number;
  startDate: Date;
  endDate: Date;
  status: TransferWindowStatus;
  statistics: TransferWindowStatistics;
  rules: TransferWindowRules;
  createdAt: Date;
  updatedAt: Date;
}

export interface BidEntry {
  id: string;
  clubId: string;
  clubName: string;
  amount: number;
  timestamp: Date;
  status: BidStatus;
  conditions?: string[];
}

export interface TransferBid {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  currentClubId: string;
  currentClubName: string;
  type: BiddingType;
  status: BidStatus;
  bids: BidEntry[];
  highestBid: number;
  leadingClubId: string | null;
  deadline: Date;
  playerPreference: PlayerTransferPreference;
  buyoutClause: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerTransferPreference {
  preferredDestinations: string[];
  rejectedClubs: string[];
  minSalaryRequirement: number;
  wantsStartingRole: boolean;
  openToLoan: boolean;
  priorityFactors: ('money' | 'playing_time' | 'championship' | 'location')[];
}

export interface NegotiationRound {
  round: number;
  initiator: 'buyer' | 'seller';
  offerType: 'fee' | 'player_exchange' | 'loan' | 'hybrid';
  feeOffer: number;
  playerExchangeId?: string;
  loanDuration?: number;
  salaryContribution?: number;
  response: 'accept' | 'counter' | 'reject' | 'pending';
  counterOffer?: {
    fee: number;
    conditions?: string[];
  };
  timestamp: Date;
  deadline: Date;
  aiReasoning?: string;
}

export interface TransferNegotiation {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  buyingClubId: string;
  buyingClubName: string;
  sellingClubId: string;
  sellingClubName: string;
  rounds: NegotiationRound[];
  status: NegotiationStatus;
  agreement: TransferAgreement | null;
  playerConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface TransferAgreement {
  fee: number;
  playerExchangeId?: string;
  loanDuration?: number;
  salaryContribution?: number;
  sellOnPercentage?: number;
  clauses: TransferClause[];
  agreedAt: Date;
}

export interface TransferResult {
  success: boolean;
  negotiationId: string;
  playerId: string;
  playerName: string;
  fromClubId: string;
  fromClubName: string;
  toClubId: string;
  toClubName: string;
  transferFee: number;
  clauses: TransferClause[];
  reason?: string;
  timestamp: Date;
}

export const DEFAULT_TRANSFER_WINDOW_RULES: TransferWindowRules = {
  maxForeignPlayers: 3,
  minHomegrownPlayers: 2,
  squadSizeLimit: 10,
  youthAgeLimit: 18,
  bidIncrementPercentage: 5,
  minBidAmount: 10,
  maxNegotiationRounds: 5,
};

export const SUMMER_WINDOW_MONTHS = { start: 5, end: 7 };
export const WINTER_WINDOW_MONTHS = { start: 0, end: 1 };

export function getTransferWindowStatus(window: TransferWindow): TransferWindowStatus {
  const now = new Date();
  const startDate = window.startDate instanceof Date ? window.startDate : new Date(window.startDate);
  const endDate = window.endDate instanceof Date ? window.endDate : new Date(window.endDate);
  
  if (now < startDate) {
    return 'upcoming';
  } else if (now >= startDate && now <= endDate) {
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 3) {
      return 'closing';
    }
    return 'active';
  } else {
    return 'closed';
  }
}

export function calculateBidIncrement(currentBid: number, rules: TransferWindowRules): number {
  return Math.max(rules.minBidAmount, Math.ceil(currentBid * (rules.bidIncrementPercentage / 100)));
}

export function isBidValid(
  bidAmount: number, 
  currentHighestBid: number, 
  clubFunds: number,
  rules: TransferWindowRules
): { valid: boolean; reason?: string } {
  if (bidAmount < rules.minBidAmount) {
    return { valid: false, reason: `出价不能低于最低金额 ${rules.minBidAmount} 万` };
  }
  
  if (currentHighestBid > 0) {
    const minIncrement = calculateBidIncrement(currentHighestBid, rules);
    if (bidAmount < currentHighestBid + minIncrement) {
      return { valid: false, reason: `出价必须比当前最高价高出至少 ${minIncrement} 万` };
    }
  }
  
  if (bidAmount > clubFunds) {
    return { valid: false, reason: '俱乐部资金不足' };
  }
  
  return { valid: true };
}
