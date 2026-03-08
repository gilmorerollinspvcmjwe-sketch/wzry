<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRetirementStore } from '@/stores/retirement';
import type { HallOfFameMember, Legend, RetiredNumber } from '@/types/retirement';
import { LEGEND_IMPACT_NAMES, CAREER_HIGHLIGHT_TYPE_NAMES } from '@/types/retirement';

const retirementStore = useRetirementStore();

const activeTab = ref<'members' | 'numbers' | 'legends'>('members');
const selectedMember = ref<HallOfFameMember | null>(null);
const selectedLegend = ref<Legend | null>(null);

const hallOfFameMembers = computed(() => retirementStore.getHallOfFameMembers());
const retiredNumbers = computed(() => retirementStore.getRetiredNumbers());
const legends = computed(() => retirementStore.getLegends());
const legendaryPlayers = computed(() => retirementStore.getLegendaryPlayers());

const statistics = computed(() => retirementStore.getRetirementStatistics());

const selectMember = (member: HallOfFameMember) => {
  selectedMember.value = member;
  selectedLegend.value = null;
};

const selectLegend = (legend: Legend) => {
  selectedLegend.value = legend;
  selectedMember.value = null;
};

const closeDetail = () => {
  selectedMember.value = null;
  selectedLegend.value = null;
};

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

const getImpactColor = (impact: Legend['impact']) => {
  const colors: Record<string, string> = {
    legendary: '#ffd700',
    great: '#c0c0c0',
    notable: '#cd7f32',
  };
  return colors[impact] || '#999';
};

const getImpactBgColor = (impact: Legend['impact']) => {
  const colors: Record<string, string> = {
    legendary: '#fffbe6',
    great: '#f5f5f5',
    notable: '#faf0e6',
  };
  return colors[impact] || '#f5f5f5';
};
</script>

