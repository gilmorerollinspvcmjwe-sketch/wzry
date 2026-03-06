import type {
  HistoricalChampion,
  SeasonHonors,
  Record,
  RecordType,
  ClubHistory,
  PlayerHistory,
  HistoricalData,
} from '@/types/history';
import type { Club } from '@/core/models/Club';
import type { Player } from '@/core/models/Player';

export class HistoricalDataService {
  private historicalData: HistoricalData = {
    champions: [],
    honors: [],
    records: [],
    clubHistories: new Map(),
    playerHistories: new Map(),
  };

  initialize(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.historicalData.champions = this.generateInitialChampions();
    this.historicalData.honors = this.generateInitialHonors();
    this.historicalData.records = this.generateInitialRecords();
  }

  private generateInitialChampions(): HistoricalChampion[] {
    const champions: HistoricalChampion[] = [
      {
        season: 1,
        year: 2023,
        phase: 'spring',
        championId: 'club_001',
        championName: 'AG超玩会',
        runnerUpId: 'club_002',
        runnerUpName: 'eStarPro',
        finalsMVPId: 'player_001',
        finalsMVPName: '一诺',
        matchScore: '4:2',
        date: new Date('2023-05-13'),
      },
      {
        season: 2,
        year: 2023,
        phase: 'summer',
        championId: 'club_002',
        championName: 'eStarPro',
        runnerUpId: 'club_003',
        runnerUpName: 'TTG',
        finalsMVPId: 'player_002',
        finalsMVPName: '花海',
        matchScore: '4:1',
        date: new Date('2023-09-16'),
      },
      {
        season: 3,
        year: 2024,
        phase: 'spring',
        championId: 'club_003',
        championName: 'TTG',
        runnerUpId: 'club_001',
        runnerUpName: 'AG超玩会',
        finalsMVPId: 'player_003',
        finalsMVPName: '清融',
        matchScore: '4:3',
        date: new Date('2024-05-18'),
      },
    ];
    return champions;
  }

  private generateInitialHonors(): SeasonHonors[] {
    const honors: SeasonHonors[] = [
      {
        season: 1,
        year: 2023,
        phase: 'spring',
        regularSeasonMVP: {
          playerId: 'player_001',
          playerName: '一诺',
          clubId: 'club_001',
          clubName: 'AG超玩会',
        },
        finalsMVP: {
          playerId: 'player_001',
          playerName: '一诺',
          clubId: 'club_001',
          clubName: 'AG超玩会',
        },
        bestNewcomer: {
          playerId: 'player_004',
          playerName: '新人王',
          clubId: 'club_004',
          clubName: 'DYG',
        },
        allStarTeam: [
          { position: 'top', playerId: 'p1', playerName: '对抗路之星', clubId: 'club_001', clubName: 'AG超玩会' },
          { position: 'jungle', playerId: 'p2', playerName: '打野之星', clubId: 'club_002', clubName: 'eStarPro' },
          { position: 'mid', playerId: 'p3', playerName: '中单之星', clubId: 'club_003', clubName: 'TTG' },
          { position: 'adc', playerId: 'player_001', playerName: '一诺', clubId: 'club_001', clubName: 'AG超玩会' },
          { position: 'support', playerId: 'p5', playerName: '辅助之星', clubId: 'club_002', clubName: 'eStarPro' },
        ],
      },
      {
        season: 2,
        year: 2023,
        phase: 'summer',
        regularSeasonMVP: {
          playerId: 'player_002',
          playerName: '花海',
          clubId: 'club_002',
          clubName: 'eStarPro',
        },
        finalsMVP: {
          playerId: 'player_002',
          playerName: '花海',
          clubId: 'club_002',
          clubName: 'eStarPro',
        },
        allStarTeam: [
          { position: 'top', playerId: 'p1', playerName: '对抗路之星', clubId: 'club_001', clubName: 'AG超玩会' },
          { position: 'jungle', playerId: 'player_002', playerName: '花海', clubId: 'club_002', clubName: 'eStarPro' },
          { position: 'mid', playerId: 'p3', playerName: '中单之星', clubId: 'club_003', clubName: 'TTG' },
          { position: 'adc', playerId: 'player_001', playerName: '一诺', clubId: 'club_001', clubName: 'AG超玩会' },
          { position: 'support', playerId: 'p5', playerName: '辅助之星', clubId: 'club_002', clubName: 'eStarPro' },
        ],
      },
    ];
    return honors;
  }

