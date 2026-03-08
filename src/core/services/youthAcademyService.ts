import type { 
  YouthAcademy, 
  YouthCoach, 
  YouthPlayer, 
  YouthFacility, 
  Loan, 
  YouthLeague,
  YouthLeagueMatch,
  YouthLeagueStanding,
  TrainingProgram,
  YouthCoachSpecialty,
  YouthCoachStyle,
  LoanReport
} from '@/types/youthAcademy';
import type { Position, PlayerStats } from '@/types';
import { useClubStore } from '@/stores/club';
import { useYouthAcademyStore } from '@/stores/youthAcademy';
import { usePlayerStore } from '@/stores/player';

const COACH_SURNAMES = ['张', '李', '王', '刘', '陈', '杨', '赵', '周', '吴', '郑', '孙', '马', '朱', '胡', '林', '何', '郭', '徐', '高', '梁', '谢', '韩', '唐', '冯'];
const COACH_GIVEN_NAMES = ['伟', '明', '强', '洋', '杰', '帆', '磊', '涛', '昊', '宇', '浩', '超', '俊', '斌', '峰', '勇', '威', '军', '远', '冰', '亮', '刚', '辉', '鹏'];

const PLAYER_SURNAMES = ['张', '李', '王', '刘', '陈', '杨', '赵', '周', '吴', '郑', '孙', '马', '朱', '胡', '林', '何', '郭', '徐', '高', '梁'];
const PLAYER_GIVEN_NAMES = ['明', '强', '洋', '杰', '帆', '磊', '涛', '昊', '宇', '浩', '超', '俊', '斌', '峰', '勇', '威', '军', '远', '冰', '亮'];

function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateCoachName(): string {
  const surname = randomItem(COACH_SURNAMES);
  const givenName = randomItem(COACH_GIVEN_NAMES);
  const givenName2 = randomItem(COACH_GIVEN_NAMES);
  return surname + givenName + (Math.random() > 0.5 ? givenName2 : '');
}

function generatePlayerName(): string {
  const surname = randomItem(PLAYER_SURNAMES);
  const givenName = randomItem(PLAYER_GIVEN_NAMES);
  const givenName2 = randomItem(PLAYER_GIVEN_NAMES);
  return surname + givenName + (Math.random() > 0.5 ? givenName2 : '');
}

export function initializeAcademy(clubId: string): YouthAcademy {
  return {
    clubId,
    level: 1,
    reputation: 50,
    coaches: [],
    facilities: {
      trainingGround: 1,
      dormitory: 1,
      medicalCenter: 1,
      analysisRoom: 1,
    },
    players: [],
    league: null,
    loans: [],
    budget: 1000,
    weeklyCost: 0,
    stats: {
      totalGraduates: 0,
      activeInFirstTeam: 0,
      totalSold: 0,
      totalRevenue: 0,
      averageRating: 0,
    },
    trainingPrograms: [],
  };
}

export function generateYouthCoach(level: number = 1): YouthCoach {
  const specialties: YouthCoachSpecialty[] = ['training', 'tactics', 'mental', 'physical', 'hero_pool', 'position'];
  const styles: YouthCoachStyle[] = ['strict', 'encouraging', 'balanced', 'innovative'];
  const positions: Position[] = ['top', 'jungle', 'mid', 'adc', 'support'];
  
  const specialty = randomItem(specialties);
  const style = randomItem(styles);
  
  const bonuses = [];
  if (specialty === 'training') {
    bonuses.push({ type: 'training_speed' as const, value: 5 + level * 2 });
  } else if (specialty === 'mental') {
    bonuses.push({ type: 'morale' as const, value: 5 + level * 2 });
  } else if (specialty === 'hero_pool') {
    bonuses.push({ type: 'hero_pool' as const, value: 5 + level * 2 });
  } else if (specialty === 'position') {
    bonuses.push({ type: 'position_mastery' as const, value: 5 + level * 2 });
  } else {
    bonuses.push({ type: 'potential_growth' as const, value: 3 + level });
  }
  
  const baseSalary = 5 + level * 3;
  
  return {
    id: generateId('youth_coach'),
    name: generateCoachName(),
    specialty,
    level,
    bonuses,
    style,
    salary: baseSalary,
    experience: randomInt(1, 15),
    reputation: randomInt(30, 70) + level * 5,
    positionFocus: specialty === 'position' ? randomItem(positions) : undefined,
  };
}

