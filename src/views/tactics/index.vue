<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useTacticsStore } from '@/stores/tactics';
import { useCoachStore } from '@/stores/coach';
import {
  initializeTactics,
  calculateBPBonusForClub,
  calculateTacticalBonus,
  updateVersionUnderstanding,
} from '@/core/services/tacticsService';
import {
  FORMATION_NAMES,
  TACTICAL_STYLE_NAMES,
  PACE_NAMES,
} from '@/types/tactics';

const router = useRouter();
const clubStore = useClubStore();
const tacticsStore = useTacticsStore();
const coachStore = useCoachStore();

const activeTab = ref<'overview' | 'formation' | 'bp' | 'commands'>('overview');

const clubId = computed(() => clubStore.currentClub?.id || '');
const tactics = computed(() => {
  if (!clubId.value) return null;
  return tacticsStore.getTactics(clubId.value) || initializeTactics(clubId.value);
});

const versionUnderstanding = computed(() => tacticsStore.getVersionUnderstanding(clubId.value));
const coachingStaff = computed(() => coachStore.getCoachingStaff(clubId.value));
const bpBonus = computed(() => calculateBPBonusForClub(clubId.value));
const tacticalBonus = computed(() => calculateTacticalBonus(clubId.value));

const formationName = computed(() => tactics.value ? FORMATION_NAMES[tactics.value.formation] : '未设置');
const styleName = computed(() => tactics.value ? TACTICAL_STYLE_NAMES[tactics.value.style] : '未设置');
const paceName = computed(() => tactics.value ? PACE_NAMES[tactics.value.pace] : '未设置');

const corePlayerName = computed(() => {
  if (!tactics.value?.corePlayer || !clubStore.currentClub) return '未设置';
  const player = clubStore.currentClub.roster.find(p => p.id === tactics.value?.corePlayer);
  return player?.name || '未设置';
});

const availableCommands = computed(() => tacticsStore.getAvailableCommands(clubId.value));

onMounted(() => {
  if (clubId.value) {
    initializeTactics(clubId.value);
    updateVersionUnderstanding(clubId.value);
  }
});

const goToFormation = () => {
  router.push('/tactics/formation');
};

const goToBP = () => {
  router.push('/tactics/bp');
};

const getBonusColor = (value: number) => {
  if (value >= 15) return '#52c41a';
  if (value >= 10) return '#1890ff';
  if (value >= 5) return '#faad14';
  return '#999';
};

