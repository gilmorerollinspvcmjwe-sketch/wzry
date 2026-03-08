import type {
  PlayerStoryline,
  StoryChapter,
  StoryChoice,
  StoryImpact,
  StoryTrigger,
  StorylineType,
} from '@/types/storyline';
import {
  STORYLINE_TEMPLATES,
  STORYLINE_TYPE_DESCRIPTIONS,
} from '@/types/storyline';
import { useStorylineStore } from '@/stores/storyline';
import { usePlayerStore } from '@/stores/player';
import { usePlayerPersonalityStore } from '@/stores/playerPersonality';
import { useRelationshipStore } from '@/stores/relationship';
import { useGameStore } from '@/stores/game';

function generateId(): string {
  return `sl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function determineStorylineType(playerId: string): StorylineType {
  const playerStore = usePlayerStore();
  const player = playerStore.getPlayerById(playerId);

  if (!player) {
    return 'rookie-rise';
  }

  const age = player.age || 20;
  const careerStats = player.careerStats;
  const totalMatches = careerStats?.totalMatches || 0;

  const weights: Record<StorylineType, number> = {
    'rookie-rise': age < 20 && totalMatches < 10 ? 50 : 10,
    'veteran-twilight': age >= 26 ? 40 : 5,
    'comeback': totalMatches > 20 && (careerStats?.wins || 0) / totalMatches < 0.4 ? 35 : 10,
    'transfer-saga': player.contract && new Date(player.contract.endDate).getTime() - Date.now() < 180 * 24 * 60 * 60 * 1000 ? 45 : 10,
    'controversy': Math.random() < 0.15 ? 30 : 5,
  };

  const types: StorylineType[] = ['rookie-rise', 'veteran-twilight', 'comeback', 'transfer-saga', 'controversy'];
  const totalWeight = types.reduce((sum, type) => sum + weights[type], 0);
  let random = Math.random() * totalWeight;

  for (const type of types) {
    random -= weights[type];
    if (random <= 0) return type;
  }

  return 'rookie-rise';
}

function generateChoicesForChapter(
  type: StorylineType,
  chapterNumber: number,
  playerData: { name: string; position: string }
): StoryChoice[] {
  const choiceTemplates: Record<StorylineType, Record<number, StoryChoice[]>> = {
    'rookie-rise': {
      1: [
        {
          id: 'rr1_a',
          text: '抓住机会，全力以赴',
          consequences: { attributes: { mechanics: 3 }, morale: 10 },
          nextChapter: 2,
        },
        {
          id: 'rr1_b',
          text: '稳扎稳打，避免失误',
          consequences: { attributes: { awareness: 2 }, morale: 5 },
          nextChapter: 2,
        },
      ],
      2: [
        {
          id: 'rr2_a',
          text: '积极面对压力，将其转化为动力',
          consequences: { attributes: { mentality: 4 }, stress: 10 },
          nextChapter: 3,
        },
        {
          id: 'rr2_b',
          text: '寻求教练和老队员的帮助',
          consequences: { attributes: { teamwork: 3 }, morale: 8 },
          nextChapter: 3,
        },
      ],
      3: [
        {
          id: 'rr3_a',
          text: '用精彩表现回应质疑',
          consequences: { attributes: { mechanics: 5, awareness: 3 }, reputation: 15 },
          nextChapter: 4,
        },
        {
          id: 'rr3_b',
          text: '保持低调，继续努力',
          consequences: { attributes: { mentality: 4 }, loyalty: 10 },
          nextChapter: 4,
        },
      ],
      4: [
        {
          id: 'rr4_a',
          text: '承担领袖责任，带领队伍前进',
          consequences: { attributes: { teamwork: 5, mentality: 3 }, reputation: 20 },
        },
        {
          id: 'rr4_b',
          text: '继续磨练技术，追求更高境界',
          consequences: { attributes: { mechanics: 5, awareness: 4 }, morale: 15 },
        },
      ],
    },
    'veteran-twilight': {
      1: [
        {
          id: 'vt1_a',
          text: '调整训练方式，延长职业生涯',
          consequences: { attributes: { mentality: 3 }, stress: -5 },
          nextChapter: 2,
        },
        {
          id: 'vt1_b',
          text: '接受现实，开始考虑退役规划',
          consequences: { morale: -10, loyalty: 15 },
          nextChapter: 2,
        },
      ],
      2: [
        {
          id: 'vt2_a',
          text: '主动指导年轻队员',
          consequences: { attributes: { teamwork: 5 }, reputation: 10 },
          nextChapter: 3,
        },
        {
          id: 'vt2_b',
          text: '专注于自己的状态调整',
          consequences: { attributes: { mechanics: 2, awareness: 2 }, morale: 5 },
          nextChapter: 3,
        },
      ],
      3: [
        {
          id: 'vt3_a',
          text: '全力以赴，不留遗憾',
          consequences: { attributes: { mechanics: 4, mentality: 4 }, stress: 15 },
          nextChapter: 4,
        },
        {
          id: 'vt3_b',
          text: '享受比赛，展现老将风范',
          consequences: { morale: 10, reputation: 10 },
          nextChapter: 4,
        },
      ],
      4: [
        {
          id: 'vt4_a',
          text: '以冠军为目标，完美谢幕',
          consequences: { attributes: { mentality: 5 }, reputation: 25 },
        },
        {
          id: 'vt4_b',
          text: '平静接受结果，感谢一路陪伴',
          consequences: { morale: 15, loyalty: 20 },
        },
      ],
    },
    'comeback': {
      1: [
        {
          id: 'cb1_a',
          text: '深刻反思，找出问题所在',
          consequences: { attributes: { awareness: 4 }, morale: -5 },
          nextChapter: 2,
        },
        {
          id: 'cb1_b',
          text: '寻求专业帮助，重新开始',
          consequences: { attributes: { mentality: 3 }, stress: 10 },
          nextChapter: 2,
        },
      ],
      2: [
        {
          id: 'cb2_a',
          text: '加倍训练，证明自己',
          consequences: { attributes: { mechanics: 4 }, stress: 15 },
          nextChapter: 3,
        },
        {
          id: 'cb2_b',
          text: '调整心态，循序渐进',
          consequences: { attributes: { mentality: 5 }, morale: 10 },
          nextChapter: 3,
        },
      ],
      3: [
        {
          id: 'cb3_a',
          text: '保持势头，继续冲击',
          consequences: { attributes: { mechanics: 3, awareness: 3 }, reputation: 10 },
          nextChapter: 4,
        },
        {
          id: 'cb3_b',
          text: '稳住心态，避免急躁',
          consequences: { attributes: { mentality: 4 }, morale: 8 },
          nextChapter: 4,
        },
      ],
      4: [
        {
          id: 'cb4_a',
          text: '重返巅峰，证明王者归来',
          consequences: { attributes: { mechanics: 5, mentality: 5 }, reputation: 30 },
        },
        {
          id: 'cb4_b',
          text: '感谢支持，继续前行',
          consequences: { morale: 20, loyalty: 15 },
        },
      ],
    },
    'transfer-saga': {
      1: [
        {
          id: 'ts1_a',
          text: '公开否认传闻，专注比赛',
          consequences: { morale: 5, loyalty: 10 },
          nextChapter: 2,
        },
        {
          id: 'ts1_b',
          text: '保持沉默，让成绩说话',
          consequences: { attributes: { mentality: 3 }, stress: 5 },
          nextChapter: 2,
        },
      ],
      2: [
        {
          id: 'ts2_a',
          text: '委托经纪人处理，专注比赛',
          consequences: { attributes: { awareness: 3 }, stress: -5 },
          nextChapter: 3,
        },
        {
          id: 'ts2_b',
          text: '亲自参与谈判，争取利益',
          consequences: { reputation: 5, stress: 15 },
          nextChapter: 3,
        },
      ],
      3: [
        {
          id: 'ts3_a',
          text: '选择留下，继续为俱乐部效力',
          consequences: { loyalty: 25, morale: 15 },
          nextChapter: 4,
        },
        {
          id: 'ts3_b',
          text: '接受新挑战，转会离开',
          consequences: { reputation: 10, loyalty: -15 },
          nextChapter: 4,
        },
      ],
      4: [
        {
          id: 'ts4_a',
          text: '感谢一切，展望未来',
          consequences: { morale: 10, reputation: 10 },
        },
        {
          id: 'ts4_b',
          text: '用表现回应一切质疑',
          consequences: { attributes: { mechanics: 4, mentality: 3 } },
        },
      ],
    },
    'controversy': {
      1: [
        {
          id: 'cv1_a',
          text: '立即公开澄清',
          consequences: { reputation: 5, stress: 10 },
          nextChapter: 2,
        },
        {
          id: 'cv1_b',
          text: '保持冷静，等待时机',
          consequences: { attributes: { mentality: 4 }, morale: -5 },
          nextChapter: 2,
        },
      ],
      2: [
        {
          id: 'cv2_a',
          text: '积极面对，主动沟通',
          consequences: { reputation: 5, stress: 15 },
          nextChapter: 3,
        },
        {
          id: 'cv2_b',
          text: '远离社交媒体，专注训练',
          consequences: { attributes: { mechanics: 3, awareness: 2 }, morale: -10 },
          nextChapter: 3,
        },
      ],
      3: [
        {
          id: 'cv3_a',
          text: '用精彩表现回应',
          consequences: { attributes: { mechanics: 5 }, reputation: 15 },
          nextChapter: 4,
        },
        {
          id: 'cv3_b',
          text: '接受采访，真诚回应',
          consequences: { attributes: { mentality: 4 }, reputation: 10 },
          nextChapter: 4,
        },
      ],
      4: [
        {
          id: 'cv4_a',
          text: '感谢支持者，继续努力',
          consequences: { morale: 15, loyalty: 10 },
        },
        {
          id: 'cv4_b',
          text: '将此经历化为动力',
          consequences: { attributes: { mentality: 5 }, reputation: 10 },
        },
      ],
    },
  };

  return choiceTemplates[type]?.[chapterNumber] || [];
}

export function generateStoryline(playerId: string): PlayerStoryline {
  const playerStore = usePlayerStore();
  const player = playerStore.getPlayerById(playerId);

  if (!player) {
    throw new Error(`Player not found: ${playerId}`);
  }

  const type = determineStorylineType(playerId);
  const template = STORYLINE_TEMPLATES[type];

  const title = template.titleTemplate.replace('{playerName}', player.name);
  const description = STORYLINE_TYPE_DESCRIPTIONS[type];

  const chapters: StoryChapter[] = template.chapterTemplates.map((chapterTemplate) => {
    const chapterNum = chapterTemplate.number || 1;
    const choices = generateChoicesForChapter(type, chapterNum, {
      name: player.name,
      position: player.position,
    });

    return {
      number: chapterNum,
      title: chapterTemplate.title || `第${chapterNum}章`,
      description: chapterTemplate.description || '',
      trigger: chapterTemplate.trigger || { type: 'random', conditions: {}, probability: 0.5 },
      choices,
      completed: false,
    };
  });

  const storyline: PlayerStoryline = {
    id: generateId(),
    playerId,
    type,
    title,
    description,
    currentChapter: 1,
    chapters,
    impact: {},
    status: 'active',
    startedAt: new Date(),
    updatedAt: new Date(),
  };

  return storyline;
}

export function checkTrigger(playerId: string, chapter: StoryChapter): boolean {
  const playerStore = usePlayerStore();
  const gameStore = useGameStore();
  const personalityStore = usePlayerPersonalityStore();

  const player = playerStore.getPlayerById(playerId);
  const personality = personalityStore.getPersonality(playerId);

  if (!player) return false;

  const trigger = chapter.trigger;
  const conditions = trigger.conditions;

  if (Math.random() > trigger.probability) {
    return false;
  }

  switch (trigger.type) {
    case 'match_result': {
      const careerStats = player.careerStats;
      if (!careerStats) return false;

      if (conditions.matchWins && careerStats.wins < conditions.matchWins) return false;
      if (conditions.matchLosses && (careerStats.totalMatches - careerStats.wins) < conditions.matchLosses) return false;
      return true;
    }

    case 'training': {
      if (conditions.morale !== undefined) {
        const morale = personality?.emotion.value || 0;
        if (conditions.morale > 0 && morale < conditions.morale) return false;
        if (conditions.morale < 0 && morale > conditions.morale) return false;
      }
      return true;
    }

    case 'contract': {
      if (!player.contract) return false;
      const monthsLeft = Math.floor(
        (new Date(player.contract.endDate).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)
      );
      if (conditions.contractMonthsLeft && monthsLeft > conditions.contractMonthsLeft) return false;
      return true;
    }

    case 'transfer': {
      return Math.random() < 0.3;
    }

    case 'achievement': {
      return Math.random() < 0.2;
    }

    case 'relationship': {
      if (conditions.relationshipStrength !== undefined) {
        const relationshipStore = useRelationshipStore();
        const relationships = relationshipStore.getPlayerRelationships(playerId);
        const avgStrength = relationships.length > 0
          ? relationships.reduce((sum, r) => sum + r.strength, 0) / relationships.length
          : 0;
        if (Math.abs(avgStrength) < conditions.relationshipStrength) return false;
      }
      return true;
    }

    case 'time': {
      if (conditions.daysInClub !== undefined) {
        const daysInClub = Math.floor(
          (Date.now() - new Date(player.joinedAt || Date.now()).getTime()) / (24 * 60 * 60 * 1000)
        );
        if (daysInClub < conditions.daysInClub) return false;
      }
      if (conditions.age !== undefined && player.age < conditions.age) return false;
      return true;
    }

    case 'random': {
      return Math.random() < trigger.probability;
    }

    default:
      return false;
  }
}

export function processChoice(
  playerId: string,
  storylineId: string,
  chapterNumber: number,
  choiceId: string
): { success: boolean; impact: StoryImpact; storylineCompleted: boolean } {
  const storylineStore = useStorylineStore();
  const storyline = storylineStore.getStoryline(storylineId);

  if (!storyline || storyline.playerId !== playerId) {
    return { success: false, impact: {}, storylineCompleted: false };
  }

  const chapter = storyline.chapters.find(c => c.number === chapterNumber);
  if (!chapter || chapter.completed) {
    return { success: false, impact: {}, storylineCompleted: false };
  }

  const choice = chapter.choices.find(c => c.id === choiceId);
  if (!choice || choice.locked) {
    return { success: false, impact: {}, storylineCompleted: false };
  }

  chapter.selectedChoice = choiceId;
  chapter.completed = true;
  chapter.completedAt = new Date();

  applyConsequences(playerId, choice.consequences);

  const isLastChapter = chapterNumber >= storyline.chapters.length;
  const storylineCompleted = isLastChapter || !choice.nextChapter;

  if (storylineCompleted) {
    storyline.status = 'completed';
    storyline.completedAt = new Date();
  } else if (choice.nextChapter) {
    storyline.currentChapter = choice.nextChapter;
  } else {
    storyline.currentChapter = chapterNumber + 1;
  }

  storyline.updatedAt = new Date();

  return { success: true, impact: choice.consequences, storylineCompleted };
}

export function applyConsequences(playerId: string, consequences: StoryImpact): void {
  const playerStore = usePlayerStore();
  const personalityStore = usePlayerPersonalityStore();
  const relationshipStore = useRelationshipStore();

  const player = playerStore.getPlayerById(playerId);
  if (!player) return;

  if (consequences.attributes) {
    const stats = player.stats;
    if (stats) {
      if (consequences.attributes.mechanics) {
        stats.mechanics = clamp(stats.mechanics + consequences.attributes.mechanics, 1, 100);
      }
      if (consequences.attributes.awareness) {
        stats.awareness = clamp(stats.awareness + consequences.attributes.awareness, 1, 100);
      }
      if (consequences.attributes.mentality) {
        stats.mentality = clamp(stats.mentality + consequences.attributes.mentality, 1, 100);
      }
      if (consequences.attributes.teamwork) {
        stats.teamwork = clamp(stats.teamwork + consequences.attributes.teamwork, 1, 100);
      }
    }
  }

  if (consequences.morale !== undefined) {
    const personality = personalityStore.getPersonality(playerId);
    if (personality) {
      const newEmotion = {
        ...personality.emotion,
        value: clamp(personality.emotion.value + consequences.morale, -100, 100),
      };
      personalityStore.updateEmotion(playerId, newEmotion);
    }
  }

  if (consequences.relationships) {
    for (const rel of consequences.relationships) {
      if (rel.targetId) {
        const change = rel.type === 'improve' ? rel.value : -rel.value;
        relationshipStore.updatePlayerRelationship(playerId, rel.targetId, change, 'support');
      }
    }
  }

  if (consequences.loyalty !== undefined) {
    const personality = personalityStore.getPersonality(playerId);
    if (personality) {
      personality.loyaltyLevel = clamp(personality.loyaltyLevel + consequences.loyalty, 0, 100);
    }
  }
}

export function advanceStoryline(playerId: string): StoryChapter | null {
  const storylineStore = useStorylineStore();
  const activeStorylines = storylineStore.getActiveStorylinesForPlayer(playerId);

  if (activeStorylines.length === 0) return null;

  const storyline = activeStorylines[0];
  if (!storyline) return null;

  const currentChapter = storyline.chapters.find(c => c.number === storyline.currentChapter);
  if (!currentChapter || currentChapter.completed) return null;

  if (checkTrigger(playerId, currentChapter)) {
    return currentChapter;
  }

  return null;
}

export function shouldGenerateStoryline(playerId: string): boolean {
  const storylineStore = useStorylineStore();
  const activeStorylines = storylineStore.getActiveStorylinesForPlayer(playerId);

  if (activeStorylines.length > 0) return false;

  return Math.random() < 0.1;
}

export function initializePlayerStoryline(playerId: string): PlayerStoryline | null {
  const storylineStore = useStorylineStore();

  const existingStorylines = storylineStore.getStorylinesForPlayer(playerId);
  const activeStorylines = existingStorylines.filter(s => s.status === 'active');

  if (activeStorylines.length > 0) {
    return activeStorylines[0] || null;
  }

  if (shouldGenerateStoryline(playerId)) {
    const storyline = generateStoryline(playerId);
    storylineStore.addStoryline(storyline);
    return storyline;
  }

  return null;
}

export function getStorylineProgress(storyline: PlayerStoryline): {
  completedChapters: number;
  totalChapters: number;
  progressPercent: number;
} {
  const completedChapters = storyline.chapters.filter(c => c.completed).length;
  const totalChapters = storyline.chapters.length;
  const progressPercent = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

  return {
    completedChapters,
    totalChapters,
    progressPercent,
  };
}
