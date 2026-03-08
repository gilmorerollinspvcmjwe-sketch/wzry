<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useHomeVenueStore } from '@/stores/homeVenue';
import { calculateTicketRevenue, calculateHomeAdvantage } from '@/core/services/homeVenueService';
import { VENUE_LEVEL_NAMES, FACILITY_TYPE_NAMES, ATMOSPHERE_ASPECT_NAMES } from '@/types/homeVenue';
import type { HomeVenue, VenueStats } from '@/types/homeVenue';

const router = useRouter();
const clubStore = useClubStore();
const venueStore = useHomeVenueStore();

const activeTab = ref<'overview' | 'facilities' | 'atmosphere' | 'culture'>('overview');

const clubId = computed(() => clubStore.currentClub?.id || '');
const venue = computed(() => venueStore.getVenue(clubId.value));
const venueStats = computed(() => venueStore.getVenueStats(clubId.value));

const facilityTypes = ['stands', 'vipArea', 'trainingRoom', 'mediaCenter', 'lockerRoom'] as const;
const atmosphereAspects = ['lighting', 'sound', 'screen', 'fanZone'] as const;

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const getLevelColor = (level: number) => {
  if (level >= 8) return '#52c41a';
  if (level >= 5) return '#1890ff';
  if (level >= 3) return '#faad14';
  return '#ff4d4f';
};

const getVenueLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    small: '#faad14',
    medium: '#1890ff',
    large: '#52c41a',
    xlarge: '#722ed1',
  };
  return colors[level] || '#999';
};

const goToConstruction = () => {
  router.push('/venue/construction');
};

const goToCommercial = () => {
  router.push('/venue/commercial');
};

const simulateMatchRevenue = () => {
  if (venue.value) {
    const revenue = calculateTicketRevenue(clubId.value, 'regular');
    clubStore.addFunds(revenue.total);
    alert(`比赛日收入：${revenue.total}万\n门票：${revenue.tickets}万\nVIP：${revenue.vip}万\n周边：${revenue.merchandise}万\n餐饮：${revenue.catering}万`);
  }
};

onMounted(() => {
  if (clubId.value && !venue.value) {
    venueStore.initVenue(clubId.value);
  }
});
</script>

