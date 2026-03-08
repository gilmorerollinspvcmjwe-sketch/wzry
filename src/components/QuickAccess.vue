<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useMatchStore } from '@/stores/match';
import { useTransferWindowStore } from '@/stores/transferWindow';
import { RouteNames } from '@/constants/routes';

const router = useRouter();
const clubStore = useClubStore();
const matchStore = useMatchStore();
const transferWindowStore = useTransferWindowStore();

const nextMatch = computed(() => matchStore.nextMatch);
const isTransferWindow = computed(() => transferWindowStore.isWindowOpen);
const pendingBidsCount = computed(() => transferWindowStore.pendingBidsCount);
const rosterCount = computed(() => clubStore.currentClub?.roster.length || 0);

const quickActions = computed(() => [
  {
    id: 'match',
    icon: '🏆',
    label: '下一场比赛',
    subLabel: nextMatch.value ? '即将开始' : '暂无比赛',
    badge: nextMatch.value ? '!' : null,
    color: '#ff6b6b',
    action: () => router.push({ name: RouteNames.Match }),
  },
  {
    id: 'transfer',
    icon: '🔄',
    label: '转会市场',
    subLabel: isTransferWindow.value ? '转会窗口开启' : '转会窗口关闭',
    badge: pendingBidsCount.value > 0 ? pendingBidsCount.value.toString() : null,
    color: '#4ecdc4',
    action: () => router.push({ name: RouteNames.Transfer }),
  },
  {
    id: 'team',
    icon: '👥',
    label: '阵容管理',
    subLabel: `${rosterCount.value}名选手`,
    badge: rosterCount.value < 5 ? '!' : null,
    color: '#667eea',
    action: () => router.push({ name: RouteNames.Team }),
  },
  {
    id: 'finance',
    icon: '💰',
    label: '财务中心',
    subLabel: '查看收支',
    badge: null,
    color: '#faad14',
    action: () => router.push({ name: RouteNames.Finance }),
  },
]);

const handleAction = (action: any) => {
  if (action.action) {
    action.action();
  }
};
</script>

<template>
  <div class="quick-access">
    <div class="section-header">
      <h3>快捷入口</h3>
    </div>
    <div class="actions-grid">
      <div
        v-for="action in quickActions"
        :key="action.id"
        class="action-card"
        :style="{ '--accent-color': action.color }"
        @click="handleAction(action)"
      >
        <div class="action-icon">{{ action.icon }}</div>
        <div class="action-content">
          <div class="action-label">{{ action.label }}</div>
          <div class="action-sub-label">{{ action.subLabel }}</div>
        </div>
        <div v-if="action.badge" class="action-badge">{{ action.badge }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quick-access {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-left: 3px solid var(--accent-color);
}

.action-card:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

.action-card:active {
  transform: translateY(0);
}

.action-icon {
  font-size: 24px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-sub-label {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.action-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ff4d4f;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
