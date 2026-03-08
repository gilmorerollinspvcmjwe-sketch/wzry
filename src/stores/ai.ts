import { defineStore } from 'pinia';
import type { AIProfile, AIPersonality, AIStrategy } from '@/types/ai';
import { AI_TEMPLATES } from '@/types/ai';

interface AIState {
  aiProfiles: Record<string, AIProfile>;
}

export const useAIStore = defineStore('ai', {
  state: (): AIState => ({
    aiProfiles: {},
  }),

  getters: {
    getAIProfile: (state) => {
      return (clubId: string): AIProfile | undefined => {
        return state.aiProfiles[clubId];
      };
    },

    hasAIProfile: (state) => {
      return (clubId: string): boolean => {
        return clubId in state.aiProfiles;
      };
    },

    allAIProfiles: (state): AIProfile[] => {
      return Object.values(state.aiProfiles);
    },

    aiProfileCount: (state): number => {
      return Object.keys(state.aiProfiles).length;
    },
  },

  actions: {
    initAIClub(clubId: string, templateName: string = 'balanced'): AIProfile {
      const template = AI_TEMPLATES[templateName] || AI_TEMPLATES.balanced;

      if (!template) {
        throw new Error('AI template not found');
      }

      const profile: AIProfile = {
        clubId,
        template: templateName,
        personality: {
          aggressiveness: template.aggressiveness,
          patience: template.patience,
          riskTolerance: template.riskTolerance,
          loyalty: template.loyalty,
        },
        strategy: {
          preferredPlayStyle: 'balanced',
          transferFocus: 'balanced',
          trainingFocus: 'balanced',
        },
      };

      this.aiProfiles[clubId] = profile;
      return profile;
    },

    /**
     * 设置/更新 AI Profile
     */
    setAIProfile(clubId: string, profile: AIProfile): void {
      this.aiProfiles[clubId] = profile;
    },
    
    updateAIPersonality(clubId: string, personality: Partial<AIPersonality>): boolean {
      const profile = this.aiProfiles[clubId];
      if (!profile) return false;
      
      profile.personality = {
        ...profile.personality,
        ...personality,
      };
      
      return true;
    },
    
    updateAIStrategy(clubId: string, strategy: Partial<AIStrategy>): boolean {
      const profile = this.aiProfiles[clubId];
      if (!profile) return false;
      
      profile.strategy = {
        ...profile.strategy,
        ...strategy,
      };
      
      return true;
    },
    
    removeAIClub(clubId: string): boolean {
      if (!this.aiProfiles[clubId]) return false;
      
      delete this.aiProfiles[clubId];
      return true;
    },
    
    clearAllAIProfiles(): void {
      this.aiProfiles = {};
    },
  },
  
  persist: true,
});
