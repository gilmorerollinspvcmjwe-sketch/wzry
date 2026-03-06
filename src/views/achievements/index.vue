<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAchievementStore } from '@/stores/achievement';
import { getCategoryName, getRarityName, getRarityColor, type AchievementCategory } from '@/data/achievements';

const router = useRouter();
const achievementStore = useAchievementStore();

const selectedCategory = ref<AchievementCategory | 'all'>('all');

onMounted(() => {
  achievementStore.initialize();
});

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return achievementStore.achievements;
  }
  return achievementStore.achievements.filter(a => a.category === selectedCategory.value);
});

const categories = [
  { value: 'all', label: '全部' },
  { value: 'career', label: '职业生涯' },
  { value: 'competition', label: '比赛竞技' },
  { value: 'management', label: '俱乐部管理' },
  { value: 'development', label: '选手养成' },
  { value: 'social', label: '社交粉丝' },
  { value: 'special', label: '特殊成就' },
];

function getProgressWidth(achievement: any): string {
  const percentage = (achievement.progress / achievement.condition.target) * 100;
  return `${Math.min(percentage, 100)}%`;
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="achievements-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>成就系统</h1>
    </div>

    <!-- 进度概览 -->
    <div class="progress-overview">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${achievementStore.progressPercentage}%` }"
        ></div>
      </div>
      <div class="progress-text">
        总进度：{{ achievementStore.progressPercentage }}%
        <span class="stats">
          已完成：{{ achievementStore.completedCount }} | 
          进行中：{{ achievementStore.inProgressCount }} | 
          总数：{{ achievementStore.totalCount }}
        </span>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="category-tabs">
      <button 
        v-for="cat in categories" 
        :key="cat.value"
        class="category-tab"
        :class="{ active: selectedCategory === cat.value }"
        @click="selectedCategory = cat.value as any"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- 成就列表 -->
    <div class="achievements-list">
      <div 
        v-for="achievement in filteredAchievements" 
        :key="achievement.id"
        class="achievement-card"
        :class="{ completed: achievement.completed }"
      >
        <div 
          class="achievement-icon"
          :style="{ borderColor: getRarityColor(achievement.rarity) }"
        >
          <span v-if="achievement.completed">✓</span>
          <span v-else>🔒</span>
        </div>
        
        <div class="achievement-content">
          <div class="achievement-header">
            <span 
              class="achievement-name"
              :style="{ color: getRarityColor(achievement.rarity) }"
            >
              {{ achievement.name }}
            </span>
            <span 
              class="achievement-rarity"
              :style="{ backgroundColor: getRarityColor(achievement.rarity) }"
            >
              {{ getRarityName(achievement.rarity) }}
            </span>
          </div>
          
          <p class="achievement-description">{{ achievement.description }}</p>
          
          <div class="achievement-progress">
            <div class="progress-bar-small">
              <div 
                class="progress-fill-small"
                :class="{ completed: achievement.completed }"
                :style="{ width: getProgressWidth(achievement) }"
              ></div>
            </div>
            <span class="progress-text-small">
              {{ achievement.progress }} / {{ achievement.condition.target }}
            </span>
          </div>
          
          <div class="achievement-rewards">
            <span class="rewards-label">奖励：</span>
            <span v-if="achievement.rewards.funds" class="reward-item">
              💰 {{ achievement.rewards.funds }}万
            </span>
            <span v-if="achievement.rewards.reputation" class="reward-item">
              ⭐ {{ achievement.rewards.reputation }}
            </span>
            <span v-if="achievement.rewards.fans" class="reward-item">
              👥 {{ achievement.rewards.fans }}
            </span>
            <span v-if="achievement.rewards.unlock" class="reward-item unlock">
              🔓 {{ achievement.rewards.unlock }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 成就解锁通知弹窗 -->
    <Teleport to="body">
      <div v-if="achievementStore.showNotification" class="notification-overlay" @click="achievementStore.closeNotification">
        <div class="notification-modal" @click.stop>
          <div class="notification-header">
            <span class="notification-icon">🏆</span>
            <span class="notification-title">成就解锁！</span>
          </div>
          <div 
            class="notification-content"
            :style="{ borderColor: getRarityColor(achievementStore.currentNotification?.rarity) }"
          >
            <h3 
              class="notification-name"
              :style="{ color: getRarityColor(achievementStore.currentNotification?.rarity) }"
            >
              {{ achievementStore.currentNotification?.achievementName }}
            </h3>
            <p class="notification-desc">
              {{ achievementStore.currentNotification?.achievementDescription }}
            </p>
            <div class="notification-rewards">
              <span v-if="achievementStore.currentNotification?.rewards.funds" class="reward">
                💰 +{{ achievementStore.currentNotification?.rewards.funds }}万
              </span>
              <span v-if="achievementStore.currentNotification?.rewards.reputation" class="reward">
                ⭐ +{{ achievementStore.currentNotification?.rewards.reputation }}
              </span>
              <span v-if="achievementStore.currentNotification?.rewards.fans" class="reward">
                👥 +{{ achievementStore.currentNotification?.rewards.fans }}
              </span>
            </div>
          </div>
          <button class="notification-close" @click="achievementStore.closeNotification">
            确定
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.achievements-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.back-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.back-btn:hover {
  background: #e0e0e0;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

/* 进度概览 */
.progress-overview {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.progress-bar {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #00d4ff);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  font-weight: bold;
  color: #333;
}

.progress-text .stats {
  font-weight: normal;
  color: #666;
  font-size: 12px;
  margin-left: 10px;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.category-tab {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-tab.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* 成就列表 */
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-card {
  display: flex;
  gap: 15px;
  background: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.achievement-card.completed {
  background: linear-gradient(135deg, #f9f9f9, #fff);
}

.achievement-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #ccc;
  border-radius: 50%;
  font-size: 20px;
  flex-shrink: 0;
  background: white;
}

.achievement-card.completed .achievement-icon {
  background: #ffc107;
  color: white;
}

.achievement-content {
  flex: 1;
}

.achievement-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.achievement-name {
  font-weight: bold;
  font-size: 16px;
}

.achievement-rarity {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  color: white;
}

.achievement-description {
  color: #666;
  font-size: 13px;
  margin: 0 0 10px 0;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.progress-bar-small {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill-small {
  height: 100%;
  background: #007bff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill-small.completed {
  background: #4caf50;
}

.progress-text-small {
  font-size: 12px;
  color: #666;
  min-width: 60px;
  text-align: right;
}

.achievement-rewards {
  font-size: 12px;
  color: #666;
}

.rewards-label {
  font-weight: bold;
}

.reward-item {
  margin-right: 10px;
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
}

.reward-item.unlock {
  background: #e8f5e9;
  color: #4caf50;
}

/* 通知弹窗 */
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.notification-modal {
  background: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.notification-icon {
  font-size: 40px;
}

.notification-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.notification-content {
  border: 3px solid #ffc107;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fffbea;
}

.notification-name {
  font-size: 20px;
  margin: 0 0 10px 0;
}

.notification-desc {
  color: #666;
  margin: 0 0 15px 0;
}

.notification-rewards {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.notification-rewards .reward {
  padding: 5px 10px;
  background: #f0f0f0;
  border-radius: 15px;
  font-weight: bold;
}

.notification-close {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.notification-close:hover {
  background: #0056b3;
}
</style>
