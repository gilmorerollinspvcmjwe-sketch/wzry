import type {
  ClubStatistics,
  PlayerStatistics,
  HeroStatistics,
  LeagueStatistics,
  MatchStatistics,
  LeaderboardType,
  LeaderboardEntry,
  StatisticsFilter,
  PlayerMatchStats,
} from '@/types/statistics';
import type { Match } from '@/core/models/Match';
import type { Player } from '@/core/models/Player';
import type { Club } from '@/core/models/Club';

export class LeagueStatisticsService {
  private matchHistory: MatchStatistics[] = [];
  private leagueStatistics: LeagueStatistics | null = null;

  initialize(year: number, phase: 'spring' | 'summer'): void {
    this.leagueStatistics = {
      season: phase === 'spring' ? 1 : 2,
      year,
      phase,
      status: 'regular',
      clubStats: [],
      playerStats: [],
      heroStats: [],
      totalMatches: 0,
      totalKills: 0,
      averageGameDuration: 0,
      mostPickedHero: '',
      mostBannedHero: '',
      highestWinRateClub: '',
    };
    this.matchHistory = [];
  }

  recordMatch(match: Match, playerStats: PlayerMatchStats[]): void {
    const matchStats = this.generateMatchStatistics(match, playerStats);
    this.matchHistory.push(matchStats);
    this.updateStatistics(matchStats);
  }

  private generateMatchStatistics(match: Match, playerStats: PlayerMatchStats[]): MatchStatistics {
    const homeTeamStats = this.calculateTeamStats(playerStats.filter(p => p.clubId === match.homeTeamId));
    const awayTeamStats = this.calculateTeamStats(playerStats.filter(p => p.clubId === match.awayTeamId));

    return {
      matchId: match.id,
      homeClubId: match.homeTeamId,
      awayClubId: match.awayTeamId,
      winnerId: match.winnerId,
      duration: match.duration || 1200,
      homeTeam: homeTeamStats,
      awayTeam: awayTeamStats,
      playerStats,
    };
  }

  private calculateTeamStats(players: PlayerMatchStats[]) {
    return {
      clubId: players[0]?.clubId || '',
      kills: players.reduce((sum, p) => sum + p.kills, 0),
      deaths: players.reduce((sum, p) => sum + p.deaths, 0),
      assists: players.reduce((sum, p) => sum + p.assists, 0),
      gold: players.reduce((sum, p) => sum + p.gold, 0),
      damage: players.reduce((sum, p) => sum + p.damage, 0),
      towers: Math.floor(Math.random() * 8) + 1,
      dragons: Math.floor(Math.random() * 5),
      barons: Math.floor(Math.random() * 3),
      firstBlood: Math.random() > 0.5,
      firstTower: Math.random() > 0.5,
      firstDragon: Math.random() > 0.5,
    };
  }

  private updateStatistics(matchStats: MatchStatistics): void {
    if (!this.leagueStatistics) return;

    this.leagueStatistics.totalMatches++;
    this.leagueStatistics.totalKills += matchStats.homeTeam.kills + matchStats.awayTeam.kills;

    this.updateClubStatistics(matchStats);
    this.updatePlayerStatistics(matchStats);
    this.updateHeroStatistics(matchStats);
    this.updateAggregateStats();
  }

  private updateClubStatistics(matchStats: MatchStatistics): void {
    if (!this.leagueStatistics) return;

    const updateClub = (clubId: string, teamStats: typeof matchStats.homeTeam, won: boolean) => {
      let clubStat = this.leagueStatistics!.clubStats.find(c => c.clubId === clubId);
      
      if (!clubStat) {
        clubStat = {
          clubId,
          clubName: '',
          matches: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
          averageGameDuration: 0,
          goldPerMinute: 0,
          damagePerMinute: 0,
          towers: 0,
          dragons: 0,
          barons: 0,
        };
        this.leagueStatistics!.clubStats.push(clubStat);
      }

      clubStat.matches++;
      if (won) clubStat.wins++;
      else clubStat.losses++;
      clubStat.winRate = (clubStat.wins / clubStat.matches) * 100;
      clubStat.totalKills += teamStats.kills;
      clubStat.totalDeaths += teamStats.deaths;
      clubStat.totalAssists += teamStats.assists;
      clubStat.towers += teamStats.towers;
      clubStat.dragons += teamStats.dragons;
      clubStat.barons += teamStats.barons;
    };

    updateClub(matchStats.homeClubId, matchStats.homeTeam, matchStats.winnerId === matchStats.homeClubId);
    updateClub(matchStats.awayClubId, matchStats.awayTeam, matchStats.winnerId === matchStats.awayClubId);
  }

