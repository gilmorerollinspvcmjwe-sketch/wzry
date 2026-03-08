<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useYouthAcademyStore } from '@/stores/youthAcademy';
import { 
  hireYouthCoach, 
  fireYouthCoach, 
  getAvailableYouthCoaches 
} from '@/core/services/youthAcademyService';
import type { YouthCoach } from '@/types/youthAcademy';
import { YOUTH_COACH_SPECIALTY_NAMES, YOUTH_COACH_STYLE_NAMES } from '@/types/youthAcademy';

const router = useRouter();
const clubStore = useClubStore();
const academyStore = useYouthAcademyStore();

const activeTab = ref<'current' | 'market'>('current');
const selectedCoach = ref<YouthCoach | null>(null);
const showCoachDetail = ref(false);
const showFireConfirm = ref(false);
const availableCoaches = ref<YouthCoach[]>([]);

const clubId = computed(() => clubStore.currentClub?.id || '');
const academy = computed(() => academyStore.getAcademy(clubId.value));
const coaches = computed(() => academyStore.getCoaches(clubId.value));

const positionNames: Record<string, string> = {
  top: '对抗路',
  jungle: '打野',
  mid: '中路',
  adc: '发育路',
  support: '游走',
};

const bonusTypeNames: Record<string, string> = {
  training_speed: '训练速度',
  potential_growth: '潜力成长',
  morale: '士气加成',
  hero_pool: '英雄池',
  position_mastery: '位置熟练度',
};

const loadAvailableCoaches = () => {
  const avgLevel = Math.floor(academy.value.coaches.reduce((sum, c) => sum + c.level, 0) / Math.max(1, academy.value.coaches.length)) || 1;
  availableCoaches.value = getAvailableYouthCoaches(5, avgLevel);
};

onMounted(() => {
  loadAvailableCoaches();
});

const openCoachDetail = (coach: YouthCoach) => {
  selectedCoach.value = coach;
  showCoachDetail.value = true;
};

const closeCoachDetail = () => {
  showCoachDetail.value = false;
  selectedCoach.value = null;
};

const handleHire = (coach: YouthCoach) => {
  const result = hireYouthCoach(clubId.value, coach);
  if (result.success) {
    alert(result.message);
    loadAvailableCoaches();
  } else {
    alert(result.message);
  }
};

const handleFire = (coach: YouthCoach) => {
  selectedCoach.value = coach;
  showFireConfirm.value = true;
};

const confirmFire = () => {
  if (!selectedCoach.value) return;
  
  const result = fireYouthCoach(clubId.value, selectedCoach.value.id);
  if (result.success) {
    alert(result.message);
    showFireConfirm.value = false;
    closeCoachDetail();
  } else {
    alert(result.message);
  }
};

const getSpecialtyColor = (specialty: string) => {
  const colors: Record<string, string> = {
    training: '#52c41a',
    tactics: '#1890ff',
    mental: '#722ed1',
    physical: '#fa8c16',
    hero_pool: '#eb2f96',
    position: '#13c2c2',
  };
  return colors[specialty] || '#666';
};

const getLevelColor = (level: number) => {
  if (level >= 4) return '#722ed1';
  if (level >= 3) return '#52c41a';
  if (level >= 2) return '#1890ff';
  return '#faad14';
};

const goBack = () => {
  router.push('/youth');
};

const refreshMarket = () => {
  loadAvailableCoaches();
};
</script>