export function hireYouthCoach(clubId: string, coach: YouthCoach): { success: boolean; message: string } {
  const clubStore = useClubStore();
  const academyStore = useYouthAcademyStore();
  
  const club = clubStore.currentClub;
  if (!club || club.id !== clubId) {
    return { success: false, message: '俱乐部不存在' };
  }
  
  const hiringFee = coach.salary * 4;
  if (club.funds < hiringFee) {
    return { success: false, message: `资金不足，聘请费用需要 ${hiringFee} 万` };
  }
  
  const academy = academyStore.getAcademy(clubId);
  if (academy.coaches.length >= 5) {
    return { success: false, message: '青训教练数量已达上限（5人）' };
  }
  
  club.funds -= hiringFee;
  academyStore.addCoach(clubId, coach);
  
  return { success: true, message: `成功聘请 ${coach.name} 为青训教练` };
}

export function fireYouthCoach(clubId: string, coachId: string): { success: boolean; message: string; cost: number } {
  const clubStore = useClubStore();
  const academyStore = useYouthAcademyStore();
  
  const club = clubStore.currentClub;
  if (!club || club.id !== clubId) {
    return { success: false, message: '俱乐部不存在', cost: 0 };
  }
  
  const academy = academyStore.getAcademy(clubId);
  const coach = academy.coaches.find(c => c.id === coachId);
  if (!coach) {
    return { success: false, message: '教练不存在', cost: 0 };
  }
  
  const penalty = coach.salary * 2;
  if (club.funds < penalty) {
    return { success: false, message: `资金不足，解约金需要 ${penalty} 万`, cost: penalty };
  }
  
  club.funds -= penalty;
  academyStore.removeCoach(clubId, coachId);
  
  return { success: true, message: `已解雇 ${coach.name}，支付违约金 ${penalty} 万`, cost: penalty };
}

export function upgradeFacility(
  clubId: string, 
  facility: keyof YouthFacility, 
  targetLevel: number
): { success: boolean; message: string; cost: number } {
  const clubStore = useClubStore();
  const academyStore = useYouthAcademyStore();
  
  const club = clubStore.currentClub;
  if (!club || club.id !== clubId) {
    return { success: false, message: '俱乐部不存在', cost: 0 };
  }
  
  const academy = academyStore.getAcademy(clubId);
  const currentLevel = academy.facilities[facility];
  
  if (targetLevel <= currentLevel) {
    return { success: false, message: '目标等级不能低于或等于当前等级', cost: 0 };
  }
  
  if (targetLevel > 5) {
    return { success: false, message: '设施等级不能超过5级', cost: 0 };
  }
  
  if (targetLevel > currentLevel + 1) {
    return { success: false, message: '只能逐级升级', cost: 0 };
  }
  
  const upgradeCosts = [0, 500, 1000, 2000, 5000];
  const cost = upgradeCosts[targetLevel - 1] || 0;
  
  if (club.funds < cost) {
    return { success: false, message: `资金不足，升级需要 ${cost} 万`, cost };
  }
  
  club.funds -= cost;
  academyStore.upgradeFacility(clubId, facility, targetLevel);
  
  return { success: true, message: `成功将设施升级到 ${targetLevel} 级`, cost };
}

export function generateYouthPlayer(clubId: string, potentialRange: [number, number] = [60, 85]): YouthPlayer {
  const positions: Position[] = ['top', 'jungle', 'mid', 'adc', 'support'];
  const position = randomItem(positions);
  const potential = randomInt(potentialRange[0], potentialRange[1]);
  const age = randomInt(16, 19);
  
  const baseValue = 30 + Math.floor(potential * 0.2);
  const variance = () => randomInt(-5, 5);
  
  const stats: YouthPlayerStats = {
    mechanics: Math.min(100, baseValue + variance()),
    awareness: Math.min(100, baseValue + variance()),
    mentality: Math.min(100, baseValue + variance()),
    teamwork: Math.min(100, baseValue + variance()),
    heroPool: Math.min(100, baseValue - 10 + variance()),
    potential,
    growthRate: 1.0,
    trainingProgress: 0,
  };
  
  const secondaryPositions: Position[] = [];
  if (Math.random() > 0.7) {
    const otherPositions = positions.filter(p => p !== position);
    secondaryPositions.push(randomItem(otherPositions));
  }
  
  return {
    id: generateId('youth_player'),
    name: generatePlayerName(),
    avatar: '',
    age,
    position,
    secondaryPositions,
    nationality: 'CN',
    gender: Math.random() > 0.05 ? 'male' : 'female',
    stats,
    condition: {
      stamina: 100,
      mentality: 80,
      injury: 0,
      morale: 75,
      happiness: 80,
      development: 0,
    },
    potential,
    growthRate: 1.0,
    trainingProgress: 0,
    positionMastery: {
      top: position === 'top' ? 50 : 0,
      jungle: position === 'jungle' ? 50 : 0,
      mid: position === 'mid' ? 50 : 0,
      adc: position === 'adc' ? 50 : 0,
      support: position === 'support' ? 50 : 0,
    },
    traits: [],
    growthHistory: [],
    joinDate: new Date(),
    academyYears: 0,
    contract: {
      salary: 1,
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3),
      buyoutClause: 10,
    },
    heroPreference: {
      preferredRoles: [],
      favoriteHeroes: [],
    },
    status: 'training',
  };
}

