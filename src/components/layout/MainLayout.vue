<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useGameStore } from '@/stores/game';
import { usePlayerStore } from '@/stores/player';

const route = useRoute();
const clubStore = useClubStore();
const gameStore = useGameStore();
const playerStore = usePlayerStore();

// 导航项（使用相对路径，因为在 /game 嵌套路由内）
const navItems = [
  { path: '', icon: '🏠', label: '首页', name: 'Home' },
  { path: 'team', icon: '👥', label: '阵容', name: 'Team' },
  { path: 'match', icon: '🏆', label: '比赛', name: 'Match' },
  { path: 'transfer', icon: '🔄', label: '转会', name: 'Transfer' },
  { path: 'league', icon: '🏅', label: '联赛', name: 'League' },
  { path: 'settings', icon: '⚙️', label: '设置', name: 'Settings' },
];

// 当前俱乐部
const currentClub = computed(() => clubStore.currentClub);

// 当前日期
const currentDate = computed(() => gameStore.currentDate);

// 当前阶段
const currentPhase = computed(() => gameStore.currentPhase);

// 格式化资金
const formatMoney = (amount: number) => {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}亿`;
  }
  return `${Math.round(amount)}万`;
};

// 格式化日期
const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

// 阶段名称
const phaseNames: Record<string, string> = {
  spring_season: '春季赛',
  spring_playoff: '春季季后赛',
  summer_break: '夏季休赛期',
  autumn_season: '秋季赛',
  worlds: '世界赛',
};

// 推进时间
const advanceTime = () => {
  const daysToAdvance = 7 * gameStore.gameSpeed; // 根据游戏速度推进
  
  // 推进时间
  for (let i = 0; i < daysToAdvance; i++) {
    gameStore.advanceTime(1);
    
    // 每周一更新
    if (gameStore.currentDate.getDay() === 1) {
      onWeekPassed();
    }
  }
  
  // 自动保存
  if (gameStore.settings.autoSave) {
    gameStore.saveGame();
  }
  
  alert(`时间推进 ${daysToAdvance} 天`);
};

// 每周事件
const onWeekPassed = () => {
  // 更新选手状态（恢复体力）
  playerStore.updatePlayerConditions();
  
  // 计算周收支
  const income = clubStore.weeklyIncome;
  const expense = clubStore.weeklyExpense;
  const netIncome = income - expense;
  
  // 更新资金
  clubStore.addFunds(netIncome);
  
  console.log(`周收支 - 收入: ${income}, 支出: ${expense}, 净收入: ${netIncome}`);
};
</script>

<template>
  <div class="main-layout">
    <!-- 顶部状态栏 -->
    <header class="status-bar">
      <div class="club-info">
        <div class="club-name" v-if="currentClub">
          {{ currentClub.name }}
        </div>
        <div class="phase-badge">
          {{ phaseNames[currentPhase] || '休赛期' }}
        </div>
      </div>
      <div class="resources">
        <div class="resource-item">
          <span class="icon">💰</span>
          <span class="value">{{ currentClub ? formatMoney(currentClub.funds) : '0' }}</span>
        </div>
        <div class="resource-item">
          <span class="icon">⭐</span>
          <span class="value">{{ currentClub ? currentClub.reputation : '0' }}</span>
        </div>
        <div class="resource-item">
          <span class="icon">👥</span>
          <span class="value">{{ currentClub ? currentClub.fans.toLocaleString() : '0' }}</span>
        </div>
        <div class="resource-item date-item" @click="advanceTime">
          <span class="icon">📅</span>
          <span class="value">{{ formatDate(currentDate) }}</span>
          <span class="advance-hint">点击推进</span>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="content">
      <router-view />
    </main>
    
    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <router-link 
        v-for="item in navItems" 
        :key="item.name"
        :to="{ name: item.name }"
        class="nav-item"
        :class="{ active: route.name === item.name }"
      >
        <div class="nav-icon">{{ item.icon }}</div>
        <div class="nav-label">{{ item.label }}</div>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 100;
}

.club-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.club-name {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.phase-badge {
  font-size: 11px;
  color: #007bff;
  background: #f0f8ff;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.resources {
  display: flex;
  gap: 12px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.resource-item .icon {
  font-size: 14px;
}

.resource-item.date-item {
  position: relative;
  cursor: pointer;
  padding: 4px 8px;
  background: #f9f9f9;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.resource-item.date-item:hover {
  background: #e9ecef;
}

.resource-item.date-item:hover .advance-hint {
  opacity: 1;
}

.advance-hint {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
  font-size: 10px;
  color: #007bff;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
  white-space: nowrap;
  pointer-events: none;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
}

.bottom-nav {
  display: flex;
  background-color: #fff;
  border-top: 1px solid #eee;
  padding: 5px 0;
  height: 60px;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #666;
  transition: all 0.3s ease;
}

.nav-item.active {
  color: #007bff;
  background-color: #f0f8ff;
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.nav-label {
  font-size: 12px;
}

@media (min-width: 768px) {
  .main-layout {
    max-width: 480px;
    margin: 0 auto;
    height: 100vh;
  }
}
</style>
