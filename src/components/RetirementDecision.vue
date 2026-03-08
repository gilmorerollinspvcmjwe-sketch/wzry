<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRetirementStore } from '@/stores/retirement';
import { usePlayerStore } from '@/stores/player';
import { useClubStore } from '@/stores/club';
import type { RetirementType, RetirementReason, RetirementCeremony, PostCareerPath } from '@/types/retirement';
import {
  RETIREMENT_TYPE_NAMES,
  RETIREMENT_REASON_NAMES,
  POST_CAREER_PATH_NAMES,
} from '@/types/retirement';

const props = defineProps<{
  playerId: string;
}>();

const emit = defineEmits<{
  close: [];
  retired: [playerId: string];
}>();

const retirementStore = useRetirementStore();
const playerStore = usePlayerStore();
const clubStore = useClubStore();

const currentStep = ref(1);
const totalSteps = 4;

const selectedType = ref<RetirementType>('voluntary');
const selectedReason = ref<RetirementReason>({
  primary: 'personal',
  details: '',
});
const selectedCeremony = ref<RetirementCeremony>({
  farewellMatch: false,
  fanEvent: false,
  hallOfFame: false,
  retiredNumber: false,
});
const selectedPostCareer = ref<PostCareerPath>('retired');
const selectedSuccessorId = ref<string>('');

const isProcessing = ref(false);
const retirementResult = ref<any>(null);

const player = computed(() => playerStore.getPlayer(props.playerId));

const eligibility = computed(() => 
  retirementStore.checkPlayerRetirementEligibility(props.playerId)
);

const ceremonyOptions = computed(() => 
  retirementStore.getPlayerCeremonyOptions(props.playerId)
);

const availableSuccessors = computed(() => {
  return playerStore.allPlayers.filter(p => 
    p.id !== props.playerId && p.position === player.value?.position
  );
});

const ceremonyCost = computed(() => {
  let cost = 0;
  if (selectedCeremony.value.farewellMatch) cost += 50;
  if (selectedCeremony.value.fanEvent) cost += 30;
  return cost;
});

const fanImpact = computed(() => {
  let impact = 0;
  if (selectedCeremony.value.farewellMatch) impact += 15;
  if (selectedCeremony.value.fanEvent) impact += 10;
  if (selectedCeremony.value.hallOfFame) impact += 25;
  if (selectedCeremony.value.retiredNumber) impact += 20;
  return impact;
});

const clubFunds = computed(() => {
  return clubStore.club?.funds || 0;
});

const canAffordCeremony = computed(() => {
  return clubFunds.value >= ceremonyCost.value;
});

const typeOptions: { value: RetirementType; label: string; description: string }[] = [
  { value: 'voluntary', label: '自愿退役', description: '选手主动选择退役' },
  { value: 'advised', label: '建议退役', description: '俱乐部建议选手退役' },
  { value: 'forced', label: '强制退役', description: '俱乐部强制选手退役' },
];

const reasonOptions: { value: RetirementReason['primary']; label: string }[] = [
  { value: 'age', label: '年龄原因' },
  { value: 'injury', label: '伤病困扰' },
  { value: 'performance', label: '状态下滑' },
  { value: 'personal', label: '个人原因' },
];

const postCareerOptions: { value: PostCareerPath; label: string; description: string }[] = [
  { value: 'coach', label: '主教练', description: '转型成为战队主教练' },
  { value: 'analyst', label: '数据分析师', description: '担任数据分析师' },
  { value: 'streamer', label: '主播/解说', description: '成为主播或解说' },
  { value: 'manager', label: '战队经理', description: '转型成为战队经理' },
  { value: 'youth_coach', label: '青训教练', description: '培养下一代选手' },
  { value: 'retired', label: '完全退役', description: '离开电竞圈' },
];

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const processRetirement = async () => {
  isProcessing.value = true;

  try {
    const retirement = retirementStore.initiatePlayerRetirement(
      props.playerId,
      selectedType.value,
      selectedReason.value
    );

    retirementStore.planPlayerCeremony(props.playerId, selectedCeremony.value);

    retirementStore.selectPlayerPostCareer(props.playerId, selectedPostCareer.value);

    if (selectedSuccessorId.value) {
      retirementStore.transferPlayerLegacy(props.playerId, selectedSuccessorId.value);
    }

    if (selectedCeremony.value.hallOfFame) {
      retirementStore.addPlayerToHallOfFame(props.playerId);
    }

    const impact = retirementStore.calculatePlayerRetirementImpact(props.playerId);

    retirementResult.value = {
      retirement,
      impact,
      ceremonyCost: ceremonyCost.value,
      fanImpact: fanImpact.value,
    };

    currentStep.value = totalSteps + 1;

    emit('retired', props.playerId);
  } catch (error) {
    console.error('Retirement processing failed:', error);
  } finally {
    isProcessing.value = false;
  }
};