  private updatePlayerStatistics(matchStats: MatchStatistics): void {
    if (!this.leagueStatistics) return;

    matchStats.playerStats.forEach(playerStat => {
      let playerStatsEntry = this.leagueStatistics!.playerStats.find(p => p.playerId === playerStat.playerId);
      
      if (!playerStatsEntry) {
        playerStatsEntry = {
          playerId: playerStat.playerId,
          playerName: playerStat.playerName,
          clubId: playerStat.clubId,
          clubName: '',
          position: playerStat.position,
          matches: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          kda: 0,
          goldPerMinute: 0,
          damagePerMinute: 0,
          damageTakenPerMinute: 0,
          visionScore: 0,
          csPerMinute: 0,
          mvpCount: 0,
          goldMedals: 0,
          silverMedals: 0,
          averageScore: 0,
        };
        this.leagueStatistics!.playerStats.push(playerStatsEntry);
      }

      const won = matchStats.winnerId === playerStat.clubId;
      playerStatsEntry.matches++;
      if (won) playerStatsEntry.wins++;
      else playerStatsEntry.losses++;
      playerStatsEntry.winRate = (playerStatsEntry.wins / playerStatsEntry.matches) * 100;
      playerStatsEntry.kills += playerStat.kills;
      playerStatsEntry.deaths += playerStat.deaths;
      playerStatsEntry.assists += playerStat.assists;
      playerStatsEntry.kda = playerStatsEntry.deaths > 0 
        ? (playerStatsEntry.kills + playerStatsEntry.assists) / playerStatsEntry.deaths 
        : playerStatsEntry.kills + playerStatsEntry.assists;
      playerStatsEntry.goldPerMinute = 
        (playerStatsEntry.goldPerMinute * (playerStatsEntry.matches - 1) + playerStat.goldPerMinute) / playerStatsEntry.matches;
      playerStatsEntry.damagePerMinute = 
        (playerStatsEntry.damagePerMinute * (playerStatsEntry.matches - 1) + playerStat.damagePerMinute) / playerStatsEntry.matches;
      playerStatsEntry.visionScore += playerStat.visionScore;
      playerStatsEntry.csPerMinute = 
        (playerStatsEntry.csPerMinute * (playerStatsEntry.matches - 1) + playerStat.csPerMinute) / playerStatsEntry.matches;
      
      if (playerStat.isMVP) playerStatsEntry.mvpCount++;
      if (playerStat.medals.includes('gold')) playerStatsEntry.goldMedals++;
      if (playerStat.medals.includes('silver')) playerStatsEntry.silverMedals++;
      playerStatsEntry.averageScore = 
        (playerStatsEntry.averageScore * (playerStatsEntry.matches - 1) + playerStat.score) / playerStatsEntry.matches;
    });
  }

  private updateHeroStatistics(matchStats: MatchStatistics): void {
    if (!this.leagueStatistics) return;

    matchStats.playerStats.forEach(playerStat => {
      let heroStat = this.leagueStatistics!.heroStats.find(h => h.heroId === playerStat.heroId);
      
      if (!heroStat) {
        heroStat = {
          heroId: playerStat.heroId,
          heroName: playerStat.heroName,
          role: '',
          picks: 0,
          bans: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          pickRate: 0,
          banRate: 0,
          averageKDA: 0,
          averageKills: 0,
          averageDeaths: 0,
          averageAssists: 0,
          averageGold: 0,
          averageDamage: 0,
        };
        this.leagueStatistics!.heroStats.push(heroStat);
      }

      const won = matchStats.winnerId === playerStat.clubId;
      heroStat.picks++;
      if (won) heroStat.wins++;
      else heroStat.losses++;
      heroStat.winRate = (heroStat.wins / heroStat.picks) * 100;
      heroStat.pickRate = (heroStat.picks / this.leagueStatistics!.totalMatches) * 100;
      heroStat.averageKills = (heroStat.averageKills * (heroStat.picks - 1) + playerStat.kills) / heroStat.picks;
      heroStat.averageDeaths = (heroStat.averageDeaths * (heroStat.picks - 1) + playerStat.deaths) / heroStat.picks;
      heroStat.averageAssists = (heroStat.averageAssists * (heroStat.picks - 1) + playerStat.assists) / heroStat.picks;
      heroStat.averageKDA = heroStat.averageDeaths > 0 
        ? (heroStat.averageKills + heroStat.averageAssists) / heroStat.averageDeaths 
        : heroStat.averageKills + heroStat.averageAssists;
      heroStat.averageGold = (heroStat.averageGold * (heroStat.picks - 1) + playerStat.gold) / heroStat.picks;
      heroStat.averageDamage = (heroStat.averageDamage * (heroStat.picks - 1) + playerStat.damage) / heroStat.picks;
    });
  }

