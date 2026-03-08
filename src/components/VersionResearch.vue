<template>
  <div class="version-research">
    <div class="research-header">
      <h3>🔬 版本研究</h3>
      <div class="version-badge">v{{ versionStore.versionNumber }}</div>
    </div>

    <div class="adaptation-section">
      <div class="adaptation-header">
        <span class="label">版本理解度</span>
        <span class="value">{{ adaptationLevel.toFixed(0) }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${adaptationLevel}%` }"></div>
      </div>
      <div class="adaptation-bonuses">
        <div class="bonus-item">
          <span class="bonus-label">英雄熟练加成</span>
          <span class="bonus-value">+{{ bonuses.heroMastery.toFixed(1) }}%</span>
        </div>
        <div class="bonus-item">
          <span class="bonus-label">阵容加成</span>
          <span class="bonus-value">+{{ bonuses.compositionBonus.toFixed(1) }}%</span>
        </div>
        <div class="bonus-item">
          <span class="bonus-label">克制加成</span>
          <span class="bonus-value">+{{ bonuses.counterBonus.toFixed(1) }}%</span>
        </div>
        <div class="bonus-item">
          <span class="bonus-label">BP洞察</span>
          <span class="bonus-value">+{{ bonuses.bpInsight.toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <div class="research-panel">
      <h4>💰 投资研究</h4>
      <p class="research-desc">投入资金进行版本研究，提升对当前版本的理解度</p>
      
      <div class="investment-options">
        <button 
          v-for="option in investmentOptions" 
          :key="option.value"
          class="investment-btn"
          :class="{ disabled: clubFunds < option.value }"
          @click="selectInvestment(option.value)"
        >
          <span class="amount">{{ option.value }}万</span>
          <span class="expected">预计+{{ option.expectedProgress }}%</span>
        </button>
      </div>

      <div class="custom-investment">
        <label>自定义投资金额：</label>
        <div class="input-group">
          <input 
            type="number" 
            v-model.number="customInvestment" 
            min="10" 
            max="1000"
            placeholder="最低10万"
          />
          <span class="unit">万</span>
        </div>
      </div>

      <button 
        class="research-btn" 
        :disabled="!canResearch"
        @click="doResearch"
      >
        开始研究
      </button>
    </div>

    <div v-if="findings.length > 0" class="findings-section">
      <h4>📊 研究发现</h4>
      <div class="findings-list">
        <div v-for="(finding, index) in findings" :key="index" class="finding-item">
          <span class="finding-type" :class="finding.type">{{ getFindingTypeName(finding.type) }}</span>
          <span class="finding-target">{{ finding.targetName }}</span>
          <span class="finding-insight">{{ finding.insight }}</span>
        </div>
      </div>
    </div>

    <div class="known-meta-section">
      <h4>📋 已知版本强势英雄</h4>
      <div v-if="knownMetaHeroes.length > 0" class="hero-list">
        <div v-for="hero in knownMetaHeroes" :key="hero.heroId" class="hero-item">
          <span class="hero-name">{{ hero.heroName }}</span>
          <span class="hero-tier" :class="`tier-${hero.tier}`">T{{ hero.tier }}</span>
          <span v-if="hero.insight" class="researched-badge">已研究</span>
        </div>
      </div>
      <div v-else class="empty-state">
        暂无已知强势英雄，请进行研究
      </div>
    </div>

    <div class="research-history">
      <h4>📜 研究历史</h4>
      <div v-if="researchHistory.length > 0" class="history-list">
        <div v-for="(record, index) in researchHistory.slice(-5)" :key="index" class="history-item">
          <span class="history-date">{{ formatDate(record.startDate) }}</span>
          <span class="history-investment">{{ record.investment }}万</span>
          <span class="history-progress">+{{ record.progress.toFixed(1) }}%</span>
        </div>
      </div>
      <div v-else class="empty-state">
        暂无研究记录
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVersionStore } from '@/stores/version';
import { useClubStore } from '@/stores/club';
import { useCoachStore } from '@/stores/coach';
import { researchVersion, getVersionMetaHeroes } from '@/core/services/versionService';
import type { VersionAdaptationBonus, ResearchFinding } from '@/types/version';

const props = defineProps<{
  clubId: string;
}>();

const emit = defineEmits<{
  researchComplete: [result: { success: boolean; message: string }];
}>();

const versionStore = useVersionStore();
const clubStore = useClubStore();
const coachStore = useCoachStore();

const customInvestment = ref<number>(50);
const findings = ref<ResearchFinding[]>([]);

const investmentOptions = [
  { value: 50, expectedProgress: 15 },
  { value: 100, expectedProgress: 30 },
  { value: 200, expectedProgress: 50 },
  { value: 500, expectedProgress: 80 },
];

const clubFunds = computed(() => {
  const club = clubStore.getClub(props.clubId);
  return club?.funds || 0;
});

const adaptationLevel = computed(() => {
  return versionStore.getAdaptationLevel(props.clubId);
});

const bonuses = computed<VersionAdaptationBonus>(() => {
  return versionStore.getAdaptationBonus(props.clubId);
});

const knownMetaHeroes = computed(() => {
  return getVersionMetaHeroes(props.clubId);
});

const researchHistory = computed(() => {
  return versionStore.getResearches(props.clubId);
});

const canResearch = computed(() => {
  return customInvestment.value >= 10 && clubFunds.value >= customInvestment.value;
});

function selectInvestment(value: number): void {
  customInvestment.value = value;
}

function getFindingTypeName(type: string): string {
  const names: Record<string, string> = {
    hero: '英雄',
    composition: '阵容',
    counter: '克制',
    mechanic: '机制',
  };
  return names[type] || type;
}

function formatDate(date: Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
}

async function doResearch(): Promise<void> {
  const result = researchVersion(props.clubId, customInvestment.value);
  
  if (result.success) {
    if (result.findings) {
      findings.value = result.findings;
    }
    if (result.research) {
      versionStore.addResearch(props.clubId, result.research);
    }
  }
  
  emit('researchComplete', {
    success: result.success,
    message: result.message,
  });
}
</script>

<style scoped>
.version-research {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 20px;
  color: #fff;
}

.research-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.research-header h3 {
  margin: 0;
  font-size: 18px;
}

.version-badge {
  background: rgba(79, 195, 247, 0.2);
  color: #4fc3f7;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
}

.adaptation-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.adaptation-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.adaptation-header .label {
  color: #888;
  font-size: 14px;
}

.adaptation-header .value {
  font-size: 18px;
  font-weight: bold;
  color: #4fc3f7;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4fc3f7 0%, #29b6f6 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.adaptation-bonuses {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.bonus-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.bonus-label {
  color: #888;
}

.bonus-value {
  color: #52c41a;
}

.research-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.research-panel h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.research-desc {
  font-size: 12px;
  color: #888;
  margin: 0 0 16px 0;
}

.investment-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.investment-btn {
  background: rgba(79, 195, 247, 0.1);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 8px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.investment-btn:hover:not(.disabled) {
  background: rgba(79, 195, 247, 0.2);
  border-color: #4fc3f7;
}

.investment-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.investment-btn .amount {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
}

.investment-btn .expected {
  font-size: 11px;
  color: #52c41a;
}

.custom-investment {
  margin-bottom: 16px;
}

.custom-investment label {
  font-size: 12px;
  color: #888;
  display: block;
  margin-bottom: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 10px 12px;
  color: #fff;
  font-size: 14px;
}

.input-group input:focus {
  outline: none;
  border-color: #4fc3f7;
}

.input-group .unit {
  color: #888;
  font-size: 14px;
}

.research-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.research-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3);
}

.research-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.findings-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.findings-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #faad14;
}

.findings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.finding-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.finding-type {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  background: rgba(79, 195, 247, 0.2);
  color: #4fc3f7;
}

.finding-type.hero {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.finding-type.composition {
  background: rgba(114, 46, 209, 0.2);
  color: #722ed1;
}

.finding-target {
  color: #fff;
  font-weight: 500;
}

.finding-insight {
  color: #888;
}

.known-meta-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.known-meta-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.hero-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.hero-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.hero-name {
  flex: 1;
  color: #fff;
}

.hero-tier {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.hero-tier.tier-0 {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.hero-tier.tier-1 {
  background: rgba(255, 122, 69, 0.2);
  color: #ff7a45;
}

.hero-tier.tier-2 {
  background: rgba(255, 169, 64, 0.2);
  color: #ffa940;
}

.researched-badge {
  font-size: 10px;
  color: #52c41a;
}

.empty-state {
  font-size: 12px;
  color: #888;
  text-align: center;
  padding: 20px;
}

.research-history {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
}

.research-history h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.history-date {
  color: #888;
}

.history-investment {
  color: #fff;
}

.history-progress {
  color: #52c41a;
}
</style>
