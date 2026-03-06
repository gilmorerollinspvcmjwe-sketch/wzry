export interface HistoricalChampion {
  season: number;
  year: number;
  phase: 'spring' | 'summer';
  championId: string;
  championName: string;
  runnerUpId: string;
  runnerUpName: string;
  finalsMVPId: string;
  finalsMVPName: string;
  matchScore: string;
  date: Date;
}

export interface SeasonHonors {
  season: number;
  year: number;
  phase: 'spring' | 'summer';
  regularSeasonMVP?: {
    playerId: string;
    playerName: string;
    clubId: string;
    clubName: string;
  };
  finalsMVP?: {
    playerId: string;
    playerName: string;
    clubId: string;
    clubName: string;
  };
  bestNewcomer?: {
    playerId: string;
    playerName: string;
    clubId: string;
    clubName: string;
  };
  bestCoach?: {
    coachId: string;
    coachName: string;
    clubId: string;
    clubName: string;
  };
  allStarTeam: {
    position: string;
    playerId: string;
    playerName: string;
    clubId: string;
    clubName: string;
  }[];
  bestTeam?: {
    clubId: string;
    clubName: string;
  };
}

export interface Record {
  id: string;
  type: RecordType;
  category: 'player' | 'club' | 'match';
  title: string;
  description: string;
  holderId: string;
  holderName: string;
  holderType: 'player' | 'club';
  value: number;
  unit: string;
  date: Date;
  season?: number;
  year?: number;
  opponent?: string;
  matchId?: string;
}

export type RecordType =
  | 'most_kills_single_match'
  | 'most_assists_single_match'
  | 'highest_kda_single_match'
  | 'most_damage_single_match'
  | 'fastest_victory'
  | 'longest_match'
  | 'most_kills_season'
  | 'highest_win_rate_season'
  | 'most_mvp_season'
  | 'most_championships'
  | 'longest_win_streak'
  | 'longest_lose_streak'
  | 'most_picked_hero'
  | 'most_banned_hero';

export interface ClubHistory {
  clubId: string;
  clubName: string;
  founded: number;
  
  championships: number;
  runnerUps: number;
  playoffAppearances: number;
  
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  allTimeWinRate: number;
  
  bestSeasonFinish: {
    season: number;
    year: number;
    phase: 'spring' | 'summer';
    rank: number;
  };
  
  seasonHistory: {
    season: number;
    year: number;
    phase: 'spring' | 'summer';
    regularSeasonRank: number;
    playoffResult: 'champion' | 'runner_up' | 'semifinal' | 'quarterfinal' | 'group_stage';
    wins: number;
    losses: number;
  }[];
}

export interface PlayerHistory {
  playerId: string;
  playerName: string;
  
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  allTimeWinRate: number;
  
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  allTimeKDA: number;
  
  mvpCount: number;
  goldMedals: number;
  silverMedals: number;
  
  championships: number;
  
  seasonsPlayed: number;
  
  bestSeason: {
    season: number;
    year: number;
    phase: 'spring' | 'summer';
    kda: number;
    winRate: number;
  } | null;
  
  clubHistory: {
    clubId: string;
    clubName: string;
    startSeason: number;
    endSeason?: number;
    matches: number;
    wins: number;
    losses: number;
  }[];
  
  heroMastery: {
    heroId: string;
    heroName: string;
    matches: number;
    wins: number;
    losses: number;
    winRate: number;
    kda: number;
  }[];
}

export interface HistoricalData {
  champions: HistoricalChampion[];
  honors: SeasonHonors[];
  records: Record[];
  clubHistories: Map<string, ClubHistory>;
  playerHistories: Map<string, PlayerHistory>;
}
