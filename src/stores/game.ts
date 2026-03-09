import { defineStore } from 'pinia';
import type { GameState, Difficulty } from '@/types';
import { useClubStore } from './club';
import { usePlayerStore } from './player';
import { useSponsorStore } from './sponsor';
import { useFanReputationStore } from './fanReputation';
import { useEventStore } from './event';
import { useMediaStore } from './media';
import { useAIStore } from './ai';
import { useLeagueStore } from './league';
import { useTransferWindowStore } from './transferWindow';
import { useRetirementStore } from './retirement';
import { AIService } from '@/core/services/aiService';
import { analystService } from '@/core/services/analystService';
import { useTournamentStore } from './tournament';

interface GameSettings {
  difficulty: Difficulty;
  autoSave: boolean;
  autoSaveInterval: number;
}

interface GameStateInterface {
  gameState: GameState;
  currentDate: Date;
  currentSeason: number;
  currentWeek: number;
  gameSpeed: number;
  settings: GameSettings;
  pendingEvents: any[];
  achievements: string[];
  weeklyReport: WeeklyReport | null;
}

interface WeeklyReport {
  week: number;
  fanChange: number;
  reputationChange: number;
  sponsorIncome: number;
  sponsorBonus: number;
  fanIncome: number;
  totalIncome: number;
  message: string;
}

