import { defineStore } from 'pinia';
import type { HomeVenue, VenueStats } from '@/types/homeVenue';
import {
  initializeVenue,
  calculateHomeAdvantage,
  calculateVenueStats,
  calculateWeeklyMaintenance,
} from '@/core/services/homeVenueService';

interface HomeVenueState {
  venues: Record<string, HomeVenue>;
}

export const useHomeVenueStore = defineStore('homeVenue', {
  state: (): HomeVenueState => ({
    venues: {},
  }),

  getters: {
    getVenue: (state) => (clubId: string): HomeVenue | undefined => {
      return state.venues[clubId];
    },

    getVenueStats: (state) => (clubId: string): VenueStats => {
      const venue = state.venues[clubId];
      if (!venue) {
        return {
          totalCapacity: 0,
          utilizationRate: 0,
          facilityScore: 0,
          atmosphereScore: 0,
          commercialRevenue: 0,
          homeAdvantage: 0,
        };
      }
      return calculateVenueStats(clubId);
    },

    getHomeAdvantage: (state) => (clubId: string): number => {
      const venue = state.venues[clubId];
      if (!venue) return 0;
      return calculateHomeAdvantage(clubId);
    },

    getWeeklyMaintenance: (state) => (clubId: string): number => {
      const venue = state.venues[clubId];
      if (!venue) return 0;
      return calculateWeeklyMaintenance(clubId);
    },

    hasVenue: (state) => (clubId: string): boolean => {
      return !!state.venues[clubId];
    },

    getAllVenues: (state) => (): HomeVenue[] => {
      return Object.values(state.venues);
    },
  },

  actions: {
    initVenue(clubId: string, name?: string): HomeVenue {
      if (this.venues[clubId]) {
        return this.venues[clubId];
      }

      const venue = initializeVenue(clubId, name);
      this.venues[clubId] = venue;
      return venue;
    },

    updateVenue(clubId: string, venue: HomeVenue): void {
      venue.updatedAt = new Date();
      this.venues[clubId] = venue;
    },

    updateVenueName(clubId: string, name: string): boolean {
      const venue = this.venues[clubId];
      if (!venue) return false;

      venue.name = name;
      venue.updatedAt = new Date();
      return true;
    },

    updateCapacity(clubId: string, capacity: number): boolean {
      const venue = this.venues[clubId];
      if (!venue) return false;

      venue.capacity = Math.min(50000, Math.max(1000, capacity));
      venue.level = this.determineVenueLevel(venue.capacity);
      venue.updatedAt = new Date();
      return true;
    },

    updateFacilityCondition(clubId: string, facilityType: string, condition: number): boolean {
      const venue = this.venues[clubId];
      if (!venue) return false;

      const facility = venue.facilities[facilityType as keyof typeof venue.facilities];
      if (facility) {
        facility.condition = Math.min(100, Math.max(0, condition));
        venue.updatedAt = new Date();
        return true;
      }
      return false;
    },

    updateMatchDayConfig(clubId: string, config: Partial<HomeVenue['matchDay']>): boolean {
      const venue = this.venues[clubId];
      if (!venue) return false;

      venue.matchDay = { ...venue.matchDay, ...config };
      venue.updatedAt = new Date();
      return true;
    },

    addHistoricalMoment(clubId: string, moment: { event: string; significance: string; attendance: number }): boolean {
      const venue = this.venues[clubId];
      if (!venue) return false;

      venue.culture.historicalMoments.push({
        date: new Date(),
        ...moment,
      });
      venue.updatedAt = new Date();
      return true;
    },

    addTradition(clubId: string, tradition: string): boolean {
      const venue = this.venues[clubId];
      if (!venue) return false;

      if (!venue.culture.traditions.includes(tradition)) {
        venue.culture.traditions.push(tradition);
        venue.updatedAt = new Date();
      }
      return true;
    },

    removeAdvertisement(clubId: string, adId: string): boolean {
      const venue = this.venues[clubId];
      if (!venue) return false;

      const index = venue.commercial.advertisements.findIndex(ad => ad.id === adId);
      if (index > -1) {
        venue.commercial.advertisements.splice(index, 1);
        venue.updatedAt = new Date();
        return true;
      }
      return false;
    },

    clearNamingRights(clubId: string): boolean {
      const venue = this.venues[clubId];
      if (!venue) return false;

      venue.commercial.namingRights = null;
      venue.updatedAt = new Date();
      return true;
    },

    upgradeShop(clubId: string): boolean {
      const venue = this.venues[clubId];
      if (!venue) return false;

      venue.commercial.merchandiseShop.level = Math.min(10, venue.commercial.merchandiseShop.level + 1);
      venue.commercial.merchandiseShop.capacity = venue.commercial.merchandiseShop.level * 100;
      venue.updatedAt = new Date();
      return true;
    },

    upgradeCatering(clubId: string): boolean {
      const venue = this.venues[clubId];
      if (!venue) return false;

      venue.commercial.catering.level = Math.min(10, venue.commercial.catering.level + 1);
      venue.commercial.catering.vendors = venue.commercial.catering.level * 5;
      venue.commercial.catering.quality = Math.min(100, 50 + venue.commercial.catering.level * 5);
      venue.updatedAt = new Date();
      return true;
    },

    clearVenue(clubId: string): void {
      delete this.venues[clubId];
    },

    determineVenueLevel(capacity: number): 'small' | 'medium' | 'large' | 'xlarge' {
      if (capacity <= 5000) return 'small';
      if (capacity <= 15000) return 'medium';
      if (capacity <= 30000) return 'large';
      return 'xlarge';
    },
  },

  persist: true,
});
