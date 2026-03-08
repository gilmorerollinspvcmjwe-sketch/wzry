import type {
  PlayerRelationship,
  TeamChemistry,
  TeamConflict,
  RelationshipEvent,
  RelationshipType,
  RelationshipHistory,
  RelationshipEffect,
  ChemistryRecommendation,
  TeamAtmosphere,
  RelationshipEventType,
} from '@/types/relationship';
import { useRelationshipStore } from '@/stores/relationship';
import { usePlayerStore } from '@/stores/player';
import { useClubStore } from '@/stores/club';

function generateId(): string {
  return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getRelationshipKey(player1Id: string, player2Id: string): string {
  return [player1Id, player2Id].sort().join('_');
}

function determineRelationshipType(strength: number): RelationshipType {
  if (strength >= 60) return 'friend';
  if (strength >= 30) return 'student';
  if (strength >= 10) return 'neutral';
  if (strength >= -30) return 'rival';
  return 'hostile';
}

function generateInitialStrength(): number {
  return randomInt(-20, 30);
}

export function initializeRelationships(playerIds: string[]): PlayerRelationship[] {
  const relationships: PlayerRelationship[] = [];
  const processedPairs = new Set<string>();

  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      const key = getRelationshipKey(playerIds[i]!, playerIds[j]!);
      if (processedPairs.has(key)) continue;
      processedPairs.add(key);

      const strength = generateInitialStrength();
      const relationship: PlayerRelationship = {
        player1Id: playerIds[i]!,
        player2Id: playerIds[j]!,
        type: determineRelationshipType(strength),
        strength,
        history: [],
        effects: generateRelationshipEffects(strength),
        interactionFrequency: randomInt(1, 10),
        lastInteraction: new Date(),
      };

      relationships.push(relationship);
    }
  }

  return relationships;
}

function generateRelationshipEffects(strength: number): RelationshipEffect[] {
  const effects: RelationshipEffect[] = [];
  const absStrength = Math.abs(strength);

  if (strength > 30) {
    effects.push({
      type: 'morale',
      value: Math.round(absStrength * 0.1),
      description: '好友关系提升士气',
    });
    effects.push({
      type: 'teamwork',
      value: Math.round(absStrength * 0.15),
      description: '默契配合提升团队协作',
    });
  } else if (strength < -30) {
    effects.push({
      type: 'morale',
      value: Math.round(strength * 0.1),
      description: '紧张关系降低士气',
    });
    effects.push({
      type: 'communication',
      value: Math.round(strength * 0.1),
      description: '沟通障碍',
    });
  }

  return effects;
}

export function updateRelationship(
  player1Id: string,
  player2Id: string,
  change: number,
  event: RelationshipEventType
): PlayerRelationship | null {
  const store = useRelationshipStore();
  const relationship = store.getRelationship(player1Id, player2Id);

  if (!relationship) return null;

  const oldStrength = relationship.strength;
  relationship.strength = clamp(oldStrength + change, -100, 100);
  relationship.type = determineRelationshipType(relationship.strength);
  relationship.effects = generateRelationshipEffects(relationship.strength);
  relationship.interactionFrequency += 1;
  relationship.lastInteraction = new Date();

  const historyEntry: RelationshipHistory = {
    date: new Date(),
    eventType: event,
    description: getEventDescription(event, change),
    change,
  };
  relationship.history.push(historyEntry);

  return relationship;
}

function getEventDescription(event: RelationshipEventType, change: number): string {
  const direction = change > 0 ? '改善' : '恶化';
  const descriptions: Record<RelationshipEventType, string> = {
    match_cooperation: `比赛中的精彩配合使关系${direction}`,
    match_conflict: `比赛中的冲突使关系${direction}`,
    training_together: `共同训练使关系${direction}`,
    argument: `发生争吵使关系${direction}`,
    reconciliation: `和解使关系${direction}`,
    celebration: `庆祝胜利使关系${direction}`,
    competition: `竞争使关系${direction}`,
    support: `互相支持使关系${direction}`,
    betrayal: `背叛行为使关系${direction}`,
    mentorship: `指导关系使关系${direction}`,
  };
  return descriptions[event] || `关系${direction}`;
}