export function recruitYouthPlayer(clubId: string): { success: boolean; message: string; player?: YouthPlayer } {
  const clubStore = useClubStore();
  const academyStore = useYouthAcademyStore();
  
  const club = clubStore.currentClub;
  if (!club || club.id !== clubId) {
    return { success: false, message: '俱乐部不存在' };
  }
  
  const academy = academyStore.getAcademy(clubId);
  if (academy.players.length >= 20) {
    return { success: false, message: '青训球员数量已达上限（20人）' };
  }
  
  const recruitCost = 50;
  if (academy.budget < recruitCost) {
    return { success: false, message: `青训预算不足，招募需要 ${recruitCost} 万` };
  }
  
  const player = generateYouthPlayer(clubId);
  academyStore.addPlayer(clubId, player);
  academyStore.updateBudget(clubId, -recruitCost);
  
  return { success: true, message: `成功招募青训球员 ${player.name}`, player };
}

export function promotePlayer(clubId: string, playerId: string): { success: boolean; message: string } {
  const clubStore = useClubStore();
  const academyStore = useYouthAcademyStore();
  const playerStore = usePlayerStore();
  
  const club = clubStore.currentClub;
  if (!club || club.id !== clubId) {
    return { success: false, message: '俱乐部不存在' };
  }
  
  const academy = academyStore.getAcademy(clubId);
  const player = academy.players.find(p => p.id === playerId);
  if (!player) {
    return { success: false, message: '球员不存在' };
  }
  
  if (player.status !== 'training') {
    return { success: false, message: '该球员当前状态无法提拔' };
  }
  
  const avgStats = Math.round(
    (player.stats.mechanics + player.stats.awareness + player.stats.mentality + player.stats.teamwork + player.stats.heroPool) / 5
  );
  
  if (avgStats < 60) {
    return { success: false, message: '球员属性不足，平均属性需要达到60才能提拔' };
  }
  
  const firstTeamPlayer = {
    id: generateId('player'),
    name: player.name,
    nickname: player.nickname,
    avatar: player.avatar,
    age: player.age,
    position: player.position,
    nationality: player.nationality,
    gender: player.gender,
    height: 175,
    weight: 65,
    gameId: `${player.name[0]}${player.name[player.name.length - 1]}`,
    stats: {
      mechanics: player.stats.mechanics,
      awareness: player.stats.awareness,
      mentality: player.stats.mentality,
      teamwork: player.stats.teamwork,
      heroPool: player.stats.heroPool,
    },
    positionMastery: player.positionMastery,
    traits: player.traits,
    condition: {
      stamina: player.condition.stamina,
      mentality: player.condition.mentality,
      injury: player.condition.injury,
      morale: player.condition.morale,
    },
    contract: {
      salary: Math.round(avgStats * 0.5),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2),
      buyoutClause: Math.round(avgStats * 6),
    },
    potential: player.potential,
    experience: 0,
    growthHistory: player.growthHistory,
    personality: {
      trainingAttitude: 'diligent',
      playStyle: 'flexible',
      teamwork: 'team-player',
      pressureResistance: 'normal',
      socialSkill: 'introverted',
    },
    talents: [],
    careerStats: {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      mvpCount: 0,
      goldMedals: 0,
      silverMedals: 0,
      averageKDA: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      favoriteHeroes: [],
    },
    rank: undefined,
    matchHistory: [],
    honors: [],
    clubHistory: [],
    relationships: [],
    heroPreference: player.heroPreference,
    secondaryPositions: player.secondaryPositions,
  };
  
  playerStore.addPlayer(clubId, firstTeamPlayer as any);
  academyStore.removePlayer(clubId, playerId);
  academyStore.updateStats(clubId, { totalGraduates: 1, activeInFirstTeam: 1 });
  
  return { success: true, message: `成功将 ${player.name} 提拔到一队` };
}