  private updateAggregateStats(): void {
    if (!this.leagueStatistics || this.matchHistory.length === 0) return;

    const totalDuration = this.matchHistory.reduce((sum, m) => sum + m.duration, 0);
    this.leagueStatistics.averageGameDuration = totalDuration / this.matchHistory.length;

    if (this.leagueStatistics.heroStats.length > 0) {
      const sortedByPicks = [...this.leagueStatistics.heroStats].sort((a, b) => b.picks - a.picks);
      this.leagueStatistics.mostPickedHero = sortedByPicks[0]?.heroName || '';
      
      const sortedByBans = [...this.leagueStatistics.heroStats].sort((a, b) => b.bans - a.bans);
      this.leagueStatistics.mostBannedHero = sortedByBans[0]?.heroName || '';
    }

    if (this.leagueStatistics.clubStats.length > 0) {
      const sortedByWinRate = [...this.leagueStatistics.clubStats]
        .filter(c => c.matches >= 5)
        .sort((a, b) => b.winRate - a.winRate);
      this.leagueStatistics.highestWinRateClub = sortedByWinRate[0]?.clubName || '';
    }
  }

  getLeaderboard(type: LeaderboardType, limit: number = 10): LeaderboardEntry[] {
    if (!this.leagueStatistics) return [];

    const sorted = [...this.leagueStatistics.playerStats];
    
    switch (type) {
      case 'kills':
        sorted.sort((a, b) => b.kills - a.kills);
        break;
      case 'assists':
        sorted.sort((a, b) => b.assists - a.assists);
        break;
      case 'kda':
        sorted.sort((a, b) => b.kda - a.kda);
        break;
      case 'gold_per_min':
        sorted.sort((a, b) => b.goldPerMinute - a.goldPerMinute);
        break;
      case 'damage_per_min':
        sorted.sort((a, b) => b.damagePerMinute - a.damagePerMinute);
        break;
      case 'vision_score':
        sorted.sort((a, b) => b.visionScore - a.visionScore);
        break;
      case 'cs_per_min':
        sorted.sort((a, b) => b.csPerMinute - a.csPerMinute);
        break;
      case 'mvp_count':
        sorted.sort((a, b) => b.mvpCount - a.mvpCount);
        break;
      case 'win_rate':
        sorted.sort((a, b) => b.winRate - a.winRate);
        break;
    }

    return sorted.slice(0, limit).map((player, index) => ({
      rank: index + 1,
      playerId: player.playerId,
      playerName: player.playerName,
      clubId: player.clubId,
      clubName: player.clubName,
      position: player.position,
      value: this.getLeaderboardValue(player, type),
      secondaryValue: player.matches,
    }));
  }

  private getLeaderboardValue(player: PlayerStatistics, type: LeaderboardType): number {
    switch (type) {
      case 'kills': return player.kills;
      case 'assists': return player.assists;
      case 'kda': return player.kda;
      case 'gold_per_min': return player.goldPerMinute;
      case 'damage_per_min': return player.damagePerMinute;
      case 'vision_score': return player.visionScore;
      case 'cs_per_min': return player.csPerMinute;
      case 'mvp_count': return player.mvpCount;
      case 'win_rate': return player.winRate;
      default: return 0;
    }
  }

  getStatistics(): LeagueStatistics | null {
    return this.leagueStatistics;
  }

  getMatchHistory(): MatchStatistics[] {
    return [...this.matchHistory];
  }

  getClubStatistics(clubId: string): ClubStatistics | undefined {
    return this.leagueStatistics?.clubStats.find(c => c.clubId === clubId);
  }

  getPlayerStatistics(playerId: string): PlayerStatistics | undefined {
    return this.leagueStatistics?.playerStats.find(p => p.playerId === playerId);
  }

  getHeroStatistics(heroId: string): HeroStatistics | undefined {
    return this.leagueStatistics?.heroStats.find(h => h.heroId === heroId);
  }

  filterStatistics(filter: StatisticsFilter): ClubStatistics[] | PlayerStatistics[] | HeroStatistics[] {
    if (!this.leagueStatistics) return [];

    let data: any[];
    
    switch (filter.type) {
      case 'club':
        data = [...this.leagueStatistics.clubStats];
        if (filter.sortBy) {
          data.sort((a, b) => {
            const aVal = a[filter.sortBy!] || 0;
            const bVal = b[filter.sortBy!] || 0;
            return filter.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
          });
        }
        break;
      case 'player':
        data = [...this.leagueStatistics.playerStats];
        if (filter.clubId) {
          data = data.filter(p => p.clubId === filter.clubId);
        }
        if (filter.position) {
          data = data.filter(p => p.position === filter.position);
        }
        if (filter.sortBy) {
          data.sort((a, b) => {
            const aVal = a[filter.sortBy!] || 0;
            const bVal = b[filter.sortBy!] || 0;
            return filter.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
          });
        }
        break;
      case 'hero':
        data = [...this.leagueStatistics.heroStats];
        if (filter.sortBy) {
          data.sort((a, b) => {
            const aVal = a[filter.sortBy!] || 0;
            const bVal = b[filter.sortBy!] || 0;
            return filter.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
          });
        }
        break;
      default:
        data = [];
    }

    if (filter.limit && filter.limit > 0) {
      data = data.slice(0, filter.limit);
    }

    return data;
  }

  reset(): void {
    this.matchHistory = [];
    this.leagueStatistics = null;
  }
}

export const leagueStatisticsService = new LeagueStatisticsService();