<template>
  <div class="coaches-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <h2 class="page-title">青训教练</h2>
      <div class="header-spacer"></div>
    </div>
    
    <div class="summary-bar">
      <div class="summary-item">
        <span class="summary-label">教练数量</span>
        <span class="summary-value">{{ coaches.length }}/5</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">周薪支出</span>
        <span class="summary-value">{{ coaches.reduce((sum, c) => sum + c.salary, 0) }}万</span>
      </div>
    </div>
    
    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'current' }"
        @click="activeTab = 'current'"
      >
        现任教练 ({{ coaches.length }})
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'market' }"
        @click="activeTab = 'market'"
      >
        教练市场
      </button>
    </div>
    
    <div v-if="activeTab === 'current'" class="current-section">
      <div v-if="coaches.length > 0" class="coaches-list">
        <div 
          v-for="coach in coaches" 
          :key="coach.id" 
          class="coach-card"
          @click="openCoachDetail(coach)"
        >
          <div class="coach-header">
            <div class="coach-avatar">{{ coach.name[0] }}</div>
            <div class="coach-info">
              <div class="coach-name">{{ coach.name }}</div>
              <div class="coach-meta">
                <span class="coach-specialty" :style="{ color: getSpecialtyColor(coach.specialty) }">
                  {{ YOUTH_COACH_SPECIALTY_NAMES[coach.specialty] }}
                </span>
                <span class="coach-level" :style="{ color: getLevelColor(coach.level) }">
                  Lv.{{ coach.level }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="coach-bonuses">
            <div v-for="bonus in coach.bonuses" :key="bonus.type" class="bonus-item">
              <span class="bonus-name">{{ bonusTypeNames[bonus.type] }}</span>
              <span class="bonus-value">+{{ bonus.value }}%</span>
            </div>
          </div>
          
          <div class="coach-footer">
            <span class="coach-salary">{{ coach.salary }}万/周</span>
            <span class="coach-style">{{ YOUTH_COACH_STYLE_NAMES[coach.style] }}</span>
          </div>
          
          <div class="coach-actions" @click.stop>
            <button class="fire-btn" @click="handleFire(coach)">解雇</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-coaches">
        <p>暂无青训教练</p>
        <button class="hire-btn" @click="activeTab = 'market'">前往聘请</button>
      </div>
    </div>
    
    <div v-else class="market-section">
      <div class="market-header">
        <h3>可聘请教练</h3>
        <button class="refresh-btn" @click="refreshMarket">刷新</button>
      </div>
      
      <div class="coaches-list">
        <div 
          v-for="coach in availableCoaches" 
          :key="coach.id" 
          class="coach-card market"
        >
          <div class="coach-header">
            <div class="coach-avatar">{{ coach.name[0] }}</div>
            <div class="coach-info">
              <div class="coach-name">{{ coach.name }}</div>
              <div class="coach-meta">
                <span class="coach-specialty" :style="{ color: getSpecialtyColor(coach.specialty) }">
                  {{ YOUTH_COACH_SPECIALTY_NAMES[coach.specialty] }}
                </span>
                <span class="coach-level" :style="{ color: getLevelColor(coach.level) }">
                  Lv.{{ coach.level }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="coach-bonuses">
            <div v-for="bonus in coach.bonuses" :key="bonus.type" class="bonus-item">
              <span class="bonus-name">{{ bonusTypeNames[bonus.type] }}</span>
              <span class="bonus-value">+{{ bonus.value }}%</span>
            </div>
          </div>
          
          <div class="coach-details">
            <div class="detail-item">
              <span class="detail-label">风格</span>
              <span class="detail-value">{{ YOUTH_COACH_STYLE_NAMES[coach.style] }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">经验</span>
              <span class="detail-value">{{ coach.experience }}年</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">声望</span>
              <span class="detail-value">{{ coach.reputation }}</span>
            </div>
          </div>
          
          <div v-if="coach.positionFocus" class="position-focus">
            专精位置: {{ positionNames[coach.positionFocus] }}
          </div>
          
          <div class="coach-footer">
            <span class="coach-salary">{{ coach.salary }}万/周</span>
            <span class="hire-cost">聘请费: {{ coach.salary * 4 }}万</span>
          </div>
          
          <div class="coach-actions">
            <button 
              class="hire-btn" 
              :disabled="coaches.length >= 5"
              @click="handleHire(coach)"
            >
              {{ coaches.length >= 5 ? '已满员' : '聘请' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showCoachDetail && selectedCoach" class="modal-overlay" @click="closeCoachDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedCoach.name }}</h3>
          <button class="close-btn" @click="closeCoachDetail">×</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">专精领域</span>
              <span class="detail-value" :style="{ color: getSpecialtyColor(selectedCoach.specialty) }">
                {{ YOUTH_COACH_SPECIALTY_NAMES[selectedCoach.specialty] }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">等级</span>
              <span class="detail-value" :style="{ color: getLevelColor(selectedCoach.level) }">
                Lv.{{ selectedCoach.level }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">风格</span>
              <span class="detail-value">{{ YOUTH_COACH_STYLE_NAMES[selectedCoach.style] }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">经验</span>
              <span class="detail-value">{{ selectedCoach.experience }}年</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">声望</span>
              <span class="detail-value">{{ selectedCoach.reputation }}</span>
            </div>
            <div v-if="selectedCoach.positionFocus" class="detail-row">
              <span class="detail-label">专精位置</span>
              <span class="detail-value">{{ positionNames[selectedCoach.positionFocus] }}</span>
            </div>
          </div>
          
          <div class="bonuses-section">
            <h4>能力加成</h4>
            <div class="bonuses-list">
              <div v-for="bonus in selectedCoach.bonuses" :key="bonus.type" class="bonus-detail">
                <span class="bonus-name">{{ bonusTypeNames[bonus.type] }}</span>
                <span class="bonus-value">+{{ bonus.value }}%</span>
              </div>
            </div>
          </div>
          
          <div class="contract-section">
            <h4>合同信息</h4>
            <div class="detail-row">
              <span class="detail-label">周薪</span>
              <span class="detail-value">{{ selectedCoach.salary }}万</span>
            </div>
          </div>
          
          <div class="style-effect">
            <h4>风格效果</h4>
            <p v-if="selectedCoach.style === 'strict'">严格型: 训练效率+10%，士气恢复-5%</p>
            <p v-else-if="selectedCoach.style === 'encouraging'">鼓励型: 士气恢复+10%，训练效率-5%</p>
            <p v-else-if="selectedCoach.style === 'balanced'">均衡型: 各项属性均衡发展</p>
            <p v-else-if="selectedCoach.style === 'innovative'">创新型: 潜力成长+5%，稳定性-5%</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="fire-btn full" @click="handleFire(selectedCoach)">解雇教练</button>
        </div>
      </div>
    </div>
    
    <div v-if="showFireConfirm" class="modal-overlay" @click="showFireConfirm = false">
      <div class="confirm-modal" @click.stop>
        <h3>确认解雇</h3>
        <p>确定要解雇 <strong>{{ selectedCoach?.name }}</strong> 吗？</p>
        <p class="hint">需要支付违约金 {{ selectedCoach ? selectedCoach.salary * 2 : 0 }}万</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="showFireConfirm = false">取消</button>
          <button class="confirm-btn fire" @click="confirmFire">确认解雇</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coaches-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f5f5f5;
  font-size: 18px;
  cursor: pointer;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-spacer {
  width: 36px;
}

.summary-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  padding: 12px 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 12px;
  color: #999;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.tab-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.coaches-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.coach-card.market {
  cursor: default;
}

.coach-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.coach-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.coach-info {
  flex: 1;
}

.coach-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.coach-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
}

.coach-specialty {
  font-weight: 600;
}

.coach-level {
  font-weight: 600;
}

.coach-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  background: #f0f5ff;
  border-radius: 4px;
  font-size: 11px;
}

.bonus-name {
  color: #666;
}

.bonus-value {
  color: #52c41a;
  font-weight: 600;
}

.coach-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.detail-item {
  text-align: center;
}

.detail-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 3px;
}

.detail-value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.position-focus {
  padding: 8px 12px;
  background: #e6f7ff;
  border-radius: 6px;
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 12px;
  text-align: center;
}

.coach-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
}

.coach-salary {
  color: #52c41a;
  font-weight: 600;
}

.hire-cost {
  color: #fa8c16;
}

.coach-actions {
  margin-top: 12px;
}

.fire-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #ff4d4f;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.fire-btn.full {
  padding: 14px;
}

.hire-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #52c41a;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.hire-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.empty-coaches {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-coaches p {
  color: #999;
  margin-bottom: 15px;
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.market-header h3 {
  font-size: 16px;
  color: #333;
}

.refresh-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
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
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
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

.detail-section {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  color: #999;
  font-size: 14px;
}

.detail-value {
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.bonuses-section,
.contract-section,
.style-effect {
  margin-bottom: 20px;
}

.bonuses-section h4,
.contract-section h4,
.style-effect h4 {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
}

.bonuses-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bonus-detail {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.bonus-detail .bonus-name {
  color: #666;
}

.bonus-detail .bonus-value {
  color: #52c41a;
  font-weight: 600;
}

.style-effect p {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.confirm-modal {
  background: white;
  border-radius: 16px;
  padding: 20px;
  width: 90%;
  max-width: 350px;
  text-align: center;
}

.confirm-modal h3 {
  margin-bottom: 15px;
  color: #333;
}

.confirm-modal p {
  color: #666;
  margin-bottom: 10px;
}

.confirm-modal .hint {
  font-size: 12px;
  color: #ff4d4f;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn.fire {
  background: #ff4d4f;
  color: white;
}
</style>
