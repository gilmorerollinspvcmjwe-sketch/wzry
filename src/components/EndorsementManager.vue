<template>
  <div class="endorsement-manager">
    <div class="section-header">
      <h3>代言合同</h3>
      <span class="contract-count">{{ endorsements.length }} 个活跃合同</span>
    </div>

    <div v-if="endorsements.length === 0" class="empty-state">
      <div class="empty-icon">🤝</div>
      <p>暂无代言合同</p>
      <p class="empty-hint">接受代言活动后将自动创建合同</p>
    </div>

    <div v-else class="endorsements-list">
      <div
        v-for="contract in endorsements"
        :key="contract.id"
        class="endorsement-card"
      >
        <div class="endorsement-header">
          <div class="brand-info">
            <span class="brand-logo">{{ contract.brandLogo || '🏢' }}</span>
            <div class="brand-details">
              <span class="brand-name">{{ contract.brandName }}</span>
              <span class="contract-type">{{ getTypeText(contract.type) }}</span>
            </div>
          </div>
          <span class="contract-status" :class="contract.status">
            {{ getStatusText(contract.status) }}
          </span>
        </div>

        <div class="contract-value">
          <div class="value-item">
            <span class="value-label">合同价值</span>
            <span class="value-number">{{ contract.value }}万</span>
          </div>
          <div class="value-item">
            <span class="value-label">已获得</span>
            <span class="value-number earned">{{ contract.totalEarned }}万</span>
          </div>
          <div class="value-item">
            <span class="value-label">剩余周期</span>
            <span class="value-number">{{ getRemainingWeeks(contract) }}周</span>
          </div>
        </div>

        <div class="contract-progress">
          <div class="progress-header">
            <span>合同进度</span>
            <span>{{ getProgressPercentage(contract) }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: getProgressPercentage(contract) + '%' }"
            ></div>
          </div>
        </div>

        <div class="contract-requirements">
          <h4>合同要求</h4>
          <div class="requirements-list">
            <div
              v-for="(req, index) in contract.requirements"
              :key="index"
              class="requirement-item"
              :class="{ completed: req.current >= req.target }"
            >
              <span class="req-text">{{ getRequirementText(req.type) }}</span>
              <span class="req-progress">{{ req.current }} / {{ req.target }}</span>
              <span class="req-status">
                {{ req.current >= req.target ? '✓' : '' }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="contract.bonuses && contract.bonuses.length > 0" class="contract-bonuses">
          <h4>奖金条件</h4>
          <div class="bonuses-list">
            <div
              v-for="(bonus, index) in contract.bonuses"
              :key="index"
              class="bonus-item"
              :class="{ achieved: bonus.achieved }"
            >
              <span class="bonus-condition">{{ bonus.condition }}</span>
              <span class="bonus-amount">+{{ bonus.amount }}万</span>
            </div>
          </div>
        </div>

        <div class="contract-dates">
          <div class="date-item">
            <span class="date-label">开始日期</span>
            <span class="date-value">{{ formatDate(contract.startDate) }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">结束日期</span>
            <span class="date-value">{{ formatDate(contract.endDate) }}</span>
          </div>
        </div>

        <div class="contract-actions">
          <button
            v-if="contract.status === 'active'"
            class="complete-btn"
            @click="handleComplete(contract.id)"
          >
            完成合同
          </button>
          <button
            v-if="contract.status === 'active'"
            class="terminate-btn"
            @click="handleTerminate(contract)"
          >
            终止合同
          </button>
        </div>
      </div>
    </div>

    <div v-if="showTerminateModal" class="modal-overlay" @click="showTerminateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>终止合同</h3>
          <button class="close-btn" @click="showTerminateModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="warning-text">
            <p>确定要终止与 <strong>{{ terminatingContract?.brandName }}</strong> 的代言合同吗？</p>
            <p class="penalty-info">
              需要支付违约金: <span class="penalty-amount">{{ calculatePenalty(terminatingContract) }}万</span>
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showTerminateModal = false">取消</button>
          <button class="confirm-btn" @click="confirmTerminate">确认终止</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { EndorsementContract } from '@/types/commercial';

interface Props {
  playerId: string;
  endorsements: EndorsementContract[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'complete', contractId: string): void;
  (e: 'terminate', contractId: string): void;
}>();

const showTerminateModal = ref(false);
const terminatingContract = ref<EndorsementContract | null>(null);

function getTypeText(type: string): string {
  const texts: Record<string, string> = {
    endorsement: '品牌代言',
    streaming: '直播合作',
    'fan-meet': '粉丝活动',
    photoshoot: '拍摄合作',
    interview: '媒体合作',
  };
  return texts[type] || type;
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    active: '进行中',
    expired: '已到期',
    terminated: '已终止',
  };
  return texts[status] || status;
}

function getRequirementText(type: string): string {
  const texts: Record<string, string> = {
    appearances: '出席活动',
    social_posts: '社交媒体发布',
    exclusivity: '独家合作',
  };
  return texts[type] || type;
}

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

function getRemainingWeeks(contract: EndorsementContract): number {
  const now = new Date();
  const endDate = new Date(contract.endDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, diffWeeks);
}

function getProgressPercentage(contract: EndorsementContract): number {
  const startDate = new Date(contract.startDate);
  const endDate = new Date(contract.endDate);
  const now = new Date();

  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();

  if (totalDuration <= 0) return 100;

  const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  return Math.round(percentage);
}

function calculatePenalty(contract: EndorsementContract | null): number {
  if (!contract) return 0;
  const remainingWeeks = getRemainingWeeks(contract);
  const weeklyValue = contract.value / contract.duration;
  return Math.round(remainingWeeks * weeklyValue * 2);
}

function handleComplete(contractId: string) {
  emit('complete', contractId);
}

function handleTerminate(contract: EndorsementContract) {
  terminatingContract.value = contract;
  showTerminateModal.value = true;
}

function confirmTerminate() {
  if (terminatingContract.value) {
    emit('terminate', terminatingContract.value.id);
    showTerminateModal.value = false;
    terminatingContract.value = null;
  }
}
</script>

<style scoped>
.endorsement-manager {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.contract-count {
  font-size: 13px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.empty-state p {
  margin: 0;
  color: #666;
}

.empty-hint {
  margin-top: 8px !important;
  font-size: 12px;
  color: #999;
}

.endorsements-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.endorsement-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.endorsement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  font-size: 32px;
}

.brand-details {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.contract-type {
  font-size: 12px;
  color: #999;
}

.contract-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.contract-status.active {
  background: #d4edda;
  color: #155724;
}

.contract-status.expired {
  background: #f8d7da;
  color: #721c24;
}

.contract-status.terminated {
  background: #e2e3e5;
  color: #383d41;
}

.contract-value {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.value-item {
  text-align: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.value-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.value-number {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.value-number.earned {
  color: #28a745;
}

.contract-progress {
  margin-bottom: 15px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #00d4ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.contract-requirements {
  margin-bottom: 15px;
}

.contract-requirements h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #333;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.requirement-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 12px;
}

.requirement-item.completed {
  background: #d4edda;
}

.req-text {
  color: #666;
}

.req-progress {
  color: #333;
  font-weight: 500;
}

.req-status {
  color: #28a745;
  font-weight: bold;
}

.contract-bonuses {
  margin-bottom: 15px;
}

.contract-bonuses h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #333;
}

.bonuses-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bonus-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fff3cd;
  border-radius: 6px;
  font-size: 12px;
}

.bonus-item.achieved {
  background: #d4edda;
}

.bonus-condition {
  color: #666;
}

.bonus-amount {
  color: #ff6b6b;
  font-weight: bold;
}

.bonus-item.achieved .bonus-amount {
  color: #28a745;
}

.contract-dates {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.date-item {
  display: flex;
  flex-direction: column;
}

.date-label {
  font-size: 11px;
  color: #999;
}

.date-value {
  font-size: 13px;
  color: #333;
}

.contract-actions {
  display: flex;
  gap: 10px;
}

.complete-btn,
.terminate-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.complete-btn {
  background: #28a745;
  color: white;
}

.terminate-btn {
  background: #f5f5f5;
  color: #dc3545;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: #f5f5f5;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.modal-body {
  padding: 20px;
}

.warning-text {
  text-align: center;
}

.warning-text p {
  margin: 0 0 10px 0;
  color: #666;
}

.penalty-info {
  font-size: 14px;
}

.penalty-amount {
  color: #dc3545;
  font-weight: bold;
  font-size: 18px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #dc3545;
  color: white;
}
</style>
