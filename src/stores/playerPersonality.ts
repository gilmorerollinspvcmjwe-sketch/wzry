import { defineStore } from 'pinia';
import type {
  PlayerPersonalityEnhanced,
  PlayerDemand,
  PlayerEmotion,
  DialogueMessage,
  EmotionEvent,
  DialogueContext,
} from '@/types/playerPersonality';
import {
  generatePersonality,
  generateDialogue,
  generateDemand,
  updateEmotion,
  processDemand,
  calculateEmotionEffect,
  shouldGenerateDemand,
} from '@/core/services/playerPersonalityService';

interface PlayerPersonalityState {
  personalities: Record<string, PlayerPersonalityEnhanced>;
  dialogueHistory: DialogueMessage[];
}

export const usePlayerPersonalityStore = defineStore('playerPersonality', {
  state: (): PlayerPersonalityState => ({
    personalities: {},
    dialogueHistory: [],
  }),

  getters: {
    getPersonality: (state) => (playerId: string): PlayerPersonalityEnhanced | undefined => {
      return state.personalities[playerId];
    },

    getAllPersonalities: (state) => (): PlayerPersonalityEnhanced[] => {
      return Object.values(state.personalities);
    },

    getEmotion: (state) => (playerId: string): PlayerEmotion | undefined => {
      return state.personalities[playerId]?.emotion;
    },

    getDemands: (state) => (playerId: string): PlayerDemand[] => {
      return state.personalities[playerId]?.currentDemands || [];
    },

    getActiveDemands: (state) => (playerId: string): PlayerDemand[] => {
      return state.personalities[playerId]?.currentDemands.filter(d => !d.satisfied) || [];
    },

    getDialogueHistory: (state) => (playerId: string, limit: number = 10): DialogueMessage[] => {
      return state.dialogueHistory
        .filter(d => d.playerId === playerId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },

    getPlayersWithLowMorale: (state) => (): PlayerPersonalityEnhanced[] => {
      return Object.values(state.personalities).filter(p => p.emotion.value < -30);
    },

    getPlayersWithCriticalDemands: (state) => (): PlayerPersonalityEnhanced[] => {
      return Object.values(state.personalities).filter(p =>
        p.currentDemands.some(d => d.urgency === 'critical' && !d.satisfied)
      );
    },

    getTeamEmotionAverage: (state) => (playerIds: string[]): number => {
      const emotions = playerIds
        .map(id => state.personalities[id]?.emotion.value)
        .filter(v => v !== undefined) as number[];

      if (emotions.length === 0) return 0;

      return Math.round(emotions.reduce((a, b) => a + b, 0) / emotions.length);
    },
  },

  actions: {
    setPersonality(personality: PlayerPersonalityEnhanced) {
      this.personalities[personality.playerId] = personality;
    },

    initPersonality(playerId: string): PlayerPersonalityEnhanced {
      if (!this.personalities[playerId]) {
        const personality = generatePersonality(playerId);
        this.personalities[playerId] = personality;
      }
      return this.personalities[playerId]!;
    },

    updateEmotion(playerId: string, emotion: PlayerEmotion) {
      const personality = this.personalities[playerId];
      if (personality) {
        personality.emotion = emotion;
        personality.updatedAt = new Date();
      }
    },

    addDemand(playerId: string, demand: PlayerDemand) {
      const personality = this.personalities[playerId];
      if (personality) {
        personality.currentDemands.push(demand);
        personality.updatedAt = new Date();
      }
    },

    resolveDemand(playerId: string, demandId: string, satisfied: boolean) {
      const personality = this.personalities[playerId];
      if (personality) {
        const demand = personality.currentDemands.find(d => d.id === demandId);
        if (demand) {
          demand.satisfied = satisfied;
          personality.updatedAt = new Date();
        }
      }
    },

    removeDemand(playerId: string, demandId: string) {
      const personality = this.personalities[playerId];
      if (personality) {
        personality.currentDemands = personality.currentDemands.filter(d => d.id !== demandId);
        personality.updatedAt = new Date();
      }
    },

    addDialogueMessage(message: DialogueMessage) {
      this.dialogueHistory.push(message);

      if (this.dialogueHistory.length > 1000) {
        this.dialogueHistory = this.dialogueHistory.slice(-500);
      }
    },

    updateLastDialogue(playerId: string) {
      const personality = this.personalities[playerId];
      if (personality) {
        personality.lastDialogueAt = new Date();
        personality.updatedAt = new Date();
      }
    },

    generatePlayerDialogue(playerId: string, context: DialogueContext): DialogueMessage {
      const message = generateDialogue(playerId, context);
      this.addDialogueMessage(message);
      return message;
    },

    generatePlayerDemand(playerId: string): PlayerDemand {
      const demand = generateDemand(playerId);
      this.addDemand(playerId, demand);
      return demand;
    },

    updatePlayerEmotion(playerId: string, event: EmotionEvent): PlayerEmotion {
      return updateEmotion(playerId, event);
    },

    processPlayerDemand(
      playerId: string,
      demandId: string,
      satisfied: boolean
    ): { success: boolean; effects: { morale: number; relationship: number; performance: number } } {
      return processDemand(playerId, demandId, satisfied);
    },

    getPlayerEmotionEffects(playerId: string) {
      return calculateEmotionEffect(playerId);
    },

    checkAndGenerateDemands() {
      for (const playerId of Object.keys(this.personalities)) {
        if (shouldGenerateDemand(playerId)) {
          this.generatePlayerDemand(playerId);
        }
      }
    },

    processMatchResult(playerId: string, won: boolean, isMvp: boolean = false) {
      const impact = won ? (isMvp ? 40 : 25) : -30;
      const event: EmotionEvent = {
        type: won ? 'match_win' : 'match_loss',
        impact,
        description: won
          ? (isMvp ? '比赛胜利并获得MVP！' : '比赛胜利！')
          : '比赛失利',
      };
      this.updatePlayerEmotion(playerId, event);
    },

    processTrainingComplete(playerId: string, success: boolean) {
      const event: EmotionEvent = {
        type: 'training',
        impact: success ? 10 : -5,
        description: success ? '训练效果不错' : '训练效果一般',
      };
      this.updatePlayerEmotion(playerId, event);
    },

    processContractRenewal(playerId: string, salaryIncrease: number) {
      const event: EmotionEvent = {
        type: 'contract',
        impact: salaryIncrease > 0 ? 20 : -10,
        description: salaryIncrease > 0
          ? `合同续签，薪资提升${salaryIncrease}万`
          : '合同续签，但薪资未达预期',
      };
      this.updatePlayerEmotion(playerId, event);
    },

    processTransferRequest(playerId: string, approved: boolean) {
      const personality = this.personalities[playerId];
      if (!personality) return;

      const event: EmotionEvent = {
        type: 'transfer',
        impact: approved ? 30 : -40,
        description: approved ? '转会请求获批' : '转会请求被拒绝',
      };
      this.updatePlayerEmotion(playerId, event);

      if (!approved) {
        const loyaltyDecrease = Math.round(personality.loyaltyLevel * 0.2);
        personality.loyaltyLevel = Math.max(0, personality.loyaltyLevel - loyaltyDecrease);
      }
    },

    processAchievement(playerId: string, achievementName: string) {
      const event: EmotionEvent = {
        type: 'achievement',
        impact: 35,
        description: `获得成就：${achievementName}`,
      };
      this.updatePlayerEmotion(playerId, event);
    },

    decayEmotions() {
      for (const personality of Object.values(this.personalities)) {
        const { emotion } = personality;
        const daysSinceStart = Math.floor(
          (Date.now() - new Date(emotion.startedAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceStart >= emotion.duration && emotion.duration > 0) {
          const decayRate = 0.1;
          const newValue = emotion.value * (1 - decayRate);

          if (Math.abs(newValue) < 5) {
            emotion.type = 'neutral';
            emotion.value = 0;
            emotion.reason = '情绪恢复平静';
            emotion.duration = 0;
          } else {
            emotion.value = Math.round(newValue);
          }

          emotion.startedAt = new Date();
          personality.updatedAt = new Date();
        }
      }
    },

    clearPlayerPersonality(playerId: string) {
      delete this.personalities[playerId];
      this.dialogueHistory = this.dialogueHistory.filter(d => d.playerId !== playerId);
    },

    clearAllPersonalities() {
      this.personalities = {};
      this.dialogueHistory = [];
    },
  },

  persist: true,
});