  private generateInitialRecords(): Record[] {
    const records: Record[] = [
      {
        id: 'record_001',
        type: 'most_kills_single_match',
        category: 'player',
        title: '单场最高击杀',
        description: '单场比赛中获得最多击杀数',
        holderId: 'player_001',
        holderName: '一诺',
        holderType: 'player',
        value: 15,
        unit: '击杀',
        date: new Date('2024-03-15'),
        season: 3,
        year: 2024,
        opponent: 'eStarPro',
        matchId: 'match_123',
      },
      {
        id: 'record_002',
        type: 'most_assists_single_match',
        category: 'player',
        title: '单场最高助攻',
        description: '单场比赛中获得最多助攻数',
        holderId: 'player_005',
        holderName: '辅助之星',
        holderType: 'player',
        value: 28,
        unit: '助攻',
        date: new Date('2024-04-20'),
        season: 3,
        year: 2024,
        opponent: 'TTG',
        matchId: 'match_456',
      },
      {
        id: 'record_003',
        type: 'highest_kda_single_match',
        category: 'player',
        title: '单场最高KDA',
        description: '单场比赛中达到的最高KDA',
        holderId: 'player_002',
        holderName: '花海',
        holderType: 'player',
        value: 25.0,
        unit: 'KDA',
        date: new Date('2023-08-10'),
        season: 2,
        year: 2023,
        opponent: 'DYG',
        matchId: 'match_789',
      },
      {
        id: 'record_004',
        type: 'fastest_victory',
        category: 'match',
        title: '最快胜利',
        description: '最快结束比赛的时间',
        holderId: 'club_001',
        holderName: 'AG超玩会',
        holderType: 'club',
        value: 12,
        unit: '分钟',
        date: new Date('2024-02-28'),
        season: 3,
        year: 2024,
        opponent: 'RNG.M',
        matchId: 'match_321',
      },
      {
        id: 'record_005',
        type: 'longest_match',
        category: 'match',
        title: '最长比赛',
        description: '比赛时长最长的记录',
        holderId: 'club_002',
        holderName: 'eStarPro',
        holderType: 'club',
        value: 42,
        unit: '分钟',
        date: new Date('2023-09-10'),
        season: 2,
        year: 2023,
        opponent: 'TTG',
        matchId: 'match_654',
      },
      {
        id: 'record_006',
        type: 'most_championships',
        category: 'club',
        title: '最多冠军',
        description: '获得联赛冠军次数最多',
        holderId: 'club_001',
        holderName: 'AG超玩会',
        holderType: 'club',
        value: 3,
        unit: '次',
        date: new Date('2024-05-18'),
        season: 3,
        year: 2024,
      },
      {
        id: 'record_007',
        type: 'longest_win_streak',
        category: 'club',
        title: '最长连胜',
        description: '连续获胜场次最多',
        holderId: 'club_002',
        holderName: 'eStarPro',
        holderType: 'club',
        value: 15,
        unit: '场',
        date: new Date('2023-07-20'),
        season: 2,
        year: 2023,
      },
      {
        id: 'record_008',
        type: 'most_mvp_season',
        category: 'player',
        title: '单赛季最多MVP',
        description: '单个赛季获得MVP次数最多',
        holderId: 'player_001',
        holderName: '一诺',
        holderType: 'player',
        value: 8,
        unit: '次',
        date: new Date('2024-05-18'),
        season: 3,
        year: 2024,
      },
    ];
    return records;
  }

  recordChampion(
    season: number,
    year: number,
    phase: 'spring' | 'summer',
    champion: Club,
    runnerUp: Club,
    finalsMVP: Player,
    matchScore: string
  ): void {
    const championRecord: HistoricalChampion = {
      season,
      year,
      phase,
      championId: champion.id,
      championName: champion.name,
      runnerUpId: runnerUp.id,
      runnerUpName: runnerUp.name,
      finalsMVPId: finalsMVP.id,
      finalsMVPName: finalsMVP.name,
      matchScore,
      date: new Date(),
    };

    this.historicalData.champions.push(championRecord);
    this.updateClubChampionship(champion.id, runnerUp.id);
    this.updatePlayerChampionship(finalsMVP.id);
  }

  recordSeasonHonors(honors: SeasonHonors): void {
    this.historicalData.honors.push(honors);
    
    if (honors.regularSeasonMVP) {
      this.updatePlayerHistory(honors.regularSeasonMVP.playerId, {
        mvpCount: 1,
      });
    }
    
    if (honors.finalsMVP) {
      this.updatePlayerHistory(honors.finalsMVP.playerId, {
        mvpCount: 1,
      });
    }
  }

