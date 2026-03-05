// 联赛系统服务

import type { LeagueSeason, LeagueTeam, LeagueMatch, TeamStanding, PlayoffBracket, PlayoffMatch } from '@/types/league';
import type { Club } from '@/core/models/Club';

export class LeagueService {
  // 创建新赛季
  static createSeason(year: number, season: 'spring' | 'summer', clubs: Club[]): LeagueSeason {
    const teams: LeagueTeam[] = clubs.map(club => ({
      clubId: club.id,
      clubName: club.name,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      kills: 0,
      deaths: 0,
      towers: 0,
      goldEarned: 0,
    }));

    const schedule = this.generateSchedule(teams);
    const totalRounds = Math.max(...schedule.map(m => m.round));

    return {
      id: `${year}-${season}`,
      year,
      season,
      phase: 'preparing',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 7 * 24 * 60 * 60 * 1000), // 14周
      currentRound: 0,
      totalRounds,
      teams,
      schedule,
      standings: this.calculateStandings(teams),
    };
  }

  // 生成赛程（单循环）
  private static generateSchedule(teams: LeagueTeam[]): LeagueMatch[] {
    const schedule: LeagueMatch[] = [];
    const n = teams.length;
    
    // 复制数组避免修改原数组
    const rotatingTeams = [...teams];
    
    // 使用轮转算法生成单循环赛程
    for (let round = 1; round < n; round++) {
      for (let i = 0; i < Math.floor(n / 2); i++) {
        const home = rotatingTeams[i];
        const away = rotatingTeams[n - 1 - i];
        
        if (home && away) {
          schedule.push({
            id: `match-${round}-${i}`,
            round,
            homeTeamId: home.clubId,
            awayTeamId: away.clubId,
            homeTeamName: home.clubName,
            awayTeamName: away.clubName,
            scheduledDate: new Date(Date.now() + round * 7 * 24 * 60 * 60 * 1000),
            isFinished: false,
          });
        }
      }
      
      // 轮转：固定第一个，其他旋转
      if (rotatingTeams.length > 1) {
        const last = rotatingTeams.pop();
        if (last) {
          rotatingTeams.splice(1, 0, last);
        }
      }
    }
    
    return schedule;
  }

  // 计算积分榜
  static calculateStandings(teams: LeagueTeam[]): TeamStanding[] {
    const standings = teams.map(team => ({
      rank: 0,
      clubId: team.clubId,
      clubName: team.clubName,
      played: team.played,
      won: team.won,
      lost: team.lost,
      points: team.points,
      killDeathRatio: team.deaths > 0 ? team.kills / team.deaths : team.kills,
      avgGameDuration: 0,
    }));

    // 排序：积分 -> 胜场 -> KDA
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      return b.killDeathRatio - a.killDeathRatio;
    });

    // 设置排名
    standings.forEach((s, i) => s.rank = i + 1);

    return standings;
  }

  // 更新比赛结果
  static updateMatchResult(
    season: LeagueSeason,
    matchId: string,
    homeScore: number,
    awayScore: number,
    winnerId: string
  ): void {
    const match = season.schedule.find(m => m.id === matchId);
    if (!match) return;

    match.isFinished = true;
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.winnerId = winnerId;

    // 更新队伍数据
    const homeTeam = season.teams.find(t => t.clubId === match.homeTeamId);
    const awayTeam = season.teams.find(t => t.clubId === match.awayTeamId);

    if (homeTeam && awayTeam) {
      homeTeam.played++;
      awayTeam.played++;

      if (winnerId === homeTeam.clubId) {
        homeTeam.won++;
        homeTeam.points += 3;
        awayTeam.lost++;
      } else {
        awayTeam.won++;
        awayTeam.points += 3;
        homeTeam.lost++;
      }
    }

    // 重新计算积分榜
    season.standings = this.calculateStandings(season.teams);
  }

  // 生成季后赛
  static generatePlayoffs(season: LeagueSeason): PlayoffBracket {
    const top4 = season.standings.slice(0, 4);
    
    if (top4.length < 4) {
      throw new Error('需要至少4支队伍才能生成季后赛');
    }
    
    const semifinals: PlayoffMatch[] = [
      {
        id: 'semi-1',
        round: 'semifinal',
        homeTeamId: top4[0]!.clubId,
        awayTeamId: top4[3]!.clubId,
        homeWins: 0,
        awayWins: 0,
        isFinished: false,
        games: [],
      },
      {
        id: 'semi-2',
        round: 'semifinal',
        homeTeamId: top4[1]!.clubId,
        awayTeamId: top4[2]!.clubId,
        homeWins: 0,
        awayWins: 0,
        isFinished: false,
        games: [],
      },
    ];

    const finals: PlayoffMatch = {
      id: 'final',
      round: 'final',
      homeTeamId: '',
      awayTeamId: '',
      homeWins: 0,
      awayWins: 0,
      isFinished: false,
      games: [],
    };

    return {
      semifinals,
      finals,
    };
  }

  // 进入下一阶段
  static advancePhase(season: LeagueSeason): void {
    switch (season.phase) {
      case 'preparing':
        season.phase = 'regular';
        season.currentRound = 1;
        break;
      case 'regular':
        if (season.currentRound >= season.totalRounds) {
          season.phase = 'playoff';
          season.playoffBracket = this.generatePlayoffs(season);
        } else {
          season.currentRound++;
        }
        break;
      case 'playoff':
        season.phase = 'offseason';
        break;
      case 'offseason':
        // 赛季结束，可以创建新赛季
        break;
    }
  }

  // 获取当前轮次的比赛
  static getCurrentRoundMatches(season: LeagueSeason): LeagueMatch[] {
    return season.schedule.filter(m => m.round === season.currentRound);
  }

  // 获取俱乐部的比赛记录
  static getClubMatches(season: LeagueSeason, clubId: string): LeagueMatch[] {
    return season.schedule.filter(
      m => m.homeTeamId === clubId || m.awayTeamId === clubId
    );
  }

  // 获取联赛奖励
  static getLeagueRewards(finalRank: number): number {
    const rewards: Record<number, number> = {
      1: 500,  // 冠军
      2: 300,  // 亚军
      3: 200,  // 季军
      4: 150,  // 殿军
    };
    return rewards[finalRank] || 50;  // 其他获得参与奖
  }
}
