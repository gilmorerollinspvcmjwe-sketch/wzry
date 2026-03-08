<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useCoachStore } from '@/stores/coach';
import { getAvailableCoaches, hireCoach } from '@/core/services/coachService';
import type { Coach, CoachType } from '@/types/coach';
import { COACH_TYPE_NAMES, COACH_STYLE_NAMES } from '@/types/coach';

const router = useRouter();
const clubStore = useClubStore();
const coachStore = useCoachStore();

const selectedType = ref<CoachType>('head');
const availableCoaches = ref<Coach[]>([]);
const selectedCoach = ref<Coach | null>(null);
const showCoachDetail = ref(false);
const isLoading = ref(false);

const clubId = computed(() => clubStore.currentClub?.id || '');
const clubFunds = computed(() => clubStore.currentClub?.funds || 0);
const coachingStaff = computed(() => coachStore.getCoachingStaff(clubId.value));

const coachTypeOptions: { value: CoachType; label: string; disabled: boolean }[] = computed(() => [
  { value: 'head', label: '主教练', disabled: !!coachingStaff.value.headCoach },
  { value: 'assistant', label: '助理教练', disabled: false },
  { value: 'analyst', label: '分析师', disabled: false },
  { value: 'psychological', label: '心理教练', disabled: !!coachingStaff.value.psychologicalCoach },
  { value: 'physical', label: '体能教练', disabled: !!coachingStaff.value.physicalCoach },
]);

const abilityNames: Record<string, string> = {
  tactics: '战术',
  drafting: 'BP',
  motivation: '激励',
  development: '培养',
  analysis: '分析',
};

const loadCoaches = () => {
  isLoading.value = true;
  setTimeout(() => {
    availableCoaches.value = getAvailableCoaches(selectedType.value, 6);
    isLoading.value = false;
  }, 300);
};

onMounted(() => {
  loadCoaches();
});

const selectType = (type: CoachType) => {
  if (coachTypeOptions.value.find(o => o.value === type)?.disabled) return;
  selectedType.value = type;
  loadCoaches();
};

const openCoachDetail = (coach: Coach) => {
  selectedCoach.value = coach;
  showCoachDetail.value = true;
};

const closeCoachDetail = () => {
  showCoachDetail.value = false;
  selectedCoach.value = null;
};

const handleHire = (coach: Coach) => {
  if (clubFunds.value < coach.contract.buyoutClause) {
    alert(`资金不足！需要 ${coach.contract.buyoutClause} 万，当前资金 ${clubFunds.value} 万`);
    return;
  }
  
  if (confirm(`确定聘请 ${coach.name} 吗？需要支付 ${coach.contract.buyoutClause} 万签约金`)) {
    const result = hireCoach(clubId.value, coach);
    if (result.success) {
      alert(result.message);
      closeCoachDetail();
      loadCoaches();
    } else {
      alert(result.message);
    }
  }
};

const goBack = () => {
  router.push('/coach');
};

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const getAbilityColor = (value: number) => {
  if (value >= 80) return '#52c41a';
  if (value >= 60) return '#1890ff';
  if (value >= 40) return '#faad14';
  return '#ff4d4f';
};

const getAverageAbility = (coach: Coach) => {
  const values = Object.values(coach.abilities);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
};
</script>