<template>
  <div class="hall-of-fame">
    <div class="header">
      <h2>俱乐部名人堂</h2>
      <div class="stats-summary">
        <div class="stat">
          <span class="stat-value">{{ statistics.hallOfFameMembers }}</span>
          <span class="stat-label">名人堂成员</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ statistics.retiredNumbers }}</span>
          <span class="stat-label">退役号码</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ statistics.legends }}</span>
          <span class="stat-label">传奇人物</span>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button 
        class="tab" 
        :class="{ active: activeTab === 'members' }"
        @click="activeTab = 'members'"
      >
        名人堂成员
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'numbers' }"
        @click="activeTab = 'numbers'"
      >
        退役号码
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'legends' }"
        @click="activeTab = 'legends'"
      >
        传奇人物
      </button>
    </div>

    <div class="content">
      <div v-if="activeTab === 'members'" class="tab-content">
        <div v-if="hallOfFameMembers.length === 0" class="empty-state">
          <p>暂无名人堂成员</p>
          <p class="hint">退役选手满足条件后可入选名人堂</p>
        </div>

        <div v-else class="members-grid">
          <div 
            v-for="member in hallOfFameMembers" 
            :key="member.id"
            class="member-card"
            @click="selectMember(member)"
          >
            <div class="member-avatar">
              <span class="avatar-placeholder">{{ member.playerName.charAt(0) }}</span>
            </div>
            <div class="member-info">
              <h4 class="member-name">{{ member.playerName }}</h4>
              <span class="member-position">{{ member.position }}</span>
              <div class="member-stats">
                <span>{{ member.careerStats.championships }}冠</span>
                <span>{{ member.careerStats.winRate }}%胜率</span>
              </div>
            </div>
            <div v-if="member.retiredNumber" class="retired-number-badge">
              #{{ member.retiredNumber }}
            </div>
          </div>
        </div>

        <div v-if="selectedMember" class="detail-panel">
          <div class="detail-header">
            <h3>{{ selectedMember.playerName }}</h3>
            <button class="close-btn" @click="closeDetail">×</button>
          </div>
          
          <div class="detail-content">
            <div class="detail-section">
              <h4>职业生涯统计</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="label">职业生涯</span>
                  <span class="value">{{ selectedMember.careerStats.yearsActive }}年</span>
                </div>
                <div class="stat-item">
                  <span class="label">出场次数</span>
                  <span class="value">{{ selectedMember.careerStats.totalMatches }}场</span>
                </div>
                <div class="stat-item">
                  <span class="label">胜率</span>
                  <span class="value">{{ selectedMember.careerStats.winRate }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">冠军</span>
                  <span class="value">{{ selectedMember.careerStats.championships }}次</span>
                </div>
                <div class="stat-item">
                  <span class="label">MVP</span>
                  <span class="value">{{ selectedMember.careerStats.mvpCount }}次</span>
                </div>
                <div class="stat-item">
                  <span class="label">入选日期</span>
                  <span class="value">{{ formatDate(selectedMember.inductionDate) }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>职业生涯亮点</h4>
              <div class="highlights-list">
                <div 
                  v-for="(highlight, index) in selectedMember.highlights" 
                  :key="index"
                  class="highlight-item"
                >
                  <span class="highlight-type">{{ CAREER_HIGHLIGHT_TYPE_NAMES[highlight.type] }}</span>
                  <span class="highlight-title">{{ highlight.title }}</span>
                  <span class="highlight-desc">{{ highlight.description }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>传记</h4>
              <p class="biography">{{ selectedMember.biography }}</p>
            </div>

            <div v-if="selectedMember.legacy.successorName" class="detail-section">
              <h4>传承</h4>
              <p class="legacy-info">
                传承给: <strong>{{ selectedMember.legacy.successorName }}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'numbers'" class="tab-content">
        <div v-if="retiredNumbers.length === 0" class="empty-state">
          <p>暂无退役号码</p>
          <p class="hint">传奇选手的号码可以被退役以纪念其贡献</p>
        </div>

        <div v-else class="numbers-grid">
          <div 
            v-for="rn in retiredNumbers" 
            :key="rn.number"
            class="number-card"
          >
            <div class="number-display">
              <span class="number">#{{ rn.number }}</span>
            </div>
            <div class="number-info">
              <h4 class="player-name">{{ rn.playerName }}</h4>
              <p class="reason">{{ rn.reason }}</p>
              <span class="date">{{ formatDate(rn.retiredAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'legends'" class="tab-content">
        <div v-if="legends.length === 0" class="empty-state">
          <p>暂无传奇人物</p>
          <p class="hint">成就卓越的选手将被铭记为传奇</p>
        </div>

        <div v-else class="legends-grid">
          <div 
            v-for="legend in legends" 
            :key="legend.id"
            class="legend-card"
            :style="{ borderColor: getImpactColor(legend.impact) }"
            @click="selectLegend(legend)"
          >
            <div 
              class="legend-badge"
              :style="{ 
                backgroundColor: getImpactColor(legend.impact),
                color: legend.impact === 'legendary' ? '#000' : '#fff'
              }"
            >
              {{ LEGEND_IMPACT_NAMES[legend.impact] }}
            </div>
            <div class="legend-info">
              <h4 class="legend-name">{{ legend.playerName }}</h4>
              <p class="legend-title">{{ legend.title }}</p>
              <p class="legend-era">{{ legend.era }}</p>
            </div>
          </div>
        </div>

        <div v-if="selectedLegend" class="detail-panel">
          <div class="detail-header">
            <h3>{{ selectedLegend.playerName }}</h3>
            <span 
              class="impact-badge"
              :style="{ 
                backgroundColor: getImpactBgColor(selectedLegend.impact),
                color: getImpactColor(selectedLegend.impact)
              }"
            >
              {{ LEGEND_IMPACT_NAMES[selectedLegend.impact] }}
            </span>
            <button class="close-btn" @click="closeDetail">×</button>
          </div>
          
          <div class="detail-content">
            <div class="detail-section">
              <h4>称号</h4>
              <p class="legend-title-text">{{ selectedLegend.title }}</p>
            </div>

            <div class="detail-section">
              <h4>描述</h4>
              <p class="legend-description">{{ selectedLegend.description }}</p>
            </div>

            <div class="detail-section">
              <h4>时代</h4>
              <p class="legend-era-text">{{ selectedLegend.era }}</p>
            </div>

            <div class="detail-section">
              <h4>主要成就</h4>
              <div class="achievements-list">
                <div 
                  v-for="(achievement, index) in selectedLegend.achievements" 
                  :key="index"
                  class="achievement-item"
                >
                  {{ achievement }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hall-of-fame {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.header {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
}

.header h2 {
  margin: 0 0 16px 0;
  font-size: 22px;
}

.stats-summary {
  display: flex;
  gap: 30px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #ffd700;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.tab {
  flex: 1;
  padding: 14px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: #666;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.content {
  padding: 20px;
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999;
}

.empty-state p {
  margin: 0;
}

.empty-state .hint {
  font-size: 12px;
  color: #bbb;
  margin-top: 8px;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.member-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.member-card:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.avatar-placeholder {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.member-info {
  flex: 1;
}

.member-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.member-position {
  font-size: 12px;
  color: #999;
}

.member-stats {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: #666;
}

.retired-number-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  background: #ffd700;
  color: #000;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.number-card {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 10px;
  color: white;
}

.number-display {
  text-align: center;
  margin-bottom: 12px;
}

.number {
  font-size: 36px;
  font-weight: 700;
  color: #ffd700;
}

.number-info {
  text-align: center;
}

.number-info .player-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.number-info .reason {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px 0;
}

.number-info .date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.legends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.legend-card {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.legend-card:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.legend-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.legend-info {
  padding-right: 60px;
}

.legend-name {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.legend-title {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #666;
}

.legend-era {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.detail-panel {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  flex: 1;
}

.impact-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #e0e0e0;
  border-radius: 50%;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #d0d0d0;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.stat-item .label {
  font-size: 11px;
  color: #999;
}

.stat-item .value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-top: 4px;
}

.highlights-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.highlight-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: white;
  border-radius: 6px;
}

.highlight-type {
  font-size: 11px;
  color: #667eea;
  margin-bottom: 4px;
}

.highlight-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.highlight-desc {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.biography {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.legacy-info {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.legend-title-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.legend-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.legend-era-text {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.achievements-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.achievement-item {
  padding: 6px 12px;
  background: white;
  border-radius: 16px;
  font-size: 12px;
  color: #333;
}
</style>
