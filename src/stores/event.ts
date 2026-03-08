import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { eventTriggerSystem, type ClubState } from '@/core/services/eventSystem';
import type { GameEvent, ActiveEvent, EventHistory, EventConsequences } from '@/types/events';
import { useClubStore } from './club';
import { useFanReputationStore } from './fanReputation';
import { useGameStore } from './game';

export const useEventStore = defineStore('event', () => {
  const activeEvents = ref<ActiveEvent[]>([]);
  const eventHistory = ref<EventHistory[]>([]);
  const isLoading = ref(false);
  const lastTriggerDay = ref(-1);
  const lastEventConsequences = ref<EventConsequences | null>(null);

  const hasActiveEvents = computed(() => activeEvents.value.length > 0);
  const activeEventCount = computed(() => activeEvents.value.length);
  const pendingEvents = computed(() => activeEvents.value);
  const pendingEventCount = computed(() => activeEvents.value.length);
  
  function getClubState(): ClubState {
    const clubStore = useClubStore();
    const fanStore = useFanReputationStore();
    
    return {
      funds: clubStore.currentClub?.funds || 0,
      reputation: fanStore.reputationValue || 0,
      fans: fanStore.totalFans || 0,
      week: clubStore.currentWeek || 1,
      ranking: clubStore.currentClub?.ranking || 1,
      winRate: clubStore.winRate || 0,
      seasonPhase: 'regular',
      playerCount: clubStore.currentClub?.roster.length || 0,
      hasPlayer: (playerType: string) => {
        return clubStore.currentClub?.roster.some(p => {
          if (playerType === 'star') return p.stats.mechanics > 80;
          if (playerType === 'veteran') return p.stats.experience > 80;
          if (playerType === 'rookie') return p.stats.potential > 80;
          return false;
        }) || false;
      },
    };
  }

  function triggerDailyEvent(): ActiveEvent[] {
    const gameStore = useGameStore();
    const currentDay = gameStore.currentWeek;
    const clubState = getClubState();
    const newEvents = eventTriggerSystem.triggerDailyEvent(currentDay, clubState);
    
    if (newEvents.length > 0) {
      activeEvents.value = eventTriggerSystem.getActiveEvents();
      lastTriggerDay.value = currentDay;
    }
    
    return newEvents;
  }

  function selectEventOption(eventId: string, optionId: string): EventConsequences | null {
    const consequences = eventTriggerSystem.selectEventOption(eventId, optionId);
    
    if (consequences) {
      applyConsequences(consequences);
      lastEventConsequences.value = consequences;
      activeEvents.value = eventTriggerSystem.getActiveEvents();
      eventHistory.value = eventTriggerSystem.getEventHistory();
    }
    
    return consequences;
  }

  function applyConsequences(consequences: EventConsequences): void {
    const clubStore = useClubStore();
    const fanStore = useFanReputationStore();
    
    if (consequences.funds) {
      clubStore.updateFunds(consequences.funds);
    }
    
    if (consequences.reputation) {
      fanStore.updateReputation(consequences.reputation);
    }
    
    if (consequences.fans) {
      fanStore.addFans(consequences.fans);
    }
    
    if (consequences.morale && clubStore.currentClub) {
      clubStore.currentClub.roster.forEach(player => {
        player.stats.mentality = Math.max(0, Math.min(100, 
          player.stats.mentality + consequences.morale!
        ));
      });
    }
  }

  function refreshEvents(): void {
    activeEvents.value = eventTriggerSystem.getActiveEvents();
    eventHistory.value = eventTriggerSystem.getEventHistory();
  }

  function clearExpiredEvents(currentDay: number): void {
    eventTriggerSystem.clearExpiredEvents(currentDay);
    activeEvents.value = eventTriggerSystem.getActiveEvents();
  }

  function reset(): void {
    eventTriggerSystem.reset();
    activeEvents.value = [];
    eventHistory.value = [];
    lastTriggerDay.value = -1;
    lastEventConsequences.value = null;
  }

  return {
    activeEvents,
    eventHistory,
    isLoading,
    lastTriggerDay,
    lastEventConsequences,
    hasActiveEvents,
    activeEventCount,
    pendingEvents,
    pendingEventCount,
    triggerDailyEvent,
    selectEventOption,
    refreshEvents,
    clearExpiredEvents,
    reset,
    getClubState,
  };
});
