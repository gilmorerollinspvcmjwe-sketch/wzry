// 联赛生态服务

import type { 
  LeagueEcosystem, 
  SeasonInfo, 
  League, 
  Cup, 
  InternationalEvent,
  DevelopmentalLeague,
  LeagueSchedule,
  ScheduleRound,
  LeagueMatchInfo,
  CupBracket,
  CupRound,
  CupMatch,
  CupParticipant,
  PrizePool,
  ClubQualification,
  QualificationInfo
} from '@/types/leagueEcosystem';
import type { TeamStanding } from '@/types/league';
import type { Club } from '@/core/models/Club';

export class LeagueEcosystemService {
  static initializeSeason(year: number, season: 'spring' | 'summer', clubs: Club[]): LeagueEcosystem {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 16 * 7 * 24 * 60 * 60 * 1000);

    const seasonInfo: SeasonInfo = {
      year,
      season,
      startDate,
      endDate,
      phase: 'preparing',
    };

    const professionalLeague = this.createLeague(
      'pro-league-1',
      '王者荣耀职业联赛',
      'professional',
      1,
      clubs,
      startDate
    );

    const nationalCup = this.createCup(
      'national-cup',
      '全国冠军杯',
      'national',
      clubs,
      startDate
    );

    const worldsEvent = this.createInternationalEvent(
      'worlds',
      '世界冠军杯',
      'worlds',
      startDate
    );

    const developmentalLeague = this.createDevelopmentalLeague(
      'dev-league-1',
      '发展联盟',
      'pro-league-1',
      clubs
    );

