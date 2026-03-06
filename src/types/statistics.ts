export interface ClubStatistics {
  clubId: string;
  clubName: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  averageGameDuration: number;
  goldPerMinute: number;
  damagePerMinute: number;
  towers: number;
  dragons: number;
  barons: number;
}

export interface PlayerStatistics {
  playerId: string;
  playerName: string;
  clubId: string;
  clubName: string;
  position: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  goldPerMinute: number;
  damagePerMinute: number;
  damageTakenPerMinute: number;
  visionScore: number;
  csPerMinute: number;
  mvpCount: number;
  goldMedals: number;
  silverMedals: number;
  averageScore: number;
}

export interface HeroStatistics {
  heroId: string;
  heroName: string;
  role: string;
  picks: number;
  bans: number;
  wins: number;
  losses: number;
  winRate: number;
  pickRate: number;
  banRate: number;
  averageKDA: number;
  averageKills: number;
  averageDeaths: number;
  averageAssists: number;
  averageGold: number;
  averageDamage: number;
}

export type LeaderboardType =
  | 'kills'
  | 'assists'
  | 'kda'
  | 'gold_per_min'
  | 'damage_per_min'
  | 'vision_score'
  | 'cs_per_min'
  | 'mvp_count'
  | 'win_rate';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  clubId: string;
  clubName: string;
  position: string;
  value: number;
  secondaryValue?: number;
}

export interface LeagueStatistics {
  season: number;
  year: number;
  phase: 'spring' | 'summer';
  status: 'regular' | 'playoff' | 'finished';
  
  clubStats: ClubStatistics[];
  playerStats: PlayerStatistics[];
  heroStats: HeroStatistics[];
  
  totalMatches: number;
  totalKills: number;
  averageGameDuration: number;
  mostPickedHero: string;
  mostBannedHero: string;
  highestWinRateClub: string;
}

export interface MatchStatistics {
  matchId: string;
  homeClubId: string;
  awayClubId: string;
  winnerId: string;
  duration: number;
  
  homeTeam: TeamMatchStats;
  awayTeam: TeamMatchStats;
  
  playerStats: PlayerMatchStats[];
}

export interface TeamMatchStats {
  clubId: string;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  damage: number;
  towers: number;
  dragons: number;
  barons: number;
  firstBlood: boolean;
  firstTower: boolean;
  firstDragon: boolean;
}

export interface PlayerMatchStats {
  playerId: string;
  playerName: string;
  clubId: string;
  position: string;
  heroId: string;
  heroName: string;
  
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  
  gold: number;
  goldPerMinute: number;
  
  damage: number;
  damagePerMinute: number;
  damageTaken: number;
  
  visionScore: number;
  cs: number;
  csPerMinute: number;
  
  score: number;
  medals: ('gold' | 'silver' | 'mvp')[];
  isMVP: boolean;
}

export interface StatisticsFilter {
  type: 'club' | 'player' | 'hero';
  clubId?: string;
  playerId?: string;
  heroId?: string;
  position?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}
