import type {
  PlayerPersonalityEnhanced,
  PlayerDemand,
  PlayerEmotion,
  DialogueStyle,
  DialogueContext,
  DialogueMessage,
  EmotionEvent,
  EmotionType,
  DemandType,
  DemandUrgency,
  PersonalityTrait,
  PlayerRelationshipRef,
} from '@/types/playerPersonality';
import {
  DEFAULT_DIALOGUE_STYLES,
  DEMAND_DEADLINE_DAYS,
  EMOTION_VALUE_RANGE,
} from '@/types/playerPersonality';
import { usePlayerPersonalityStore } from '@/stores/playerPersonality';
import { usePlayerStore } from '@/stores/player';
import { useRelationshipStore } from '@/stores/relationship';

function generateId(): string {
  return `pp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function determineEmotionType(value: number): EmotionType {
  if (value >= 50) return 'happy';
  if (value >= 20) return 'neutral';
  if (value >= -20) return 'neutral';
  if (value >= -50) return 'anxious';
  if (value >= -75) return 'sad';
  return 'angry';
}

function generatePersonalityTraits(): PersonalityTrait {
  return {
    openness: randomInt(30, 90),
    conscientiousness: randomInt(30, 90),
    extraversion: randomInt(30, 90),
    agreeableness: randomInt(30, 90),
    neuroticism: randomInt(20, 70),
  };
}

function determineDialogueStyle(traits: PersonalityTrait): DialogueStyle {
  const { extraversion, neuroticism, agreeableness } = traits;

  if (extraversion > 70 && neuroticism > 60) {
    return DEFAULT_DIALOGUE_STYLES.aggressive;
  }

  if (agreeableness > 70 && neuroticism < 40) {
    return DEFAULT_DIALOGUE_STYLES.calm;
  }

  return DEFAULT_DIALOGUE_STYLES.default;
}

function determineCommunicationStyle(traits: PersonalityTrait): 'direct' | 'indirect' | 'formal' | 'casual' {
  const { extraversion, conscientiousness } = traits;

  if (extraversion > 70 && conscientiousness < 50) {
    return 'casual';
  }
  if (conscientiousness > 70) {
    return 'formal';
  }
  if (extraversion > 60) {
    return 'direct';
  }
  return 'indirect';
}

export function generatePersonality(playerId: string): PlayerPersonalityEnhanced {
  const playerStore = usePlayerStore();
  const relationshipStore = useRelationshipStore();

  const player = playerStore.getPlayerById(playerId);
  if (!player) {
    throw new Error(`Player not found: ${playerId}`);
  }

  const traits = generatePersonalityTraits();
  const dialogueStyle = determineDialogueStyle(traits);
  const communicationStyle = determineCommunicationStyle(traits);

  const relationships = relationshipStore.getPlayerRelationships(playerId).map(rel => {
    const otherPlayerId = rel.player1Id === playerId ? rel.player2Id : rel.player1Id;
    return {
      playerId: otherPlayerId,
      type: rel.type,
      strength: rel.strength,
    };
  });

  const ambitionLevel = Math.round((traits.openness + traits.conscientiousness) / 2);
  const loyaltyLevel = Math.round((traits.agreeableness + (100 - traits.neuroticism)) / 2);
  const stressThreshold = Math.round(100 - traits.neuroticism * 0.5);

  const personality: PlayerPersonalityEnhanced = {
    playerId,
    dialogueStyle,
    currentDemands: [],
    emotion: {
      type: 'neutral',
      value: 0,
      reason: '初始状态',
      duration: 0,
      startedAt: new Date(),
    },
    relationships,
    traits,
    communicationStyle,
    ambitionLevel,
    loyaltyLevel,
    stressThreshold,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return personality;
}

export function generateDialogue(
  playerId: string,
  context: DialogueContext
): DialogueMessage {
  const store = usePlayerPersonalityStore();
  const personality = store.getPersonality(playerId);

  if (!personality) {
    throw new Error(`Personality not found for player: ${playerId}`);
  }

  const style = personality.dialogueStyle;
  const emotion = personality.emotion;

  let messages: string[];
  switch (context) {
    case 'greeting':
      messages = style.greeting;
      break;
    case 'happy':
      messages = style.happy;
      break;
    case 'sad':
      messages = style.sad;
      break;
    case 'angry':
      messages = style.angry;
      break;
    case 'anxious':
      messages = style.anxious;
      break;
    case 'training_request':
      messages = style.trainingRequest;
      break;
    case 'match_feedback':
      messages = style.matchFeedback;
      break;
    case 'demand':
      messages = style.demand;
      break;
    case 'contract':
      messages = style.contract;
      break;
    case 'transfer':
      messages = style.transfer;
      break;
    default:
      messages = style.greeting;
  }

  const message = randomChoice(messages);

  const dialogueMessage: DialogueMessage = {
    id: generateId(),
    playerId,
    context,
    message,
    emotion: emotion.type,
    timestamp: new Date(),
  };

  store.updateLastDialogue(playerId);

  return dialogueMessage;
}

export function generateDemand(playerId: string): PlayerDemand {
  const store = usePlayerPersonalityStore();
  const playerStore = usePlayerStore();

  const personality = store.getPersonality(playerId);
  const player = playerStore.getPlayerById(playerId);

  if (!personality || !player) {
    throw new Error(`Data not found for player: ${playerId}`);
  }

  const demandTypes: DemandType[] = ['playing_time', 'salary', 'transfer', 'teammate', 'facility'];
  const weights: Record<DemandType, number> = {
    playing_time: player.careerStats?.totalMatches && player.careerStats.totalMatches > 10 ? 30 : 10,
    salary: player.contract.salary < 50 ? 40 : 10,
    transfer: personality.loyaltyLevel < 40 ? 50 : 5,
    teammate: personality.relationships.some(r => r.type === 'hostile') ? 35 : 5,
    facility: Math.random() > 0.8 ? 20 : 5,
  };

  const type = weightedChoice(demandTypes, weights);

  const urgencyLevels: DemandUrgency[] = ['low', 'medium', 'high', 'critical'];
  const urgencyWeights: Record<DemandUrgency, number> = {
    low: 30,
    medium: 40,
    high: personality.emotion.value < -30 ? 50 : 20,
    critical: personality.emotion.value < -60 ? 60 : 10,
  };

  const urgency = weightedChoice(urgencyLevels, urgencyWeights);

  const description = generateDemandDescription(type, player, personality);

  const deadlineDays = DEMAND_DEADLINE_DAYS[urgency];
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + deadlineDays);

  const demand: PlayerDemand = {
    id: generateId(),
    type,
    urgency,
    description,
    deadline,
    satisfied: false,
    consequences: calculateConsequences(type, urgency, personality),
    createdAt: new Date(),
  };

  return demand;
}

function generateDemandDescription(
  type: DemandType,
  player: any,
  personality: PlayerPersonalityEnhanced
): string {
  const descriptions: Record<DemandType, string[]> = {
    playing_time: [
      '我希望能获得更多的上场机会。',
      '我觉得我的能力应该得到更多展示。',
      '希望能参加更多重要比赛。',
    ],
    salary: [
      '我觉得我的薪资应该有所提升。',
      '希望能重新谈一下合同待遇。',
      '我的表现值得更好的薪资。',
    ],
    transfer: [
      '我在考虑转会到其他俱乐部。',
      '希望能探索新的机会。',
      '我觉得这里可能不是最适合我的地方。',
    ],
    teammate: [
      '我和某些队友的关系需要改善。',
      '希望能调整一下队伍氛围。',
      '有些队友问题需要解决。',
    ],
    facility: [
      '训练设施需要改善。',
      '希望能有更好的训练环境。',
      '设备有些落后了。',
    ],
  };

  return randomChoice(descriptions[type]);
}

function calculateConsequences(
  type: DemandType,
  urgency: DemandUrgency,
  personality: PlayerPersonalityEnhanced
): { morale: number; relationship: number; performance: number } {
  const baseMultiplier = {
    low: 1,
    medium: 1.5,
    high: 2,
    critical: 3,
  };

  const multiplier = baseMultiplier[urgency];

  const baseConsequences: Record<DemandType, { morale: number; relationship: number; performance: number }> = {
    playing_time: { morale: -15, relationship: -5, performance: -10 },
    salary: { morale: -10, relationship: -10, performance: -5 },
    transfer: { morale: -20, relationship: -15, performance: -15 },
    teammate: { morale: -10, relationship: -20, performance: -10 },
    facility: { morale: -5, relationship: -5, performance: -8 },
  };

  const base = baseConsequences[type];

  return {
    morale: Math.round(base.morale * multiplier),
    relationship: Math.round(base.relationship * multiplier),
    performance: Math.round(base.performance * multiplier),
  };
}

function weightedChoice<T>(items: T[], weights: Record<string, number>): T {
  const totalWeight = items.reduce((sum, item) => sum + (weights[item as string] || 1), 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= weights[item as string] || 1;
    if (random <= 0) return item;
  }

  return items[items.length - 1]!;
}

export function updateEmotion(playerId: string, event: EmotionEvent): PlayerEmotion {
  const store = usePlayerPersonalityStore();
  const personality = store.getPersonality(playerId);

  if (!personality) {
    throw new Error(`Personality not found for player: ${playerId}`);
  }

  const { traits, stressThreshold } = personality;

  let impactModifier = 1;
  if (traits.neuroticism > 70) {
    impactModifier = 1.3;
  } else if (traits.neuroticism < 30) {
    impactModifier = 0.7;
  }

  const currentEmotion = personality.emotion;
  let newValue = currentEmotion.value + event.impact * impactModifier;

  if (event.impact < 0 && newValue < -stressThreshold) {
    newValue = -stressThreshold;
  }

  newValue = clamp(newValue, EMOTION_VALUE_RANGE.min, EMOTION_VALUE_RANGE.max);

  const newEmotion: PlayerEmotion = {
    type: determineEmotionType(newValue),
    value: newValue,
    reason: event.description,
    duration: Math.abs(event.impact) > 30 ? 7 : Math.abs(event.impact) > 15 ? 3 : 1,
    startedAt: new Date(),
  };

  store.updateEmotion(playerId, newEmotion);

  return newEmotion;
}

export function processDemand(
  playerId: string,
  demandId: string,
  satisfied: boolean
): { success: boolean; effects: { morale: number; relationship: number; performance: number } } {
  const store = usePlayerPersonalityStore();
  const personality = store.getPersonality(playerId);

  if (!personality) {
    throw new Error(`Personality not found for player: ${playerId}`);
  }

  const demand = personality.currentDemands.find(d => d.id === demandId);

  if (!demand) {
    return { success: false, effects: { morale: 0, relationship: 0, performance: 0 } };
  }

  let effects: { morale: number; relationship: number; performance: number };

  if (satisfied) {
    effects = {
      morale: Math.abs(demand.consequences.morale) * 0.5,
      relationship: Math.abs(demand.consequences.relationship) * 0.5,
      performance: Math.abs(demand.consequences.performance) * 0.3,
    };

    const event: EmotionEvent = {
      type: 'recognition',
      impact: 30,
      description: `诉求得到满足：${demand.description}`,
    };
    updateEmotion(playerId, event);
  } else {
    effects = demand.consequences;

    const event: EmotionEvent = {
      type: 'conflict',
      impact: -30,
      description: `诉求被拒绝：${demand.description}`,
    };
    updateEmotion(playerId, event);
  }

  store.resolveDemand(playerId, demandId, satisfied);

  return { success: true, effects };
}

export function calculateEmotionEffect(playerId: string): {
  moraleModifier: number;
  performanceModifier: number;
  teamworkModifier: number;
  trainingEfficiency: number;
} {
  const store = usePlayerPersonalityStore();
  const personality = store.getPersonality(playerId);

  if (!personality) {
    return {
      moraleModifier: 0,
      performanceModifier: 0,
      teamworkModifier: 0,
      trainingEfficiency: 1,
    };
  }

  const { emotion, traits } = personality;
  const emotionValue = emotion.value;

  const moraleModifier = emotionValue * 0.5;

  const performanceModifier = emotionValue * 0.3;

  const teamworkModifier = (traits.agreeableness - 50) * 0.2 + emotionValue * 0.2;

  let trainingEfficiency = 1;
  if (emotion.type === 'happy') {
    trainingEfficiency = 1.2;
  } else if (emotion.type === 'sad' || emotion.type === 'angry') {
    trainingEfficiency = 0.8;
  } else if (emotion.type === 'anxious') {
    trainingEfficiency = 0.9;
  }

  return {
    moraleModifier: Math.round(moraleModifier),
    performanceModifier: Math.round(performanceModifier),
    teamworkModifier: Math.round(teamworkModifier),
    trainingEfficiency,
  };
}

export function checkDemandExpiration(playerId: string): PlayerDemand[] {
  const store = usePlayerPersonalityStore();
  const personality = store.getPersonality(playerId);

  if (!personality) {
    return [];
  }

  const now = new Date();
  const expiredDemands: PlayerDemand[] = [];

  for (const demand of personality.currentDemands) {
    if (!demand.satisfied && new Date(demand.deadline) < now) {
      expiredDemands.push(demand);
      processDemand(playerId, demand.id, false);
    }
  }

  return expiredDemands;
}

export function generateContextualDialogue(playerId: string): DialogueMessage {
  const store = usePlayerPersonalityStore();
  const personality = store.getPersonality(playerId);

  if (!personality) {
    return generateDialogue(playerId, 'greeting');
  }

  const { emotion, currentDemands } = personality;

  if (currentDemands.some(d => d.urgency === 'critical' && !d.satisfied)) {
    return generateDialogue(playerId, 'demand');
  }

  switch (emotion.type) {
    case 'happy':
      return generateDialogue(playerId, 'happy');
    case 'sad':
      return generateDialogue(playerId, 'sad');
    case 'angry':
      return generateDialogue(playerId, 'angry');
    case 'anxious':
      return generateDialogue(playerId, 'anxious');
    default:
      return generateDialogue(playerId, 'greeting');
  }
}

export function updateRelationshipsFromPersonality(playerId: string): void {
  const store = usePlayerPersonalityStore();
  const relationshipStore = useRelationshipStore();

  const personality = store.getPersonality(playerId);
  if (!personality) return;

  for (const rel of personality.relationships) {
    const existingRel = relationshipStore.getRelationship(playerId, rel.playerId);

    if (existingRel) {
      const emotionEffect = personality.emotion.value * 0.1;
      const newStrength = clamp(existingRel.strength + emotionEffect, -100, 100);

      if (Math.abs(newStrength - existingRel.strength) > 5) {
        relationshipStore.updatePlayerRelationship(
          playerId,
          rel.playerId,
          newStrength - existingRel.strength,
          'support'
        );
      }
    }
  }
}

export function shouldGenerateDemand(playerId: string): boolean {
  const store = usePlayerPersonalityStore();
  const personality = store.getPersonality(playerId);

  if (!personality) return false;

  if (personality.currentDemands.length >= 3) return false;

  if (personality.emotion.value < -30) return Math.random() < 0.3;

  if (personality.loyaltyLevel < 40) return Math.random() < 0.2;

  return Math.random() < 0.05;
}

export function initializePlayerPersonality(playerId: string): PlayerPersonalityEnhanced {
  const store = usePlayerPersonalityStore();

  let personality = store.getPersonality(playerId);

  if (!personality) {
    personality = generatePersonality(playerId);
    store.setPersonality(personality);
  }

  return personality;
}
