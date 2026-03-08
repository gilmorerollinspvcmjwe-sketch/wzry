<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useCoachStore } from '@/stores/coach';
import { holdMeeting } from '@/core/services/coachService';
import type { CoachMeeting, MeetingOutcome } from '@/types/coach';

const router = useRouter();
const clubStore = useClubStore();
const coachStore = useCoachStore();

const selectedType = ref<CoachMeeting['type']>('tactical');
const customTopic = ref('');
const isHolding = ref(false);
const lastMeetingResult = ref<{ success: boolean; meeting: CoachMeeting | null; message: string } | null>(null);
const showResult = ref(false);

const clubId = computed(() => clubStore.currentClub?.id || '');
const coachingStaff = computed(() => coachStore.getCoachingStaff(clubId.value));
const recentMeetings = computed(() => coachStore.getRecentMeetings(clubId.value, 10));

const meetingTypes: { value: CoachMeeting['type']; label: string; description: string; icon: string }[] = [
  { value: 'tactical', label: '战术会议', description: '讨论战术策略和比赛计划', icon: '🎯' },
  { value: 'player_review', label: '选手评估', description: '评估选手表现和状态', icon: '📊' },
  { value: 'draft_prep', label: 'BP准备', description: '准备BP策略和英雄选择', icon: '🎮' },
  { value: 'team_building', label: '团队建设', description: '增强团队凝聚力和士气', icon: '🤝' },
  { value: 'performance', label: '表现分析', description: '分析近期比赛表现', icon: '📈' },
];

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const getMeetingTypeLabel = (type: CoachMeeting['type']) => {
  return meetingTypes.find(t => t.value === type)?.label || type;
};

const selectType = (type: CoachMeeting['type']) => {
  selectedType.value = type;
  customTopic.value = '';
};

const handleHoldMeeting = async () => {
  if (!coachingStaff.value.headCoach) {
    alert('请先聘请主教练');
    return;
  }
  
  isHolding.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const topic = customTopic.value || meetingTypes.find(t => t.value === selectedType.value)?.label || '会议';
  const result = holdMeeting(clubId.value, selectedType.value, topic);
  
  lastMeetingResult.value = result;
  showResult.value = true;
  isHolding.value = false;
};

const closeResult = () => {
  showResult.value = false;
};

const goBack = () => {
  router.push('/coach');
};

const getOutcomeIcon = (type: MeetingOutcome['type']) => {
  switch (type) {
    case 'insight': return '💡';
    case 'issue': return '⚠️';
    case 'suggestion': return '💭';
    case 'decision': return '✅';
    default: return '📝';
  }
};

const getOutcomeColor = (type: MeetingOutcome['type']) => {
  switch (type) {
    case 'insight': return '#52c41a';
    case 'issue': return '#ff4d4f';
    case 'suggestion': return '#1890ff';
    case 'decision': return '#722ed1';
    default: return '#666';
  }
};
</script>

