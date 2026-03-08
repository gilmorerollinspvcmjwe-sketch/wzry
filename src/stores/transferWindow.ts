import { defineStore } from 'pinia';
import { TransferWindowService } from '@/core/services/transferWindowService';
import type {
  TransferWindow,
  TransferBid,
  TransferNegotiation,
  TransferResult,
  TransferWindowType,
} from '@/types/transferWindow';

interface TransferWindowState {
  currentWindow: TransferWindow | null;
  activeBids: TransferBid[];
  myBids: TransferBid[];
  myNegotiations: TransferNegotiation[];
  transferHistory: TransferResult[];
  isLoading: boolean;
  error: string | null;
}

export const useTransferWindowStore = defineStore('transferWindow', {
  state: (): TransferWindowState => ({
    currentWindow: null,
    activeBids: [],
    myBids: [],
    myNegotiations: [],
    transferHistory: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    isWindowOpen: (state): boolean => {
      if (!state.currentWindow) return false;
      return state.currentWindow.status === 'active' || state.currentWindow.status === 'closing';
    },

    windowStatus: (state): string => {
      if (!state.currentWindow) return '未开启';
      const statusMap: Record<string, string> = {
        upcoming: '即将开启',
        active: '开放中',
        closing: '即将关闭',
        closed: '已关闭',
      };
      return statusMap[state.currentWindow.status] || '未知';
    },

    daysRemaining: (state): number => {
      if (!state.currentWindow) return 0;
      const endDate = state.currentWindow.endDate instanceof Date 
        ? state.currentWindow.endDate 
        : new Date(state.currentWindow.endDate);
      const now = new Date();
      return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    },

    pendingBidsCount: (state): number => {
      return state.myBids.filter(b => b.status === 'pending').length;
    },

    activeNegotiationsCount: (state): number => {
      return state.myNegotiations.filter(n => n.status === 'in_progress').length;
    },

    totalTransferFees: (state): number => {
      return state.transferHistory
        .filter(t => t.success)
        .reduce((sum, t) => sum + t.transferFee, 0);
    },
  },

  actions: {
    initializeWindow(year: number, type: TransferWindowType) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const window = TransferWindowService.initializeTransferWindow(year, type);
        this.currentWindow = window;
        this.refreshData();
      } catch (e) {
        this.error = '初始化转会窗口失败';
        console.error('Failed to initialize transfer window:', e);
      } finally {
        this.isLoading = false;
      }
    },

    checkWindowStatus() {
      const window = TransferWindowService.checkWindowStatus();
      if (window) {
        this.currentWindow = window;
      }
    },

    refreshData() {
      this.activeBids = TransferWindowService.getActiveBids();
      this.transferHistory = TransferWindowService.getTransferHistory();
    },

    refreshClubData(clubId: string) {
      this.myBids = TransferWindowService.getBidsByClub(clubId);
      this.myNegotiations = TransferWindowService.getNegotiationsByClub(clubId);
    },

    placeBid(
      playerId: string,
      clubId: string,
      amount: number,
      type: 'open' | 'sealed' = 'open'
    ): { success: boolean; reason?: string } {
      this.isLoading = true;
      this.error = null;

      try {
        const result = TransferWindowService.placeBid(playerId, clubId, amount, type);
        
        if (result.success && result.bid) {
          this.refreshData();
          this.refreshClubData(clubId);
          return { success: true };
        } else {
          this.error = result.reason || '出价失败';
          return { success: false, reason: result.reason };
        }
      } catch (e) {
        this.error = '出价失败';
        console.error('Failed to place bid:', e);
        return { success: false, reason: '出价失败' };
      } finally {
        this.isLoading = false;
      }
    },

    processBidding(playerId: string): TransferResult | null {
      this.isLoading = true;
      this.error = null;

      try {
        const result = TransferWindowService.processBidding(playerId);
        this.refreshData();
        return result;
      } catch (e) {
        this.error = '处理竞价失败';
        console.error('Failed to process bidding:', e);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    startNegotiation(
      playerId: string,
      buyingClubId: string,
      sellingClubId: string
    ): TransferNegotiation | null {
      this.isLoading = true;
      this.error = null;

      try {
        const negotiation = TransferWindowService.startNegotiation(
          playerId,
          buyingClubId,
          sellingClubId
        );
        
        if (negotiation) {
          this.refreshClubData(buyingClubId);
        }
        
        return negotiation;
      } catch (e) {
        this.error = '开始谈判失败';
        console.error('Failed to start negotiation:', e);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    processNegotiationRound(
      negotiationId: string,
      offer: {
        fee: number;
        playerExchangeId?: string;
        loanDuration?: number;
        salaryContribution?: number;
      },
      clubId: string
    ): { negotiation: TransferNegotiation | null; aiResponse?: string } {
      this.isLoading = true;
      this.error = null;

      try {
        const result = TransferWindowService.processNegotiationRound(negotiationId, offer);
        
        if (result.negotiation) {
          this.refreshClubData(clubId);
        }
        
        return result;
      } catch (e) {
        this.error = '处理谈判失败';
        console.error('Failed to process negotiation round:', e);
        return { negotiation: null };
      } finally {
        this.isLoading = false;
      }
    },

    completeTransfer(negotiationId: string, clubId: string): TransferResult | null {
      this.isLoading = true;
      this.error = null;

      try {
        const result = TransferWindowService.completeTransfer(negotiationId);
        
        if (result) {
          this.refreshData();
          this.refreshClubData(clubId);
        }
        
        return result;
      } catch (e) {
        this.error = '完成转会失败';
        console.error('Failed to complete transfer:', e);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    reset() {
      TransferWindowService.reset();
      this.currentWindow = null;
      this.activeBids = [];
      this.myBids = [];
      this.myNegotiations = [];
      this.transferHistory = [];
      this.isLoading = false;
      this.error = null;
    },
  },

  persist: true,
});
