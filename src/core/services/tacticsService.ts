import type {
  Tactics,
  FormationType,
  TacticalStyle,
  PacePreference,
  BPStrategy,
  VersionUnderstanding,
  BPRecommendation,
  TacticalAnalysis,
  MetaHero,
  MetaComposition,
  InGameCommand,
} from '@/types/tactics';
import {
  DEFAULT_BP_STRATEGY,
  DEFAULT_IN_GAME_COMMANDS,
  FORMATION_BONUSES,
  STYLE_BONUSES,
} from '@/types/tactics';
import { useTacticsStore } from '@/stores/tactics';
import { useClubStore } from '@/stores/club';
import { useCoachStore } from '@/stores/coach';
import { useHeroStore } from '@/stores/hero';
import { useVersionStore } from '@/stores/version';
import { calculateBPBonus } from '@/core/services/coachService';

function generateId(): string {
  return `tactics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function initializeTactics(clubId: string): Tactics {
  const tacticsStore = useTacticsStore();
  
  const existingTactics = tacticsStore.getTactics(clubId);
  if (existingTactics) {
    return existingTactics;
  }
  
  const tactics: Tactics = {
    id: generateId(),
    clubId,
    formation: 'balanced',
    style: 'balanced',
    pace: 'mid-game',
    corePlayer: null,
    bpStrategy: { ...DEFAULT_BP_STRATEGY },
    inGameCommands: [...DEFAULT_IN_GAME_COMMANDS.map(cmd => ({ ...cmd }))],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  tacticsStore.setTactics(clubId, tactics);
  
  return tactics;
}

export function setFormation(clubId: string, formation: FormationType): { success: boolean; message: string } {
  const tacticsStore = useTacticsStore();
  const tactics = tacticsStore.getTactics(clubId);
  
  if (!tactics) {
    return { success: false, message: '战术配置不存在' };
  }
  
  tactics.formation = formation;
  tactics.updatedAt = new Date();
  
  tacticsStore.setTactics(clubId, tactics);
  
  return { success: true, message: `阵容体系已设置为 ${formation}` };
}

export function setStyle(clubId: string, style: TacticalStyle): { success: boolean; message: string } {
  const tacticsStore = useTacticsStore();
  const tactics = tacticsStore.getTactics(clubId);
  
  if (!tactics) {
    return { success: false, message: '战术配置不存在' };
  }
  
  tactics.style = style;
  tactics.updatedAt = new Date();
  
  tacticsStore.setTactics(clubId, tactics);
  
  return { success: true, message: `战术风格已设置为 ${style}` };
}

export function setPace(clubId: string, pace: PacePreference): { success: boolean; message: string } {
  const tacticsStore = useTacticsStore();
  const tactics = tacticsStore.getTactics(clubId);
  
  if (!tactics) {
    return { success: false, message: '战术配置不存在' };
  }
  
  tactics.pace = pace;
  tactics.updatedAt = new Date();
  
  tacticsStore.setTactics(clubId, tactics);
  
  return { success: true, message: `节奏偏好已设置为 ${pace}` };
}

export function setCorePlayer(clubId: string, playerId: string | null): { success: boolean; message: string } {
  const tacticsStore = useTacticsStore();
  const clubStore = useClubStore();
  const tactics = tacticsStore.getTactics(clubId);
  
  if (!tactics) {
    return { success: false, message: '战术配置不存在' };
  }
  
  if (playerId) {
    const club = clubStore.getClub(clubId);
    if (!club) {
      return { success: false, message: '俱乐部不存在' };
    }
    
    const player = club.roster.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: '选手不存在' };
    }
  }
  
  tactics.corePlayer = playerId;
  tactics.updatedAt = new Date();
  
  tacticsStore.setTactics(clubId, tactics);
  
  return { success: true, message: playerId ? '核心选手已设置' : '已取消核心选手设置' };
}

export function calculateBPBonusForClub(clubId: string): number {
  const tacticsStore = useTacticsStore();
  const coachStore = useCoachStore();
  
  const tactics = tacticsStore.getTactics(clubId);
  const staff = coachStore.getCoachingStaff(clubId);
  
  let totalBonus = 0;
  
  const coachBPBonus = calculateBPBonus(staff.headCoach);
  totalBonus += coachBPBonus.bonus;
  
  if (tactics) {
    const formationBonus = FORMATION_BONUSES[tactics.formation];
    if (formationBonus) {
      totalBonus += (formationBonus.coordination || 0) * 0.005;
    }
    
    const styleBonus = STYLE_BONUSES[tactics.style];
    if (styleBonus) {
      totalBonus += (styleBonus.focus || 0) * 0.005;
    }
  }
  
  return Math.min(0.3, totalBonus);
}

export function generateBPRecommendation(
  clubId: string,
  opponentId?: string
): BPRecommendation[] {
  const tacticsStore = useTacticsStore();
  const heroStore = useHeroStore();
  const clubStore = useClubStore();
  const versionStore = useVersionStore();
  
  const recommendations: BPRecommendation[] = [];
  const tactics = tacticsStore.getTactics(clubId);
  const club = clubStore.getClub(clubId);
  const versionUnderstanding = tacticsStore.getVersionUnderstanding(clubId);
  
  if (!club) return recommendations;
  
  const heroes = heroStore.allHeroes;
  const bpBonus = calculateBPBonusForClub(clubId);
  
  const metaHeroes = versionUnderstanding?.metaHeroes || [];
  const metaHeroIds = new Set(metaHeroes.map(h => h.heroId));
  
  const priorityHeroes: { heroId: string; score: number; reason: string }[] = [];
  
  heroes.forEach(hero => {
    let score = 50;
    let reason = '';
    
    if (metaHeroIds.has(hero.id)) {
      const metaHero = metaHeroes.find(h => h.heroId === hero.id);
      if (metaHero) {
        score += metaHero.tier === 'S' ? 30 : metaHero.tier === 'A' ? 20 : 10;
        reason = `版本强势英雄 (T${metaHero.tier})`;
      }
    }
    
    if (tactics) {
      if (tactics.formation === 'four-protect-one' && hero.role === 'marksman') {
        score += 15;
        reason = reason || '四保一阵容核心';
      } else if (tactics.formation === 'jungle-core' && hero.role === 'assassin') {
        score += 15;
        reason = reason || '野核体系核心';
      } else if (tactics.formation === 'global' && hero.tags.includes('global')) {
        score += 20;
        reason = reason || '全球流核心';
      }
    }
    
    club.roster.forEach(player => {
      if (player.heroPreference.favoriteHeroes.includes(hero.id)) {
        score += 10;
        reason = reason || `${player.name} 常用英雄`;
      }
    });
    
    score += bpBonus * 100;
    
    if (score > 60) {
      priorityHeroes.push({ heroId: hero.id, score, reason });
    }
  });
  
  priorityHeroes.sort((a, b) => b.score - a.score);
  
  priorityHeroes.slice(0, 5).forEach((item, index) => {
    const hero = heroes.find(h => h.id === item.heroId);
    if (hero) {
      recommendations.push({
        phase: 'pick',
        priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
        heroId: hero.id,
        heroName: hero.name,
        reason: item.reason,
        expectedWinRate: Math.min(70, 50 + item.score * 0.2),
        counterOptions: getCounterHeroes(hero.id, heroes),
      });
    }
  });
  
  const banTargets = metaHeroes
    .filter(h => h.tier === 'S' || h.banRate > 50)
    .slice(0, 3);
  
  banTargets.forEach(metaHero => {
    const hero = heroes.find(h => h.id === metaHero.heroId);
    if (hero) {
      recommendations.push({
        phase: 'ban',
        priority: metaHero.tier === 'S' ? 'high' : 'medium',
        heroId: hero.id,
        heroName: hero.name,
        reason: `版本强势 (胜率${metaHero.winRate.toFixed(1)}%)`,
        expectedWinRate: 0,
        counterOptions: [],
      });
    }
  });
  
  return recommendations;
}

function getCounterHeroes(heroId: string, heroes: any[]): string[] {
  return heroes
    .filter(h => h.id !== heroId)
    .slice(0, 3)
    .map(h => h.name);
}

export function updateVersionUnderstanding(clubId: string): VersionUnderstanding {
  const tacticsStore = useTacticsStore();
  const heroStore = useHeroStore();
  const versionStore = useVersionStore();
  const coachStore = useCoachStore();
  
  const staff = coachStore.getCoachingStaff(clubId);
  const existingUnderstanding = tacticsStore.getVersionUnderstanding(clubId);
  
  const analysisBonus = staff.headCoach?.abilities.analysis || 50;
  const analystBonus = staff.analysts.reduce((sum, a) => sum + a.abilities.analysis, 0) * 0.1;
  
  let understandingLevel = existingUnderstanding?.understandingLevel || 0;
  understandingLevel = Math.min(100, understandingLevel + 5 + analysisBonus * 0.1 + analystBonus);
  
  const heroes = heroStore.allHeroes;
  const metaHeroes: MetaHero[] = heroes
    .filter(h => h.tier <= 2)
    .map(h => ({
      heroId: h.id,
      heroName: h.name,
      tier: h.tier === 0 ? 'S' : h.tier === 1 ? 'A' : 'B' as const,
      winRate: 50 + Math.random() * 10 - 5,
      pickRate: 20 + Math.random() * 30,
      banRate: 10 + Math.random() * 20,
      positions: [h.role],
    }));
  
  const metaCompositions: MetaComposition[] = [
    {
      id: 'comp_1',
      name: '四保一阵容',
      description: '以ADC为核心的后期团战阵容',
      heroes: [],
      winRate: 52 + Math.random() * 5,
      counterBy: ['mid-jungle'],
      strongAgainst: ['defensive'],
    },
    {
      id: 'comp_2',
      name: '中野联动阵容',
      description: '前期节奏压制阵容',
      heroes: [],
      winRate: 51 + Math.random() * 5,
      counterBy: ['defensive'],
      strongAgainst: ['four-protect-one'],
    },
  ];
  
  const bonuses = {
    heroMastery: understandingLevel * 0.15,
    compositionBonus: understandingLevel * 0.1,
    counterBonus: understandingLevel * 0.08,
    adaptationBonus: understandingLevel * 0.05,
  };
  
  const versionUnderstanding: VersionUnderstanding = {
    currentVersion: versionStore.versionNumber,
    understandingLevel,
    metaHeroes,
    metaCompositions,
    bonuses,
    lastUpdated: new Date(),
    researchProgress: Math.min(100, understandingLevel),
  };
  
  tacticsStore.setVersionUnderstanding(clubId, versionUnderstanding);
  
  return versionUnderstanding;
}

export function analyzeOpponent(opponentId: string): TacticalAnalysis {
  const clubStore = useClubStore();
  const tacticsStore = useTacticsStore();
  
  const opponentClub = clubStore.getClub(opponentId);
  if (!opponentClub) {
    return {
      opponentFormation: null,
      opponentStyle: null,
      predictedCorePlayer: null,
      predictedPicks: [],
      weaknesses: [],
      recommendations: [],
    };
  }
  
  const opponentTactics = tacticsStore.getTactics(opponentId);
  
  let predictedCorePlayer: string | null = null;
  let opponentFormation: FormationType | null = null;
  let opponentStyle: TacticalStyle | null = null;
  
  if (opponentTactics) {
    predictedCorePlayer = opponentTactics.corePlayer;
    opponentFormation = opponentTactics.formation;
    opponentStyle = opponentTactics.style;
  } else {
    const roster = opponentClub.roster;
    const adcPlayer = roster.find(p => p.position === 'adc');
    const midPlayer = roster.find(p => p.position === 'mid');
    const junglePlayer = roster.find(p => p.position === 'jungle');
    
    const adcPower = adcPlayer?.getTotalPower() || 0;
    const midPower = midPlayer?.getTotalPower() || 0;
    const junglePower = junglePlayer?.getTotalPower() || 0;
    
    if (adcPower >= midPower && adcPower >= junglePower) {
      predictedCorePlayer = adcPlayer?.id || null;
      opponentFormation = 'four-protect-one';
    } else if (junglePower >= midPower) {
      predictedCorePlayer = junglePlayer?.id || null;
      opponentFormation = 'jungle-core';
    } else {
      predictedCorePlayer = midPlayer?.id || null;
      opponentFormation = 'mid-jungle';
    }
    
    opponentStyle = 'balanced';
  }
  
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  
  if (opponentFormation === 'four-protect-one') {
    weaknesses.push('前期节奏较慢');
    weaknesses.push('核心发育期脆弱');
    recommendations.push('前期入侵野区压制');
    recommendations.push('针对核心选手进行BP');
  } else if (opponentFormation === 'jungle-core') {
    weaknesses.push('后期团战能力较弱');
    weaknesses.push('依赖打野节奏');
    recommendations.push('保护己方野区资源');
    recommendations.push('拖入后期团战');
  } else if (opponentFormation === 'mid-jungle') {
    weaknesses.push('下路可能被忽视');
    weaknesses.push('容错率较低');
    recommendations.push('针对下路进行突破');
    recommendations.push('稳健运营避免失误');
  }
  
  const predictedPicks: string[] = [];
  if (predictedCorePlayer) {
    const corePlayer = opponentClub.roster.find(p => p.id === predictedCorePlayer);
    if (corePlayer) {
      predictedPicks.push(...corePlayer.heroPreference.favoriteHeroes.slice(0, 3));
    }
  }
  
  return {
    opponentFormation,
    opponentStyle,
    predictedCorePlayer,
    predictedPicks,
    weaknesses,
    recommendations,
  };
}

export function updateBPStrategy(
  clubId: string,
  strategy: Partial<BPStrategy>
): { success: boolean; message: string } {
  const tacticsStore = useTacticsStore();
  const tactics = tacticsStore.getTactics(clubId);
  
  if (!tactics) {
    return { success: false, message: '战术配置不存在' };
  }
  
  tactics.bpStrategy = {
    ...tactics.bpStrategy,
    ...strategy,
  };
  tactics.updatedAt = new Date();
  
  tacticsStore.setTactics(clubId, tactics);
  
  return { success: true, message: 'BP策略已更新' };
}

export function useInGameCommand(
  clubId: string,
  commandId: string
): { success: boolean; message: string; effect: InGameCommand['effect'] | null } {
  const tacticsStore = useTacticsStore();
  const tactics = tacticsStore.getTactics(clubId);
  
  if (!tactics) {
    return { success: false, message: '战术配置不存在', effect: null };
  }
  
  const command = tactics.inGameCommands.find(c => c.id === commandId);
  if (!command) {
    return { success: false, message: '指令不存在', effect: null };
  }
  
  const now = new Date();
  if (command.lastUsed) {
    const lastUsed = new Date(command.lastUsed);
    const daysSinceLastUse = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastUse < command.cooldown) {
      return {
        success: false,
        message: `指令冷却中，还需 ${command.cooldown - daysSinceLastUse} 天`,
        effect: null,
      };
    }
  }
  
  command.lastUsed = now;
  tacticsStore.setTactics(clubId, tactics);
  
  return {
    success: true,
    message: `指令「${command.name}」已执行`,
    effect: command.effect,
  };
}

export function calculateTacticalBonus(clubId: string): Record<string, number> {
  const tacticsStore = useTacticsStore();
  const tactics = tacticsStore.getTactics(clubId);
  
  const bonuses: Record<string, number> = {
    earlyGame: 0,
    midGame: 0,
    lateGame: 0,
    teamfight: 0,
    coordination: 0,
    adaptation: 0,
  };
  
  if (!tactics) return bonuses;
  
  const formationBonus = FORMATION_BONUSES[tactics.formation];
  if (formationBonus) {
    Object.entries(formationBonus).forEach(([key, value]) => {
      bonuses[key] = (bonuses[key] || 0) + value;
    });
  }
  
  const styleBonus = STYLE_BONUSES[tactics.style];
  if (styleBonus) {
    Object.entries(styleBonus).forEach(([key, value]) => {
      bonuses[key] = (bonuses[key] || 0) + value;
    });
  }
  
  if (tactics.pace === 'early-game') {
    bonuses.earlyGame += 10;
  } else if (tactics.pace === 'late-game') {
    bonuses.lateGame += 10;
  } else {
    bonuses.midGame += 10;
  }
  
  return bonuses;
}

export function getRecommendedFormation(clubId: string): FormationType {
  const clubStore = useClubStore();
  const club = clubStore.getClub(clubId);
  
  if (!club || club.roster.length === 0) {
    return 'balanced';
  }
  
  const roster = club.roster;
  const adcPlayer = roster.find(p => p.position === 'adc');
  const midPlayer = roster.find(p => p.position === 'mid');
  const junglePlayer = roster.find(p => p.position === 'jungle');
  const topPlayer = roster.find(p => p.position === 'top');
  const supportPlayer = roster.find(p => p.position === 'support');
  
  const adcPower = adcPlayer?.getTotalPower() || 0;
  const midPower = midPlayer?.getTotalPower() || 0;
  const junglePower = junglePlayer?.getTotalPower() || 0;
  const topPower = topPlayer?.getTotalPower() || 0;
  const supportPower = supportPlayer?.getTotalPower() || 0;
  
  const maxPower = Math.max(adcPower, midPower, junglePower, topPower);
  
  if (adcPower === maxPower && adcPower > midPower * 1.1) {
    return 'four-protect-one';
  }
  
  if (junglePower === maxPower && junglePower > midPower * 1.1) {
    return 'jungle-core';
  }
  
  if (midPower > 70 && junglePower > 70) {
    return 'mid-jungle';
  }
  
  if (adcPower > 65 && midPower > 65) {
    return 'dual-carry';
  }
  
  return 'balanced';
}