    return {
      currentSeason: seasonInfo,
      leagues: [professionalLeague],
      cups: [nationalCup],
      internationalEvents: [worldsEvent],
      developmentalLeagues: [developmentalLeague],
    };
  }

  static createLeague(
    id: string,
    name: string,
    type: 'professional' | 'developmental' | 'amateur',
    tier: number,
    clubs: Club[],
    startDate: Date
  ): League {
    const schedule = this.generateLeagueSchedule(clubs, startDate);
    const standings = this.initializeStandings(clubs);

    return {
      id,
      name,
      type,
      tier,
      schedule,
      standings,
      prizes: this.createDefaultPrizePool(1000),
      relegationZone: 2,
      promotionZone: 2,
      status: 'upcoming',
    };
  }

  static generateLeagueSchedule(clubs: Club[], startDate: Date): LeagueSchedule {
    const rounds: ScheduleRound[] = [];
    const n = clubs.length;
    const totalRounds = n - 1;
    const rotatingClubs = [...clubs];

    for (let round = 1; round <= totalRounds; round++) {
      const matches: LeagueMatchInfo[] = [];
      const roundStartDate = new Date(startDate.getTime() + (round - 1) * 7 * 24 * 60 * 60 * 1000);
      const roundEndDate = new Date(roundStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);

      for (let i = 0; i < Math.floor(n / 2); i++) {
        const home = rotatingClubs[i];
        const away = rotatingClubs[n - 1 - i];

        if (home && away) {
          matches.push({
            id: `match-${round}-${i}`,
            homeTeamId: home.id,
            homeTeamName: home.name,
            awayTeamId: away.id,
            awayTeamName: away.name,
            scheduledDate: roundStartDate,
            isFinished: false,
          });
        }
      }

      rounds.push({
        round,
        matches,
        startDate: roundStartDate,
        endDate: roundEndDate,
      });

      if (rotatingClubs.length > 1) {
        const last = rotatingClubs.pop();
        if (last) {
          rotatingClubs.splice(1, 0, last);
        }
      }
    }

    return {
      rounds,
      currentRound: 1,
      totalRounds,
    };
  }

  static initializeStandings(clubs: Club[]): TeamStanding[] {
    return clubs.map((club, index) => ({
      rank: index + 1,
      clubId: club.id,
      clubName: club.name,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      killDeathRatio: 0,
      avgGameDuration: 0,
    }));
  }

  static updateStandings(league: League, match: LeagueMatchInfo, homeScore: number, awayScore: number): void {
    const homeStanding = league.standings.find(s => s.clubId === match.homeTeamId);
    const awayStanding = league.standings.find(s => s.clubId === match.awayTeamId);

    if (!homeStanding || !awayStanding) return;

    homeStanding.played++;
    awayStanding.played++;

    if (homeScore > awayScore) {
      homeStanding.won++;
      homeStanding.points += 3;
      awayStanding.lost++;
    } else {
      awayStanding.won++;
      awayStanding.points += 3;
      homeStanding.lost++;
    }

    league.standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      return b.killDeathRatio - a.killDeathRatio;
    });

    league.standings.forEach((s, i) => s.rank = i + 1);
  }

  static createCup(
    id: string,
    name: string,
    type: 'national' | 'regional' | 'invitational',
    clubs: Club[],
    startDate: Date
  ): Cup {
    const participants: CupParticipant[] = clubs.map((club, index) => ({
      clubId: club.id,
      clubName: club.name,
      seed: index + 1,
      eliminated: false,
    }));

    const bracket = this.generateCupBracket(participants, startDate);

    return {
      id,
      name,
      type,
      format: {
        type: 'single_elimination',
        rounds: Math.ceil(Math.log2(clubs.length)),
        matchFormat: 'bo3',
        thirdPlaceMatch: true,
      },
      participants,
      bracket,
      prizes: this.createDefaultPrizePool(500),
      status: 'upcoming',
      startDate,
      endDate: new Date(startDate.getTime() + 4 * 7 * 24 * 60 * 60 * 1000),
    };
  }

  static generateCupBracket(participants: CupParticipant[], startDate: Date): CupBracket {
    const rounds: CupRound[] = [];
    const totalParticipants = participants.length;
    const roundsCount = Math.ceil(Math.log2(totalParticipants));
    const bracketSize = Math.pow(2, roundsCount);

    for (let round = 1; round <= roundsCount; round++) {
      const matchesInRound = bracketSize / Math.pow(2, round);
      const matches: CupMatch[] = [];
      const roundNames = ['决赛', '半决赛', '四分之一决赛', '十六强', '三十二强'];
      const roundName = roundNames[roundsCount - round] || `第${round}轮`;

      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          id: `cup-${round}-${i}`,
          round,
          isFinished: false,
          games: [],
        });
      }

      rounds.push({
        round,
        name: roundName,
        matches,
      });
    }

    this.seedBracket(rounds, participants);

    return {
      rounds,
      currentRound: 1,
    };
  }

  static seedBracket(rounds: CupRound[], participants: CupParticipant[]): void {
    if (rounds.length === 0 || rounds[rounds.length - 1]!.matches.length === 0) return;

    const firstRound = rounds[rounds.length - 1]!;
    const matches = firstRound.matches;
    const seedPattern = this.generateSeedPattern(participants.length);

    for (let i = 0; i < matches.length; i++) {
      const seed1 = seedPattern[i * 2];
      const seed2 = seedPattern[i * 2 + 1];

      if (seed1 !== undefined && seed1 <= participants.length) {
        const p1 = participants.find(p => p.seed === seed1);
        if (p1) {
          matches[i]!.homeTeamId = p1.clubId;
          matches[i]!.homeTeamName = p1.clubName;
        }
      }

      if (seed2 !== undefined && seed2 <= participants.length) {
        const p2 = participants.find(p => p.seed === seed2);
        if (p2) {
          matches[i]!.awayTeamId = p2.clubId;
          matches[i]!.awayTeamName = p2.clubName;
        }
      }
    }
  }

  static generateSeedPattern(size: number): number[] {
    if (size <= 1) return [1];
    
    const pattern: number[] = [1, 2];
    
    while (pattern.length < size) {
      const newPattern: number[] = [];
      const gap = pattern.length + 1;
      
      for (const seed of pattern) {
        newPattern.push(seed);
        newPattern.push(gap * 2 - seed + 1);
      }
      
      if (newPattern.length >= size) {
        return newPattern.slice(0, size);
      }
      
      pattern.length = 0;
      pattern.push(...newPattern);
    }
    
    return pattern;
  }

  static createInternationalEvent(
    id: string,
    name: string,
    type: 'worlds' | 'continental' | 'friendly',
    startDate: Date
  ): InternationalEvent {
    return {
      id,
      name,
      type,
      qualification: [
        { region: '中国', slots: 4, type: 'direct' },
        { region: '韩国', slots: 3, type: 'direct' },
        { region: '东南亚', slots: 2, type: 'regional_qualifier' },
        { region: '外卡', slots: 1, type: 'wildcard' },
      ],
      schedule: {
        groupStage: {
          groups: [],
          currentRound: 0,
        },
        knockoutStage: {
          rounds: [],
          currentRound: 0,
        },
      },
      prizes: this.createDefaultPrizePool(2000),
      status: 'upcoming',
      startDate,
      endDate: new Date(startDate.getTime() + 3 * 7 * 24 * 60 * 60 * 1000),
      hostRegion: '中国',
    };
  }

  static createDevelopmentalLeague(
    id: string,
    name: string,
    parentLeagueId: string,
    clubs: Club[]
  ): DevelopmentalLeague {
    return {
      id,
      name,
      parentLeagueId,
      teams: clubs.map(club => ({
        clubId: `${club.id}-dev`,
        clubName: `${club.name}二队`,
        parentClubId: club.id,
        played: 0,
        won: 0,
        lost: 0,
        points: 0,
      })),
      schedule: {
        rounds: [],
        currentRound: 0,
        totalRounds: 0,
      },
      standings: [],
      status: 'upcoming',
    };
  }

  static createDefaultPrizePool(totalAmount: number): PrizePool {
    return {
      currency: '万',
      distribution: [
        { rank: 1, amount: Math.floor(totalAmount * 0.4), description: '冠军' },
        { rank: 2, amount: Math.floor(totalAmount * 0.25), description: '亚军' },
        { rank: 3, amount: Math.floor(totalAmount * 0.15), description: '季军' },
        { rank: 4, amount: Math.floor(totalAmount * 0.1), description: '殿军' },
        { rank: 'participant', amount: Math.floor(totalAmount * 0.1), description: '参与奖' },
      ],
      totalAmount,
    };
  }

  static getQualification(ecosystem: LeagueEcosystem, clubId: string): ClubQualification {
    const qualifications: QualificationInfo[] = [];

    ecosystem.leagues.forEach(league => {
      const standing = league.standings.find(s => s.clubId === clubId);
      if (standing) {
        qualifications.push({
          eventId: league.id,
          eventName: league.name,
          eventType: 'league',
          status: standing.rank <= league.promotionZone ? 'qualified' : 'pending',
        });
      }
    });

    ecosystem.cups.forEach(cup => {
      const participant = cup.participants.find(p => p.clubId === clubId);
      if (participant) {
        qualifications.push({
          eventId: cup.id,
          eventName: cup.name,
          eventType: 'cup',
          status: participant.eliminated ? 'eliminated' : 'pending',
        });
      }
    });

    ecosystem.internationalEvents.forEach(event => {
      qualifications.push({
        eventId: event.id,
        eventName: event.name,
        eventType: 'international',
        status: 'pending',
      });
    });

    return {
      clubId,
      clubName: '',
      qualifications,
    };
  }

  static advanceLeagueRound(league: League): void {
    if (league.schedule.currentRound < league.schedule.totalRounds) {
      league.schedule.currentRound++;
    } else {
      league.status = 'completed';
    }
  }

  static advanceCupRound(cup: Cup): void {
    const currentRound = cup.bracket.rounds.find(r => r.round === cup.bracket.currentRound);
    if (!currentRound) return;

    const allMatchesFinished = currentRound.matches.every(m => m.isFinished);
    if (!allMatchesFinished) return;

    if (cup.bracket.currentRound < cup.bracket.rounds.length) {
      const nextRound = cup.bracket.rounds.find(r => r.round === cup.bracket.currentRound + 1);
      if (nextRound) {
        currentRound.matches.forEach((match, index) => {
          if (match.winnerId && nextRound.matches[Math.floor(index / 2)]) {
            const nextMatch = nextRound.matches[Math.floor(index / 2)]!;
            if (index % 2 === 0) {
              nextMatch.homeTeamId = match.winnerId;
              nextMatch.homeTeamName = match.homeTeamName;
            } else {
              nextMatch.awayTeamId = match.winnerId;
              nextMatch.awayTeamName = match.awayTeamName;
            }
          }
        });
      }
      cup.bracket.currentRound++;
    } else {
      cup.status = 'completed';
    }
  }

  static getUpcomingEvents(ecosystem: LeagueEcosystem, days: number = 7): Array<{ type: string; event: League | Cup | InternationalEvent; date: Date }> {
    const events: Array<{ type: string; event: League | Cup | InternationalEvent; date: Date }> = [];
    const now = new Date();
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    ecosystem.leagues.forEach(league => {
      if (league.status === 'ongoing') {
        const currentRound = league.schedule.rounds.find(r => r.round === league.schedule.currentRound);
        if (currentRound && currentRound.startDate <= endDate) {
          events.push({ type: 'league', event: league, date: currentRound.startDate });
        }
      }
    });

    ecosystem.cups.forEach(cup => {
      if (cup.status === 'ongoing') {
        const currentRound = cup.bracket.rounds.find(r => r.round === cup.bracket.currentRound);
        if (currentRound && cup.startDate <= endDate) {
          events.push({ type: 'cup', event: cup, date: cup.startDate });
        }
      }
    });

    ecosystem.internationalEvents.forEach(event => {
      if (event.status === 'upcoming' && event.startDate <= endDate) {
        events.push({ type: 'international', event, date: event.startDate });
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