<template>
  <div class="venue-page">
    <h2 class="page-title">主场管理</h2>

    <div v-if="venue" class="venue-content">
      <div class="venue-header">
        <div class="venue-name">{{ venue.name }}</div>
        <div class="venue-level" :style="{ backgroundColor: getVenueLevelColor(venue.level) }">
          {{ VENUE_LEVEL_NAMES[venue.level] }}
        </div>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">场馆容量</div>
          <div class="summary-value">{{ venue.capacity.toLocaleString() }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">主场优势</div>
          <div class="summary-value">+{{ venueStats.homeAdvantage }}%</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">设施评分</div>
          <div class="summary-value">{{ venueStats.facilityScore }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">氛围评分</div>
          <div class="summary-value">{{ venueStats.atmosphereScore }}</div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn primary" @click="goToConstruction">
          设施建设
        </button>
        <button class="action-btn secondary" @click="goToCommercial">
          商业运营
        </button>
        <button class="action-btn accent" @click="simulateMatchRevenue">
          模拟比赛日
        </button>
      </div>

      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          概览
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'facilities' }"
          @click="activeTab = 'facilities'"
        >
          设施
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'atmosphere' }"
          @click="activeTab = 'atmosphere'"
        >
          氛围
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'culture' }"
          @click="activeTab = 'culture'"
        >
          文化
        </button>
      </div>

      <div v-if="activeTab === 'overview'" class="overview-section">
        <div class="info-card">
          <h3>场馆信息</h3>
          <div class="info-row">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ formatDate(venue.createdAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">上座率</span>
            <span class="info-value">{{ venueStats.utilizationRate }}%</span>
          </div>
          <div class="info-row">
            <span class="info-label">季票持有者</span>
            <span class="info-value">{{ venue.matchDay.seasonTicketHolders.toLocaleString() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">基础票价</span>
            <span class="info-value">{{ venue.matchDay.baseTicketPrice }}万</span>
          </div>
          <div class="info-row">
            <span class="info-label">VIP票价</span>
            <span class="info-value">{{ venue.matchDay.vipTicketPrice }}万</span>
          </div>
        </div>

        <div class="info-card">
          <h3>最近比赛收入</h3>
          <div class="revenue-breakdown">
            <div class="revenue-item">
              <span>门票收入</span>
              <span class="revenue-value">{{ venue.matchDay.lastMatchRevenue.tickets }}万</span>
            </div>
            <div class="revenue-item">
              <span>VIP收入</span>
              <span class="revenue-value">{{ venue.matchDay.lastMatchRevenue.vip }}万</span>
            </div>
            <div class="revenue-item">
              <span>周边销售</span>
              <span class="revenue-value">{{ venue.matchDay.lastMatchRevenue.merchandise }}万</span>
            </div>
            <div class="revenue-item">
              <span>餐饮收入</span>
              <span class="revenue-value">{{ venue.matchDay.lastMatchRevenue.catering }}万</span>
            </div>
            <div class="revenue-item total">
              <span>总计</span>
              <span class="revenue-value">{{ venue.matchDay.lastMatchRevenue.total }}万</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3>商业概况</h3>
          <div class="info-row">
            <span class="info-label">冠名权</span>
            <span class="info-value">
              {{ venue.commercial.namingRights ? venue.commercial.namingRights.sponsor : '未出售' }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">广告数量</span>
            <span class="info-value">{{ venue.commercial.advertisements.length }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">商店等级</span>
            <span class="info-value">Lv.{{ venue.commercial.merchandiseShop.level }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">餐饮等级</span>
            <span class="info-value">Lv.{{ venue.commercial.catering.level }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'facilities'" class="facilities-section">
        <div
          v-for="type in facilityTypes"
          :key="type"
          class="facility-card"
        >
          <div class="facility-header">
            <span class="facility-name">{{ FACILITY_TYPE_NAMES[type] }}</span>
            <span class="facility-level" :style="{ color: getLevelColor(venue.facilities[type].level) }">
              Lv.{{ venue.facilities[type].level }}
            </span>
          </div>
          <div class="facility-details">
            <div class="detail-item">
              <span class="detail-label">状态</span>
              <div class="condition-bar">
                <div
                  class="condition-fill"
                  :style="{
                    width: venue.facilities[type].condition + '%',
                    backgroundColor: venue.facilities[type].condition > 60 ? '#52c41a' : venue.facilities[type].condition > 30 ? '#faad14' : '#ff4d4f'
                  }"
                ></div>
              </div>
              <span class="detail-value">{{ venue.facilities[type].condition }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">维护费</span>
              <span class="detail-value">{{ venue.facilities[type].maintenanceCost }}万/周</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">升级费用</span>
              <span class="detail-value">{{ venue.facilities[type].upgradeCost }}万</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'atmosphere'" class="atmosphere-section">
        <div
          v-for="aspect in atmosphereAspects"
          :key="aspect"
          class="atmosphere-card"
        >
          <div class="atmosphere-header">
            <span class="atmosphere-name">{{ ATMOSPHERE_ASPECT_NAMES[aspect] }}</span>
            <span class="atmosphere-level" :style="{ color: getLevelColor(venue.atmosphere[aspect].level) }">
              Lv.{{ venue.atmosphere[aspect].level }}
            </span>
          </div>
          <div class="atmosphere-details">
            <div class="detail-item">
              <span class="detail-label">质量</span>
              <div class="quality-bar">
                <div
                  class="quality-fill"
                  :style="{ width: venue.atmosphere[aspect].quality + '%' }"
                ></div>
              </div>
              <span class="detail-value">{{ venue.atmosphere[aspect].quality }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">效果加成</span>
              <span class="detail-value">+{{ venue.atmosphere[aspect].effect }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">升级费用</span>
              <span class="detail-value">{{ venue.atmosphere[aspect].upgradeCost }}万</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'culture'" class="culture-section">
        <div class="culture-card">
          <h3>队歌</h3>
          <div v-if="venue.culture.anthem.unlocked" class="culture-content">
            <div class="culture-name">{{ venue.culture.anthem.name }}</div>
            <div class="culture-desc">{{ venue.culture.anthem.description }}</div>
            <div class="culture-popularity">
              人气度：{{ venue.culture.anthem.popularity }}%
            </div>
          </div>
          <div v-else class="culture-locked">
            <p>尚未解锁队歌</p>
          </div>
        </div>

        <div class="culture-card">
          <h3>吉祥物</h3>
          <div v-if="venue.culture.mascot.unlocked" class="culture-content">
            <div class="culture-name">{{ venue.culture.mascot.name }}</div>
            <div class="culture-desc">{{ venue.culture.mascot.description }}</div>
            <div class="culture-popularity">
              人气度：{{ venue.culture.mascot.popularity }}%
            </div>
          </div>
          <div v-else class="culture-locked">
            <p>尚未解锁吉祥物</p>
          </div>
        </div>

        <div class="culture-card">
          <h3>连胜纪录</h3>
          <div class="win-streak">
            <span class="streak-number">{{ venue.culture.winStreak }}</span>
            <span class="streak-label">场</span>
          </div>
        </div>

        <div class="culture-card">
          <h3>传统</h3>
          <div v-if="venue.culture.traditions.length > 0" class="traditions-list">
            <div v-for="(tradition, idx) in venue.culture.traditions" :key="idx" class="tradition-item">
              {{ tradition }}
            </div>
          </div>
          <div v-else class="no-traditions">
            <p>暂无传统</p>
          </div>
        </div>

        <div class="culture-card">
          <h3>历史时刻</h3>
          <div v-if="venue.culture.historicalMoments.length > 0" class="moments-list">
            <div v-for="(moment, idx) in venue.culture.historicalMoments" :key="idx" class="moment-item">
              <div class="moment-date">{{ formatDate(moment.date) }}</div>
              <div class="moment-event">{{ moment.event }}</div>
              <div class="moment-significance">{{ moment.significance }}</div>
              <div class="moment-attendance">观众：{{ moment.attendance.toLocaleString() }}</div>
            </div>
          </div>
          <div v-else class="no-moments">
            <p>暂无历史时刻</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-venue">
      <p>尚未创建主场</p>
      <button class="create-btn" @click="venueStore.initVenue(clubId.value)">
        创建主场
      </button>
    </div>
  </div>
</template>

<style scoped>
.venue-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.venue-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.venue-level {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  font-weight: bold;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.secondary {
  background: #28a745;
  color: white;
}

.action-btn.accent {
  background: #fd7e14;
  color: white;
}

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  min-width: 70px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.overview-section,
.facilities-section,
.atmosphere-section,
.culture-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-card h3 {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.info-label {
  color: #999;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.revenue-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.revenue-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}

.revenue-item.total {
  padding-top: 8px;
  border-top: 1px solid #eee;
  font-weight: bold;
  color: #333;
}

.revenue-value {
  color: #52c41a;
}

.facility-card,
.atmosphere-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.facility-header,
.atmosphere-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.facility-name,
.atmosphere-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.facility-level,
.atmosphere-level {
  font-size: 14px;
  font-weight: bold;
}

.facility-details,
.atmosphere-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.detail-label {
  width: 60px;
  color: #999;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.condition-bar,
.quality-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.condition-fill,
.quality-fill {
  height: 100%;
  background: #007bff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.quality-fill {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.culture-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.culture-card h3 {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.culture-content {
  text-align: center;
}

.culture-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.culture-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.culture-popularity {
  font-size: 12px;
  color: #999;
}

.culture-locked,
.no-traditions,
.no-moments {
  text-align: center;
  padding: 20px;
  color: #999;
}

.win-streak {
  text-align: center;
  padding: 20px;
}

.streak-number {
  font-size: 48px;
  font-weight: bold;
  color: #ff6b6b;
}

.streak-label {
  font-size: 16px;
  color: #999;
  margin-left: 5px;
}

.traditions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tradition-item {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  border-left: 3px solid #007bff;
}

.moments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.moment-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.moment-date {
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.moment-event {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.moment-significance {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.moment-attendance {
  font-size: 11px;
  color: #999;
}

.no-venue {
  text-align: center;
  padding: 60px 20px;
}

.no-venue p {
  color: #999;
  margin-bottom: 20px;
}

.create-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>