export function loanPlayer(
  clubId: string, 
  playerId: string, 
  toClub: string,
  toClubId: string,
  duration: number = 6,
  fee: number = 0,
  clauses: Loan['clauses'] = []
): { success: boolean; message: string; loan?: Loan } {
  const academyStore = useYouthAcademyStore();
  
  const academy = academyStore.getAcademy(clubId);
  const player = academy.players.find(p => p.id === playerId);
  if (!player) {
    return { success: false, message: '球员不存在' };
  }
  
  if (player.status !== 'training') {
    return { success: false, message: '该球员当前状态无法外租' };
  }
  
  const loan: Loan = {
    id: generateId('loan'),
    playerId: player.id,
    playerName: player.name,
    toClub,
    toClubId,
    startDate: new Date(),
    endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000),
    fee,
    clauses,
    reports: [],
    status: 'active',
  };
  
  player.status = 'loaned';
  player.loanInfo = loan;
  
  academyStore.addLoan(clubId, loan);
  academyStore.updatePlayer(clubId, player);
  
  return { success: true, message: `成功将 ${player.name} 租借到 ${toClub}`, loan };
}

export function recallLoan(clubId: string, loanId: string): { success: boolean; message: string } {
  const academyStore = useYouthAcademyStore();
  
  const academy = academyStore.getAcademy(clubId);
  const loan = academy.loans.find(l => l.id === loanId);
  if (!loan) {
    return { success: false, message: '租借记录不存在' };
  }
  
  if (loan.status !== 'active') {
    return { success: false, message: '该租借已结束' };
  }
  
  const player = academy.players.find(p => p.id === loan.playerId);
  if (player) {
    player.status = 'training';
    player.loanInfo = undefined;
    academyStore.updatePlayer(clubId, player);
  }
  
  loan.status = 'recalled';
  academyStore.updateLoan(clubId, loan);
  
  return { success: true, message: `成功召回 ${loan.playerName}` };
}

export function generateLoanReport(loan: Loan): LoanReport {
  const rating = randomInt(5, 10);
  const development = randomInt(1, 5);
  
  const performances = [
    '表现出色，获得大量出场机会',
    '表现稳定，逐渐适应比赛节奏',
    '表现一般，需要更多锻炼',
    '表现欠佳，出场时间有限',
  ];
  
  const recommendations: LoanReport['recommendation'][] = 
    rating >= 8 ? ['promote', 'extend'] :
    rating >= 6 ? ['extend', 'recall'] :
    ['recall', 'release'];
  
  return {
    date: new Date(),
    rating,
    performance: randomItem(performances),
    development,
    recommendation: randomItem(recommendations),
  };
}

export function simulateYouthLeague(clubId: string): { success: boolean; message: string; results?: YouthLeagueMatch[] } {
  const academyStore = useYouthAcademyStore();
  
  const academy = academyStore.getAcademy(clubId);
  if (!academy.league) {
    return { success: false, message: '未参加青训联赛' };
  }
  
  const league = academy.league;
  if (league.status !== 'ongoing') {
    return { success: false, message: '联赛未在进行中' };
  }
  
  const unplayedMatches = league.matches.filter(m => !m.played && (m.homeClubId === clubId || m.awayClubId === clubId));
  if (unplayedMatches.length === 0) {
    return { success: false, message: '没有待进行的比赛' };
  }
  
  const results: YouthLeagueMatch[] = [];
  
  for (const match of unplayedMatches.slice(0, 1)) {
    const isHome = match.homeClubId === clubId;
    const teamPower = calculateYouthTeamPower(academy.players.filter(p => p.status === 'training'));
    const opponentPower = randomInt(40, 80);
    
    const homeAdvantage = isHome ? 5 : 0;
    const totalPower = isHome ? teamPower + homeAdvantage : opponentPower + 5;
    const opponentTotalPower = isHome ? opponentPower : teamPower;
    
    let homeScore: number, awayScore: number;
    if (totalPower > opponentTotalPower + 10) {
      homeScore = isHome ? randomInt(2, 3) : randomInt(0, 1);
      awayScore = isHome ? randomInt(0, 1) : randomInt(2, 3);
    } else if (totalPower > opponentTotalPower) {
      homeScore = isHome ? randomInt(1, 2) : randomInt(0, 1);
      awayScore = isHome ? randomInt(0, 1) : randomInt(1, 2);
    } else {
      homeScore = isHome ? randomInt(0, 1) : randomInt(2, 3);
      awayScore = isHome ? randomInt(2, 3) : randomInt(0, 1);
    }
    
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.played = true;
    match.result = isHome ? 
      (homeScore > awayScore ? 'win' : homeScore < awayScore ? 'loss' : 'draw') :
      (awayScore > homeScore ? 'win' : awayScore < homeScore ? 'loss' : 'draw');
    
    results.push(match);
    
    updateLeagueStandings(league, match);
  }
  
  academyStore.updateLeague(clubId, league);
  
  return { success: true, message: '比赛模拟完成', results };
}

