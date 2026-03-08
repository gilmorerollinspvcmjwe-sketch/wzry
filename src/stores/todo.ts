import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useClubStore } from './club';
import { useSponsorStore } from './sponsor';
import { useEventStore } from './event';
import { useInterviewStore } from './interview';
import { useGameStore } from './game';

export interface Todo {
  id: string;
  type: 'sponsor' | 'player_contract' | 'event' | 'interview' | 'match' | 'training' | 'other';
  priority: 'low' | 'medium' | 'high';
  message: string;
  action?: string;
  data?: any;
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([]);

  const highPriorityTodos = computed(() => 
    todos.value.filter(t => t.priority === 'high')
  );

  const mediumPriorityTodos = computed(() => 
    todos.value.filter(t => t.priority === 'medium')
  );

  const lowPriorityTodos = computed(() => 
    todos.value.filter(t => t.priority === 'low')
  );

  const sortedTodos = computed(() => [
    ...highPriorityTodos.value,
    ...mediumPriorityTodos.value,
    ...lowPriorityTodos.value
  ]);

  function generateTodos(): void {
    const newTodos: Todo[] = [];
    const clubStore = useClubStore();
    const sponsorStore = useSponsorStore();
    const eventStore = useEventStore();
    const interviewStore = useInterviewStore();
    const gameStore = useGameStore();

    if (clubStore.currentClub) {
      clubStore.currentClub.roster.forEach(player => {
        if (player.contract && player.contract.remainingDays !== undefined) {
          if (player.contract.remainingDays <= 30) {
            newTodos.push({
              id: `contract_${player.id}`,
              type: 'player_contract',
              priority: player.contract.remainingDays <= 7 ? 'high' : 'medium',
              message: `${player.name}的合同即将到期（${player.contract.remainingDays}天）`,
              action: '/team',
              data: { playerId: player.id }
            });
          }
        }
      });
    }

    if (sponsorStore.currentContract) {
      const remainingWeeks = sponsorStore.remainingWeeks;
      if (remainingWeeks <= 4) {
        newTodos.push({
          id: `sponsor_${sponsorStore.currentContract.sponsor.id}`,
          type: 'sponsor',
          priority: remainingWeeks <= 2 ? 'high' : 'medium',
          message: `赞助商${sponsorStore.currentContract.sponsor.name}合同还有${remainingWeeks}周到期`,
          action: '/sponsor',
          data: { sponsorId: sponsorStore.currentContract.sponsor.id }
        });
      }
    }

    eventStore.pendingEvents.forEach(event => {
      newTodos.push({
        id: `event_${event.id}`,
        type: 'event',
        priority: event.rarity === 'epic' || event.rarity === 'rare' ? 'high' : 'medium',
        message: `事件待处理：${event.title}`,
        action: '/events',
        data: { eventId: event.id }
      });
    });

    interviewStore.pendingInterviews.forEach(interview => {
      newTodos.push({
        id: `interview_${interview.id}`,
        type: 'interview',
        priority: 'medium',
        message: `媒体采访请求：${interview.mediaOutlet}`,
        action: '/interview',
        data: { interviewId: interview.id }
      });
    });

    todos.value = newTodos;
  }

  function removeTodo(id: string): void {
    todos.value = todos.value.filter(t => t.id !== id);
  }

  function addTodo(todo: Todo): void {
    const exists = todos.value.some(t => t.id === todo.id);
    if (!exists) {
      todos.value.push(todo);
    }
  }

  function clearTodos(): void {
    todos.value = [];
  }

  return {
    todos,
    highPriorityTodos,
    mediumPriorityTodos,
    lowPriorityTodos,
    sortedTodos,
    generateTodos,
    removeTodo,
    addTodo,
    clearTodos
  };
});
