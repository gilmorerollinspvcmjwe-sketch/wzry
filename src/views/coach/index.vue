<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useCoachStore } from '@/stores/coach';
import { fireCoach, calculateBPBonus } from '@/core/services/coachService';
import type { Coach } from '@/types/coach';
import { COACH_TYPE_NAMES, COACH_STYLE_NAMES } from '@/types/coach';

const router = useRouter();
const clubStore = useClubStore();
const coachStore = useCoachStore();

const activeTab = ref<'staff' | 'meetings'>('staff');
const selectedCoach = ref<Coach | null>(null);
const showCoachDetail = ref(false);

const clubId = computed(() => clubStore.currentClub?.id || '');
const coachingStaff = computed(() => coachStore.getCoachingStaff(clubId.value));
const totalSalary = computed(() => coachStore.getTotalSalary(clubId.value));
const recentMeetings = computed(() => coachStore.getRecentMeetings(clubId.value, 5));

const allCoaches = computed(() => {
  const coaches: Coach[] = [];
  if (coachingStaff.value.headCoach) coaches.push(coachingStaff.value.headCoach);
  coaches.push(...coachingStaff.value.assistantCoaches);
  coaches.push(...coachingStaff.value.analysts);
  if (coachingStaff.value.psychologicalCoach) coaches.push(coachingStaff.value.psychologicalCoach);
  if (coachingStaff.value.physicalCoach) coaches.push(coachingStaff.value.physicalCoach);
  return coaches;
});

const bpBonus = computed(() => calculateBPBonus(coachingStaff.value.headCoach));

const abilityNames: Record<string, string> = {
  tactics: '战术',
  drafting: 'BP',
  motivation: '激励',
  development: '培养',
  analysis: '分析',
};

const meetingTypeNames: Record<string, string> = {
  tactical: '战术会议',
  player_review: '选手评估',
  draft_prep: 'BP准备',
  team_building: '团队建设',
  performance: '表现分析',
};

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const openCoachDetail = (coach: Coach) => {
  selectedCoach.value = coach;
  showCoachDetail.value = true;
};

const closeCoachDetail = () => {
  showCoachDetail.value = false;
  selectedCoach.value = null;
};

const handleFireCoach = (coach: Coach) => {
  if (confirm(`确定要解雇 ${coach.name} 吗？需要支付违约金 ${Math.floor(coach.contract.buyoutClause * 0.3)} 万`)) {
    const result = fireCoach(clubId.value, coach.id);
    if (result.success) {
      alert(result.message);
      closeCoachDetail();
    } else {
      alert(result.message);
    }
  }
};

const goToHiring = () => {
  router.push('/coach/hiring');
};

const goToMeeting = () => {
  router.push('/coach/meeting');
};

const getAbilityColor = (value: number) => {
  if (value >= 80) return '#52c41a';
  if (value >= 60) return '#1890ff';
  if (value >= 40) return '#faad14';
  return '#ff4d4f';
};

const getChemistryColor = (value: number) => {
  if (value >= 80) return '#52c41a';
  if (value >= 60) return '#1890ff';
  if (value >= 40) return '#faad14';
  return '#ff4d4f';
};
</script>

