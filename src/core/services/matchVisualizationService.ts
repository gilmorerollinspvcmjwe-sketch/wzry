import type { Match } from '@/core/models/Match';
import type {
  MatchVisualization,
  MinimapData,
  GoldCurve,
  LiveStats,
  PostMatchAnalysis,
  PlayerHeatmap,
  DamageBreakdown,
  VisionControl,
  KeyFight,
  MinimapPlayer,
  MinimapObjective,
  MinimapEvent,
  PlayerLiveStats,
  TeamLiveStats,
  TurningPoint,
  TeamComparison,
  Position2D,
  HeatmapPoint,
  HeatmapZone,
} from '@/types/matchVisualization';
import { useClubStore } from '@/stores/club';
import { useHeroStore } from '@/stores/hero';

function generateId(): string {
  return `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function randomPosition(): Position2D {
  return {
    x: Math.random() * 100,
    y: Math.random() * 100,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function generateMinimapData(match: Match): MinimapData[] {
  const clubStore = useClubStore();
  const heroStore = useHeroStore();
  
  const minimapData: MinimapData[] = [];
  const duration = match.stats?.duration || 1200;
  const interval = 60;
  
  const homeClub = clubStore.getClub(match.homeTeam.clubId);
  const awayClub = clubStore.getClub(match.awayTeam.clubId);
  
  if (!homeClub || !awayClub) return minimapData;
  
  for (let time = 0; time <= duration; time += interval) {
    const players: MinimapPlayer[] = [];
    const objectives: MinimapObjective[] = [];
    const events: MinimapEvent[] = [];
    
    homeClub.roster.forEach((player, index) => {
      const heroId = match.homeTeam.players[index]?.heroId || player.heroPreference.favoriteHeroes[0];
      const hero = heroStore.getHeroById(heroId);
      
      const basePosition = getBasePosition(player.position, 'blue');
      const wanderRange = 15;
      
      players.push({
        playerId: player.id,
        playerName: player.name,
        team: 'blue',
        position: {
          x: clamp(basePosition.x + (Math.random() - 0.5) * wanderRange, 0, 100),
          y: clamp(basePosition.y + (Math.random() - 0.5) * wanderRange, 0, 100),
        },
        heroId: heroId,
        heroName: hero?.name || '未知英雄',
        isAlive: Math.random() > 0.05,
        health: Math.floor(Math.random() * 100),
      });
    });
    
    awayClub.roster.forEach((player, index) => {
      const heroId = match.awayTeam.players[index]?.heroId || player.heroPreference.favoriteHeroes[0];
      const hero = heroStore.getHeroById(heroId);
      
      const basePosition = getBasePosition(player.position, 'red');
      const wanderRange = 15;
      
      players.push({
        playerId: player.id,
        playerName: player.name,
        team: 'red',
        position: {
          x: clamp(basePosition.x + (Math.random() - 0.5) * wanderRange, 0, 100),
          y: clamp(basePosition.y + (Math.random() - 0.5) * wanderRange, 0, 100),
        },
        heroId: heroId,
        heroName: hero?.name || '未知英雄',
        isAlive: Math.random() > 0.05,
        health: Math.floor(Math.random() * 100),
      });
    });
    
    objectives.push({
      id: 'dragon',
      type: 'dragon',
      position: { x: 50, y: 75 },
      status: time < 300 ? 'alive' : Math.random() > 0.3 ? 'dead' : 'alive',
      team: Math.random() > 0.5 ? 'blue' : 'red',
    });
    
    objectives.push({
      id: 'baron',
      type: 'baron',
      position: { x: 50, y: 25 },
      status: time < 1200 ? 'alive' : Math.random() > 0.5 ? 'dead' : 'alive',
      team: Math.random() > 0.5 ? 'blue' : 'red',
    });
    
    if (Math.random() > 0.7) {
      events.push({
        id: generateId(),
        type: Math.random() > 0.5 ? 'kill' : 'objective',
        position: randomPosition(),
        timestamp: time,
        description: `事件发生在 ${Math.floor(time / 60)} 分钟`,
        involvedPlayers: [players[0]?.playerId || '', players[5]?.playerId || ''],
      });
    }
    
    minimapData.push({
      timestamp: time,
      players,
      objectives,
      events,
    });
  }
  
  return minimapData;
}

function getBasePosition(position: string, team: 'blue' | 'red'): Position2D {
  const positions: Record<string, Position2D> = {
    top: { x: 25, y: 25 },
    jungle: { x: 35, y: 50 },
    mid: { x: 50, y: 50 },
    adc: { x: 75, y: 75 },
    support: { x: 70, y: 70 },
  };
  
  const base = positions[position] || { x: 50, y: 50 };
  
  if (team === 'red') {
    return {
      x: 100 - base.x,
      y: 100 - base.y,
    };
  }
  
  return base;
}

export function generateGoldCurve(match: Match): GoldCurve[] {
  const curve: GoldCurve[] = [];
  const duration = match.stats?.duration || 1200;
  const totalMinutes = Math.ceil(duration / 60);
  
  let blueGold = 2500;
  let redGold = 2500;
  
  const homeScore = match.homeTeam.score;
  const awayScore = match.awayTeam.score;
  const blueAdvantage = homeScore > awayScore ? 1.1 : homeScore < awayScore ? 0.9 : 1;
  
  for (let minute = 0; minute <= totalMinutes; minute++) {
    const blueGrowth = 1800 + Math.random() * 400;
    const redGrowth = 1800 + Math.random() * 400;
    
    blueGold += blueGrowth * blueAdvantage;
    redGold += redGrowth * (2 - blueAdvantage);
    
    curve.push({
      minute,
      blue: Math.floor(blueGold),
      red: Math.floor(redGold),
      difference: Math.floor(blueGold - redGold),
    });
  }
  
  return curve;
}

export function generateLiveStats(match: Match): LiveStats[] {
  const clubStore = useClubStore();
  const heroStore = useHeroStore();
  
  const stats: LiveStats[] = [];
  const duration = match.stats?.duration || 1200;
  const interval = 120;
  
  const homeClub = clubStore.getClub(match.homeTeam.clubId);
  const awayClub = clubStore.getClub(match.awayTeam.clubId);
  
  if (!homeClub || !awayClub) return stats;
  
  for (let time = interval; time <= duration; time += interval) {
    const players: PlayerLiveStats[] = [];
    
    homeClub.roster.forEach((player, index) => {
      const heroId = match.homeTeam.players[index]?.heroId || player.heroPreference.favoriteHeroes[0];
      const hero = heroStore.getHeroById(heroId);
      
      players.push({
        playerId: player.id,
        playerName: player.name,
        team: 'blue',
        position: player.position,
        heroId: heroId,
        heroName: hero?.name || '未知英雄',
        kills: Math.floor(Math.random() * 8),
        deaths: Math.floor(Math.random() * 5),
        assists: Math.floor(Math.random() * 12),
        gold: Math.floor(5000 + Math.random() * 8000),
        damage: Math.floor(10000 + Math.random() * 30000),
        cs: Math.floor(50 + (time / 60) * 8 + Math.random() * 20),
        level: Math.min(18, Math.floor(time / 120) + 1),
        items: [],
        killParticipation: 30 + Math.random() * 40,
        damagePerGold: 0.8 + Math.random() * 0.4,
      });
    });
    
    awayClub.roster.forEach((player, index) => {
      const heroId = match.awayTeam.players[index]?.heroId || player.heroPreference.favoriteHeroes[0];
      const hero = heroStore.getHeroById(heroId);
      
      players.push({
        playerId: player.id,
        playerName: player.name,
        team: 'red',
        position: player.position,
        heroId: heroId,
        heroName: hero?.name || '未知英雄',
        kills: Math.floor(Math.random() * 8),
        deaths: Math.floor(Math.random() * 5),
        assists: Math.floor(Math.random() * 12),
        gold: Math.floor(5000 + Math.random() * 8000),
        damage: Math.floor(10000 + Math.random() * 30000),
        cs: Math.floor(50 + (time / 60) * 8 + Math.random() * 20),
        level: Math.min(18, Math.floor(time / 120) + 1),
        items: [],
        killParticipation: 30 + Math.random() * 40,
        damagePerGold: 0.8 + Math.random() * 0.4,
      });
    });
    
    const bluePlayers = players.filter(p => p.team === 'blue');
    const redPlayers = players.filter(p => p.team === 'red');
    
    stats.push({
      timestamp: time,
      blueTeam: {
        team: 'blue',
        totalKills: bluePlayers.reduce((sum, p) => sum + p.kills, 0),
        totalDeaths: bluePlayers.reduce((sum, p) => sum + p.deaths, 0),
        totalGold: bluePlayers.reduce((sum, p) => sum + p.gold, 0),
        totalDamage: bluePlayers.reduce((sum, p) => sum + p.damage, 0),
        towers: Math.floor(time / 600),
        dragons: Math.floor(time / 900),
        barons: Math.floor(time / 1800),
        inhibitors: Math.floor(time / 1500),
        visionScore: 30 + Math.random() * 20,
      },
      redTeam: {
        team: 'red',
        totalKills: redPlayers.reduce((sum, p) => sum + p.kills, 0),
        totalDeaths: redPlayers.reduce((sum, p) => sum + p.deaths, 0),
        totalGold: redPlayers.reduce((sum, p) => sum + p.gold, 0),
        totalDamage: redPlayers.reduce((sum, p) => sum + p.damage, 0),
        towers: Math.floor(time / 600),
        dragons: Math.floor(time / 900),
        barons: Math.floor(time / 1800),
        inhibitors: Math.floor(time / 1500),
        visionScore: 30 + Math.random() * 20,
      },
      players,
    });
  }
  
  return stats;
}

export function generatePostMatchAnalysis(match: Match): PostMatchAnalysis {
  const clubStore = useClubStore();
  const heroStore = useHeroStore();
  
  const homeClub = clubStore.getClub(match.homeTeam.clubId);
  const awayClub = clubStore.getClub(match.awayTeam.clubId);
  
  if (!homeClub || !awayClub) {
    return {
      heatmaps: [],
      damageBreakdown: [],
      visionControl: [],
      keyFights: [],
      mvp: null,
      turningPoints: [],
      teamComparison: {
        blue: createEmptyMetrics(),
        red: createEmptyMetrics(),
      },
    };
  }
  
  const heatmaps = generateAllHeatmaps(match, homeClub, awayClub);
  const damageBreakdown = generateDamageBreakdown(match, homeClub, awayClub, heroStore);
  const visionControl = generateVisionControl(match, homeClub, awayClub);
  const keyFights = generateKeyFights(match);
  const mvp = selectMVP(match, homeClub, awayClub, heroStore);
  const turningPoints = generateTurningPoints(match);
  const teamComparison = generateTeamComparison(match);
  
  return {
    heatmaps,
    damageBreakdown,
    visionControl,
    keyFights,
    mvp,
    turningPoints,
    teamComparison,
  };
}

function createEmptyMetrics() {
  return {
    earlyGame: 50,
    midGame: 50,
    lateGame: 50,
    teamfight: 50,
    objectiveControl: 50,
    visionControl: 50,
    snowball: 50,
    comeback: 50,
  };
}

export function generateHeatmap(playerId: string, match: Match): PlayerHeatmap {
  const clubStore = useClubStore();
  
  const homeClub = clubStore.getClub(match.homeTeam.clubId);
  const awayClub = clubStore.getClub(match.awayTeam.clubId);
  
  let player: any = null;
  let team: 'blue' | 'red' = 'blue';
  
  if (homeClub) {
    player = homeClub.roster.find(p => p.id === playerId);
    if (player) team = 'blue';
  }
  
  if (!player && awayClub) {
    player = awayClub.roster.find(p => p.id === playerId);
    if (player) team = 'red';
  }
  
  if (!player) {
    return {
      playerId,
      playerName: '未知选手',
      points: [],
      totalEvents: 0,
      hotZones: [],
    };
  }
  
  const points: HeatmapPoint[] = [];
  const eventCount = 20 + Math.floor(Math.random() * 30);
  
  const basePosition = getBasePosition(player.position, team);
  
  for (let i = 0; i < eventCount; i++) {
    const eventTypes: Array<'kill' | 'death' | 'assist' | 'damage' | 'vision'> = 
      ['kill', 'death', 'assist', 'damage', 'vision'];
    
    points.push({
      x: clamp(basePosition.x + (Math.random() - 0.5) * 40, 0, 100),
      y: clamp(basePosition.y + (Math.random() - 0.5) * 40, 0, 100),
      intensity: Math.random(),
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    });
  }
  
  const hotZones = identifyHotZones(points, player.position);
  
  return {
    playerId,
    playerName: player.name,
    points,
    totalEvents: eventCount,
    hotZones,
  };
}

function identifyHotZones(points: HeatmapPoint[], position: string): HeatmapZone[] {
  const zones: HeatmapZone[] = [];
  
  const gridSize = 20;
  const grid: Record<string, number> = {};
  
  points.forEach(point => {
    const gridX = Math.floor(point.x / gridSize);
    const gridY = Math.floor(point.y / gridSize);
    const key = `${gridX},${gridY}`;
    grid[key] = (grid[key] || 0) + point.intensity;
  });
  
  const sortedGrids = Object.entries(grid)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  sortedGrids.forEach(([key, intensity], index) => {
    const [gridX, gridY] = key.split(',').map(Number);
    zones.push({
      name: `${position}热点区域 ${index + 1}`,
      x: gridX * gridSize + gridSize / 2,
      y: gridY * gridSize + gridSize / 2,
      radius: gridSize,
      eventCount: Math.floor(intensity * 10),
      description: `活跃区域，共 ${Math.floor(intensity * 10)} 次事件`,
    });
  });
  
  return zones;
}

function generateAllHeatmaps(match: Match, homeClub: any, awayClub: any): PlayerHeatmap[] {
  const heatmaps: PlayerHeatmap[] = [];
  
  homeClub.roster.forEach((player: any) => {
    heatmaps.push(generateHeatmap(player.id, match));
  });
  
  awayClub.roster.forEach((player: any) => {
    heatmaps.push(generateHeatmap(player.id, match));
  });
  
  return heatmaps;
}

function generateDamageBreakdown(match: Match, homeClub: any, awayClub: any, heroStore: any): DamageBreakdown[] {
  const breakdowns: DamageBreakdown[] = [];
  
  homeClub.roster.forEach((player: any, index: number) => {
    const heroId = match.homeTeam.players[index]?.heroId || player.heroPreference.favoriteHeroes[0];
    const hero = heroStore.getHeroById(heroId);
    
    const totalDamage = 15000 + Math.random() * 35000;
    const physicalRatio = hero?.role === 'marksman' || hero?.role === 'assassin' ? 0.7 : 0.3;
    const magicRatio = hero?.role === 'mage' ? 0.8 : 0.2;
    
    breakdowns.push({
      playerId: player.id,
      playerName: player.name,
      heroName: hero?.name || '未知英雄',
      totalDamage: Math.floor(totalDamage),
      physicalDamage: Math.floor(totalDamage * physicalRatio),
      magicDamage: Math.floor(totalDamage * magicRatio),
      trueDamage: Math.floor(totalDamage * 0.1),
      damageToChampions: Math.floor(totalDamage * 0.6),
      damageToObjectives: Math.floor(totalDamage * 0.3),
      damageTaken: Math.floor(10000 + Math.random() * 20000),
      damageMitigated: Math.floor(5000 + Math.random() * 10000),
    });
  });
  
  awayClub.roster.forEach((player: any, index: number) => {
    const heroId = match.awayTeam.players[index]?.heroId || player.heroPreference.favoriteHeroes[0];
    const hero = heroStore.getHeroById(heroId);
    
    const totalDamage = 15000 + Math.random() * 35000;
    const physicalRatio = hero?.role === 'marksman' || hero?.role === 'assassin' ? 0.7 : 0.3;
    const magicRatio = hero?.role === 'mage' ? 0.8 : 0.2;
    
    breakdowns.push({
      playerId: player.id,
      playerName: player.name,
      heroName: hero?.name || '未知英雄',
      totalDamage: Math.floor(totalDamage),
      physicalDamage: Math.floor(totalDamage * physicalRatio),
      magicDamage: Math.floor(totalDamage * magicRatio),
      trueDamage: Math.floor(totalDamage * 0.1),
      damageToChampions: Math.floor(totalDamage * 0.6),
      damageToObjectives: Math.floor(totalDamage * 0.3),
      damageTaken: Math.floor(10000 + Math.random() * 20000),
      damageMitigated: Math.floor(5000 + Math.random() * 10000),
    });
  });
  
  return breakdowns;
}

function generateVisionControl(match: Match, homeClub: any, awayClub: any): VisionControl[] {
  const visionData: VisionControl[] = [];
  
  homeClub.roster.forEach((player: any) => {
    const isSupport = player.position === 'support';
    visionData.push({
      playerId: player.id,
      playerName: player.name,
      wardsPlaced: isSupport ? 15 + Math.floor(Math.random() * 10) : 5 + Math.floor(Math.random() * 5),
      wardsKilled: isSupport ? 8 + Math.floor(Math.random() * 5) : 2 + Math.floor(Math.random() * 3),
      controlWardsBought: isSupport ? 5 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2),
      visionScore: isSupport ? 50 + Math.random() * 30 : 20 + Math.random() * 15,
      detectedEnemies: Math.floor(Math.random() * 20),
      mapCoverage: isSupport ? 40 + Math.random() * 20 : 15 + Math.random() * 10,
    });
  });
  
  awayClub.roster.forEach((player: any) => {
    const isSupport = player.position === 'support';
    visionData.push({
      playerId: player.id,
      playerName: player.name,
      wardsPlaced: isSupport ? 15 + Math.floor(Math.random() * 10) : 5 + Math.floor(Math.random() * 5),
      wardsKilled: isSupport ? 8 + Math.floor(Math.random() * 5) : 2 + Math.floor(Math.random() * 3),
      controlWardsBought: isSupport ? 5 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2),
      visionScore: isSupport ? 50 + Math.random() * 30 : 20 + Math.random() * 15,
      detectedEnemies: Math.floor(Math.random() * 20),
      mapCoverage: isSupport ? 40 + Math.random() * 20 : 15 + Math.random() * 10,
    });
  });
  
  return visionData;
}

function generateKeyFights(match: Match): KeyFight[] {
  const fights: KeyFight[] = [];
  const duration = match.stats?.duration || 1200;
  const fightCount = 3 + Math.floor(Math.random() * 4);
  
  for (let i = 0; i < fightCount; i++) {
    const timestamp = Math.floor((duration / (fightCount + 1)) * (i + 1));
    const blueKills = Math.floor(Math.random() * 4);
    const redKills = Math.floor(Math.random() * 4);
    
    fights.push({
      id: generateId(),
      timestamp,
      duration: 10 + Math.floor(Math.random() * 30),
      location: randomPosition(),
      participants: {
        blue: ['player1', 'player2', 'player3'].slice(0, 2 + Math.floor(Math.random() * 3)),
        red: ['player6', 'player7', 'player8'].slice(0, 2 + Math.floor(Math.random() * 3)),
      },
      result: blueKills > redKills ? 'blue' : redKills > blueKills ? 'red' : 'blue',
      kills: {
        blue: blueKills,
        red: redKills,
      },
      goldSwing: Math.floor(Math.random() * 3000),
      description: `团战发生在 ${Math.floor(timestamp / 60)} 分钟`,
      impact: ['minor', 'moderate', 'major', 'decisive'][Math.floor(Math.random() * 4)] as any,
    });
  }
  
  return fights.sort((a, b) => a.timestamp - b.timestamp);
}

function selectMVP(match: Match, homeClub: any, awayClub: any, heroStore: any): PlayerLiveStats | null {
  const allPlayers: any[] = [];
  
  homeClub.roster.forEach((player: any, index: number) => {
    const heroId = match.homeTeam.players[index]?.heroId || player.heroPreference.favoriteHeroes[0];
    const hero = heroStore.getHeroById(heroId);
    
    allPlayers.push({
      playerId: player.id,
      playerName: player.name,
      team: 'blue',
      position: player.position,
      heroId: heroId,
      heroName: hero?.name || '未知英雄',
      kills: Math.floor(Math.random() * 10),
      deaths: Math.floor(Math.random() * 5),
      assists: Math.floor(Math.random() * 15),
      gold: Math.floor(10000 + Math.random() * 10000),
      damage: Math.floor(20000 + Math.random() * 30000),
      cs: Math.floor(150 + Math.random() * 100),
      level: 18,
      items: [],
      killParticipation: 40 + Math.random() * 40,
      damagePerGold: 0.8 + Math.random() * 0.4,
    });
  });
  
  awayClub.roster.forEach((player: any, index: number) => {
    const heroId = match.awayTeam.players[index]?.heroId || player.heroPreference.favoriteHeroes[0];
    const hero = heroStore.getHeroById(heroId);
    
    allPlayers.push({
      playerId: player.id,
      playerName: player.name,
      team: 'red',
      position: player.position,
      heroId: heroId,
      heroName: hero?.name || '未知英雄',
      kills: Math.floor(Math.random() * 10),
      deaths: Math.floor(Math.random() * 5),
      assists: Math.floor(Math.random() * 15),
      gold: Math.floor(10000 + Math.random() * 10000),
      damage: Math.floor(20000 + Math.random() * 30000),
      cs: Math.floor(150 + Math.random() * 100),
      level: 18,
      items: [],
      killParticipation: 40 + Math.random() * 40,
      damagePerGold: 0.8 + Math.random() * 0.4,
    });
  });
  
  allPlayers.sort((a, b) => {
    const scoreA = a.kills * 3 + a.assists - a.deaths * 2 + a.damage / 10000;
    const scoreB = b.kills * 3 + b.assists - b.deaths * 2 + b.damage / 10000;
    return scoreB - scoreA;
  });
  
  return allPlayers[0] || null;
}

function generateTurningPoints(match: Match): TurningPoint[] {
  const points: TurningPoint[] = [];
  const duration = match.stats?.duration || 1200;
  
  const types: Array<'objective' | 'teamfight' | 'pick' | 'baron' | 'dragon'> = 
    ['objective', 'teamfight', 'pick', 'baron', 'dragon'];
  
  const pointCount = 2 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < pointCount; i++) {
    const timestamp = Math.floor((duration / (pointCount + 1)) * (i + 1));
    
    points.push({
      timestamp,
      type: types[Math.floor(Math.random() * types.length)],
      description: `转折点发生在 ${Math.floor(timestamp / 60)} 分钟`,
      goldSwing: Math.floor(Math.random() * 5000) - 2500,
      momentumShift: Math.random() * 2 - 1,
    });
  }
  
  return points.sort((a, b) => a.timestamp - b.timestamp);
}

function generateTeamComparison(match: Match): TeamComparison {
  const homeScore = match.homeTeam.score;
  const awayScore = match.awayTeam.score;
  const blueAdvantage = homeScore > awayScore ? 10 : homeScore < awayScore ? -10 : 0;
  
  return {
    blue: {
      earlyGame: 50 + blueAdvantage + Math.random() * 20 - 10,
      midGame: 50 + blueAdvantage + Math.random() * 20 - 10,
      lateGame: 50 + blueAdvantage + Math.random() * 20 - 10,
      teamfight: 50 + blueAdvantage + Math.random() * 20 - 10,
      objectiveControl: 50 + blueAdvantage + Math.random() * 20 - 10,
      visionControl: 50 + blueAdvantage + Math.random() * 20 - 10,
      snowball: 50 + blueAdvantage + Math.random() * 20 - 10,
      comeback: 50 - blueAdvantage + Math.random() * 20 - 10,
    },
    red: {
      earlyGame: 50 - blueAdvantage + Math.random() * 20 - 10,
      midGame: 50 - blueAdvantage + Math.random() * 20 - 10,
      lateGame: 50 - blueAdvantage + Math.random() * 20 - 10,
      teamfight: 50 - blueAdvantage + Math.random() * 20 - 10,
      objectiveControl: 50 - blueAdvantage + Math.random() * 20 - 10,
      visionControl: 50 - blueAdvantage + Math.random() * 20 - 10,
      snowball: 50 - blueAdvantage + Math.random() * 20 - 10,
      comeback: 50 + blueAdvantage + Math.random() * 20 - 10,
    },
  };
}

export function generateMatchVisualization(match: Match): MatchVisualization {
  return {
    matchId: match.id,
    minimap: generateMinimapData(match),
    goldCurve: generateGoldCurve(match),
    liveStats: generateLiveStats(match),
    postMatch: generatePostMatchAnalysis(match),
    duration: match.stats?.duration || 1200,
    winner: match.result === 'win' ? 'blue' : 'red',
  };
}
