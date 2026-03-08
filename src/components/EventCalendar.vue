<template>
  <div class="event-calendar">
    <div class="calendar-header">
      <h3 class="title">赛事日历</h3>
      <div class="season-info" v-if="currentSeason">
        <span class="season-name">{{ currentSeason.year }}年{{ currentSeason.season === 'spring' ? '春季' : '夏季' }}赛</span>
        <span class="season-phase">{{ phaseText }}</span>
      </div>
    </div>

    <div class="calendar-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="badge" v-if="getEventCount(tab.key) > 0">{{ getEventCount(tab.key) }}</span>
      </button>
    </div>

    <div class="calendar-content">
      <div v-if="activeTab === 'upcoming'" class="tab-panel">
        <div v-if="upcomingEvents.length === 0" class="empty-state">
          <span class="empty-icon">📅</span>
          <span class="empty-text">暂无即将开始的赛事</span>
        </div>
        <div v-else class="event-list">
          <div
            v-for="event in upcomingEvents"
            :key="`${event.type}-${event.event.id}`"
            class="event-item"
            :class="event.type"
          >
            <div class="event-icon">
              {{ getEventIcon(event.type) }}
            </div>
            <div class="event-info">
              <div class="event-name">{{ event.event.name }}</div>
              <div class="event-meta">
                <span class="event-type">{{ getEventTypeName(event.type) }}</span>
                <span class="event-date">{{ formatDate(event.date) }}</span>
              </div>
            </div>
            <div class="event-status" :class="getStatusClass(event.event.status)">
              {{ getStatusText(event.event.status) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'leagues'" class="tab-panel">
        <div v-if="leagues.length === 0" class="empty-state">
          <span class="empty-icon">🏆</span>
          <span class="empty-text">暂无联赛</span>
        </div>
        <div v-else class="event-list">
          <div
            v-for="league in leagues"
            :key="league.id"
            class="event-item league"
          >
            <div class="event-icon">🏆</div>
            <div class="event-info">
              <div class="event-name">{{ league.name }}</div>
              <div class="event-meta">
                <span class="event-type">{{ getLeagueTypeName(league.type) }}</span>
                <span class="event-round" v-if="league.status === 'ongoing'">
                  第 {{ league.schedule.currentRound }} / {{ league.schedule.totalRounds }} 轮
                </span>
              </div>
            </div>
            <div class="event-status" :class="getStatusClass(league.status)">
              {{ getStatusText(league.status) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'cups'" class="tab-panel">
        <div v-if="cups.length === 0" class="empty-state">
          <span class="empty-icon">🏅</span>
          <span class="empty-text">暂无杯赛</span>
        </div>
        <div v-else class="event-list">
          <div
            v-for="cup in cups"
            :key="cup.id"
            class="event-item cup"
          >
            <div class="event-icon">🏅</div>
            <div class="event-info">
              <div class="event-name">{{ cup.name }}</div>
              <div class="event-meta">
                <span class="event-type">{{ getCupTypeName(cup.type) }}</span>
                <span class="event-format">{{ cup.format.matchFormat.toUpperCase() }}</span>
              </div>
            </div>
            <div class="event-status" :class="getStatusClass(cup.status)">
              {{ getStatusText(cup.status) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'international'" class="tab-panel">
        <div v-if="internationalEvents.length === 0" class="empty-state">
          <span class="empty-icon">🌍</span>
          <span class="empty-text">暂无国际赛事</span>
        </div>
        <div v-else class="event-list">
          <div
            v-for="event in internationalEvents"
            :key="event.id"
            class="event-item international"
          >
            <div class="event-icon">🌍</div>
            <div class="event-info">
              <div class="event-name">{{ event.name }}</div>
              <div class="event-meta">
                <span class="event-type">{{ getInternationalTypeName(event.type) }}</span>
                <span class="event-region">举办地: {{ event.hostRegion }}</span>
              </div>
            </div>
            <div class="event-status" :class="getStatusClass(event.status)">
              {{ getStatusText(event.status) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'qualifications'" class="tab-panel">
        <div v-if="!myClubQualifications" class="empty-state">
          <span class="empty-icon">📋</span>
          <span class="empty-text">暂无赛事资格信息</span>
        </div>
        <div v-else class="qualification-list">
          <div
            v-for="qual in myClubQualifications.qualifications"
            :key="qual.eventId"
            class="qualification-item"
            :class="qual.status"
          >
            <div class="qual-info">
              <div class="qual-name">{{ qual.eventName }}</div>
              <div class="qual-type">{{ getEventTypeLabel(qual.eventType) }}</div>
            </div>
            <div class="qual-status" :class="qual.status">
              {{ getQualificationStatusText(qual.status) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLeagueEcosystemStore } from '@/stores/leagueEcosystem';

const ecosystemStore = useLeagueEcosystemStore();

const tabs = [
  { key: 'upcoming', label: '即将开始' },
  { key: 'leagues', label: '联赛' },
  { key: 'cups', label: '杯赛' },
  { key: 'international', label: '国际赛' },
  { key: 'qualifications', label: '赛事资格' },
];

const activeTab = ref('upcoming');

const currentSeason = computed(() => ecosystemStore.currentSeason);
const leagues = computed(() => ecosystemStore.leagues);
const cups = computed(() => ecosystemStore.cups);
const internationalEvents = computed(() => ecosystemStore.internationalEvents);
const upcomingEvents = computed(() => ecosystemStore.upcomingEvents);
const myClubQualifications = computed(() => ecosystemStore.myClubQualifications);

const phaseText = computed(() => {
  const phase = currentSeason.value?.phase;
  const phaseMap: Record<string, string> = {
    preparing: '准备阶段',
    regular: '常规赛',
    playoff: '季后赛',
    offseason: '休赛期',
  };
  return phaseMap[phase || ''] || '';
});

function getEventCount(tabKey: string): number {
  switch (tabKey) {
    case 'upcoming':
      return upcomingEvents.value.length;
    case 'leagues':
      return leagues.value.length;
    case 'cups':
      return cups.value.length;
    case 'international':
      return internationalEvents.value.length;
    default:
      return 0;
  }
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    league: '🏆',
    cup: '🏅',
    international: '🌍',
  };
  return icons[type] || '📅';
}

function getEventTypeName(type: string): string {
  const names: Record<string, string> = {
    league: '联赛',
    cup: '杯赛',
    international: '国际赛事',
  };
  return names[type] || type;
}

function getLeagueTypeName(type: string): string {
  const names: Record<string, string> = {
    professional: '职业联赛',
    developmental: '发展联盟',
    amateur: '业余联赛',
  };
  return names[type] || type;
}

function getCupTypeName(type: string): string {
  const names: Record<string, string> = {
    national: '全国杯赛',
    regional: '地区杯赛',
    invitational: '邀请赛',
  };
  return names[type] || type;
}

function getInternationalTypeName(type: string): string {
  const names: Record<string, string> = {
    worlds: '世界赛',
    continental: '洲际赛',
    friendly: '友谊赛',
  };
  return names[type] || type;
}

function getStatusClass(status: string): string {
  return status;
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消',
  };
  return texts[status] || status;
}

function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    league: '联赛',
    cup: '杯赛',
    international: '国际赛事',
  };
  return labels[type] || type;
}

function getQualificationStatusText(status: string): string {
  const texts: Record<string, string> = {
    qualified: '已晋级',
    pending: '待定',
    eliminated: '已淘汰',
  };
  return texts[status] || status;
}

function formatDate(date: Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.event-calendar {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.season-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.season-name {
  font-size: 14px;
  font-weight: bold;
  color: #007bff;
}

.season-phase {
  font-size: 12px;
  color: #666;
}

.calendar-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  min-width: 80px;
  padding: 12px 8px;
  border: none;
  background: #f9f9f9;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tab-btn.active {
  background: white;
  color: #007bff;
  font-weight: bold;
  border-bottom: 2px solid #007bff;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #007bff;
  color: white;
  border-radius: 9px;
  font-size: 11px;
}

.calendar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.tab-panel {
  height: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid transparent;
  gap: 12px;
}

.event-item.league {
  border-left-color: #007bff;
}

.event-item.cup {
  border-left-color: #28a745;
}

.event-item.international {
  border-left-color: #fd7e14;
}

.event-icon {
  font-size: 24px;
}

.event-info {
  flex: 1;
}

.event-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.event-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.event-type {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
}

.event-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.event-status.upcoming {
  background: #fff3cd;
  color: #856404;
}

.event-status.ongoing {
  background: #d4edda;
  color: #155724;
}

.event-status.completed {
  background: #e2e3e5;
  color: #383d41;
}

.qualification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qualification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.qualification-item.qualified {
  background: #d4edda;
}

.qualification-item.eliminated {
  background: #f8d7da;
}

.qual-info {
  display: flex;
  flex-direction: column;
}

.qual-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.qual-type {
  font-size: 12px;
  color: #666;
}

.qual-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.qual-status.qualified {
  background: #28a745;
  color: white;
}

.qual-status.pending {
  background: #ffc107;
  color: #333;
}

.qual-status.eliminated {
  background: #dc3545;
  color: white;
}
</style>
