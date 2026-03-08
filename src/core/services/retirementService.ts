import type {
  Retirement,
  RetirementType,
  RetirementReason,
  RetirementCeremony,
  PostCareer,
  Legacy,
  CareerHighlight,
  RetirementStats,
  HallOfFameMember,
  ClubHallOfFame,
  RetirementEligibility,
  RetirementCeremonyOptions,
  PostCareerPath,
  Legend,
} from '@/types/retirement';
import {
  DEFAULT_LEGACY,
  DEFAULT_RETIREMENT_CEREMONY,
  HALL_OF_FAME_REQUIREMENTS,
  RETIRED_NUMBER_REQUIREMENTS,
} from '@/types/retirement';
import { useRetirementStore } from '@/stores/retirement';
import { usePlayerStore } from '@/stores/player';
import { useClubStore } from '@/stores/club';

function generateId(): string {
  return `ret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function checkRetirementEligibility(playerId: string): RetirementEligibility {
  const playerStore = usePlayerStore();
  const player = playerStore.getPlayer(playerId);

  if (!player) {
    return {
      eligible: false,
      reasons: ['选手不存在'],
      recommendations: [],
      suggestedType: 'voluntary',
    };
  }

  const reasons: string[] = [];
  const recommendations: string[] = [];
  let suggestedType: RetirementType = 'voluntary';

  if (player.age >= 28) {
    reasons.push(`年龄已达到${player.age}岁，接近职业选手退役年龄`);
    suggestedType = 'advised';
  }

  if (player.age >= 30) {
    reasons.push(`年龄已达到${player.age}岁，建议考虑退役`);
    suggestedType = 'forced';
  }

  if (player.condition && player.condition.injury > 50) {
    reasons.push('伤病情况严重，影响竞技状态');
    suggestedType = 'advised';
  }

  const avgStats = player.getAverageStats ? player.getAverageStats() : 50;
  if (avgStats < 50) {
    reasons.push('整体实力下滑明显');
    recommendations.push('建议退役或转型其他角色');
  }

  if (player.careerStats && player.careerStats.winRate < 40) {
    reasons.push('近期胜率较低');
    recommendations.push('可以考虑退役或休息调整');
  }

  if (reasons.length === 0) {
    recommendations.push('选手状态良好，可继续职业生涯');
  }

  return {
    eligible: true,
    reasons,
    recommendations,
    suggestedType,
  };
}

export function initiateRetirement(
  playerId: string,
  type: RetirementType,
  reason?: RetirementReason
): Retirement {
  const playerStore = usePlayerStore();
  const retirementStore = useRetirementStore();
  const player = playerStore.getPlayer(playerId);

  if (!player) {
    throw new Error(`Player not found: ${playerId}`);
  }

  const defaultReason: RetirementReason = reason || {
    primary: type === 'forced' ? 'performance' : type === 'advised' ? 'age' : 'personal',
    details: getDefaultReasonDescription(type),
  };

  const stats = calculateRetirementStats(player);
  const highlights = extractCareerHighlights(player);

  const retirement: Retirement = {
    id: generateId(),
    playerId,
    playerName: player.name,
    type,
    reason: defaultReason,
    ceremony: { ...DEFAULT_RETIREMENT_CEREMONY },
    postCareer: {
      path: 'retired',
      details: '',
    },
    legacy: { ...DEFAULT_LEGACY },
    careerHighlights: highlights,
    stats,
    retiredAt: new Date(),
    createdAt: new Date(),
  };

  retirementStore.addRetirement(retirement);
  playerStore.removePlayer(playerId);

  return retirement;
}

function getDefaultReasonDescription(type: RetirementType): string {
  const descriptions: Record<RetirementType, string> = {
    voluntary: '选手个人决定退役',
    advised: '俱乐部建议退役',
    forced: '俱乐部强制退役',
  };
  return descriptions[type];
}

function calculateRetirementStats(player: any): RetirementStats {
  const careerStats = player.careerStats || {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    mvpCount: 0,
  };

  const clubHistory = player.clubHistory || [];
  const yearsActive = clubHistory.length > 0
    ? Math.max(1, Math.floor(
        (Date.now() - new Date(clubHistory[0].joinDate).getTime()) / (365 * 24 * 60 * 60 * 1000)
      ))
    : 1;

  return {
    totalMatches: careerStats.totalMatches || 0,
    wins: careerStats.wins || 0,
    losses: careerStats.losses || 0,
    winRate: careerStats.winRate || 0,
    mvpCount: careerStats.mvpCount || 0,
    championships: player.honors?.filter((h: any) => h.type === 'champion').length || 0,
    yearsActive,
    clubsPlayed: clubHistory.length || 1,
  };
}

function extractCareerHighlights(player: any): CareerHighlight[] {
  const highlights: CareerHighlight[] = [];

  if (player.honors) {
    for (const honor of player.honors) {
      if (honor.type === 'champion') {
        highlights.push({
          type: 'championship',
          title: '冠军荣誉',
          description: honor.description || '获得冠军',
          date: honor.date || new Date(),
        });
      } else if (honor.type === 'mvp') {
        highlights.push({
          type: 'mvp',
          title: 'MVP奖项',
          description: honor.description || '获得MVP',
          date: honor.date || new Date(),
        });
      }
    }
  }

  if (player.careerStats) {
    if (player.careerStats.totalMatches >= 100) {
      highlights.push({
        type: 'milestone',
        title: '百场里程碑',
        description: `职业生涯共出场${player.careerStats.totalMatches}场比赛`,
        date: new Date(),
      });
    }

    if (player.careerStats.winRate >= 70) {
      highlights.push({
        type: 'achievement',
        title: '高胜率成就',
        description: `职业生涯胜率达到${player.careerStats.winRate}%`,
        date: new Date(),
      });
    }
  }

  return highlights;
}

export function planCeremony(
  playerId: string,
  ceremony: RetirementCeremony
): { success: boolean; cost: number; fanImpact: number } {
  const retirementStore = useRetirementStore();
  const retirement = retirementStore.getRetirementByPlayerId(playerId);

  if (!retirement) {
    return { success: false, cost: 0, fanImpact: 0 };
  }

  let totalCost = 0;
  let totalFanImpact = 0;

  if (ceremony.farewellMatch) {
    totalCost += 50;
    totalFanImpact += 15;
  }

  if (ceremony.fanEvent) {
    totalCost += 30;
    totalFanImpact += 10;
  }

  if (ceremony.hallOfFame) {
    const eligibility = checkHallOfFameEligibility(playerId);
    if (!eligibility.eligible) {
      ceremony.hallOfFame = false;
    } else {
      totalFanImpact += 25;
    }
  }

  if (ceremony.retiredNumber) {
    const eligibility = checkRetiredNumberEligibility(playerId);
    if (!eligibility.eligible) {
      ceremony.retiredNumber = false;
    } else {
      totalFanImpact += 20;
    }
  }

  retirementStore.updateCeremony(playerId, ceremony);

  return { success: true, cost: totalCost, fanImpact: totalFanImpact };
}

export function selectPostCareer(
  playerId: string,
  path: PostCareerPath
): PostCareer {
  const retirementStore = useRetirementStore();
  const retirement = retirementStore.getRetirementByPlayerId(playerId);

  if (!retirement) {
    throw new Error(`Retirement not found for player: ${playerId}`);
  }

  const details = getPostCareerDetails(path, retirement);

  const postCareer: PostCareer = {
    path,
    details,
  };

  retirementStore.updatePostCareer(playerId, postCareer);

  return postCareer;
}

function getPostCareerDetails(path: PostCareerPath, retirement: Retirement): string {
  const descriptions: Record<PostCareerPath, string> = {
    coach: `${retirement.playerName}将转型成为战队主教练，继续为俱乐部贡献力量`,
    analyst: `${retirement.playerName}将担任数据分析师，用丰富的比赛经验帮助队伍`,
    streamer: `${retirement.playerName}将成为主播/解说，继续活跃在电竞圈`,
    manager: `${retirement.playerName}将转型成为战队经理，管理队伍日常事务`,
    retired: `${retirement.playerName}选择完全退役，开启人生新篇章`,
    youth_coach: `${retirement.playerName}将成为青训教练，培养下一代选手`,
  };
  return descriptions[path];
}

export function transferLegacy(
  playerId: string,
  successorId: string
): Legacy {
  const retirementStore = useRetirementStore();
  const playerStore = usePlayerStore();

  const retirement = retirementStore.getRetirementByPlayerId(playerId);
  const successor = playerStore.getPlayer(successorId);

  if (!retirement) {
    throw new Error(`Retirement not found for player: ${playerId}`);
  }

  if (!successor) {
    throw new Error(`Successor not found: ${successorId}`);
  }

  const transferRate = 0.15;

  const legacy: Legacy = {
    successorId,
    successorName: successor.name,
    attributesTransferred: {
      mechanics: Math.round(retirement.stats.winRate * transferRate * 0.5),
      awareness: Math.round(retirement.stats.winRate * transferRate * 0.6),
      mentality: Math.round(retirement.stats.mvpCount * transferRate),
      teamwork: Math.round(retirement.stats.championships * 5 * transferRate),
    },
    heroProficiencyTransferred: retirement.careerHighlights
      .filter(h => h.type === 'achievement')
      .map(h => h.title)
      .slice(0, 3),
    captaincyTransferred: retirement.stats.championships >= 1,
    numberRetired: retirement.ceremony.retiredNumber,
    jerseyNumber: retirement.ceremony.retiredNumber ? Math.floor(Math.random() * 99) + 1 : undefined,
  };

  if (successor.stats) {
    successor.stats.mechanics = clamp(
      successor.stats.mechanics + legacy.attributesTransferred.mechanics,
      0,
      100
    );
    successor.stats.awareness = clamp(
      successor.stats.awareness + legacy.attributesTransferred.awareness,
      0,
      100
    );
    successor.stats.mentality = clamp(
      successor.stats.mentality + legacy.attributesTransferred.mentality,
      0,
      100
    );
    successor.stats.teamwork = clamp(
      successor.stats.teamwork + legacy.attributesTransferred.teamwork,
      0,
      100
    );
  }

  retirementStore.updateLegacy(playerId, legacy);

  return legacy;
}

export function addToHallOfFame(playerId: string): HallOfFameMember | null {
  const retirementStore = useRetirementStore();
  const playerStore = usePlayerStore();

  const retirement = retirementStore.getRetirementByPlayerId(playerId);

  if (!retirement) {
    return null;
  }

  const eligibility = checkHallOfFameEligibility(playerId);
  if (!eligibility.eligible) {
    return null;
  }

  const player = playerStore.getPlayer(playerId);

  const member: HallOfFameMember = {
    id: generateId(),
    playerId,
    playerName: retirement.playerName,
    position: player?.position || 'unknown',
    inductionDate: new Date(),
    careerStats: retirement.stats,
    highlights: retirement.careerHighlights,
    retiredNumber: retirement.ceremony.retiredNumber ? retirement.legacy.jerseyNumber : undefined,
    legacy: retirement.legacy,
    biography: generateBiography(retirement),
  };

  retirementStore.addHallOfFameMember(member);

  return member;
}

function generateBiography(retirement: Retirement): string {
  const parts: string[] = [];

  parts.push(`${retirement.playerName}，职业生涯共${retirement.stats.yearsActive}年，`);

  if (retirement.stats.championships > 0) {
    parts.push(`获得${retirement.stats.championships}次冠军，`);
  }

  parts.push(`出战${retirement.stats.totalMatches}场比赛，`);
  parts.push(`胜率${retirement.stats.winRate}%，`);

  if (retirement.stats.mvpCount > 0) {
    parts.push(`${retirement.stats.mvpCount}次获得MVP。`);
  }

  if (retirement.careerHighlights.length > 0) {
    const highlightTitles = retirement.careerHighlights.slice(0, 3).map(h => h.title);
    parts.push(`主要成就：${highlightTitles.join('、')}。`);
  }

  return parts.join('');
}

export function checkHallOfFameEligibility(playerId: string): {
  eligible: boolean;
  requirements: string[];
} {
  const retirementStore = useRetirementStore();
  const retirement = retirementStore.getRetirementByPlayerId(playerId);

  if (!retirement) {
    return { eligible: false, requirements: ['未找到退役记录'] };
  }

  const requirements: string[] = [];
  let eligible = true;

  if (retirement.stats.yearsActive < HALL_OF_FAME_REQUIREMENTS.minYearsActive) {
    requirements.push(`需要至少${HALL_OF_FAME_REQUIREMENTS.minYearsActive}年职业生涯`);
    eligible = false;
  }

  if (retirement.stats.winRate < HALL_OF_FAME_REQUIREMENTS.minWinRate) {
    requirements.push(`胜率需要达到${HALL_OF_FAME_REQUIREMENTS.minWinRate}%`);
    eligible = false;
  }

  if (retirement.stats.championships < HALL_OF_FAME_REQUIREMENTS.minChampionships) {
    requirements.push(`需要至少${HALL_OF_FAME_REQUIREMENTS.minChampionships}次冠军`);
    eligible = false;
  }

  if (retirement.stats.mvpCount < HALL_OF_FAME_REQUIREMENTS.minMvpCount) {
    requirements.push(`需要至少${HALL_OF_FAME_REQUIREMENTS.minMvpCount}次MVP`);
    eligible = false;
  }

  return { eligible, requirements };
}

export function checkRetiredNumberEligibility(playerId: string): {
  eligible: boolean;
  requirements: string[];
} {
  const retirementStore = useRetirementStore();
  const retirement = retirementStore.getRetirementByPlayerId(playerId);

  if (!retirement) {
    return { eligible: false, requirements: ['未找到退役记录'] };
  }

  const requirements: string[] = [];
  let eligible = true;

  if (retirement.stats.yearsActive < RETIRED_NUMBER_REQUIREMENTS.minYearsAtClub) {
    requirements.push(`需要在俱乐部效力至少${RETIRED_NUMBER_REQUIREMENTS.minYearsAtClub}年`);
    eligible = false;
  }

  if (retirement.stats.championships < RETIRED_NUMBER_REQUIREMENTS.minChampionships) {
    requirements.push(`需要至少${RETIRED_NUMBER_REQUIREMENTS.minChampionships}次冠军`);
    eligible = false;
  }

  const isLegendary = retirement.careerHighlights.some(
    h => h.type === 'championship' && retirement.stats.mvpCount >= 10
  );

  if (!isLegendary) {
    requirements.push('需要传奇级别的成就');
    eligible = false;
  }

  return { eligible, requirements };
}

export function getCeremonyOptions(playerId: string): RetirementCeremonyOptions {
  const hallOfFameEligibility = checkHallOfFameEligibility(playerId);
  const retiredNumberEligibility = checkRetiredNumberEligibility(playerId);

  return {
    farewellMatch: {
      available: true,
      cost: 50,
      fanImpact: 15,
    },
    fanEvent: {
      available: true,
      cost: 30,
      fanImpact: 10,
    },
    hallOfFame: {
      eligible: hallOfFameEligibility.eligible,
      requirements: hallOfFameEligibility.requirements,
    },
    retiredNumber: {
      eligible: retiredNumberEligibility.eligible,
      requirements: retiredNumberEligibility.requirements,
    },
  };
}

export function createLegend(
  playerId: string,
  title: string,
  description: string
): Legend | null {
  const retirementStore = useRetirementStore();
  const retirement = retirementStore.getRetirementByPlayerId(playerId);

  if (!retirement) {
    return null;
  }

  let impact: Legend['impact'] = 'notable';
  if (retirement.stats.championships >= 3 && retirement.stats.mvpCount >= 10) {
    impact = 'legendary';
  } else if (retirement.stats.championships >= 2 || retirement.stats.mvpCount >= 5) {
    impact = 'great';
  }

  const era = `${retirement.stats.yearsActive}年职业生涯`;

  const achievements: string[] = [];
  if (retirement.stats.championships > 0) {
    achievements.push(`${retirement.stats.championships}次冠军`);
  }
  if (retirement.stats.mvpCount > 0) {
    achievements.push(`${retirement.stats.mvpCount}次MVP`);
  }
  achievements.push(`胜率${retirement.stats.winRate}%`);

  const legend: Legend = {
    id: generateId(),
    playerId,
    playerName: retirement.playerName,
    title,
    description,
    era,
    achievements,
    impact,
  };

  retirementStore.addLegend(legend);

  return legend;
}

export function getRetirementSummary(playerId: string): string {
  const retirementStore = useRetirementStore();
  const retirement = retirementStore.getRetirementByPlayerId(playerId);

  if (!retirement) {
    return '未找到退役记录';
  }

  const summary = [
    `${retirement.playerName}的职业生涯总结：`,
    `- 退役类型：${retirement.type === 'voluntary' ? '自愿退役' : retirement.type === 'advised' ? '建议退役' : '强制退役'}`,
    `- 退役原因：${retirement.reason.details}`,
    `- 职业生涯：${retirement.stats.yearsActive}年`,
    `- 出场次数：${retirement.stats.totalMatches}场`,
    `- 胜率：${retirement.stats.winRate}%`,
    `- 冠军数：${retirement.stats.championships}次`,
    `- MVP次数：${retirement.stats.mvpCount}次`,
    `- 退役后发展：${getPostCareerPathName(retirement.postCareer.path)}`,
  ];

  if (retirement.legacy.successorName) {
    summary.push(`- 传承给：${retirement.legacy.successorName}`);
  }

  return summary.join('\n');
}

function getPostCareerPathName(path: PostCareerPath): string {
  const names: Record<PostCareerPath, string> = {
    coach: '主教练',
    analyst: '数据分析师',
    streamer: '主播/解说',
    manager: '战队经理',
    retired: '完全退役',
    youth_coach: '青训教练',
  };
  return names[path];
}

export function calculateRetirementImpact(playerId: string): {
  teamMorale: number;
  fanSentiment: number;
  reputation: number;
} {
  const retirementStore = useRetirementStore();
  const retirement = retirementStore.getRetirementByPlayerId(playerId);

  if (!retirement) {
    return { teamMorale: 0, fanSentiment: 0, reputation: 0 };
  }

  let teamMorale = -10;
  let fanSentiment = -5;
  let reputation = 0;

  if (retirement.type === 'voluntary') {
    teamMorale = -5;
    fanSentiment = 0;
  } else if (retirement.type === 'forced') {
    teamMorale = -20;
    fanSentiment = -15;
    reputation = -10;
  }

  if (retirement.ceremony.farewellMatch) {
    teamMorale += 5;
    fanSentiment += 10;
  }

  if (retirement.ceremony.fanEvent) {
    fanSentiment += 8;
  }

  if (retirement.ceremony.hallOfFame) {
    teamMorale += 3;
    fanSentiment += 5;
    reputation += 10;
  }

  if (retirement.ceremony.retiredNumber) {
    fanSentiment += 10;
    reputation += 15;
  }

  if (retirement.legacy.successorId) {
    teamMorale += 5;
    fanSentiment += 3;
  }

  return { teamMorale, fanSentiment, reputation };
}
