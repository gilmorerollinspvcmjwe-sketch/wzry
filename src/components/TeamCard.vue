<template>
  <div class="team-card">
    <div class="card-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="card-content">
      <!-- 阵容Tab -->
      <div v-if="activeTab === 'roster'" class="tab-panel">
        <div class="roster-list">
          <div
            v-for="player in mainRoster"
            :key="player.id"
            class="player-item"
            :class="{ warning: (player.condition?.stamina || 0) < 30 }"
            @click="viewPlayerDetail(player)"
          >
            <div class="player-avatar">{{ player.name[0] }}</div>
            <div class="player-info">
              <span class="player-name">{{ player.name }}</span>
              <span class="player-position">{{ player.position }}</span>
            </div>
            <div class="player-stats">
              <div class="stat-row">
                <span class="stat-label">实力</span>
                <span class="stat-value">{{ getPlayerPower(player) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">体力</span>
                <div class="stamina-bar">
                  <div
                    class="stamina-fill"
                    :class="{ low: (player.condition?.stamina || 0) < 30 }"
                    :style="{ width: (player.condition?.stamina || 0) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="roster-summary">
          <span>主力5人 | 替补{{ benchCount }}人</span>
        </div>
      </div>

      <!-- 转会Tab -->
      <div v-if="activeTab === 'transfer'" class="tab-panel">
        <div class="transfer-section">
          <h4>🎯 系统推荐</h4>
          <div class="recommended-players">
            <div
              v-for="player in recommendedPlayers"
              :key="player.id"
              class="recommended-item"
              @click="viewTransferDetail(player)"
            >
              <div class="rec-avatar">{{ player.name[0] }}</div>
              <div class="rec-info">
                <span class="rec-name">{{ player.name }}</span>
                <span class="rec-reason">{{ player.reason }}</span>
              </div>
              <div class="rec-price">{{ player.price }}万</div>
            </div>
          </div>
        </div>
        <button class="search-btn" @click="goToTransfer">
          🔍 主动搜索更多选手
        </button>
      </div>

      <!-- 青训Tab -->
      <div v-if="activeTab === 'youth'" class="tab-panel">
        <div class="youth-list">
          <div
            v-for="player in youthPlayers"
            :key="player.id"
            class="youth-item"
            @click="promoteYouth(player)"
          >
            <div class="youth-avatar">{{ player.name[0] }}</div>
            <div class="youth-info">
              <span class="youth-name">{{ player.name }}</span>
              <span class="youth-potential">潜力 {{ player.potential }}</span>
            </div>
            <button class="promote-btn">提拔</button>
          </div>
        </div>
        <button v-if="youthPlayers.length === 0" class="scout-btn" @click="scoutYouth">
          ⛏️ 挖掘新选手
        </button>
        <button v-else class="scout-btn" @click="goToYouth">
          查看青训学院
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { usePlayerStore } from '@/stores/player';
import { useYouthAcademyStore } from '@/stores/youthAcademy';
import { recruitYouthPlayer } from '@/core/services/youthAcademyService';
import { RouteNames } from '@/constants/routes';
import { getPlayerTotalPower } from '@/utils/playerUtils';

const router = useRouter();
const clubStore = useClubStore();
const playerStore = usePlayerStore();
const youthAcademyStore = useYouthAcademyStore();

const tabs = [
  { key: 'roster', label: '阵容' },
  { key: 'transfer', label: '转会' },
  { key: 'youth', label: '青训' },
];

const activeTab = ref('roster');

const mainRoster = computed(() => {
  return clubStore.currentClub?.roster.slice(0, 5) || [];
});

const benchCount = computed(() => {
  return Math.max(0, (clubStore.currentClub?.roster.length || 0) - 5);
});

const recommendedPlayers = ref([
  { id: '1', name: '张天才', price: 200, reason: '高潜力新秀' },
  { id: '2', name: '李强', price: 350, reason: '即战力补强' },
  { id: '3', name: '王明星', price: 500, reason: '明星选手' },
]);

const clubId = computed(() => clubStore.currentClub?.id || '');

const youthPlayers = computed(() => {
  return youthAcademyStore.getAvailablePlayers(clubId.value).slice(0, 3);
});

const getPlayerPower = (player: any): number => {
  return getPlayerTotalPower(player);
};

const viewPlayerDetail = (player: any) => {
  // 跳转到团队管理页面并传递选手 ID
  router.push({ name: RouteNames.Team, query: { playerId: player.id } });
};

const viewTransferDetail = (_player: any) => {
  router.push('/game/transfer');
};

const goToTransfer = () => {
  router.push('/game/transfer');
};

const goToYouth = () => {
  router.push('/youth');
};

const promoteYouth = (player: any) => {
  console.log('提拔:', player);
};

const scoutYouth = () => {
  const result = recruitYouthPlayer(clubId.value);
  if (result.success && result.player) {
    alert(`发现青训选手：${result.player.name}，潜力${result.player.potential}`);
  } else {
    alert(result.message || '招募失败');
  }
};
</script>

<style scoped>
.team-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: #f9f9f9;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: white;
  color: #007bff;
  font-weight: bold;
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.tab-panel {
  height: 100%;
}

/* 阵容样式 */
.roster-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.player-item.warning {
  background: #fff5f5;
  border-left: 3px solid #dc3545;
}

.player-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  display: block;
  font-size: 14px;
  color: #333;
  font-weight: bold;
}

.player-position {
  font-size: 11px;
  color: #999;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 80px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.stat-label {
  color: #999;
}

.stat-value {
  color: #333;
  font-weight: bold;
}

.stamina-bar {
  width: 50px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.stamina-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s;
}

.stamina-fill.low {
  background: #dc3545;
}

.roster-summary {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  text-align: center;
  font-size: 12px;
  color: #999;
}

/* 转会样式 */
.transfer-section {
  margin-bottom: 12px;
}

.transfer-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
}

.recommended-players {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommended-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f0f8ff;
  border-radius: 8px;
  cursor: pointer;
  border-left: 3px solid #007bff;
}

.rec-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.rec-info {
  flex: 1;
}

.rec-name {
  display: block;
  font-size: 14px;
  color: #333;
  font-weight: bold;
}

.rec-reason {
  font-size: 11px;
  color: #007bff;
}

.rec-price {
  font-size: 14px;
  color: #28a745;
  font-weight: bold;
}

.search-btn {
  width: 100%;
  padding: 12px;
  background: #f9f9f9;
  border: 1px dashed #ddd;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

/* 青训样式 */
.youth-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.youth-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.youth-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.youth-info {
  flex: 1;
}

.youth-name {
  display: block;
  font-size: 14px;
  color: #333;
}

.youth-potential {
  font-size: 11px;
  color: #28a745;
}

.promote-btn {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.scout-btn {
  width: 100%;
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
</style>