import { defineStore } from 'pinia';
import type {
  PlayerStoryline,
  StoryChapter,
  StoryImpact,
} from '@/types/storyline';
import {
  generateStoryline,
  checkTrigger,
  processChoice,
  applyConsequences,
  advanceStoryline,
  shouldGenerateStoryline,
  getStorylineProgress,
} from '@/core/services/storylineService';

interface StorylineState {
  storylines: Record<string, PlayerStoryline>;
  activeEvents: {
    storylineId: string;
    chapterNumber: number;
    triggeredAt: Date;
  }[];
}

export const useStorylineStore = defineStore('storyline', {
  state: (): StorylineState => ({
    storylines: {},
    activeEvents: [],
  }),

  getters: {
    getStoryline: (state) => (id: string): PlayerStoryline | undefined => {
      return state.storylines[id];
    },

    getStorylinesForPlayer: (state) => (playerId: string): PlayerStoryline[] => {
      return Object.values(state.storylines).filter(s => s.playerId === playerId);
    },

    getActiveStorylinesForPlayer: (state) => (playerId: string): PlayerStoryline[] => {
      return Object.values(state.storylines).filter(
        s => s.playerId === playerId && s.status === 'active'
      );
    },

    getCompletedStorylinesForPlayer: (state) => (playerId: string): PlayerStoryline[] => {
      return Object.values(state.storylines).filter(
        s => s.playerId === playerId && s.status === 'completed'
      );
    },

    getAllActiveStorylines: (state) => (): PlayerStoryline[] => {
      return Object.values(state.storylines).filter(s => s.status === 'active');
    },

    getCurrentChapter: (state) => (storylineId: string): StoryChapter | undefined => {
      const storyline = state.storylines[storylineId];
      if (!storyline) return undefined;
      return storyline.chapters.find(c => c.number === storyline.currentChapter);
    },

    getPendingEvents: (state) => () => {
      return state.activeEvents;
    },

    hasPendingEvent: (state) => (playerId: string): boolean => {
      return state.activeEvents.some(event => {
        const storyline = state.storylines[event.storylineId];
        return storyline?.playerId === playerId;
      });
    },

    getStorylineProgress: (state) => (storylineId: string) => {
      const storyline = state.storylines[storylineId];
      if (!storyline) return { completedChapters: 0, totalChapters: 0, progressPercent: 0 };
      return getStorylineProgress(storyline);
    },
  },

  actions: {
    addStoryline(storyline: PlayerStoryline) {
      this.storylines[storyline.id] = storyline;
    },

    removeStoryline(id: string) {
      delete this.storylines[id];
      this.activeEvents = this.activeEvents.filter(e => e.storylineId !== id);
    },

    generatePlayerStoryline(playerId: string): PlayerStoryline {
      const storyline = generateStoryline(playerId);
      this.addStoryline(storyline);
      return storyline;
    },

    processPlayerChoice(
      playerId: string,
      storylineId: string,
      chapterNumber: number,
      choiceId: string
    ): { success: boolean; impact: StoryImpact; storylineCompleted: boolean } {
      const result = processChoice(playerId, storylineId, chapterNumber, choiceId);

      if (result.success) {
        this.activeEvents = this.activeEvents.filter(
          e => !(e.storylineId === storylineId && e.chapterNumber === chapterNumber)
        );
      }

      return result;
    },

    checkStorylineTriggers(playerId: string): StoryChapter | null {
      const chapter = advanceStoryline(playerId);

      if (chapter) {
        const storyline = this.getActiveStorylinesForPlayer(playerId)[0];
        if (storyline) {
          const existingEvent = this.activeEvents.find(
            e => e.storylineId === storyline.id && e.chapterNumber === chapter.number
          );

          if (!existingEvent) {
            this.activeEvents.push({
              storylineId: storyline.id,
              chapterNumber: chapter.number,
              triggeredAt: new Date(),
            });
          }
        }
      }

      return chapter;
    },

    checkAllStorylineTriggers() {
      const allStorylines = this.getAllActiveStorylines();
      const playerIds = [...new Set(allStorylines.map(s => s.playerId))];

      for (const playerId of playerIds) {
        this.checkStorylineTriggers(playerId);
      }
    },

    dismissEvent(storylineId: string, chapterNumber: number) {
      this.activeEvents = this.activeEvents.filter(
        e => !(e.storylineId === storylineId && e.chapterNumber === chapterNumber)
      );
    },

    abandonStoryline(storylineId: string) {
      const storyline = this.storylines[storylineId];
      if (storyline) {
        storyline.status = 'abandoned';
        storyline.updatedAt = new Date();
      }

      this.activeEvents = this.activeEvents.filter(e => e.storylineId !== storylineId);
    },

    completeStoryline(storylineId: string) {
      const storyline = this.storylines[storylineId];
      if (storyline) {
        storyline.status = 'completed';
        storyline.completedAt = new Date();
        storyline.updatedAt = new Date();
      }

      this.activeEvents = this.activeEvents.filter(e => e.storylineId !== storylineId);
    },

    checkAndGenerateStorylines(playerIds: string[]) {
      for (const playerId of playerIds) {
        const activeStorylines = this.getActiveStorylinesForPlayer(playerId);

        if (activeStorylines.length === 0 && shouldGenerateStoryline(playerId)) {
          this.generatePlayerStoryline(playerId);
        }
      }
    },

    updateStorylineImpact(storylineId: string, impact: StoryImpact) {
      const storyline = this.storylines[storylineId];
      if (storyline) {
        storyline.impact = {
          ...storyline.impact,
          ...impact,
        };
        storyline.updatedAt = new Date();
      }
    },

    getStorylinesByType: (state) => (type: string): PlayerStoryline[] => {
      return Object.values(state.storylines).filter(s => s.type === type);
    },

    clearPlayerStorylines(playerId: string) {
      const idsToRemove = Object.keys(this.storylines).filter(
        id => this.storylines[id]?.playerId === playerId
      );

      for (const id of idsToRemove) {
        delete this.storylines[id];
      }

      this.activeEvents = this.activeEvents.filter(event => {
        const storyline = this.storylines[event.storylineId];
        return storyline?.playerId !== playerId;
      });
    },

    clearAllStorylines() {
      this.storylines = {};
      this.activeEvents = [];
    },

    importStorylines(storylines: PlayerStoryline[]) {
      for (const storyline of storylines) {
        this.storylines[storyline.id] = storyline;
      }
    },

    exportStorylines(): PlayerStoryline[] {
      return Object.values(this.storylines);
    },
  },

  persist: true,
});