const getUnderstandingColor = (level: number) => {
  if (level >= 80) return '#52c41a';
  if (level >= 60) return '#1890ff';
  if (level >= 40) return '#faad14';
  return '#ff4d4f';
};

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="tactics-page">
    <h2 class="page-title">战术中心</h2>
    
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-label">阵容体系</div>
        <div class="summary-value">{{ formationName }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">战术风格</div>
        <div class="summary-value">{{ styleName }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">BP加成</div>
        <div class="summary-value" style="color: #52c41a">+{{ (bpBonus * 100).toFixed(1) }}%</div>
      </div>
    </div>

    <div class="version-section">
      <div class="version-header">
        <span class="version-title">版本理解</span>
        <span class="version-level" :style="{ color: getUnderstandingColor(versionUnderstanding?.understandingLevel || 0) }">
          Lv.{{ versionUnderstanding?.understandingLevel || 0 }}
        </span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ 
            width: (versionUnderstanding?.researchProgress || 0) + '%',
            backgroundColor: getUnderstandingColor(versionUnderstanding?.understandingLevel || 0)
          }"
        ></div>
      </div>
      <div class="version-bonuses">
        <div class="bonus-item">
          <span class="bonus-label">英雄熟练度</span>
          <span class="bonus-value">+{{ ((versionUnderstanding?.bonuses.heroMastery || 0) * 100).toFixed(1) }}%</span>
        </div>
        <div class="bonus-item">
          <span class="bonus-label">阵容加成</span>
          <span class="bonus-value">+{{ ((versionUnderstanding?.bonuses.compositionBonus || 0) * 100).toFixed(1) }}%</span>
        </div>
        <div class="bonus-item">
          <span class="bonus-label">克制加成</span>
          <span class="bonus-value">+{{ ((versionUnderstanding?.bonuses.counterBonus || 0) * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        总览
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'formation' }"
        @click="activeTab = 'formation'"
      >
        阵容
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'bp' }"
        @click="activeTab = 'bp'"
      >
        BP策略
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'commands' }"
        @click="activeTab = 'commands'"
      >
        指令
      </button>
    </div>

    <div v-if="activeTab === 'overview'" class="overview-section">
      <div class="info-card">
        <h3 class="card-title">战术配置</h3>
        <div class="info-row">
          <span class="info-label">阵容体系</span>
          <span class="info-value">{{ formationName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">战术风格</span>
          <span class="info-value">{{ styleName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">节奏偏好</span>
          <span class="info-value">{{ paceName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">核心选手</span>
          <span class="info-value">{{ corePlayerName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">更新时间</span>
          <span class="info-value">{{ formatDate(tactics?.updatedAt || new Date()) }}</span>
        </div>
      </div>

      <div class="bonus-card">
        <h3 class="card-title">战术加成</h3>
        <div class="bonus-grid">
          <div v-for="(value, key) in tacticalBonus" :key="key" class="bonus-item">
            <span class="bonus-label">{{ key }}</span>
            <span class="bonus-value" :style="{ color: getBonusColor(value) }">+{{ value }}%</span>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn primary" @click="goToFormation">
          调整阵容
        </button>
        <button class="action-btn secondary" @click="goToBP">
          BP设置
        </button>
      </div>
    </div>

    <div v-else-if="activeTab === 'formation'" class="formation-section">
      <div class="formation-preview">
        <h3 class="card-title">当前阵容</h3>
        <div class="formation-display">
          <div class="formation-name">{{ formationName }}</div>
          <div class="formation-style">{{ styleName }} · {{ paceName }}</div>
          <div class="formation-core" v-if="tactics?.corePlayer">
            核心: {{ corePlayerName }}
          </div>
        </div>
        <button class="edit-btn" @click="goToFormation">编辑阵容</button>
      </div>
    </div>

    <div v-else-if="activeTab === 'bp'" class="bp-section">
      <div class="bp-preview">
        <h3 class="card-title">BP策略</h3>
        <div class="bp-info">
          <div class="bp-item">
            <span class="bp-label">优先英雄</span>
            <span class="bp-value">{{ tactics?.bpStrategy.priorityHeroes.length || 0 }} 个</span>
          </div>
          <div class="bp-item">
            <span class="bp-label">禁用目标</span>
            <span class="bp-value">{{ tactics?.bpStrategy.banTargets.length || 0 }} 个</span>
          </div>
          <div class="bp-item">
            <span class="bp-label">摇摆位</span>
            <span class="bp-value">{{ tactics?.bpStrategy.flexPicks.length || 0 }} 个</span>
          </div>
        </div>
        <button class="edit-btn" @click="goToBP">编辑BP策略</button>
      </div>
    </div>

    <div v-else-if="activeTab === 'commands'" class="commands-section">
      <h3 class="card-title">局内指令</h3>
      <div class="commands-list">
        <div 
          v-for="cmd in tactics?.inGameCommands" 
          :key="cmd.id" 
          class="command-card"
          :class="{ disabled: !availableCommands.find(c => c.id === cmd.id) }"
        >
          <div class="command-header">
            <span class="command-name">{{ cmd.name }}</span>
            <span class="command-cooldown">CD: {{ cmd.cooldown }}天</span>
          </div>
          <div class="command-desc">{{ cmd.description }}</div>
          <div class="command-effect">
            效果: {{ cmd.effect.type }} +{{ cmd.effect.value }}
          </div>
          <div class="command-trigger">
            触发条件: {{ cmd.triggerCondition }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tactics-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.version-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.version-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.version-level {
  font-size: 16px;
  font-weight: bold;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.version-bonuses {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.bonus-item {
  text-align: center;
}

.bonus-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 3px;
}

.bonus-value {
  font-size: 14px;
  font-weight: bold;
  color: #52c41a;
}

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.info-card, .bonus-card, .formation-preview, .bp-preview {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #999;
  font-size: 13px;
}

.info-value {
  color: #333;
  font-size: 13px;
  font-weight: 600;
}

.bonus-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
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

.formation-display {
  text-align: center;
  padding: 20px 0;
}

.formation-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.formation-style {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.formation-core {
  font-size: 13px;
  color: #007bff;
}

.edit-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #f0f0f0;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
}

.bp-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 10px;
}

.bp-item {
  text-align: center;
}

.bp-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.bp-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.commands-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.command-card {
  background: white;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #007bff;
}

.command-card.disabled {
  opacity: 0.5;
  border-left-color: #ccc;
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.command-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.command-cooldown {
  font-size: 11px;
  color: #999;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.command-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.command-effect {
  font-size: 12px;
  color: #52c41a;
  margin-bottom: 4px;
}

.command-trigger {
  font-size: 11px;
  color: #999;
}
</style>