const close = () => {
  emit('close');
};

onMounted(() => {
  if (eligibility.value.suggestedType) {
    selectedType.value = eligibility.value.suggestedType;
  }
});
</script>

<template>
  <div class="retirement-decision">
    <div class="header">
      <h2>退役决策</h2>
      <div v-if="player" class="player-info">
        <span class="player-name">{{ player.name }}</span>
        <span class="player-age">{{ player.age }}岁</span>
        <span class="player-position">{{ player.position }}</span>
      </div>
    </div>

    <div v-if="currentStep <= totalSteps" class="progress">
      <div 
        v-for="step in totalSteps" 
        :key="step"
        class="progress-step"
        :class="{ active: step === currentStep, completed: step < currentStep }"
      >
        {{ step }}
      </div>
    </div>

    <div class="content">
      <div v-if="currentStep === 1" class="step-content">
        <h3>退役资格评估</h3>
        
        <div class="eligibility-card">
          <div class="eligibility-status" :class="{ eligible: eligibility.eligible }">
            {{ eligibility.eligible ? '符合退役条件' : '暂不符合退役条件' }}
          </div>
          
          <div v-if="eligibility.reasons.length > 0" class="reasons">
            <h4>退役原因</h4>
            <ul>
              <li v-for="(reason, index) in eligibility.reasons" :key="index">
                {{ reason }}
              </li>
            </ul>
          </div>

          <div v-if="eligibility.recommendations.length > 0" class="recommendations">
            <h4>建议</h4>
            <ul>
              <li v-for="(rec, index) in eligibility.recommendations" :key="index">
                {{ rec }}
              </li>
            </ul>
          </div>
        </div>

        <div class="type-selection">
          <h4>选择退役类型</h4>
          <div class="type-options">
            <label 
              v-for="option in typeOptions" 
              :key="option.value"
              class="type-option"
              :class="{ selected: selectedType === option.value }"
            >
              <input type="radio" v-model="selectedType" :value="option.value" />
              <div class="option-content">
                <span class="option-label">{{ option.label }}</span>
                <span class="option-desc">{{ option.description }}</span>
              </div>
            </label>
          </div>
        </div>

        <div class="reason-selection">
          <h4>退役原因</h4>
          <select v-model="selectedReason.primary">
            <option v-for="option in reasonOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <textarea 
            v-model="selectedReason.details" 
            placeholder="请输入详细原因..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <div v-if="currentStep === 2" class="step-content">
        <h3>退役仪式规划</h3>
        
        <div class="ceremony-options">
          <label class="ceremony-option">
            <input type="checkbox" v-model="selectedCeremony.farewellMatch" />
            <div class="option-info">
              <span class="option-title">告别赛</span>
              <span class="option-cost">费用: 50万</span>
              <span class="option-impact">粉丝影响: +15</span>
            </div>
          </label>

          <label class="ceremony-option">
            <input type="checkbox" v-model="selectedCeremony.fanEvent" />
            <div class="option-info">
              <span class="option-title">粉丝见面会</span>
              <span class="option-cost">费用: 30万</span>
              <span class="option-impact">粉丝影响: +10</span>
            </div>
          </label>

          <label class="ceremony-option" :class="{ disabled: !ceremonyOptions.hallOfFame.eligible }">
            <input 
              type="checkbox" 
              v-model="selectedCeremony.hallOfFame"
              :disabled="!ceremonyOptions.hallOfFame.eligible"
            />
            <div class="option-info">
              <span class="option-title">入选名人堂</span>
              <span v-if="!ceremonyOptions.hallOfFame.eligible" class="option-locked">
                未满足条件
              </span>
              <span v-else class="option-impact">粉丝影响: +25</span>
            </div>
          </label>

          <label class="ceremony-option" :class="{ disabled: !ceremonyOptions.retiredNumber.eligible }">
            <input 
              type="checkbox" 
              v-model="selectedCeremony.retiredNumber"
              :disabled="!ceremonyOptions.retiredNumber.eligible"
            />
            <div class="option-info">
              <span class="option-title">退役号码</span>
              <span v-if="!ceremonyOptions.retiredNumber.eligible" class="option-locked">
                未满足条件
              </span>
              <span v-else class="option-impact">粉丝影响: +20</span>
            </div>
          </label>
        </div>

        <div class="ceremony-summary">
          <div class="summary-item">
            <span>总费用:</span>
            <span :class="{ warning: !canAffordCeremony }">{{ ceremonyCost }}万</span>
          </div>
          <div class="summary-item">
            <span>俱乐部资金:</span>
            <span>{{ clubFunds }}万</span>
          </div>
          <div class="summary-item">
            <span>粉丝影响:</span>
            <span>+{{ fanImpact }}</span>
          </div>
        </div>
      </div>

      <div v-if="currentStep === 3" class="step-content">
        <h3>退役后发展</h3>
        
        <div class="post-career-options">
          <label 
            v-for="option in postCareerOptions" 
            :key="option.value"
            class="post-career-option"
            :class="{ selected: selectedPostCareer === option.value }"
          >
            <input type="radio" v-model="selectedPostCareer" :value="option.value" />
            <div class="option-content">
              <span class="option-label">{{ option.label }}</span>
              <span class="option-desc">{{ option.description }}</span>
            </div>
          </label>
        </div>
      </div>

      <div v-if="currentStep === 4" class="step-content">
        <h3>传承安排</h3>
        
        <div class="successor-selection">
          <h4>选择传承人（可选）</h4>
          <p class="hint">选择同位置的年轻选手作为传承人，可以传递经验和属性加成</p>
          
          <select v-model="selectedSuccessorId">
            <option value="">不选择传承人</option>
            <option 
              v-for="successor in availableSuccessors" 
              :key="successor.id" 
              :value="successor.id"
            >
              {{ successor.name }} ({{ successor.position }}) - {{ successor.age }}岁
            </option>
          </select>
        </div>

        <div class="legacy-preview" v-if="selectedSuccessorId">
          <h4>传承预览</h4>
          <div class="legacy-items">
            <div class="legacy-item">
              <span>属性传承加成</span>
              <span>根据职业生涯表现计算</span>
            </div>
            <div class="legacy-item">
              <span>英雄熟练度传承</span>
              <span>传递常用英雄经验</span>
            </div>
            <div class="legacy-item">
              <span>队长袖标传承</span>
              <span v-if="player?.careerStats?.championships >= 1">可传承</span>
              <span v-else>不可传承</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentStep === totalSteps + 1" class="step-content result">
        <h3>退役完成</h3>
        
        <div v-if="retirementResult" class="result-card">
          <div class="result-header">
            <span class="player-name">{{ retirementResult.retirement.playerName }}</span>
            <span class="retirement-type">{{ RETIREMENT_TYPE_NAMES[retirementResult.retirement.type] }}</span>
          </div>

          <div class="result-stats">
            <div class="stat-item">
              <span class="stat-label">职业生涯</span>
              <span class="stat-value">{{ retirementResult.retirement.stats.yearsActive }}年</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">出场次数</span>
              <span class="stat-value">{{ retirementResult.retirement.stats.totalMatches }}场</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">胜率</span>
              <span class="stat-value">{{ retirementResult.retirement.stats.winRate }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">冠军</span>
              <span class="stat-value">{{ retirementResult.retirement.stats.championships }}次</span>
            </div>
          </div>

          <div class="result-impact">
            <h4>影响</h4>
            <div class="impact-item">
              <span>团队士气</span>
              <span :class="{ positive: retirementResult.impact.teamMorale > 0, negative: retirementResult.impact.teamMorale < 0 }">
                {{ retirementResult.impact.teamMorale > 0 ? '+' : '' }}{{ retirementResult.impact.teamMorale }}
              </span>
            </div>
            <div class="impact-item">
              <span>粉丝情绪</span>
              <span :class="{ positive: retirementResult.impact.fanSentiment > 0, negative: retirementResult.impact.fanSentiment < 0 }">
                {{ retirementResult.impact.fanSentiment > 0 ? '+' : '' }}{{ retirementResult.impact.fanSentiment }}
              </span>
            </div>
            <div class="impact-item">
              <span>俱乐部声誉</span>
              <span :class="{ positive: retirementResult.impact.reputation > 0, negative: retirementResult.impact.reputation < 0 }">
                {{ retirementResult.impact.reputation > 0 ? '+' : '' }}{{ retirementResult.impact.reputation }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button 
        v-if="currentStep > 1 && currentStep <= totalSteps"
        class="btn btn-secondary" 
        @click="prevStep"
      >
        上一步
      </button>
      
      <button 
        v-if="currentStep < totalSteps"
        class="btn btn-primary" 
        @click="nextStep"
      >
        下一步
      </button>

      <button 
        v-if="currentStep === totalSteps"
        class="btn btn-danger" 
        :disabled="isProcessing || !canAffordCeremony"
        @click="processRetirement"
      >
        {{ isProcessing ? '处理中...' : '确认退役' }}
      </button>

      <button 
        v-if="currentStep === totalSteps + 1"
        class="btn btn-primary" 
        @click="close"
      >
        完成
      </button>

      <button 
        v-if="currentStep <= totalSteps"
        class="btn btn-text" 
        @click="close"
      >
        取消
      </button>
    </div>
  </div>
</template>

<style scoped>
.retirement-decision {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  max-width: 600px;
  margin: 0 auto;
}

.header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.player-info {
  display: flex;
  gap: 15px;
  font-size: 14px;
}

.player-name {
  font-weight: 600;
}

.progress {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: #f5f5f5;
}

.progress-step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s;
}

.progress-step.active {
  background: #667eea;
  color: white;
}

.progress-step.completed {
  background: #52c41a;
  color: white;
}

.content {
  padding: 20px;
  min-height: 300px;
}

.step-content h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.eligibility-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.eligibility-status {
  font-size: 16px;
  font-weight: 600;
  color: #ff4d4f;
  margin-bottom: 12px;
}

.eligibility-status.eligible {
  color: #52c41a;
}

.reasons h4,
.recommendations h4 {
  font-size: 14px;
  color: #666;
  margin: 12px 0 8px 0;
}

.reasons ul,
.recommendations ul {
  margin: 0;
  padding-left: 20px;
}

.reasons li,
.recommendations li {
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
}

.type-selection,
.reason-selection {
  margin-bottom: 20px;
}

.type-selection h4,
.reason-selection h4 {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.type-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.type-option,
.post-career-option {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-option:hover,
.post-career-option:hover {
  border-color: #667eea;
}

.type-option.selected,
.post-career-option.selected {
  border-color: #667eea;
  background: #f0f2ff;
}

.type-option input,
.post-career-option input {
  margin-right: 12px;
  margin-top: 2px;
}

.option-content {
  display: flex;
  flex-direction: column;
}

.option-label {
  font-weight: 600;
  color: #333;
}

.option-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.reason-selection select,
.successor-selection select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
}

.reason-selection textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
}

.ceremony-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.ceremony-option {
  display: flex;
  align-items: center;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.ceremony-option:hover:not(.disabled) {
  border-color: #667eea;
}

.ceremony-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ceremony-option input {
  margin-right: 12px;
}

.option-info {
  display: flex;
  flex-direction: column;
}

.option-title {
  font-weight: 600;
  color: #333;
}

.option-cost,
.option-impact {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.option-locked {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 4px;
}

.ceremony-summary {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.summary-item span:last-child {
  font-weight: 600;
}

.summary-item .warning {
  color: #ff4d4f;
}

.post-career-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.successor-selection {
  margin-bottom: 20px;
}

.successor-selection h4 {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.hint {
  font-size: 12px;
  color: #999;
  margin: 0 0 12px 0;
}

.legacy-preview {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.legacy-preview h4 {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.legacy-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legacy-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.result-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.result-header .player-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.retirement-type {
  padding: 4px 12px;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 12px;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: white;
  border-radius: 6px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-top: 4px;
}

.result-impact h4 {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.impact-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
}

.impact-item:last-child {
  border-bottom: none;
}

.impact-item .positive {
  color: #52c41a;
  font-weight: 600;
}

.impact-item .negative {
  color: #ff4d4f;
  font-weight: 600;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #ff4d4f;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #ff7875;
}

.btn-text {
  background: transparent;
  color: #999;
}

.btn-text:hover {
  color: #666;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
