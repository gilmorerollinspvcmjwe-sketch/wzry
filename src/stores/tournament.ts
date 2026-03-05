import { defineStore } from 'pinia';
import { Tournament } from '@/core/models/Tournament';
import { Match } from '@/core/models/Match';
import type { TournamentType, Group } from '@/types';

interface TournamentState {
  currentTournament: Tournament | null;
  tournaments: Tournament[];
  currentSeason: number;
  currentYear: number;
}

export const useTournamentStore = defineStore('tournament', {
  state: (): TournamentState => ({
    currentTournament: null,
    tournaments: [],
    currentSeason: 1,
    currentYear: 2024,
  }),

  getters: {
    // 获取当前赛事
    activeTournament: (state) => state.currentTournament,

    // 获取积分榜
    standings: (state) => {
      if (!state.currentTournament) return [];
      return state.currentTournament.participants;
    },

    // 获取某组排名
    groupStandings: (state) => {
      return (group: Group) => {
        if (!state.currentTournament) return [];
        return state.currentTournament.getGroupTeams(group);
      };
    },

    // 获取玩家俱乐部排名
    playerClubStanding: (state) => {
      return (clubId: string) => {
        if (!state.currentTournament) return null;
        return state.currentTournament.participants.find(p => p.clubId === clubId);
      };
    },

    // 获取下一场比赛
    nextMatch: (state) => {
      if (!state.currentTournament) return null;
      return state.currentTournament.schedule.find(m => m.result === 'pending');
    },

    // 获取已完成比赛
    completedMatches: (state) => {
      if (!state.currentTournament) return [];
      return state.currentTournament.schedule.filter(m => m.result !== 'pending');
    },
  },

  actions: {
    // 创建新赛事
    createTournament(
      name: string,
      type: TournamentType,
      clubIds: string[]
    ): Tournament {
      const tournament = new Tournament(
        name,
        type,
        this.currentSeason,
        this.currentYear,
        clubIds
      );
      this.tournaments.push(tournament);
      this.currentTournament = tournament;
      return tournament;
    },

    // 开始赛事
    startTournament(): void {
      if (this.currentTournament) {
        this.currentTournament.start();
      }
    },

    // 结束赛事
    finishTournament(): void {
      if (this.currentTournament) {
        this.currentTournament.finish();
      }
    },

    // 生成赛程
    generateSchedule(): void {
      if (!this.currentTournament) return;

      const clubs = this.currentTournament.participants.map(p => p.clubId);
      const matches: Match[] = [];

      // 单循环赛制
      for (let i = 0; i < clubs.length; i++) {
        for (let j = i + 1; j < clubs.length; j++) {
          // 同一组的队伍才比赛
          const team1 = this.currentTournament.participants[i];
          const team2 = this.currentTournament.participants[j];

          if (team1 && team2 && team1.group === team2.group) {
            const match = new Match(
              this.currentTournament.id,
              matches.length + 1,
              clubs[i]!,
              clubs[j]!
            );
            matches.push(match);
          }
        }
      }

      this.currentTournament.schedule = matches;
      this.currentTournament.totalRounds = Math.ceil(matches.length / 9); // 每周 9 场比赛
    },

    // 添加比赛结果
    addMatchResult(matchId: string, winner: 'home' | 'away'): void {
      if (!this.currentTournament) return;

      const match = this.currentTournament.schedule.find(m => m.id === matchId);
      if (!match) return;

      // 设置比赛结果
      match.result = winner === 'home' ? 'win' : 'loss';
      match.homeTeam.score = winner === 'home' ? 3 : 1;
      match.awayTeam.score = winner === 'away' ? 3 : 1;

      // 更新积分榜
      this.currentTournament.addMatchResult(match);
    },

    // 进行下一场比赛
    playNextMatch(): Match | null {
      const nextMatch = this.nextMatch;
      if (!nextMatch) return null;

      // 模拟比赛结果
      const winner = Math.random() > 0.5 ? 'home' : 'away';
      this.addMatchResult(nextMatch.id, winner);

      return nextMatch;
    },

    // 进入下一轮
    advanceRound(): void {
      if (this.currentTournament) {
        this.currentTournament.currentRound++;
      }
    },

    // 执行升降级
    promoteAndRelegate(): { promoted: string[]; relegated: string[] } {
      if (!this.currentTournament) {
        return { promoted: [], relegated: [] };
      }
      return this.currentTournament.promoteAndRelegate();
    },

    // 新赛季
    newSeason(): void {
      this.currentSeason++;
      if (this.currentSeason % 2 === 1) {
        this.currentYear++;
      }
    },

    // 获取赛事奖励
    getTournamentRewards(_clubId: string, rank: number) {
      if (!this.currentTournament) return null;

      const { rewards } = this.currentTournament;
      if (rank === 1) return rewards.champion;
      if (rank === 2) return rewards.runnerUp;
      if (rank <= 4) return rewards.semifinal;
      return rewards.participant;
    },
  },

  persist: true,
});