  checkAndUpdateRecord(
    type: RecordType,
    holderId: string,
    holderName: string,
    holderType: 'player' | 'club',
    value: number,
    unit: string,
    opponent?: string,
    matchId?: string
  ): boolean {
    const existingRecord = this.historicalData.records.find(r => r.type === type);
    
    if (!existingRecord || value > existingRecord.value) {
      const newRecord: Record = {
        id: `record_${Date.now()}`,
        type,
        category: holderType,
        title: existingRecord?.title || type,
        description: existingRecord?.description || '',
        holderId,
        holderName,
        holderType,
        value,
        unit,
        date: new Date(),
        opponent,
        matchId,
      };

      if (existingRecord) {
        const index = this.historicalData.records.findIndex(r => r.type === type);
        this.historicalData.records[index] = newRecord;
      } else {
        this.historicalData.records.push(newRecord);
      }

      return true;
    }

    return false;
  }

  private updateClubChampionship(championId: string, runnerUpId: string): void {
    let championHistory = this.historicalData.clubHistories.get(championId);
    if (!championHistory) {
      championHistory = this.createClubHistory(championId);
    }
    championHistory.championships++;

    let runnerUpHistory = this.historicalData.clubHistories.get(runnerUpId);
    if (!runnerUpHistory) {
      runnerUpHistory = this.createClubHistory(runnerUpId);
    }
    runnerUpHistory.runnerUps++;
  }

  private updatePlayerChampionship(playerId: string): void {
    let playerHistory = this.historicalData.playerHistories.get(playerId);
    if (!playerHistory) {
      playerHistory = this.createPlayerHistory(playerId);
    }
    playerHistory.championships++;
  }

  private updatePlayerHistory(playerId: string, updates: Partial<PlayerHistory>): void {
    let history = this.historicalData.playerHistories.get(playerId);
    if (!history) {
      history = this.createPlayerHistory(playerId);
    }

    Object.assign(history, updates);
  }

  private createClubHistory(clubId: string): ClubHistory {
    const history: ClubHistory = {
      clubId,
      clubName: '',
      founded: new Date().getFullYear(),
      championships: 0,
      runnerUps: 0,
      playoffAppearances: 0,
      totalMatches: 0,
      totalWins: 0,
      totalLosses: 0,
      allTimeWinRate: 0,
      bestSeasonFinish: {
        season: 0,
        year: new Date().getFullYear(),
        phase: 'spring',
        rank: 0,
      },
      seasonHistory: [],
    };

    this.historicalData.clubHistories.set(clubId, history);
    return history;
  }

  private createPlayerHistory(playerId: string): PlayerHistory {
    const history: PlayerHistory = {
      playerId,
      playerName: '',
      totalMatches: 0,
      totalWins: 0,
      totalLosses: 0,
      allTimeWinRate: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      allTimeKDA: 0,
      mvpCount: 0,
      goldMedals: 0,
      silverMedals: 0,
      championships: 0,
      seasonsPlayed: 0,
      bestSeason: null,
      clubHistory: [],
      heroMastery: [],
    };

    this.historicalData.playerHistories.set(playerId, history);
    return history;
  }

  getChampions(): HistoricalChampion[] {
    return [...this.historicalData.champions];
  }

  getChampionsByClub(clubId: string): HistoricalChampion[] {
    return this.historicalData.champions.filter(
      c => c.championId === clubId || c.runnerUpId === clubId
    );
  }

  getHonors(): SeasonHonors[] {
    return [...this.historicalData.honors];
  }

  getHonorsBySeason(season: number): SeasonHonors | undefined {
    return this.historicalData.honors.find(h => h.season === season);
  }

  getHonorsByPlayer(playerId: string): SeasonHonors[] {
    return this.historicalData.honors.filter(h => 
      h.regularSeasonMVP?.playerId === playerId ||
      h.finalsMVP?.playerId === playerId ||
      h.bestNewcomer?.playerId === playerId ||
      h.allStarTeam.some(p => p.playerId === playerId)
    );
  }

  getRecords(): Record[] {
    return [...this.historicalData.records];
  }

  getRecordsByType(type: RecordType): Record | undefined {
    return this.historicalData.records.find(r => r.type === type);
  }

  getRecordsByHolder(holderId: string): Record[] {
    return this.historicalData.records.filter(r => r.holderId === holderId);
  }

  getClubHistory(clubId: string): ClubHistory | undefined {
    return this.historicalData.clubHistories.get(clubId);
  }

  getPlayerHistory(playerId: string): PlayerHistory | undefined {
    return this.historicalData.playerHistories.get(playerId);
  }

  getAllClubHistories(): ClubHistory[] {
    return Array.from(this.historicalData.clubHistories.values());
  }

  getAllPlayerHistories(): PlayerHistory[] {
    return Array.from(this.historicalData.playerHistories.values());
  }

  getHistoricalData(): HistoricalData {
    return this.historicalData;
  }

  reset(): void {
    this.historicalData = {
      champions: [],
      honors: [],
      records: [],
      clubHistories: new Map(),
      playerHistories: new Map(),
    };
    this.loadInitialData();
  }
}

export const historicalDataService = new HistoricalDataService();