function calculateYouthTeamPower(players: YouthPlayer[]): number {
  if (players.length === 0) return 50;
  
  const totalPower = players.reduce((sum, p) => {
    const avgStats = (p.stats.mechanics + p.stats.awareness + p.stats.mentality + p.stats.teamwork + p.stats.heroPool) / 5;
    return sum + avgStats;
  }, 0);
  
  return Math.round(totalPower / players.length);
}

function updateLeagueStandings(league: YouthLeague, match: YouthLeagueMatch): void {
  const homeStanding = league.standings.find(s => s.clubId === match.homeClubId);
  const awayStanding = league.standings.find(s => s.clubId === match.awayClubId);
  
  if (!homeStanding || !awayStanding) return;
  
  homeStanding.played++;
  awayStanding.played++;
  homeStanding.goalsFor += match.homeScore || 0;
  homeStanding.goalsAgainst += match.awayScore || 0;
  awayStanding.goalsFor += match.awayScore || 0;
  awayStanding.goalsAgainst += match.homeScore || 0;
  
  if ((match.homeScore || 0) > (match.awayScore || 0)) {
    homeStanding.wins++;
    homeStanding.points += 3;
    awayStanding.losses++;
  } else if ((match.homeScore || 0) < (match.awayScore || 0)) {
    awayStanding.wins++;
    awayStanding.points += 3;
    homeStanding.losses++;
  } else {
    homeStanding.draws++;
    awayStanding.draws++;
    homeStanding.points++;
    awayStanding.points++;
  }
  
  league.standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aGD = a.goalsFor - a.goalsAgainst;
    const bGD = b.goalsFor - b.goalsAgainst;
    if (bGD !== aGD) return bGD - aGD;
    return b.goalsFor - a.goalsFor;
  });
}

export function createYouthLeague(clubId: string, participantClubs: { id: string; name: string }[]): YouthLeague {
  const matches: YouthLeagueMatch[] = [];
  const standings: YouthLeagueStanding[] = participantClubs.map(club => ({
    clubId: club.id,
    clubName: club.name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  }));
  
  for (let i = 0; i < participantClubs.length; i++) {
    for (let j = i + 1; j < participantClubs.length; j++) {
      matches.push({
        id: generateId('youth_match'),
        date: new Date(Date.now() + matches.length * 7 * 24 * 60 * 60 * 1000),
        homeClubId: participantClubs[i]!.id,
        awayClubId: participantClubs[j]!.id,
        played: false,
      });
      
      matches.push({
        id: generateId('youth_match'),
        date: new Date(Date.now() + (matches.length + 1) * 7 * 24 * 60 * 60 * 1000),
        homeClubId: participantClubs[j]!.id,
        awayClubId: participantClubs[i]!.id,
        played: false,
      });
    }
  }
  
  return {
    id: generateId('youth_league'),
    name: '青训联赛',
    season: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    participants: participantClubs.map(c => c.id),
    matches,
    standings,
    status: 'ongoing',
  };
}