export function calculateTeamChemistry(clubId: string): TeamChemistry {
  const store = useRelationshipStore();
  const clubStore = useClubStore();
  const playerStore = usePlayerStore();

  const club = clubStore.getClub(clubId);
  if (!club) {
    return createEmptyTeamChemistry(clubId);
  }

  const relationships = store.getClubRelationships(clubId);
  const conflicts = detectConflicts(clubId);

  let totalStrength = 0;
  relationships.forEach(rel => {
    totalStrength += rel.strength;
  });

  const avgStrength = relationships.length > 0 ? totalStrength / relationships.length : 0;
  const conflictPenalty = conflicts.reduce((sum, c) => sum + c.severity, 0);

  let overallChemistry = 50 + avgStrength * 0.3 - conflictPenalty * 2;

  const roster = club.roster || [];
  const avgMorale = roster.reduce((sum: number, p: any) => sum + (p.condition?.morale || 50), 0) / Math.max(1, roster.length);
  overallChemistry += (avgMorale - 50) * 0.2;

  overallChemistry = clamp(Math.round(overallChemistry), 0, 100);

  const atmosphere = determineAtmosphere(overallChemistry, conflicts);
  const recommendations = generateRecommendations(relationships, conflicts, overallChemistry);

  return {
    clubId,
    overallChemistry,
    relationships,
    atmosphere,
    conflicts,
    recommendations,
    lastUpdated: new Date(),
  };
}

function createEmptyTeamChemistry(clubId: string): TeamChemistry {
  return {
    clubId,
    overallChemistry: 50,
    relationships: [],
    atmosphere: 'neutral',
    conflicts: [],
    recommendations: [],
    lastUpdated: new Date(),
  };
}

function determineAtmosphere(chemistry: number, conflicts: TeamConflict[]): TeamAtmosphere {
  const activeConflicts = conflicts.filter(c => c.status === 'active' || c.status === 'escalating');

  if (activeConflicts.length >= 3 || chemistry < 30) return 'toxic';
  if (activeConflicts.length >= 1 || chemistry < 50) return 'tense';
  if (chemistry >= 70) return 'harmonious';
  return 'neutral';
}

export function detectConflicts(clubId: string): TeamConflict[] {
  const store = useRelationshipStore();
  const conflicts: TeamConflict[] = [];

  const relationships = store.getClubRelationships(clubId);

  relationships.forEach(rel => {
    if (rel.strength < -30) {
      const conflict: TeamConflict = {
        id: generateId(),
        player1Id: rel.player1Id,
        player2Id: rel.player2Id,
        type: determineConflictType(rel),
        severity: Math.abs(rel.strength) / 20,
        description: `选手之间存在紧张关系`,
        status: rel.strength < -60 ? 'escalating' : 'active',
        startDate: rel.history[0]?.date || new Date(),
      };
      conflicts.push(conflict);
    }
  });

  return conflicts;
}

function determineConflictType(relationship: PlayerRelationship): TeamConflict['type'] {
  if (relationship.type === 'rival') return 'position';
  if (relationship.history.some(h => h.eventType === 'argument')) return 'personality';
  if (relationship.history.some(h => h.eventType === 'competition')) return 'leadership';
  return 'personality';
}

function generateRecommendations(
  relationships: PlayerRelationship[],
  conflicts: TeamConflict[],
  chemistry: number
): ChemistryRecommendation[] {
  const recommendations: ChemistryRecommendation[] = [];

  if (conflicts.length > 0) {
    const highSeverityConflicts = conflicts.filter(c => c.severity >= 3);
    if (highSeverityConflicts.length > 0) {
      recommendations.push({
        type: 'mediation',
        priority: 'high',
        description: '建议安排调解会议，解决选手之间的严重矛盾',
        targetPlayers: highSeverityConflicts.flatMap(c => [c.player1Id, c.player2Id]),
        expectedImprovement: 15,
      });
    }
  }

  const poorRelationships = relationships.filter(r => r.strength < -20);
  if (poorRelationships.length > 2) {
    recommendations.push({
      type: 'team_building',
      priority: 'medium',
      description: '建议组织团建活动，改善团队氛围',
      expectedImprovement: 10,
    });
  }

  if (chemistry < 40) {
    recommendations.push({
      type: 'communication',
      priority: 'high',
      description: '团队化学反应较低，建议加强内部沟通',
      expectedImprovement: 20,
    });
  }

  const goodRelationships = relationships.filter(r => r.strength > 50);
  if (goodRelationships.length > relationships.length * 0.5) {
    recommendations.push({
      type: 'rest',
      priority: 'low',
      description: '团队关系良好，可以适当安排休息活动',
      expectedImprovement: 5,
    });
  }

  return recommendations;
}