<template>
  <div class="coach-page">
    <h2 class="page-title">教练团队</h2>
    
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-label">团队默契</div>
        <div class="summary-value" :style="{ color: getChemistryColor(coachingStaff.chemistry) }">
          {{ coachingStaff.chemistry }}
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-label">周薪支出</div>
        <div class="summary-value">{{ totalSalary }}万</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">BP加成</div>
        <div class="summary-value">+{{ (bpBonus.bonus * 100).toFixed(1) }}%</div>
      </div>
    </div>
    
    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'staff' }"
        @click="activeTab = 'staff'"
      >
        教练组 ({{ allCoaches.length }})
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'meetings' }"
        @click="activeTab = 'meetings'"
      >
        会议记录
      </button>
    </div>
    
    <div v-if="activeTab === 'staff'" class="staff-section">
      <div class="action-buttons">
        <button class="action-btn primary" @click="goToHiring">
          聘请教练
        </button>
        <button class="action-btn secondary" @click="goToMeeting" :disabled="!coachingStaff.headCoach">
          召开会议
        </button>
      </div>
      
      <div v-if="coachingStaff.headCoach" class="coach-card head-coach" @click="openCoachDetail(coachingStaff.headCoach)">
        <div class="coach-type-badge">主教练</div>
        <div class="coach-header">
          <div class="coach-avatar">{{ coachingStaff.headCoach.name[0] }}</div>
          <div class="coach-info">
            <div class="coach-name">{{ coachingStaff.headCoach.name }}</div>
            <div class="coach-style">{{ COACH_STYLE_NAMES[coachingStaff.headCoach.style] }}</div>
          </div>
        </div>
        <div class="coach-abilities">
          <div v-for="(value, key) in coachingStaff.headCoach.abilities" :key="key" class="ability-item">
            <span class="ability-name">{{ abilityNames[key] }}</span>
            <div class="ability-bar">
              <div class="ability-fill" :style="{ width: value + '%', backgroundColor: getAbilityColor(value) }"></div>
            </div>
            <span class="ability-value">{{ value }}</span>
          </div>
        </div>
        <div class="coach-footer">
          <span class="salary">{{ coachingStaff.headCoach.contract.salary }}万/周</span>
          <span class="contract-end">合同至 {{ formatDate(coachingStaff.headCoach.contract.endDate) }}</span>
        </div>
      </div>
      
      <div v-else class="empty-coach head">
        <p>暂无主教练</p>
        <button class="hire-btn" @click="goToHiring">聘请主教练</button>
      </div>
      
      <div class="coaches-grid">
        <div 
          v-for="coach in coachingStaff.assistantCoaches" 
          :key="coach.id"
          class="coach-card assistant"
          @click="openCoachDetail(coach)"
        >
          <div class="coach-type-badge small">助教</div>
          <div class="coach-name">{{ coach.name }}</div>
          <div class="coach-specialty" v-if="coach.specialties.length">
            {{ coach.specialties[0].type }}
          </div>
          <div class="coach-salary">{{ coach.contract.salary }}万/周</div>
        </div>
        
        <div 
          v-for="coach in coachingStaff.analysts" 
          :key="coach.id"
          class="coach-card analyst"
          @click="openCoachDetail(coach)"
        >
          <div class="coach-type-badge small">分析师</div>
          <div class="coach-name">{{ coach.name }}</div>
          <div class="coach-specialty" v-if="coach.specialties.length">
            {{ coach.specialties[0].type }}
          </div>
          <div class="coach-salary">{{ coach.contract.salary }}万/周</div>
        </div>
      </div>
      
      <div class="special-coaches">
        <div 
          v-if="coachingStaff.psychologicalCoach"
          class="coach-card psychological"
          @click="openCoachDetail(coachingStaff.psychologicalCoach)"
        >
          <div class="coach-type-badge">心理教练</div>
          <div class="coach-name">{{ coachingStaff.psychologicalCoach.name }}</div>
          <div class="coach-ability">
            激励: {{ coachingStaff.psychologicalCoach.abilities.motivation }}
          </div>
          <div class="coach-salary">{{ coachingStaff.psychologicalCoach.contract.salary }}万/周</div>
        </div>
        
        <div 
          v-if="coachingStaff.physicalCoach"
          class="coach-card physical"
          @click="openCoachDetail(coachingStaff.physicalCoach)"
        >
          <div class="coach-type-badge">体能教练</div>
          <div class="coach-name">{{ coachingStaff.physicalCoach.name }}</div>
          <div class="coach-ability">
            培养: {{ coachingStaff.physicalCoach.abilities.development }}
          </div>
          <div class="coach-salary">{{ coachingStaff.physicalCoach.contract.salary }}万/周</div>
        </div>
      </div>
    </div>
    
    <div v-else class="meetings-section">
      <div v-if="recentMeetings.length > 0" class="meetings-list">
        <div v-for="meeting in recentMeetings" :key="meeting.id" class="meeting-card">
          <div class="meeting-header">
            <span class="meeting-type">{{ meetingTypeNames[meeting.type] }}</span>
            <span class="meeting-date">{{ formatDate(meeting.date) }}</span>
          </div>
          <div class="meeting-topic">{{ meeting.topic }}</div>
          <div class="meeting-outcomes">
            <div v-for="(outcome, idx) in meeting.outcomes.slice(0, 3)" :key="idx" class="outcome-item">
              {{ outcome.description }}
            </div>
          </div>
          <div class="meeting-footer">
            <span class="morale-change" :class="{ positive: meeting.moraleChange >= 0 }">
              士气 {{ meeting.moraleChange >= 0 ? '+' : '' }}{{ meeting.moraleChange }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="empty-meetings">
        <p>暂无会议记录</p>
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
              <span class="detail-label">类型</span>
              <span class="detail-value">{{ COACH_TYPE_NAMES[selectedCoach.type] }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">风格</span>
              <span class="detail-value">{{ COACH_STYLE_NAMES[selectedCoach.style] }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">经验</span>
              <span class="detail-value">{{ selectedCoach.experience }} 年</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">声望</span>
              <span class="detail-value">{{ selectedCoach.reputation }}</span>
            </div>
          </div>
          
          <div class="abilities-section">
            <h4>能力属性</h4>
            <div v-for="(value, key) in selectedCoach.abilities" :key="key" class="ability-item">
              <span class="ability-name">{{ abilityNames[key] }}</span>
              <div class="ability-bar">
                <div class="ability-fill" :style="{ width: value + '%', backgroundColor: getAbilityColor(value) }"></div>
              </div>
              <span class="ability-value">{{ value }}</span>
            </div>
          </div>
          
          <div v-if="selectedCoach.specialties.length > 0" class="specialties-section">
            <h4>专精领域</h4>
            <div class="specialties-list">
              <div v-for="specialty in selectedCoach.specialties" :key="specialty.type + specialty.value" class="specialty-item">
                <span class="specialty-type">{{ specialty.type }}</span>
                <span class="specialty-value">{{ specialty.value }}</span>
                <span class="specialty-bonus">+{{ specialty.bonus }}%</span>
              </div>
            </div>
          </div>
          
          <div class="contract-section">
            <h4>合同信息</h4>
            <div class="detail-row">
              <span class="detail-label">周薪</span>
              <span class="detail-value">{{ selectedCoach.contract.salary }}万</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">违约金</span>
              <span class="detail-value">{{ selectedCoach.contract.buyoutClause }}万</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">合同到期</span>
              <span class="detail-value">{{ formatDate(selectedCoach.contract.endDate) }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="fire-btn" @click="handleFireCoach(selectedCoach)">
            解雇
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coach-page {
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
  font-size: 18px;
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

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.coach-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.coach-card:active {
  transform: scale(0.98);
}

.coach-card.head-coach {
  border-left: 4px solid #007bff;
  margin-bottom: 15px;
}

.coach-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  background: #007bff;
  color: white;
}

.coach-type-badge.small {
  font-size: 10px;
  padding: 2px 6px;
}

.coach-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.coach-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
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

.coach-style {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.coach-abilities {
  margin-bottom: 15px;
}

.ability-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.ability-name {
  width: 40px;
  font-size: 12px;
  color: #666;
}

.ability-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.ability-value {
  width: 30px;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.coach-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #666;
}

.salary {
  color: #28a745;
  font-weight: bold;
}

.coaches-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.coach-card.assistant {
  border-left: 4px solid #28a745;
}

.coach-card.analyst {
  border-left: 4px solid #17a2b8;
}

.coach-specialty {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.coach-salary {
  font-size: 12px;
  color: #28a745;
  margin-top: 8px;
}

.special-coaches {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.coach-card.psychological {
  border-left: 4px solid #6f42c1;
}

.coach-card.physical {
  border-left: 4px solid #fd7e14;
}

.coach-ability {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.empty-coach {
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 15px;
}

.empty-coach.head {
  border-left: 4px solid #dc3545;
}

.hire-btn {
  margin-top: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.meetings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meeting-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.meeting-type {
  font-size: 14px;
  font-weight: bold;
  color: #007bff;
}

.meeting-date {
  font-size: 12px;
  color: #999;
}

.meeting-topic {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}

.meeting-outcomes {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
}

.outcome-item {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  padding-left: 10px;
  border-left: 2px solid #007bff;
}

.meeting-footer {
  text-align: right;
}

.morale-change {
  font-size: 14px;
  font-weight: bold;
  color: #ff4d4f;
}

.morale-change.positive {
  color: #52c41a;
}

.empty-meetings {
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

.specialties-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.specialty-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 13px;
}

.specialty-type {
  color: #666;
}

.specialty-value {
  color: #333;
  font-weight: 600;
}

.specialty-bonus {
  color: #52c41a;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.fire-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: #ff4d4f;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>
