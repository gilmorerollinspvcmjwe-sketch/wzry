import { defineStore } from 'pinia';
import { commercialService } from '@/core/services/commercialService';
import type {
  CommercialActivity,
  CommercialActivityOffer,
  PlayerCommercialProfile,
  EndorsementContract,
  ControversyEvent,
  CommercialBrand,
} from '@/types/commercial';
import { CommercialActivityStatus } from '@/types/commercial';
import { useFanReputationStore } from './fanReputation';

interface CommercialState {
  initialized: boolean;
  profiles: Map<string, PlayerCommercialProfile>;
  pendingOffers: CommercialActivityOffer[];
  activeControversies: ControversyEvent[];
  availableBrands: CommercialBrand[];
  lastOfferCheck: number;
}

export const useCommercialStore = defineStore('commercial', {
  state: (): CommercialState => ({
    initialized: false,
    profiles: new Map(),
    pendingOffers: [],
    activeControversies: [],
    availableBrands: [],
    lastOfferCheck: 0,
  }),

  getters: {
    getProfile: (state) => (playerId: string) => {
      return state.profiles.get(playerId);
    },

    getPlayerPendingActivities: (state) => (playerId: string) => {
      const profile = state.profiles.get(playerId);
      if (!profile) return [];
      return profile.pendingActivities.filter(
        a => a.status === CommercialActivityStatus.PENDING
      );
    },

    getPlayerActiveEndorsements: (state) => (playerId: string) => {
      const profile = state.profiles.get(playerId);
      if (!profile) return [];
      return profile.activeEndorsements;
    },

    getPlayerCompletedActivities: (state) => (playerId: string) => {
      const profile = state.profiles.get(playerId);
      if (!profile) return [];
      return profile.completedActivities;
    },

    getPlayerStatistics: (state) => (playerId: string) => {
      const profile = state.profiles.get(playerId);
      if (!profile) return null;
      return profile.statistics;
    },

    getPlayerControversies: (state) => (playerId: string) => {
      return state.activeControversies.filter(c => c.playerId === playerId);
    },

    totalPendingOffers: (state) => state.pendingOffers.length,

    hasActiveControversies: (state) => state.activeControversies.length > 0,
  },

  actions: {
    initialize() {
      if (this.initialized) return;

      this.availableBrands = commercialService.getAvailableBrands();
      this.initialized = true;
    },

    initializePlayerProfile(
      playerId: string,
      playerStats: {
        avgStats: number;
        age: number;
        fans: number;
        reputation: number;
      }
    ) {
      const existingProfile = this.profiles.get(playerId);
      if (existingProfile) return existingProfile;

      const profile = commercialService.initializeCommercialProfile(playerId, playerStats);
      this.profiles.set(playerId, profile);
      return profile;
    },

    generateOfferForPlayer(
      playerId: string,
      playerStats: {
        avgStats: number;
        age: number;
        fans: number;
        reputation: number;
        ranking?: number;
      }
    ): CommercialActivityOffer | null {
      const offer = commercialService.generateEndorsementOffer(playerId, playerStats);
      if (offer) {
        this.pendingOffers.push(offer);
        const profile = this.profiles.get(playerId);
        if (profile) {
          const existingIndex = profile.pendingActivities.findIndex(
            a => a.id === offer.activity.id
          );
          if (existingIndex === -1) {
            profile.pendingActivities.push(offer.activity);
          }
        }
      }
      this.lastOfferCheck = Date.now();
      return offer;
    },

    acceptActivity(playerId: string, activityId: string) {
      const result = commercialService.acceptActivity(playerId, activityId);

      if (result.success) {
        const profile = this.profiles.get(playerId);
        if (profile && result.activity) {
          const index = profile.pendingActivities.findIndex(a => a.id === activityId);
          if (index !== -1) {
            profile.pendingActivities.splice(index, 1);
          }

          if (result.activity.type === 'endorsement') {
            const contract = profile.activeEndorsements.find(
              c => c.brandName === result.activity!.brand
            );
            if (!contract) {
              profile.pendingActivities.push(result.activity);
            }
          } else {
            profile.pendingActivities.push(result.activity);
          }
        }

        this.pendingOffers = this.pendingOffers.filter(
          o => o.activity.id !== activityId
        );
      }

      return result;
    },

    rejectActivity(playerId: string, activityId: string) {
      const result = commercialService.rejectActivity(playerId, activityId);

      if (result.success) {
        const profile = this.profiles.get(playerId);
        if (profile) {
          const index = profile.pendingActivities.findIndex(a => a.id === activityId);
          if (index !== -1) {
            profile.pendingActivities.splice(index, 1);
          }
        }

        this.pendingOffers = this.pendingOffers.filter(
          o => o.activity.id !== activityId
        );
      }

      return result;
    },

    completeActivity(playerId: string, activityId: string) {
      const result = commercialService.completeActivity(playerId, activityId);

      if (result.success) {
        const profile = this.profiles.get(playerId);
        if (profile && result.impact) {
          profile.statistics.totalActivities++;
          profile.statistics.totalIncome += result.impact.income;
          profile.statistics.successfulActivities++;

          const fanStore = useFanReputationStore();
          if (result.impact.fanGain) {
            fanStore.addFans(Math.floor(result.impact.fanGain));
          }
          if (result.impact.reputationGain) {
            fanStore.addReputation(result.impact.reputationGain);
          }

          const activityIndex = profile.pendingActivities.findIndex(a => a.id === activityId);
          if (activityIndex !== -1) {
            const activity = profile.pendingActivities[activityIndex];
            if (activity) {
              activity.status = CommercialActivityStatus.COMPLETED;
              profile.pendingActivities.splice(activityIndex, 1);
              profile.completedActivities.push(activity);
            }
          }
        }
      }

      return result;
    },

    handleControversy(playerId: string, activityId: string, resolutionId: string) {
      const result = commercialService.handleControversy(playerId, activityId, resolutionId);

      if (result.success) {
        this.activeControversies = this.activeControversies.filter(
          c => !(c.activityId === activityId && c.playerId === playerId)
        );

        const profile = this.profiles.get(playerId);
        if (profile && result.impact) {
          profile.reputation.overall = Math.max(
            0,
            Math.min(100, profile.reputation.overall + result.impact.reputation)
          );
        }
      }

      return result;
    },

    processWeeklyEndorsements(playerId: string) {
      const result = commercialService.processWeeklyEndorsements(playerId);

      if (result.completedContracts.length > 0) {
        const profile = this.profiles.get(playerId);
        if (profile) {
          for (const contract of result.completedContracts) {
            const index = profile.activeEndorsements.findIndex(c => c.id === contract.id);
            if (index !== -1) {
              profile.activeEndorsements.splice(index, 1);
            }
            const existingPast = profile.pastEndorsements.find(c => c.id === contract.id);
            if (!existingPast) {
              profile.pastEndorsements.push(contract);
            }
          }
        }
      }

      return result;
    },

    updatePlayerPreferences(
      playerId: string,
      preferences: Partial<PlayerCommercialProfile['preferences']>
    ) {
      const success = commercialService.updatePreferences(playerId, preferences);

      if (success) {
        const profile = this.profiles.get(playerId);
        if (profile) {
          profile.preferences = { ...profile.preferences, ...preferences };
        }
      }

      return success;
    },

    loadControversies(playerId: string) {
      const controversies = commercialService.getActiveControversies(playerId);
      this.activeControversies = [
        ...this.activeControversies.filter(c => c.playerId !== playerId),
        ...controversies,
      ];
    },

    calculateCommercialValue(
      playerId: string,
      playerStats: {
        avgStats: number;
        age: number;
        fans: number;
        reputation: number;
      }
    ) {
      return commercialService.calculateCommercialValue(playerId, playerStats);
    },

    refreshProfile(playerId: string) {
      const profile = commercialService.getProfile(playerId);
      if (profile) {
        this.profiles.set(playerId, profile);
      }
      return profile;
    },

    reset() {
      this.profiles.clear();
      this.pendingOffers = [];
      this.activeControversies = [];
      this.initialized = false;
      this.lastOfferCheck = 0;
    },
  },

  persist: {
    key: 'commercial-store',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          initialized: state.initialized,
          profiles: Array.from(state.profiles.entries()),
          pendingOffers: state.pendingOffers,
          activeControversies: state.activeControversies,
          lastOfferCheck: state.lastOfferCheck,
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          initialized: parsed.initialized,
          profiles: new Map(parsed.profiles),
          pendingOffers: parsed.pendingOffers,
          activeControversies: parsed.activeControversies,
          availableBrands: commercialService.getAvailableBrands(),
          lastOfferCheck: parsed.lastOfferCheck,
        };
      },
    },
  },
});
