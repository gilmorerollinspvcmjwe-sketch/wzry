import type { Achievement, AchievementConditionType, AchievementReward, AchievementNotification } from '@/types/achievement';
import { ACHIEVEMENTS, getAchievementsByCategory, getAchievementById } from '@/data/achievements';

export class AchievementService {
  private achievements: Achievement[] = [];
  private notifications: AchievementNotification[] = [];
  private unlockListeners: ((notification: AchievementNotification) => void)[] = [];

  constructor() {
    this.initialize();
  }

  initialize(): void {
    this.achievements = ACHIEVEMENTS.map(a => ({ ...a }));
    this.notifications = [];
  }

  onAchievementUnlocked(listener: (notification: AchievementNotification) => void): void {
    this.unlockListeners.push(listener);
  }

  private notifyListeners(notification: AchievementNotification): void {
    this.unlockListeners.forEach(listener => listener(notification));
  }

  updateProgress(type: AchievementConditionType, value: number): void {
    const achievement = this.achievements.find(a => a.condition.type === type);
    if (!achievement || achievement.completed) return;

    achievement.progress = value;
    
    if (value >= achievement.condition.target) {
      this.completeAchievement(achievement.id);
    }
  }

  incrementProgress(type: AchievementConditionType, amount: number = 1): void {
    const achievement = this.achievements.find(a => a.condition.type === type);
    if (!achievement || achievement.completed) return;

    achievement.progress += amount;
    
    if (achievement.progress >= achievement.condition.target) {
      this.completeAchievement(achievement.id);
    }
  }

  private completeAchievement(achievementId: string): void {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.completed) return;

    achievement.completed = true;
    achievement.completedAt = new Date();

    const notification: AchievementNotification = {
      achievementId: achievement.id,
      achievementName: achievement.name,
      achievementDescription: achievement.description,
      rarity: achievement.rarity,
      rewards: achievement.rewards,
      timestamp: new Date(),
    };

    this.notifications.unshift(notification);
    this.notifyListeners(notification);
  }

  getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.find(a => a.id === achievementId);
  }

  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  getCompletedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.completed);
  }

  getInProgressAchievements(): Achievement[] {
    return this.achievements.filter(a => !a.completed && a.progress > 0);
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.completed);
  }

  getAchievementProgress(achievementId: string): number {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    return (achievement.progress / achievement.condition.target) * 100;
  }

  getTotalProgress(): { completed: number; inProgress: number; total: number } {
    const completed = this.achievements.filter(a => a.completed).length;
    const inProgress = this.achievements.filter(a => !a.completed && a.progress > 0).length;
    return {
      completed,
      inProgress,
      total: this.achievements.length,
    };
  }

  getNotifications(): AchievementNotification[] {
    return [...this.notifications];
  }

  clearNotification(achievementId: string): void {
    this.notifications = this.notifications.filter(n => n.achievementId !== achievementId);
  }

  reset(): void {
    this.achievements = ACHIEVEMENTS.map(a => ({ ...a }));
    this.notifications = [];
  }
}

export const achievementService = new AchievementService();
