import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { interviewSystem } from '@/core/services/interviewSystem';
import type { Interview, InterviewAnswer } from '@/types/media';
import { useGameStore } from './game';
import { useClubStore } from './club';

export const useInterviewStore = defineStore('interview', () => {
  const pendingInterviews = ref<Interview[]>([]);
  const completedInterviews = ref<Interview[]>([]);
  const isLoading = ref(false);

  const hasPendingInterviews = computed(() => pendingInterviews.value.length > 0);
  const pendingCount = computed(() => pendingInterviews.value.length);

  function refreshInterviews(): void {
    pendingInterviews.value = interviewSystem.getPendingInterviews();
    completedInterviews.value = interviewSystem.getCompletedInterviews();
  }

  function answerInterview(interviewId: string, answers: InterviewAnswer[]): boolean {
    const success = interviewSystem.answerInterview(interviewId, answers);
    
    if (success) {
      refreshInterviews();
    }
    
    return success;
  }

  function declineInterview(interviewId: string): boolean {
    const success = interviewSystem.declineInterview(interviewId);
    
    if (success) {
      refreshInterviews();
    }
    
    return success;
  }

  function triggerPostMatchInterview(
    won?: boolean,
    isImportant?: boolean,
    clubState?: any,
    day?: number
  ): Interview | null {
    const gameStore = useGameStore();
    const clubStore = useClubStore();
    
    const actualWon = won ?? false;
    const actualIsImportant = isImportant ?? false;
    const actualDay = day ?? gameStore.currentWeek;
    const actualClubState = clubState ?? {
      reputation: clubStore.currentClub?.reputation || 50,
      winStreak: 0,
      recentPerformance: 'average'
    };
    
    const interview = interviewSystem.triggerPostMatchInterview(
      actualWon,
      actualIsImportant,
      actualClubState,
      actualDay
    );
    
    if (interview) {
      refreshInterviews();
    }
    
    return interview;
  }

  return {
    pendingInterviews,
    completedInterviews,
    isLoading,
    hasPendingInterviews,
    pendingCount,
    refreshInterviews,
    answerInterview,
    declineInterview,
    triggerPostMatchInterview,
  };
});