<template>
  <div class="meeting-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h2 class="page-title">教练会议</h2>
    </div>
    
    <div v-if="!coachingStaff.headCoach" class="no-coach-warning">
      <div class="warning-icon">⚠️</div>
      <p>请先聘请主教练才能召开会议</p>
      <button class="hire-btn" @click="router.push('/coach/hiring')">
        去聘请
      </button>
    </div>
    
    <template v-else>
      <div class="coach-info">
        <div class="coach-avatar">{{ coachingStaff.headCoach.name[0] }}</div>
        <div class="coach-details">
          <div class="coach-name">主教练：{{ coachingStaff.headCoach.name }}</div>
          <div class="coach-stats">
            战术 {{ coachingStaff.headCoach.abilities.tactics }} | 
            激励 {{ coachingStaff.headCoach.abilities.motivation }}
          </div>
        </div>
      </div>
      
      <div class="meeting-types">
        <h3 class="section-title">选择会议类型</h3>
        <div class="types-grid">
          <div 
            v-for="type in meetingTypes" 
            :key="type.value"
            class="type-card"
            :class="{ active: selectedType === type.value }"
            @click="selectType(type.value)"
          >
            <div class="type-icon">{{ type.icon }}</div>
            <div class="type-label">{{ type.label }}</div>
            <div class="type-desc">{{ type.description }}</div>
          </div>
        </div>
      </div>
      
      <div class="custom-topic">
        <h3 class="section-title">会议议题（可选）</h3>
        <input 
          v-model="customTopic"
          type="text"
          class="topic-input"
          placeholder="输入自定义议题..."
        />
      </div>
      
      <button 
        class="hold-meeting-btn"
        :disabled="isHolding"
        @click="handleHoldMeeting"
      >
        {{ isHolding ? '会议进行中...' : '召开会议' }}
      </button>
      
      <div class="recent-meetings">
        <h3 class="section-title">近期会议</h3>
        <div v-if="recentMeetings.length > 0" class="meetings-list">
          <div v-for="meeting in recentMeetings" :key="meeting.id" class="meeting-item">
            <div class="meeting-header">
              <span class="meeting-type-badge">{{ getMeetingTypeLabel(meeting.type) }}</span>
              <span class="meeting-date">{{ formatDate(meeting.date) }}</span>
            </div>
            <div class="meeting-topic">{{ meeting.topic }}</div>
            <div class="meeting-summary">
              <span class="attendees">{{ meeting.attendees.length }} 人参与</span>
              <span class="morale" :class="{ positive: meeting.moraleChange >= 0 }">
                士气 {{ meeting.moraleChange >= 0 ? '+' : '' }}{{ meeting.moraleChange }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-meetings">
          <p>暂无会议记录</p>
        </div>
      </div>
    </template>
    
    <div v-if="showResult && lastMeetingResult" class="modal-overlay" @click="closeResult">
      <div class="modal-content" @click.stop>
        <div class="modal-header" :class="{ success: lastMeetingResult.success }">
          <h3>{{ lastMeetingResult.success ? '会议完成' : '会议失败' }}</h3>
          <button class="close-btn" @click="closeResult">×</button>
        </div>
        
        <div v-if="lastMeetingResult.meeting" class="modal-body">
          <div class="result-summary">
            <div class="result-icon">{{ lastMeetingResult.success ? '🎉' : '😔' }}</div>
            <p class="result-message">{{ lastMeetingResult.message }}</p>
          </div>
          
          <div class="meeting-details">
            <div class="detail-item">
              <span class="detail-label">会议类型</span>
              <span class="detail-value">{{ getMeetingTypeLabel(lastMeetingResult.meeting.type) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">参与人数</span>
              <span class="detail-value">{{ lastMeetingResult.meeting.attendees.length }} 人</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">士气变化</span>
              <span class="detail-value" :class="{ positive: lastMeetingResult.meeting.moraleChange >= 0 }">
                {{ lastMeetingResult.meeting.moraleChange >= 0 ? '+' : '' }}{{ lastMeetingResult.meeting.moraleChange }}
              </span>
            </div>
          </div>
          
          <div class="outcomes-section">
            <h4>会议成果</h4>
            <div class="outcomes-list">
              <div 
                v-for="(outcome, idx) in lastMeetingResult.meeting.outcomes" 
                :key="idx"
                class="outcome-item"
              >
                <span class="outcome-icon">{{ getOutcomeIcon(outcome.type) }}</span>
                <div class="outcome-content">
                  <span class="outcome-type" :style="{ color: getOutcomeColor(outcome.type) }">
                    {{ outcome.type }}
                  </span>
                  <span class="outcome-desc">{{ outcome.description }}</span>
                </div>
                <div v-if="outcome.impact" class="outcome-impact">
                  <span class="impact-type">{{ outcome.impact.type }}</span>
                  <span class="impact-value" :class="{ positive: outcome.impact.value > 0 }">
                    {{ outcome.impact.value > 0 ? '+' : '' }}{{ outcome.impact.value.toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="confirm-btn" @click="closeResult">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meeting-page {
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

.no-coach-warning {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.no-coach-warning p {
  color: #666;
  margin-bottom: 20px;
}

.hire-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.coach-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 20px;
}

.coach-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.coach-details {
  flex: 1;
}

.coach-name {
  font-size: 16px;
  font-weight: bold;
}

.coach-stats {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.meeting-types {
  margin-bottom: 20px;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.type-card {
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.type-card.active {
  border-color: #007bff;
  background: #f0f7ff;
}

.type-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.type-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 11px;
  color: #999;
}

.custom-topic {
  margin-bottom: 20px;
}

.topic-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.topic-input:focus {
  outline: none;
  border-color: #007bff;
}

.hold-meeting-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.hold-meeting-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recent-meetings {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.meetings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meeting-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.meeting-type-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: #007bff;
  color: white;
}

.meeting-date {
  font-size: 11px;
  color: #999;
}

.meeting-topic {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.meeting-summary {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.morale {
  font-weight: 600;
  color: #ff4d4f;
}

.morale.positive {
  color: #52c41a;
}

.empty-meetings {
  text-align: center;
  padding: 30px;
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
  background: #f5f5f5;
}

.modal-header.success {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: rgba(0,0,0,0.1);
  border: none;
  font-size: 24px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: inherit;
}

.modal-body {
  padding: 20px;
}

.result-summary {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.result-message {
  font-size: 16px;
  color: #333;
}

.meeting-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.detail-item {
  text-align: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.detail-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.detail-value.positive {
  color: #52c41a;
}

.outcomes-section h4 {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
}

.outcomes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.outcome-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.outcome-icon {
  font-size: 20px;
}

.outcome-content {
  flex: 1;
}

.outcome-type {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.outcome-desc {
  font-size: 13px;
  color: #333;
}

.outcome-impact {
  text-align: right;
}

.impact-type {
  display: block;
  font-size: 10px;
  color: #999;
}

.impact-value {
  font-size: 14px;
  font-weight: bold;
  color: #ff4d4f;
}

.impact-value.positive {
  color: #52c41a;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.confirm-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: #007bff;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>