export const useGameStore = defineStore('game', {
  state: (): GameStateInterface => ({
    gameState: 'menu',
    currentDate: new Date(2024, 0, 1),
    currentSeason: 1,
    currentWeek: 1,
    gameSpeed: 1,
    settings: {
      difficulty: 'normal',
      autoSave: true,
      autoSaveInterval: 5,
    },
    pendingEvents: [],
    achievements: [],
    weeklyReport: null,
  }),
  
  getters: {
    currentPhase: (state) => {
      const date = state.currentDate instanceof Date ? state.currentDate : new Date(state.currentDate);
      const month = date.getMonth();
      if (month < 2) return 'spring_season';
      if (month < 5) return 'spring_playoff';
      if (month < 8) return 'summer_break';
      if (month < 11) return 'autumn_season';
      return 'worlds';
    },
    
    isTransferWindow: (state) => {
      const date = state.currentDate instanceof Date ? state.currentDate : new Date(state.currentDate);
      const month = date.getMonth();
      return month === 0 || month === 6;
    },
  },
  
  actions: {
    newGame(_clubName: string, difficulty: Difficulty = 'normal') {
      this.gameState = 'playing';
      this.currentDate = new Date(2024, 0, 1);
      this.currentSeason = 1;
      this.currentWeek = 1;
      this.settings.difficulty = difficulty;
      this.pendingEvents = [];
      this.achievements = [];
      this.weeklyReport = null;

      this.initializeSystems();
    },

    initializeSystems() {
      const sponsorStore = useSponsorStore();
      const fanReputationStore = useFanReputationStore();
      const mediaStore = useMediaStore();

      sponsorStore.initialize();
      fanReputationStore.initialize(10000, 30);
      mediaStore.initialize();
    },
    
    advanceTime(days: number = 1) {
      const currentDateObj = this.currentDate instanceof Date 
        ? this.currentDate 
        : new Date(this.currentDate);
       
      for (let i = 0; i < days; i++) {
        currentDateObj.setDate(currentDateObj.getDate() + 1);
        this.currentDate = new Date(currentDateObj);
        this.onDayPassed();
      }
    },
    
    onDayPassed() {
      const currentDateObj = this.currentDate instanceof Date 
        ? this.currentDate 
        : new Date(this.currentDate);
       
      this.checkRandomEvents();
       
      if (currentDateObj.getDay() === 1) {
        this.onWeekPassed();
      }
    },
    
    checkRandomEvents() {
      const eventStore = useEventStore();
      const clubStore = useClubStore();
      const club = clubStore.currentClub;
       
      if (!club) return;
       
      const clubState = {
        funds: club.funds,
        reputation: club.reputation,
        fans: club.fans,
        week: this.currentWeek,
        ranking: 10,
        winRate: 0.5,
        seasonPhase: 'regular' as const,
        playerCount: club.roster.length,
        hasPlayer: (_playerType: string) => false,
      };
       
      const currentDay = Math.floor((this.currentDate.getTime() - new Date(2024, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
      eventStore.triggerDailyEvent(currentDay, clubState);
    },
    
    onWeekPassed() {
      this.currentWeek++;

      const clubStore = useClubStore();
      const playerStore = usePlayerStore();
      const sponsorStore = useSponsorStore();
      const fanReputationStore = useFanReputationStore();
      const mediaStore = useMediaStore();
      const leagueStore = useLeagueStore();

      const club = clubStore.currentClub;
      if (!club) return;

      this.simulateAIClubs();

      const currentRanking = 10;
      const winRate = 0.5;

      const sponsorResult = sponsorStore.processWeeklySettlement(
        this.currentWeek,
        currentRanking,
        winRate,
        club.fans
      );

      if (sponsorResult.income > 0) {
        clubStore.addFunds(sponsorResult.income + sponsorResult.bonus);
      }

      const fanResult = fanReputationStore.processWeeklyGrowth(
        this.currentWeek,
        currentRanking,
        winRate,
        sponsorStore.hasSponsor
      );

      const fanIncome = fanReputationStore.weeklyFanIncome;
      clubStore.addFunds(fanIncome);

      club.fans = fanReputationStore.totalFans;
      club.reputation = fanReputationStore.reputation;

      mediaStore.onWeekAdvance();

      club.roster.forEach(player => {
        playerStore.recoverPlayer(player.id);
      });

      this.simulateAITransferBidding();

      const retirementStore = useRetirementStore();
      club.roster.forEach(player => {
        const canRetire = retirementStore.checkRetirementEligibility(player.id);
        if (canRetire.eligible) {
          retirementStore.triggerRetirementEvent(player.id, club.id);
        }
      });

      analystService.clearExpiredReports();

      if (leagueStore.currentSeason?.phase === 'regular') {
        leagueStore.simulateAllMatchesInRound();
      }

      this.weeklyReport = {
        week: this.currentWeek,
        fanChange: fanResult.fanChange,
        reputationChange: fanResult.reputationChange,
        sponsorIncome: sponsorResult.income,
        sponsorBonus: sponsorResult.bonus,
        fanIncome: fanIncome,
        totalIncome: sponsorResult.income + sponsorResult.bonus + fanIncome,
        message: sponsorResult.message,
      };
    },
    
    simulateAIClubs() {
      const clubStore = useClubStore();
      const playerStore = usePlayerStore();
      const aiStore = useAIStore();

      const allClubs = clubStore.allClubs;
      const playerClubId = clubStore.currentClub?.id;

      if (!playerClubId) return;

      const availablePlayers = playerStore.availablePlayers;

      allClubs.forEach(club => {
        if (club.id === playerClubId) return;

        if (!AIService.getAIProfile(club.id)) {
          const storedProfile = aiStore.getAIProfile(club.id);
          if (storedProfile && storedProfile.template) {
            AIService.initAIClub(club.id, storedProfile.template);
          } else {
            AIService.initAIClub(club.id);
          }
        }

        const clubWithMethods = club as any;
        if (clubWithMethods.roster) {
          AIService.simulateAIWeek(clubWithMethods, availablePlayers);
        }

        const updatedProfile = AIService.getAIProfile(club.id);
        if (updatedProfile) {
          aiStore.setAIProfile(club.id, updatedProfile);
        }
      });
    },
    
    simulateAITransferBidding() {
      const clubStore = useClubStore();
      const playerStore = usePlayerStore();
      const transferWindowStore = useTransferWindowStore();
      
      const allClubs = clubStore.allClubs;
      const playerClubId = clubStore.currentClub?.id;
      
      if (!playerClubId) return;
      
      const transferOffers = transferWindowStore.activeOffers;
      
      allClubs.forEach(club => {
        if (club.id === playerClubId) return;
        
        const clubWithMethods = club as any;
        const clubFunds = clubWithMethods.funds || 0;
        const clubPower = clubWithMethods.roster?.reduce((sum: number, p: any) => sum + (p.power || 50), 0) || 0;
        
        transferOffers.forEach(offer => {
          if (offer.status !== 'active') return;
          
          const player = playerStore.getPlayer(offer.playerId);
          if (!player) return;
          
          const playerPower = player.power || 50;
          const buyout = offer.buyoutClause || player.contract?.buyoutClause || 100;
          
          if (clubFunds > buyout * 1.5 && clubPower < 300) {
            const bidAmount = buyout * (0.8 + Math.random() * 0.4);
            
            transferWindowStore.placeBid(offer.playerId, club.id, bidAmount, 'open');
          }
        });
      });
    },
    
    saveGame(): string {
      const saveData = {
        game: this.$state,
      };
      const saveId = `save_${Date.now()}`;
      localStorage.setItem(saveId, JSON.stringify(saveData));
      return saveId;
    },
    
    loadGame(saveId: string) {
      const saveData = JSON.parse(localStorage.getItem(saveId) || '{}');
      if (saveData.game) {
        this.$patch(saveData.game);
      }
    },
  },
  
  persist: true,
});
