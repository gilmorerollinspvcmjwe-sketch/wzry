import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GameEvent, ActiveEvent, EventHistory, EventConsequences } from '@/types/events';
import { eventTriggerSystem } from '@/core/services/eventSystem';
import type { ClubState } from '@/core/services/eventSystem';

export const useEventStore = defineStore('event', () => {
  // State
  const activeEvents = ref<ActiveEvent[]>([]);
  const eventHistory = ref<EventHistory[]>([]);
  const currentEvent = ref<GameEvent | null>(null);
  const isModalVisible = ref(false);

  // Getters
  const hasActiveEvents = computed(() => activeEvents.value.length > 0);
  const activeEventsCount = computed(() => activeEvents.value.length);
  const pendingEvents = computed(() => activeEvents.value.filter(e => !e.selectedOptionId));

  // Actions
  /**
   * 触发每日事件
   */
  function triggerDailyEvent(currentDay: number, clubState: ClubState): ActiveEvent[] {
    const triggered = eventTriggerSystem.triggerDailyEvent(currentDay, clubState);
    
    if (triggered.length > 0) {
      activeEvents.value = [...activeEvents.value, ...triggered];
      
      // 如果有新事件且当前没有显示事件，显示第一个
      if (!isModalVisible.value && triggered.length > 0 && triggered[0]) {
        showEvent(triggered[0]);
      }
    }
    
    return triggered;
  }

  /**
   * 显示事件
   */
  function showEvent(event: GameEvent) {
    currentEvent.value = event;
    isModalVisible.value = true;
  }

  /**
   * 关闭事件弹窗
   */
  function closeEventModal() {
    isModalVisible.value = false;
    currentEvent.value = null;
    
    // 如果有下一个待处理事件，显示它
    const nextPending = pendingEvents.value[0];
    if (nextPending) {
      setTimeout(() => {
        showEvent(nextPending);
      }, 300);
    }
  }

  /**
   * 选择事件选项
   */
  function selectEventOption(eventId: string, optionId: string): EventConsequences | null {
    const consequences = eventTriggerSystem.selectEventOption(eventId, optionId);
    
    if (consequences) {
      // 更新进行中的事件列表
      activeEvents.value = activeEvents.value.filter(e => e.id !== eventId);
      
      // 添加到历史
      const history = eventTriggerSystem.getEventHistory(1);
      if (history.length > 0 && history[0]) {
        eventHistory.value.unshift(history[0]);
      }
      
      // 关闭弹窗或显示下一个事件
      closeEventModal();
    }
    
    return consequences;
  }

  /**
   * 获取事件历史
   */
  function loadEventHistory(limit: number = 50) {
    eventHistory.value = eventTriggerSystem.getEventHistory(limit);
  }

  /**
   * 清除过期事件
   */
  function clearExpiredEvents(currentDay: number) {
    eventTriggerSystem.clearExpiredEvents(currentDay);
    activeEvents.value = eventTriggerSystem.getActiveEvents();
  }

  /**
   * 应用事件后果到俱乐部状态
   */
  function applyConsequences(consequences: EventConsequences, clubStore: any) {
    if (!consequences) return;

    // 财务影响
    if (consequences.fundsChange) {
      clubStore.updateFunds(consequences.fundsChange);
    }
    if (consequences.salaryChange) {
      clubStore.updateSalary(consequences.salaryChange);
    }

    // 声望影响
    if (consequences.reputationChange) {
      clubStore.updateReputation(consequences.reputationChange);
    }
    if (consequences.fanChange) {
      clubStore.updateFans(consequences.fanChange);
    }

    // 士气影响
    if (consequences.moraleChange) {
      clubStore.updateMorale(consequences.moraleChange);
    }

    // 选手状态影响
    if (consequences.staminaChange) {
      clubStore.updateStamina(consequences.staminaChange);
    }
    if (consequences.mentalityChange) {
      clubStore.updateMentality(consequences.mentalityChange);
    }

    // 特定选手影响
    if (consequences.affectedPlayerId && consequences.playerMoraleChange) {
      clubStore.updatePlayerMorale(consequences.affectedPlayerId, consequences.playerMoraleChange);
    }
  }

  /**
   * 重置系统
   */
  function reset() {
    activeEvents.value = [];
    eventHistory.value = [];
    currentEvent.value = null;
    isModalVisible.value = false;
    eventTriggerSystem.reset();
  }

  return {
    // State
    activeEvents,
    eventHistory,
    currentEvent,
    isModalVisible,
    
    // Getters
    hasActiveEvents,
    activeEventsCount,
    pendingEvents,
    
    // Actions
    triggerDailyEvent,
    showEvent,
    closeEventModal,
    selectEventOption,
    loadEventHistory,
    clearExpiredEvents,
    applyConsequences,
    reset,
  };
});
