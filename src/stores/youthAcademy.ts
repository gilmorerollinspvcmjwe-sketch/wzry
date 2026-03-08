import { defineStore } from 'pinia';
import type { 
  YouthAcademy, 
  YouthCoach, 
  YouthPlayer, 
  YouthFacility, 
  Loan, 
  YouthLeague,
  TrainingProgram 
} from '@/types/youthAcademy';
import { initializeAcademy, calculateAcademyWeeklyCost } from '@/core/services/youthAcademyService';
import { usePlayerStore } from './player';

interface YouthAcademyState {
  academies: Record<string, YouthAcademy>;
}

export const useYouthAcademyStore = defineStore('youthAcademy', {
  state: (): YouthAcademyState => ({
    academies: {},
  }),
  
  getters: {
    getAcademy: (state) => (clubId: string): YouthAcademy => {
      if (!state.academies[clubId]) {
        state.academies[clubId] = initializeAcademy(clubId);
      }
      return state.academies[clubId];
    },
    
    getPlayers: (state) => (clubId: string): YouthPlayer[] => {
      return state.academies[clubId]?.players || [];
    },
    
    getCoaches: (state) => (clubId: string): YouthCoach[] => {
      return state.academies[clubId]?.coaches || [];
    },
    
    getFacilities: (state) => (clubId: string): YouthFacility => {
      return state.academies[clubId]?.facilities || {
        trainingGround: 1,
        dormitory: 1,
        medicalCenter: 1,
        analysisRoom: 1,
      };
    },
    
    getLoans: (state) => (clubId: string): Loan[] => {
      return state.academies[clubId]?.loans || [];
    },
    
    getActiveLoans: (state) => (clubId: string): Loan[] => {
      return (state.academies[clubId]?.loans || []).filter(l => l.status === 'active');
    },
    
    getLeague: (state) => (clubId: string): YouthLeague | null => {
      return state.academies[clubId]?.league || null;
    },
    
    getTrainingPrograms: (state) => (clubId: string): TrainingProgram[] => {
      return state.academies[clubId]?.trainingPrograms || [];
    },
    
    getWeeklyCost: (state) => (clubId: string): number => {
      const academy = state.academies[clubId];
      if (!academy) return 0;
      return calculateAcademyWeeklyCost(academy);
    },
    
    getPlayerById: (state) => (clubId: string, playerId: string): YouthPlayer | undefined => {
      return state.academies[clubId]?.players.find(p => p.id === playerId);
    },
    
    getCoachById: (state) => (clubId: string, coachId: string): YouthCoach | undefined => {
      return state.academies[clubId]?.coaches.find(c => c.id === coachId);
    },
    
    getAvailablePlayers: (state) => (clubId: string): YouthPlayer[] => {
      return (state.academies[clubId]?.players || []).filter(p => p.status === 'training');
    },
    
    getAcademyStats: (state) => (clubId: string) => {
      return state.academies[clubId]?.stats || {
        totalGraduates: 0,
        activeInFirstTeam: 0,
        totalSold: 0,
        totalRevenue: 0,
        averageRating: 0,
      };
    },
  },
  
  actions: {
    initAcademy(clubId: string) {
      if (!this.academies[clubId]) {
        this.academies[clubId] = initializeAcademy(clubId);
      }
    },
    
    updateAcademy(clubId: string, academy: YouthAcademy) {
      this.academies[clubId] = academy;
    },
    
    addCoach(clubId: string, coach: YouthCoach) {
      this.initAcademy(clubId);
      this.academies[clubId].coaches.push(coach);
    },
    
    removeCoach(clubId: string, coachId: string) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.coaches = academy.coaches.filter(c => c.id !== coachId);
      }
    },
    
    updateCoach(clubId: string, coach: YouthCoach) {
      const academy = this.academies[clubId];
      if (academy) {
        const index = academy.coaches.findIndex(c => c.id === coach.id);
        if (index !== -1) {
          academy.coaches[index] = coach;
        }
      }
    },
    
    addPlayer(clubId: string, player: YouthPlayer) {
      this.initAcademy(clubId);
      this.academies[clubId].players.push(player);
    },
    
    removePlayer(clubId: string, playerId: string) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.players = academy.players.filter(p => p.id !== playerId);
      }
    },
    
    updatePlayer(clubId: string, player: YouthPlayer) {
      const academy = this.academies[clubId];
      if (academy) {
        const index = academy.players.findIndex(p => p.id === player.id);
        if (index !== -1) {
          academy.players[index] = player;
        }
      }
    },
    
    upgradeFacility(clubId: string, facility: keyof YouthFacility, level: number) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.facilities[facility] = level;
      }
    },
    
    addLoan(clubId: string, loan: Loan) {
      this.initAcademy(clubId);
      this.academies[clubId].loans.push(loan);
    },
    
    updateLoan(clubId: string, loan: Loan) {
      const academy = this.academies[clubId];
      if (academy) {
        const index = academy.loans.findIndex(l => l.id === loan.id);
        if (index !== -1) {
          academy.loans[index] = loan;
        }
      }
    },
    
    removeLoan(clubId: string, loanId: string) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.loans = academy.loans.filter(l => l.id !== loanId);
      }
    },
    
    setLeague(clubId: string, league: YouthLeague | null) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.league = league;
      }
    },
    
    updateLeague(clubId: string, league: YouthLeague) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.league = league;
      }
    },
    
    addTrainingProgram(clubId: string, program: TrainingProgram) {
      this.initAcademy(clubId);
      this.academies[clubId].trainingPrograms.push(program);
    },
    
    removeTrainingProgram(clubId: string, programId: string) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.trainingPrograms = academy.trainingPrograms.filter(p => p.id !== programId);
      }
    },

    promoteToFirstTeam(clubId: string, playerId: string) {
      const academy = this.academies[clubId];
      if (!academy) return null;

      const playerIndex = academy.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return null;

      const youthPlayer = academy.players[playerIndex];
      
      const avgStats = (
        youthPlayer.stats.mechanics +
        youthPlayer.stats.awareness +
        youthPlayer.stats.mentality +
        youthPlayer.stats.teamwork +
        youthPlayer.stats.heroPool
      ) / 5;

      if (avgStats < 60) {
        console.warn(`选手 ${youthPlayer.name} 平均属性 ${avgStats} 低于60，无法提拔`);
        return null;
      }

      const playerStore = usePlayerStore();
      const firstTeamPlayer = {
        ...youthPlayer,
        position: youthPlayer.position as any,
        status: 'active' as const,
        contract: {
          salary: youthPlayer.potential * 1000,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          buyoutClause: youthPlayer.potential * 50000
        },
        condition: {
          stamina: 100,
          mentality: 75,
          injury: 0,
          morale: 75
        },
        heroPreference: {
          preferredRoles: [youthPlayer.position],
          preferredTags: [],
          favoriteHeroes: []
        },
        personality: {
          playStyle: 'balanced',
          pressureResistance: 'normal',
          teamwork: 70,
          loyalty: 75
        },
        talents: [],
        growthHistory: []
      };

      academy.players.splice(playerIndex, 1);
      
      if (academy.stats) {
        academy.stats.activeInFirstTeam += 1;
      }

      return playerStore.addPlayer(firstTeamPlayer);
    },
    
    updateBudget(clubId: string, amount: number) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.budget += amount;
      }
    },
    
    updateStats(clubId: string, stats: Partial<YouthAcademy['stats']>) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.stats = { ...academy.stats, ...stats };
      }
    },
    
    setAcademyLevel(clubId: string, level: number) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.level = level;
      }
    },
    
    setAcademyReputation(clubId: string, reputation: number) {
      const academy = this.academies[clubId];
      if (academy) {
        academy.reputation = Math.min(100, Math.max(0, reputation));
      }
    },
    
    clearAcademy(clubId: string) {
      this.academies[clubId] = initializeAcademy(clubId);
    },
  },
  
  persist: true,
});
