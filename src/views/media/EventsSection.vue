<template>
  <div class="events-section">
    <!-- 标签页切换 -->
    <div class="tabs">
      <div 
        class="tab" 
        :class="{ active: activeTab === 'active' }"
        @click="activeTab = 'active'"
      >
        进行中
        <span v-if="eventStore.pendingEventCount > 0" class="tab-badge">{{ eventStore.pendingEventCount }}</span>
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        历史记录
      </div>
    </div>

    <!-- 进行中的事件 -->
    <div v-if="activeTab === 'active'" class="tab-content">
      <div v-if="eventStore.activeEvents.length === 0" class="empty-state">
        <span class="icon">📭</span>
        <p>暂无进行中的事件</p>
        <span class="sub-text">日常运营中可能会触发各种事件</span>
      </div>

      <div v-else class="events-list">
        <div 
          v-for="event in eventStore.activeEvents" 
          :key="event.id"
          class="event-card"
          :class="`rarity-${event.rarity}`"
        >
          <div class="event-header">
            <span class="event-category">{{ getCategoryName(event.category) }}</span>
            <span class="event-rarity" :class="event.rarity">{{ getRarityName(event.rarity) }}</span>
          </div>
          
          <h3 class="event-title">{{ event.title }}</h3>
          <p class="event-description">{{ event.description }}</p>
          
          <div class="event-meta">
            <span class="trigger-time">{{ formatTime(event.triggeredAt) }}</span>
            <span v-if="event.duration" class="duration">⏱️ 剩余 {{ event.duration }} 天</span>
          </div>

          <!-- 选项列表 -->
          <div class="event-options">
            <button
              v-for="option in event.options"
              :key="option.id"
              class="option-btn"
              :class="{ selected: selectedOption === option.id }"
              @click="selectOption(event.id, option.id)"
              :disabled="isProcessing"
            >
              <span class="option-text">{{ option.text }}</span>
              <div class="option-preview">
                <span v-if="option.consequences.funds" class="consequence" :class="{ positive: option.consequences.funds > 0, negative: option.consequences.funds < 0 }">
                  💰 {{ option.consequences.funds > 0 ? '+' : '' }}{{ option.consequences.funds }}
                </span>
                <span v-if="option.consequences.reputation" class="consequence" :class="{ positive: option.consequences.reputation > 0, negative: option.consequences.reputation < 0 }">
                  📊 {{ option.consequences.reputation > 0 ? '+' : '' }}{{ option.consequences.reputation }}
                </span>
                <span v-if="option.consequences.fans" class="consequence" :class="{ positive: option.consequences.fans > 0, negative: option.consequences.fans < 0 }">
                  👥 {{ option.consequences.fans > 0 ? '+' : '' }}{{ option.consequences.fans }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录 -->
    <div v-else class="tab-content">
      <div v-if="eventStore.eventHistory.length === 0" class="empty-state">
        <span class="icon">📜</span>
        <p>暂无事件历史</p>
        <span class="sub-text">处理事件后会在这里显示记录</span>
      </div>

      <div v-else class="history-list">
        <div 
          v-for="history in eventStore.eventHistory" 
          :key="`${history.eventId}-${history.triggeredAt}`"
          class="history-card"
        >
          <div class="history-header">
            <span class="history-category">{{ getCategoryName(history.category) }}</span>
            <span class="history-time">{{ formatTime(history.triggeredAt) }}</span>
          </div>
          
          <h4 class="history-title">{{ history.title }}</h4>
          <p class="history-option">
            <span class="label">选择：</span>
            <span class="value">{{ history.selectedOption }}</span>
          </p>
          
          <!-- 后果展示 -->
          <div v-if="history.consequences" class="consequences">
            <span v-if="history.consequences.funds" class="consequence-tag" :class="{ positive: history.consequences.funds > 0, negative: history.consequences.funds < 0 }">
              资金 {{ history.consequences.funds > 0 ? '+' : '' }}{{ history.consequences.funds }}
            </span>
            <span v-if="history.consequences.reputation" class="consequence-tag" :class="{ positive: history.consequences.reputation > 0, negative: history.consequences.reputation < 0 }">
              声望 {{ history.consequences.reputation > 0 ? '+' : '' }}{{ history.consequences.reputation }}
            </span>
            <span v-if="history.consequences.fans" class="consequence-tag" :class="{ positive: history.consequences.fans > 0, negative: history.consequences.fans < 0 }">
              粉丝 {{ history.consequences.fans > 0 ? '+' : '' }}{{ history.consequences.fans }}
            </span>
            <span v-if="history.consequences.morale" class="consequence-tag" :class="{ positive: history.consequences.morale > 0, negative: history.consequences.morale < 0 }">
              士气 {{ history.consequences.morale > 0 ? '+' : '' }}{{ history.consequences.morale }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 结果弹窗 -->
    <div v-if="showResultModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>事件处理结果</h3>
        <div class="result-consequences">
          <div v-for="(value, key) in lastConsequences" :key="key" class="result-item" :class="{ positive: value > 0, negative: value < 0 }">
            <span class="result-label">{{ getConsequenceLabel(key) }}</span>
            <span class="result-value">{{ value > 0 ? '+' : '' }}{{ value }}</span>
          </div>
        </div>
        <button class="confirm-btn" @click="closeModal">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEventStore } from '@/stores/event';
import { EventCategory, EventRarity } from '@/types/events';
import type { EventConsequences } from '@/types/events';

const eventStore = useEventStore();

// 状态
const activeTab = ref<'active' | 'history'>('active');
const selectedOption = ref<string | null>(null);
const isProcessing = ref(false);
const showResultModal = ref(false);
const lastConsequences = ref<Partial<EventConsequences>>({});

// 获取分类名称
const getCategoryName = (category: EventCategory): string => {
  const names: Record<EventCategory, string> = {
    [EventCategory.MANAGEMENT]: '管理',
    [EventCategory.COMPETITION]: '比赛',
    [EventCategory.TRANSFER]: '转会',
    [EventCategory.MEDIA]: '媒体',
    [EventCategory.FINANCE]: '财务',
    [EventCategory.CRISIS]: '危机',
  };
  return names[category] || category;
};

// 获取稀有度名称
const getRarityName = (rarity: EventRarity): string => {
  const names: Record<EventRarity, string> = {
    [EventRarity.COMMON]: '普通',
    [EventRarity.UNCOMMON]: '罕见',
    [EventRarity.RARE]: '稀有',
    [EventRarity.EPIC]: '史诗',
  };
  return names[rarity] || rarity;
};

// 格式化时间
const formatTime = (date: Date | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// 选择选项
const selectOption = async (eventId: string, optionId: string) => {
  if (isProcessing.value) return;
  
  selectedOption.value = optionId;
  isProcessing.value = true;
  
  const consequences = eventStore.selectEventOption(eventId, optionId);
  
  if (consequences) {
    lastConsequences.value = consequences;
    showResultModal.value = true;
  }
  
  isProcessing.value = false;
  selectedOption.value = null;
};

// 获取后果标签
const getConsequenceLabel = (key: string): string => {
  const labels: Record<string, string> = {
    funds: '资金',
    reputation: '声望',
    fans: '粉丝',
    morale: '士气',
  };
  return labels[key] || key;
};

// 关闭弹窗
const closeModal = () => {
  showResultModal.value = false;
  lastConsequences.value = {};
};
</script>

<style scoped lang="scss">
.events-section {
  padding: 10px 0;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  background: white;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.tab {
  flex: 1;
  padding: 10px;
  text-align: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  color: #666;
  position: relative;
}

.tab.active {
  background: #3b82f6;
  color: white;
  font-weight: bold;
}

.tab-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff4757;
  color: white;
  padding: 1px 4px;
  border-radius: 6px;
  font-size: 9px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.empty-state .icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  color: #333;
  font-size: 15px;
  margin-bottom: 6px;
}

.empty-state .sub-text {
  color: #999;
  font-size: 13px;
}

/* 事件卡片 */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  border-left: 3px solid #ddd;
}

.event-card.rarity-common { border-left-color: #95a5a6; }
.event-card.rarity-uncommon { border-left-color: #3498db; }
.event-card.rarity-rare { border-left-color: #9b59b6; }
.event-card.rarity-epic { border-left-color: #f39c12; }

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.event-category {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 12px;
}

.event-rarity {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.event-rarity.common { background: #ecf0f1; color: #7f8c8d; }
.event-rarity.uncommon { background: #ebf5fb; color: #2980b9; }
.event-rarity.rare { background: #f5eef8; color: #8e44ad; }
.event-rarity.epic { background: #fef5e7; color: #d68910; }

.event-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.event-description {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.event-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 11px;
  color: #999;
}

/* 选项 */
.event-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-btn {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.option-btn:active:not(:disabled) {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.option-btn.selected {
  border-color: #3b82f6;
  background: #e3f2fd;
}

.option-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.option-text {
  font-size: 13px;
  color: #333;
  margin-bottom: 6px;
}

.option-preview {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.consequence {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #f0f0f0;
}

.consequence.positive {
  background: #d4edda;
  color: #155724;
}

.consequence.negative {
  background: #f8d7da;
  color: #721c24;
}

/* 历史记录 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-category {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
}

.history-time {
  font-size: 11px;
  color: #999;
}

.history-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 6px 0;
}

.history-option {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.history-option .label {
  color: #999;
}

.history-option .value {
  color: #333;
  font-weight: 500;
}

.consequences {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.consequence-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  background: #f0f0f0;
  color: #666;
}

.consequence-tag.positive {
  background: #d4edda;
  color: #155724;
}

.consequence-tag.negative {
  background: #f8d7da;
  color: #721c24;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 25px;
  width: 100%;
  max-width: 300px;
  text-align: center;
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.result-consequences {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  background: #f8f9fa;
}

.result-item.positive {
  background: #d4edda;
}

.result-item.negative {
  background: #f8d7da;
}

.result-label {
  font-size: 13px;
  color: #666;
}

.result-value {
  font-size: 14px;
  font-weight: bold;
}

.result-item.positive .result-value {
  color: #155724;
}

.result-item.negative .result-value {
  color: #721c24;
}

.confirm-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}
</style>