export function trainYouthPlayer(
  clubId: string, 
  playerId: string, 
  statType: keyof PlayerStats,
  intensity: 'light' | 'normal' | 'intense' = 'normal'
): { success: boolean; message: string; growth?: number } {
  const academyStore = useYouthAcademyStore();
  
  const academy = academyStore.getAcademy(clubId);
  const player = academy.players.find(p => p.id === playerId);
  if (!player) {
    return { success: false, message: '球员不存在' };
  }
  
  if (player.status !== 'training') {
    return { success: false, message: '该球员当前无法训练' };
  }
  
  const facilityBonus = (academy.facilities.trainingGround - 1) * 0.05;
  const coachBonus = academy.coaches
    .filter(c => c.specialty === 'training' || c.specialty === 'position' && c.positionFocus === player.position)
    .reduce((sum, c) => sum + c.level * 0.02, 0);
  
  const intensityMultiplier = intensity === 'light' ? 0.5 : intensity === 'intense' ? 1.5 : 1.0;
  const staminaCost = intensity === 'light' ? 5 : intensity === 'intense' ? 20 : 10;
  
  const baseGrowth = 0.5 + Math.random() * 0.5;
  const totalGrowth = baseGrowth * (1 + facilityBonus + coachBonus) * intensityMultiplier * player.growthRate;
  
  const oldValue = player.stats[statType];
  const newValue = Math.min(100, oldValue + totalGrowth);
  const actualGrowth = newValue - oldValue;
  
  player.stats[statType] = newValue;
  player.condition.stamina = Math.max(0, player.condition.stamina - staminaCost);
  player.trainingProgress += totalGrowth;
  
  player.growthHistory.push({
    date: new Date(),
    statType,
    oldValue,
    newValue,
    reason: 'youth_training',
  });
  
  if (player.trainingProgress >= 10) {
    player.growthRate = Math.min(1.5, player.growthRate + 0.05);
    player.trainingProgress = 0;
  }
  
  academyStore.updatePlayer(clubId, player);
  
  return { success: true, message: `训练完成，${statType} 提升 ${actualGrowth.toFixed(2)}`, growth: actualGrowth };
}

export function getAvailableYouthCoaches(count: number = 5, level: number = 1): YouthCoach[] {
  const coaches: YouthCoach[] = [];
  for (let i = 0; i < count; i++) {
    coaches.push(generateYouthCoach(level + randomInt(-1, 1)));
  }
  return coaches;
}

export function calculateAcademyWeeklyCost(academy: YouthAcademy): number {
  const coachSalaries = academy.coaches.reduce((sum, c) => sum + c.salary, 0);
  const playerCosts = academy.players.length * 2;
  const facilityCosts = Object.values(academy.facilities).reduce((sum, level) => sum + level * 5, 0);
  
  return coachSalaries + playerCosts + facilityCosts;
}

export function processWeeklyAcademy(clubId: string): { message: string } {
  const academyStore = useYouthAcademyStore();
  const clubStore = useClubStore();
  
  const club = clubStore.currentClub;
  if (!club || club.id !== clubId) {
    return { message: '俱乐部不存在' };
  }
  
  const academy = academyStore.getAcademy(clubId);
  const weeklyCost = calculateAcademyWeeklyCost(academy);
  
  if (club.funds >= weeklyCost) {
    club.funds -= weeklyCost;
  } else {
    academy.budget -= weeklyCost;
  }
  
  for (const player of academy.players) {
    if (player.status === 'training') {
      player.condition.stamina = Math.min(100, player.condition.stamina + 20);
      player.condition.morale = Math.min(100, player.condition.morale + 5);
      player.academyYears += 1 / 52;
      
      if (Math.random() < 0.1) {
        const stats = ['mechanics', 'awareness', 'mentality', 'teamwork', 'heroPool'] as (keyof PlayerStats)[];
        const stat = randomItem(stats);
        const growth = 0.1 + Math.random() * 0.3;
        player.stats[stat] = Math.min(player.potential, player.stats[stat] + growth);
      }
    }
  }
  
  for (const loan of academy.loans) {
    if (loan.status === 'active') {
      if (Math.random() < 0.3) {
        loan.reports.push(generateLoanReport(loan));
      }
      
      if (new Date() >= loan.endDate) {
        loan.status = 'completed';
        const player = academy.players.find(p => p.id === loan.playerId);
        if (player) {
          player.status = 'training';
          player.loanInfo = undefined;
        }
      }
    }
  }
  
  academyStore.updateAcademy(clubId, academy);
  
  return { message: `青训学院周支出: ${weeklyCost} 万` };
}
