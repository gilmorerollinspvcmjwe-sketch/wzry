import { defineStore } from 'pinia';
import type {
  AIPersonalityProfile,
  PersonalityType,
  Storyline,
} from '@/types/aiPersonality';

interface AIPersonalityState {
  profiles: Record<string, AIPersonalityProfile>;
}

export const useAIPersonalityStore = defineStore('aiPersonality', {
  state: (): AIPersonalityState => ({
    profiles: {},
  }),

  getters: {
    getProfile: (state) => {
      return (clubId: string): AIPersonalityProfile | undefined => {
        return state.profiles[clubId];
      };
    },

    hasProfile: (state) => {
      return (clubId: string): boolean => {
        return clubId in state.profiles;
      };
    },

    allProfiles: (state): AIPersonalityProfile[] => {
      return Object.values(state.profiles);
    },

    profileCount: (state): number => {
      return Object.keys(state.profiles).length;
    },

    getProfilesByPersonalityType: (state) => {
      return (type: PersonalityType): AIPersonalityProfile[] => {
        return Object.values(state.profiles).filter(p => p.personality === type);
      };
    },

    getActiveStorylines: (state): Array<{ clubId: string; storyline: Storyline }> => {
      return Object.entries(state.profiles).map(([clubId, profile]) => ({
        clubId,
        storyline: profile.storyline,
      }));
    },
  },

  actions: {
    setProfile(profile: AIPersonalityProfile): void {
      this.profiles[profile.clubId] = {
        ...profile,
        updatedAt: new Date(),
      };
    },

    updateProfile(clubId: string, updates: Partial<AIPersonalityProfile>): boolean {
      const profile = this.profiles[clubId];
      if (!profile) return false;

      this.profiles[clubId] = {
        ...profile,
        ...updates,
        updatedAt: new Date(),
      };

      return true;
    },

    updateTransferPreference(
      clubId: string,
      preference: Partial<AIPersonalityProfile['transferPreference']>
    ): boolean {
      const profile = this.profiles[clubId];
      if (!profile) return false;

      profile.transferPreference = {
        ...profile.transferPreference,
        ...preference,
      };
      profile.updatedAt = new Date();

      return true;
    },

    updateTacticalPreference(
      clubId: string,
      preference: Partial<AIPersonalityProfile['tacticalPreference']>
    ): boolean {
      const profile = this.profiles[clubId];
      if (!profile) return false;

      profile.tacticalPreference = {
        ...profile.tacticalPreference,
        ...preference,
      };
      profile.updatedAt = new Date();

      return true;
    },

    updateCoachingStyle(
      clubId: string,
      style: Partial<AIPersonalityProfile['coachingStyle']>
    ): boolean {
      const profile = this.profiles[clubId];
      if (!profile) return false;

      profile.coachingStyle = {
        ...profile.coachingStyle,
        ...style,
      };
      profile.updatedAt = new Date();

      return true;
    },

    updateBehaviors(
      clubId: string,
      behaviors: Partial<AIPersonalityProfile['behaviors']>
    ): boolean {
      const profile = this.profiles[clubId];
      if (!profile) return false;

      profile.behaviors = {
        ...profile.behaviors,
        ...behaviors,
      };
      profile.updatedAt = new Date();

      return true;
    },

    updateStoryline(
      clubId: string,
      storylineUpdates: Partial<Storyline>
    ): boolean {
      const profile = this.profiles[clubId];
      if (!profile) return false;

      profile.storyline = {
        ...profile.storyline,
        ...storylineUpdates,
      };
      profile.updatedAt = new Date();

      return true;
    },

    addStorylineEvent(
      clubId: string,
      event: Storyline['events'][0]
    ): boolean {
      const profile = this.profiles[clubId];
      if (!profile) return false;

      profile.storyline.events.push(event);
      profile.updatedAt = new Date();

      return true;
    },

    advanceStorylineChapter(clubId: string): boolean {
      const profile = this.profiles[clubId];
      if (!profile) return false;

      profile.storyline.currentChapter++;
      profile.updatedAt = new Date();

      return true;
    },

    completeStoryline(clubId: string): boolean {
      const profile = this.profiles[clubId];
      if (!profile) return false;

      profile.storyline.completedAt = new Date();
      profile.updatedAt = new Date();

      return true;
    },

    removeProfile(clubId: string): boolean {
      if (!this.profiles[clubId]) return false;

      delete this.profiles[clubId];
      return true;
    },

    clearAllProfiles(): void {
      this.profiles = {};
    },

    initializeProfilesForClubs(clubIds: string[]): void {
      const { AIPersonalityService } = require('@/core/services/aiPersonalityService');
      
      clubIds.forEach(clubId => {
        if (!this.hasProfile(clubId)) {
          AIPersonalityService.generateAIPersonality(clubId);
        }
      });
    },

    batchUpdateProfiles(updates: Array<{ clubId: string; updates: Partial<AIPersonalityProfile> }>): void {
      updates.forEach(({ clubId, updates: profileUpdates }) => {
        this.updateProfile(clubId, profileUpdates);
      });
    },

    getProfilesByStorylineType(type: Storyline['type']): AIPersonalityProfile[] {
      return Object.values(this.profiles).filter(p => p.storyline.type === type);
    },

    getHighAmbitionProfiles(threshold: number = 70): AIPersonalityProfile[] {
      return Object.values(this.profiles).filter(p => p.behaviors.ambition >= threshold);
    },

    getLowPatienceProfiles(threshold: number = 30): AIPersonalityProfile[] {
      return Object.values(this.profiles).filter(p => p.behaviors.patience <= threshold);
    },
  },

  persist: true,
});