export function generateRelationshipEvent(
  player1Id: string,
  player2Id: string
): RelationshipEvent | null {
  const store = useRelationshipStore();
  const relationship = store.getRelationship(player1Id, player2Id);

  if (!relationship) return null;

  const eventTypes: RelationshipEventType[] = [
    'match_cooperation',
    'training_together',
    'support',
    'competition',
    'argument',
  ];

  const weights = {
    match_cooperation: relationship.strength > 0 ? 3 : 1,
    training_together: 2,
    support: relationship.strength > 30 ? 4 : 1,
    competition: relationship.type === 'rival' ? 4 : 1,
    argument: relationship.strength < -20 ? 4 : 1,
  };

  const eventType = weightedRandom(eventTypes, weights);
  const change = calculateEventChange(eventType, relationship.strength);

  const event: RelationshipEvent = {
    id: generateId(),
    type: eventType,
    player1Id,
    player2Id,
    description: getEventDescription(eventType, change),
    impact: {
      relationshipChange: change,
      moraleEffect: change * 0.1,
      teamworkEffect: change * 0.05,
    },
    date: new Date(),
  };

  updateRelationship(player1Id, player2Id, change, eventType);

  return event;
}

function weightedRandom<T>(items: T[], weights: Record<string, number>): T {
  const totalWeight = items.reduce((sum, item) => sum + (weights[item as string] || 1), 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= weights[item as string] || 1;
    if (random <= 0) return item;
  }

  return items[items.length - 1]!;
}

function calculateEventChange(eventType: RelationshipEventType, currentStrength: number): number {
  const baseChanges: Record<RelationshipEventType, number> = {
    match_cooperation: randomInt(5, 15),
    match_conflict: randomInt(-20, -5),
    training_together: randomInt(2, 8),
    argument: randomInt(-15, -5),
    reconciliation: randomInt(10, 25),
    celebration: randomInt(5, 15),
    competition: randomInt(-5, 5),
    support: randomInt(5, 12),
    betrayal: randomInt(-30, -15),
    mentorship: randomInt(8, 18),
  };

  let change = baseChanges[eventType] || 0;

  if (currentStrength > 50 && change > 0) {
    change = Math.round(change * 0.7);
  } else if (currentStrength < -50 && change < 0) {
    change = Math.round(change * 0.7);
  }

  return change;
}

export function getRelationshipEffects(player1Id: string, player2Id: string): RelationshipEffect[] {
  const store = useRelationshipStore();
  const relationship = store.getRelationship(player1Id, player2Id);

  if (!relationship) return [];

  return relationship.effects;
}

export function calculateMatchBonus(clubId: string): { offense: number; defense: number; morale: number } {
  const chemistry = calculateTeamChemistry(clubId);

  const chemistryBonus = (chemistry.overallChemistry - 50) * 0.002;
  const conflictPenalty = chemistry.conflicts.filter(c => c.status === 'active').length * 0.02;

  return {
    offense: clamp(chemistryBonus - conflictPenalty, -0.1, 0.15),
    defense: clamp(chemistryBonus * 0.8 - conflictPenalty, -0.1, 0.12),
    morale: clamp(chemistryBonus * 50, -10, 15),
  };
}

export function resolveConflict(
  clubId: string,
  conflictId: string,
  resolution: string
): boolean {
  const store = useRelationshipStore();
  const conflicts = detectConflicts(clubId);
  const conflict = conflicts.find(c => c.id === conflictId);

  if (!conflict) return false;

  updateRelationship(conflict.player1Id, conflict.player2Id, 20, 'reconciliation');

  return true;
}

export function applyTeamBuilding(clubId: string): { success: boolean; message: string; improvement: number } {
  const store = useRelationshipStore();
  const relationships = store.getClubRelationships(clubId);

  if (relationships.length === 0) {
    return { success: false, message: '没有选手关系数据', improvement: 0 };
  }

  let totalImprovement = 0;

  relationships.forEach(rel => {
    const improvement = randomInt(3, 10);
    updateRelationship(rel.player1Id, rel.player2Id, improvement, 'celebration');
    totalImprovement += improvement;
  });

  const avgImprovement = Math.round(totalImprovement / relationships.length);

  return {
    success: true,
    message: `团建活动成功！团队关系平均提升 ${avgImprovement} 点`,
    improvement: avgImprovement,
  };
}
