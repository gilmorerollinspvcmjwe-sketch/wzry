import { defineStore } from 'pinia';
import type {
  PlayerRelationship,
  TeamChemistry,
  TeamConflict,
  RelationshipEvent,
} from '@/types/relationship';
import {
  initializeRelationships,
  updateRelationship,
  calculateTeamChemistry,
  detectConflicts,
  generateRelationshipEvent,
  getRelationshipEffects,
} from '@/core/services/relationshipService';

interface RelationshipState {
  relationships: Record<string, PlayerRelationship>;
  teamChemistries: Record<string, TeamChemistry>;
  events: RelationshipEvent[];
}

function getRelationshipKey(player1Id: string, player2Id: string): string {
  return [player1Id, player2Id].sort().join('_');
}

export const useRelationshipStore = defineStore('relationship', {
  state: (): RelationshipState => ({
    relationships: {},
    teamChemistries: {},
    events: [],
  }),

  getters: {
    getRelationship: (state) => (player1Id: string, player2Id: string): PlayerRelationship | undefined => {
      const key = getRelationshipKey(player1Id, player2Id);
      return state.relationships[key];
    },

    getClubRelationships: (state) => (clubId: string): PlayerRelationship[] => {
      return Object.values(state.relationships);
    },

    getTeamChemistry: (state) => (clubId: string): TeamChemistry | undefined => {
      return state.teamChemistries[clubId];
    },

    getPlayerRelationships: (state) => (playerId: string): PlayerRelationship[] => {
      return Object.values(state.relationships).filter(
        rel => rel.player1Id === playerId || rel.player2Id === playerId
      );
    },

    getConflicts: (state) => (clubId: string): TeamConflict[] => {
      const chemistry = state.teamChemistries[clubId];
      return chemistry?.conflicts || [];
    },

    getRecentEvents: (state) => (limit: number = 10): RelationshipEvent[] => {
      return [...state.events]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    },

    getRelationshipStrength: (state) => (player1Id: string, player2Id: string): number => {
      const key = getRelationshipKey(player1Id, player2Id);
      const rel = state.relationships[key];
      return rel?.strength || 0;
    },

    hasActiveConflict: (state) => (player1Id: string, player2Id: string): boolean => {
      const key = getRelationshipKey(player1Id, player2Id);
      const rel = state.relationships[key];
      return rel ? rel.strength < -30 : false;
    },
  },

  actions: {
    initClubRelationships(clubId: string, playerIds: string[]) {
      const newRelationships = initializeRelationships(playerIds);

      newRelationships.forEach(rel => {
        const key = getRelationshipKey(rel.player1Id, rel.player2Id);
        this.relationships[key] = rel;
      });

      this.recalculateTeamChemistry(clubId);
    },

    updatePlayerRelationship(
      player1Id: string,
      player2Id: string,
      change: number,
      eventType: any
    ) {
      const key = getRelationshipKey(player1Id, player2Id);
      const relationship = this.relationships[key];

      if (!relationship) return;

      const oldStrength = relationship.strength;
      relationship.strength = Math.max(-100, Math.min(100, oldStrength + change));
      relationship.lastInteraction = new Date();
      relationship.interactionFrequency += 1;

      if (relationship.strength >= 60) {
        relationship.type = 'friend';
      } else if (relationship.strength >= 30) {
        relationship.type = 'student';
      } else if (relationship.strength >= -30) {
        relationship.type = relationship.strength < 0 ? 'rival' : 'neutral';
      } else {
        relationship.type = 'hostile';
      }

      relationship.history.push({
        date: new Date(),
        eventType,
        description: `关系变化: ${change > 0 ? '+' : ''}${change}`,
        change,
      });
    },

    recalculateTeamChemistry(clubId: string) {
      const chemistry = calculateTeamChemistry(clubId);
      this.teamChemistries[clubId] = chemistry;
    },

    addRelationshipEvent(event: RelationshipEvent) {
      this.events.push(event);
    },

    generateEvent(player1Id: string, player2Id: string): RelationshipEvent | null {
      const event = generateRelationshipEvent(player1Id, player2Id);
      if (event) {
        this.events.push(event);
      }
      return event;
    },

    resolveConflict(clubId: string, conflictId: string, resolution: string) {
      const chemistry = this.teamChemistries[clubId];
      if (!chemistry) return false;

      const conflict = chemistry.conflicts.find(c => c.id === conflictId);
      if (!conflict) return false;

      this.updatePlayerRelationship(conflict.player1Id, conflict.player2Id, 20, 'reconciliation');

      conflict.status = 'resolved';
      conflict.resolution = resolution;

      this.recalculateTeamChemistry(clubId);

      return true;
    },

    applyTeamBuilding(clubId: string) {
      const relationships = Object.values(this.relationships);

      relationships.forEach(rel => {
        const improvement = Math.floor(Math.random() * 8) + 3;
        this.updatePlayerRelationship(rel.player1Id, rel.player2Id, improvement, 'celebration');
      });

      this.recalculateTeamChemistry(clubId);

      return true;
    },

    clearClubRelationships(clubId: string) {
      delete this.teamChemistries[clubId];
    },

    getEffects(player1Id: string, player2Id: string) {
      return getRelationshipEffects(player1Id, player2Id);
    },

    processMatchResult(clubId: string, playerIds: string[], won: boolean) {
      const change = won ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * -10) - 5;

      for (let i = 0; i < playerIds.length; i++) {
        for (let j = i + 1; j < playerIds.length; j++) {
          this.updatePlayerRelationship(
            playerIds[i]!,
            playerIds[j]!,
            change,
            won ? 'match_cooperation' : 'match_conflict'
          );
        }
      }

      this.recalculateTeamChemistry(clubId);
    },
  },

  persist: true,
});