<template>
  <div class="hiring-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h2 class="page-title">聘请教练</h2>
    </div>
    
    <div class="type-selector">
      <button 
        v-for="option in coachTypeOptions" 
        :key="option.value"
        class="type-btn"
        :class="{ 
          active: selectedType === option.value,
          disabled: option.disabled 
        }"
        :disabled="option.disabled"
        @click="selectType(option.value)"
      >
        {{ option.label }}
        <span v-if="option.disabled" class="filled-badge">已聘请</span>
      </button>
    </div>
    
    <div class="funds-info">
      <span class="funds-label">可用资金</span>
      <span class="funds-value">{{ clubFunds }} 万</span>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <p>正在搜索教练...</p>
    </div>
    
    <div v-else class="coaches-list">
      <div 
        v-for="coach in availableCoaches" 
        :key="coach.id"
        class="coach-card"
        @click="openCoachDetail(coach)"
      >
        <div class="coach-header">
          <div class="coach-avatar">{{ coach.name[0] }}</div>
          <div class="coach-info">
            <div class="coach-name">{{ coach.name }}</div>
            <div class="coach-meta">
              <span class="coach-style">{{ COACH_STYLE_NAMES[coach.style] }}</span>
              <span class="coach-exp">{{ coach.experience }}年经验</span>
            </div>
          </div>
          <div class="coach-rating">
            <div class="rating-value">{{ getAverageAbility(coach) }}</div>
            <div class="rating-label">综合</div>
          </div>
        </div>
        
        <div class="coach-abilities-preview">
          <div 
            v-for="(value, key) in coach.abilities" 
            :key="key"
            class="ability-dot"
            :style="{ backgroundColor: getAbilityColor(value) }"
            :title="`${abilityNames[key]}: ${value}`"
          >
            {{ value }}
          </div>
        </div>
        
        <div class="coach-footer">
          <div class="coach-cost">
            <span class="cost-label">签约金</span>
            <span class="cost-value" :class="{ affordable: clubFunds >= coach.contract.buyoutClause }">
              {{ coach.contract.buyoutClause }}万
            </span>
          </div>
          <div class="coach-salary">
            <span class="salary-label">周薪</span>
            <span class="salary-value">{{ coach.contract.salary }}万</span>
          </div>
        </div>
      </div>
      
      <div v-if="availableCoaches.length === 0" class="empty-state">
        <p>暂无可聘请的教练</p>
      </div>
    </div>
    
    <button class="refresh-btn" @click="loadCoaches" :disabled="isLoading">
      刷新候选人
    </button>
    
    <div v-if="showCoachDetail && selectedCoach" class="modal-overlay" @click="closeCoachDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="header-info">
            <h3>{{ selectedCoach.name }}</h3>
            <div class="header-meta">
              <span class="type-tag">{{ COACH_TYPE_NAMES[selectedCoach.type] }}</span>
              <span class="style-tag">{{ COACH_STYLE_NAMES[selectedCoach.style] }}</span>
            </div>
          </div>
          <button class="close-btn" @click="closeCoachDetail">×</button>
        </div>
        
        <div class="modal-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">经验</span>
              <span class="info-value">{{ selectedCoach.experience }} 年</span>
            </div>
            <div class="info-item">
              <span class="info-label">声望</span>
              <span class="info-value">{{ selectedCoach.reputation }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">综合能力</span>
              <span class="info-value highlight">{{ getAverageAbility(selectedCoach) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">签约金</span>
              <span class="info-value" :class="{ affordable: clubFunds >= selectedCoach.contract.buyoutClause }">
                {{ selectedCoach.contract.buyoutClause }}万
              </span>
            </div>
          </div>
          
          <div class="abilities-section">
            <h4>能力属性</h4>
            <div v-for="(value, key) in selectedCoach.abilities" :key="key" class="ability-row">
              <span class="ability-name">{{ abilityNames[key] }}</span>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: value + '%', backgroundColor: getAbilityColor(value) }"></div>
              </div>
              <span class="ability-value">{{ value }}</span>
            </div>
          </div>
          
          <div v-if="selectedCoach.specialties.length > 0" class="specialties-section">
            <h4>专精领域</h4>
            <div class="specialties-grid">
              <div v-for="specialty in selectedCoach.specialties" :key="specialty.type + specialty.value" class="specialty-card">
                <div class="specialty-type">{{ specialty.type }}</div>
                <div class="specialty-value">{{ specialty.value }}</div>
                <div class="specialty-bonus">+{{ specialty.bonus }}%</div>
              </div>
            </div>
          </div>
          
          <div class="contract-section">
            <h4>合同详情</h4>
            <div class="contract-details">
              <div class="contract-item">
                <span class="contract-label">周薪</span>
                <span class="contract-value">{{ selectedCoach.contract.salary }}万</span>
              </div>
              <div class="contract-item">
                <span class="contract-label">合同期限</span>
                <span class="contract-value">
                  {{ Math.ceil((new Date(selectedCoach.contract.endDate).getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000)) }} 年
                </span>
              </div>
              <div class="contract-item">
                <span class="contract-label">违约金</span>
                <span class="contract-value">{{ selectedCoach.contract.buyoutClause }}万</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="hire-btn"
            :disabled="clubFunds < selectedCoach.contract.buyoutClause"
            @click="handleHire(selectedCoach)"
          >
            {{ clubFunds >= selectedCoach.contract.buyoutClause ? '聘请' : '资金不足' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hiring-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.back-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.type-btn {
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.type-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.type-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.filled-badge {
  display: block;
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}

.type-btn.active .filled-badge {
  color: rgba(255,255,255,0.8);
}

.funds-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  margin-bottom: 15px;
  color: white;
}

.funds-label {
  font-size: 14px;
  opacity: 0.9;
}

.funds-value {
  font-size: 18px;
  font-weight: bold;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.coaches-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 15px;
}

.coach-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.coach-card:active {
  transform: scale(0.98);
}

.coach-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.coach-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.coach-info {
  flex: 1;
}

.coach-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.coach-meta {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.coach-style, .coach-exp {
  font-size: 12px;
  color: #999;
}

.coach-rating {
  text-align: center;
}

.rating-value {
  font-size: 20px;
  font-weight: bold;
  color: #007bff;
}

.rating-label {
  font-size: 10px;
  color: #999;
}

.coach-abilities-preview {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.ability-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: bold;
}

.coach-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.coach-cost, .coach-salary {
  display: flex;
  flex-direction: column;
}

.cost-label, .salary-label {
  font-size: 11px;
  color: #999;
}

.cost-value, .salary-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.cost-value.affordable {
  color: #52c41a;
}

.refresh-btn {
  width: 100%;
  padding: 14px;
  border: 2px solid #007bff;
  border-radius: 10px;
  background: white;
  color: #007bff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:active:not(:disabled) {
  background: #007bff;
  color: white;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-content {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .modal-content {
    border-radius: 16px;
    max-height: 80vh;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.header-meta {
  display: flex;
  gap: 8px;
}

.type-tag, .style-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(255,255,255,0.2);
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.modal-body {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  text-align: center;
}

.info-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.info-value.highlight {
  color: #007bff;
  font-size: 18px;
}

.info-value.affordable {
  color: #52c41a;
}

.abilities-section,
.specialties-section,
.contract-section {
  margin-bottom: 20px;
}

.abilities-section h4,
.specialties-section h4,
.contract-section h4 {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
}

.ability-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.ability-name {
  width: 40px;
  font-size: 13px;
  color: #666;
}

.ability-bar {
  flex: 1;
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.ability-value {
  width: 30px;
  text-align: right;
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.specialties-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.specialty-card {
  padding: 12px;
  background: linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%);
  border-radius: 8px;
  text-align: center;
}

.specialty-type {
  font-size: 11px;
  color: #999;
}

.specialty-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 4px 0;
}

.specialty-bonus {
  font-size: 12px;
  color: #52c41a;
  font-weight: bold;
}

.contract-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contract-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.contract-label {
  font-size: 13px;
  color: #999;
}

.contract-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.hire-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hire-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
