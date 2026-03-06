import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Achievement, AchievementCategory, AchievementNotification, AchievementReward } from '@/types/achievement';
import { achievementService } from '@/core/services/achievementService';
import { useClubStore } from '@/stores/club';
import { useFanReputationStore } from '@/stores/fanReputation';
import { useSponsorStore } from '@/stores/sponsor';

export const useAchievementStore = defineStore('achievement', () => {
  const achievements = ref<Achievement[]>([]);
  const notifications = ref<AchievementNotification[]>([]);
  const showNotification = ref(false);
  const currentNotification = ref<AchievementNotification | null>(null);

  const completedCount = computed(() => achievements.value.filter(a => a.completed).length);
  const inProgressCount = computed(() => achievements.value.filter(a => !a.completed && a.progress > 0).length);
  const totalCount = computed(() => achievements.value.length);
  const progressPercentage = computed(() => {
    if (totalCount.value === 0) return 0;
    return Math.round((completedCount.value / totalCount.value) * 100);
  });

  const achievementsByCategory = computed(() => {
    const categories: AchievementCategory[] = ['career', 'competition', 'management', 'development', 'social', 'special'];
    return categories.map(cat => ({
      category: cat,
      achievements: achievements.value.filter(a => a.category === cat),
      completedCount: achievements.value.filter(a => a.category === cat && a.completed).length,
    }));
  });

  function initialize() {
    achievementService.initialize();
    achievements.value = achievementService.getAchievements();
    
    achievementService.onAchievementUnlocked((notification) => {
      currentNotification.value = notification;
      showNotification.value = true;
      notifications.value = achievementService.getNotifications();
      grantRewards(notification.rewards);
    });
  }

  function grantRewards(rewards: AchievementReward) {
    const clubStore = useClubStore();
    const fanReputationStore = useFanReputationStore();
    
    if (rewards.funds) {
      clubStore.addFunds(rewards.funds);
    }
    if (rewards.fans) {
      fanReputationStore.addFans(rewards.fans);
    }
    if (rewards.reputation) {
      fanReputationStore.addReputation(rewards.reputation);
    }
  }

  function updateProgress(type: string, value: number) {
    achievementService.updateProgress(type as any, value);
    achievements.value = [...achievementService.getAchievements()];
  }

  function incrementProgress(type: string, amount: number = 1) {
    achievementService.incrementProgress(type as any, amount);
    achievements.value = [...achievementService.getAchievements()];
  }

  function getAchievement(achievementId: string): Achievement | undefined {
    return achievementService.getAchievement(achievementId);
  }

  function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return achievementService.getAchievementsByCategory(category);
  }

  function getCompletedAchievements(): Achievement[] {
    return achievementService.getCompletedAchievements();
  }

  function getInProgressAchievements(): Achievement[] {
    return achievementService.getInProgressAchievements();
  }

  function closeNotification() {
    showNotification.value = false;
    currentNotification.value = null;
  }

  function getTotalProgress() {
    return achievementService.getTotalProgress();
  }

  return {
    achievements,
    notifications,
    showNotification,
    currentNotification,
    completedCount,
    inProgressCount,
    totalCount,
    progressPercentage,
    achievementsByCategory,
    initialize,
    updateProgress,
    incrementProgress,
    getAchievement,
    getAchievementsByCategory,
    getCompletedAchievements,
    getInProgressAchievements,
    closeNotification,
    getTotalProgress,
  };
}, {
  persist: true,
});
