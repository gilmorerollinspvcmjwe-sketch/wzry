<template>
  <div class="interviews-section">
    <!-- 待处理采访 -->
    <div v-if="hasPendingInterviews" class="pending-interviews">
      <h3 class="section-title">待处理采访 ({{ pendingInterviews.length }})</h3>
      
      <div v-for="interview in pendingInterviews" :key="interview.id" class="interview-card">
        <div class="interview-header">
          <div class="media-info">
            <span class="media-name">{{ interview.media.name }}</span>
            <span class="media-type-tag" :class="interview.media.type">
              {{ getMediaTypeName(interview.media.type) }}
            </span>
          </div>
          <span class="interview-type-tag">{{ getInterviewTypeText(interview.type) }}</span>
        </div>

        <div class="interview-questions">
          <div v-for="question in interview.questions" :key="question.id" class="question-block">
            <p class="question-text">{{ question.question }}</p>
            
            <div class="question-options">
              <div
                v-for="option in question.options"
                :key="option.id"
                class="option-item"
                :class="{ selected: selectedAnswers[question.id] === option.id }"
                @click="selectAnswer(question.id, option.id)"
              >
                <div class="option-text">{{ option.text }}</div>
                <div class="option-preview">{{ getOptionPreview(option) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="interview-actions">
          <button class="btn btn-submit" @click="submitAnswers(interview.id)" :disabled="!canSubmit">
            提交回答
          </button>
          <button class="btn btn-decline" @click="declineInterview(interview.id)">
            拒绝采访
          </button>
        </div>
      </div>
    </div>

    <!-- 无待处理采访 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📰</div>
      <p class="empty-text">暂无待处理采访</p>
    </div>

    <!-- 已完成采访历史 -->
    <div v-if="completedInterviews.length > 0" class="completed-interviews">
      <h3 class="section-title">采访历史</h3>
      
      <div v-for="interview in completedInterviews.slice(0, 5)" :key="interview.id" class="history-card">
        <div class="history-header">
          <span class="history-media">{{ interview.media.name }}</span>
          <span class="history-date">{{ formatDate(interview.createdAt) }}</span>
        </div>
        <div class="history-status">
          <span :class="interview.status">
            {{ interview.status === 'completed' ? '已完成' : '已过期' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMediaStore } from '@/stores/media';
import type { Interview, InterviewOption, InterviewTone } from '@/types/media';

const mediaStore = useMediaStore();

const selectedAnswers = ref<Record<string, string>>({});

const hasPendingInterviews = computed(() => mediaStore.pendingInterviews.length > 0);
const pendingInterviews = computed(() => mediaStore.pendingInterviews);
const completedInterviews = computed(() => mediaStore.completedInterviews);

const canSubmit = computed(() => {
  return Object.keys(selectedAnswers.value).length > 0;
});

function getMediaTypeName(type: string): string {
  const types: Record<string, string> = {
    esports_media: '电竞媒体',
    mainstream_media: '主流媒体',
    fan_community: '粉丝社区',
  };
  return types[type] || type;
}

function getInterviewTypeText(type: string): string {
  const types: Record<string, string> = {
    post_match: '赛后采访',
    pre_playoff: '季后赛采访',
    transfer: '转会采访',
    scandal: '丑闻采访',
    random: '随机采访',
  };
  return types[type] || '采访';
}

function getOptionPreview(option: InterviewOption): string {
  const parts: string[] = [];
  
  if (option.consequences.fanChange) {
    parts.push(`粉丝${option.consequences.fanChange > 0 ? '+' : ''}${option.consequences.fanChange}`);
  }
  if (option.consequences.reputationChange) {
    parts.push(`声望${option.consequences.reputationChange > 0 ? '+' : ''}${option.consequences.reputationChange}`);
  }
  if (option.consequences.playerMoraleChange) {
    parts.push(`士气${option.consequences.playerMoraleChange > 0 ? '+' : ''}${option.consequences.playerMoraleChange}`);
  }
  
  return parts.join(', ') || '无影响';
}

function selectAnswer(questionId: string, optionId: string): void {
  selectedAnswers.value[questionId] = optionId;
}

function submitAnswers(interviewId: string): void {
  const answers = Object.keys(selectedAnswers.value).map(questionId => ({
    questionId,
    optionId: selectedAnswers.value[questionId],
  }));

  mediaStore.answerInterview(interviewId, answers);
  selectedAnswers.value = {};
}

function declineInterview(interviewId: string): void {
  if (confirm('确定要拒绝这次采访吗？')) {
    mediaStore.declineInterview(interviewId);
    selectedAnswers.value = {};
  }
}

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

onMounted(() => {
  mediaStore.loadInterviews();
});
</script>

<style scoped lang="scss">
.interviews-section {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.interview-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.interview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.media-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.media-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.media-type-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 500;
  
  &.esports_media {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  &.mainstream_media {
    background: #f3e5f5;
    color: #7b1fa2;
  }
  
  &.fan_community {
    background: #fff3e0;
    color: #f57c00;
  }
}

.interview-type-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  background: #f5f5f5;
  color: #666;
  font-weight: 500;
}

.question-block {
  margin-bottom: 20px;
}

.question-text {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  padding: 12px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background: #f0f7ff;
  }
  
  &.selected {
    border-color: #3b82f6;
    background: #e6f4ff;
  }
}

.option-text {
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 6px;
  line-height: 1.4;
}

.option-preview {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
}

.interview-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.btn-submit {
    background: #3b82f6;
    color: #fff;
    
    &:hover:not(:disabled) {
      background: #2563eb;
    }
  }
  
  &.btn-decline {
    background: #f5f5f5;
    color: #666;
    
    &:hover {
      background: #e8e8e8;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 15px;
  color: #999;
  margin: 0;
}

.completed-interviews {
  margin-top: 32px;
}

.history-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 3px solid #3b82f6;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-media {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.history-date {
  font-size: 12px;
  color: #999;
}

.history-status span {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  
  &.completed {
    background: #e8f5e9;
    color: #2e7d32;
  }
  
  &.expired {
    background: #ffebee;
    color: #c62828;
  }
}
</style>
