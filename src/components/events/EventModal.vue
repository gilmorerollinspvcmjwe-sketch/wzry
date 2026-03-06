<template>
  <div v-if="visible" class="event-modal-overlay" @click.self="closeModal">
    <div class="event-modal" :class="getEventClass">
      <!-- 事件头部 -->
      <div class="event-header" v-if="event">
        <div class="event-icon">{{ eventIcon }}</div>
        <div class="event-title-group">
          <h2 class="event-title">{{ event.title }}</h2>
          <div class="event-meta">
            <span class="event-category-tag" :class="event.category">
              {{ categoryText }}
            </span>
            <span class="event-rarity-tag" :class="event.rarity">
              {{ rarityText }}
            </span>
          </div>
        </div>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- 事件描述 -->
      <div class="event-body" v-if="event">
        <p class="event-description">{{ event.description }}</p>

        <!-- 事件选项 -->
        <div class="event-options">
          <div
            v-for="option in event.options"
            :key="option.id"
            class="event-option"
            :class="{ disabled: !isOptionAvailable(option) }"
            @click="selectOption(option)"
          >
            <div class="option-content">
              <div class="option-text">{{ option.text }}</div>
              <div v-if="option.preview" class="option-preview">
                {{ option.preview }}
              </div>
            </div>
            <div class="option-requirements" v-if="option.requirements">
              <span v-if="option.requirements.minFunds">
                需要资金 ≥ {{ option.requirements.minFunds }}万
              </span>
              <span v-if="option.requirements.maxFunds">
                需要资金 ≤ {{ option.requirements.maxFunds }}万
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 事件历史（如果有） -->
      <div v-if="showHistory && eventHistory.length > 0" class="event-history">
        <h3>事件历史</h3>
        <div class="history-list">
          <div
            v-for="history in eventHistory.slice(0, 5)"
            :key="history.eventId"
            class="history-item"
          >
            <div class="history-title">{{ history.title }}</div>
            <div class="history-meta">
              <span>{{ formatDate(history.triggeredAt) }}</span>
              <span class="selected-option">{{ history.selectedOption }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GameEvent, EventOption, EventHistory } from '@/types/events';

interface Props {
  visible: boolean;
  event: GameEvent | null;
  eventHistory?: EventHistory[];
  showHistory?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  eventHistory: () => [],
  showHistory: false,
});

const emit = defineEmits<{
  close: [];
  select: [optionId: string];
}>();

// 关闭弹窗
const closeModal = () => {
  emit('close');
};

// 选择选项
const selectOption = (option: EventOption) => {
  if (!isOptionAvailable(option)) return;
  emit('select', option.id);
};

// 检查选项是否可用
const isOptionAvailable = (option: EventOption): boolean => {
  if (!option.requirements) return true;
  
  // 这里需要从 store 获取俱乐部状态
  // 暂时返回 true，实际使用时需要传入俱乐部状态
  return true;
};

// 获取事件图标
const eventIcon = computed(() => {
  if (!props.event) return '📢';
  
  const icons: Record<string, string> = {
    business: '💼',
    transfer: '🔄',
    injury: '🏥',
    internal: '⚠️',
    media: '📺',
    sponsor: '🤝',
    competitor: '⚔️',
    league_policy: '📜',
    emergency: '🚨',
    honor: '🏆',
  };
  
  return icons[props.event.category] || '📢';
});

// 获取类别文本
const categoryText = computed(() => {
  if (!props.event) return '';
  
  const texts: Record<string, string> = {
    business: '商业活动',
    transfer: '选手转会',
    injury: '伤病意外',
    internal: '内部矛盾',
    media: '媒体事件',
    sponsor: '赞助商',
    competitor: '竞争对手',
    league_policy: '联赛政策',
    emergency: '突发事件',
    honor: '荣誉庆典',
  };
  
  return texts[props.event.category] || '事件';
});

// 获取稀有度文本
const rarityText = computed(() => {
  if (!props.event) return '';
  
  const texts: Record<string, string> = {
    common: '普通',
    uncommon: '罕见',
    rare: '稀有',
    epic: '史诗',
  };
  
  return texts[props.event.rarity] || '';
});

// 获取事件类别样式
const getEventClass = computed(() => {
  if (!props.event) return '';
  return `event-${props.event.category}`;
});

// 格式化日期
const formatDate = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getMonth() + 1}/${d.getDate()}`;
};
</script>

<style scoped lang="scss">
.event-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.event-modal {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
  
  @media (max-width: 768px) {
    width: 95%;
    max-height: 90vh;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// 不同类别的事件配色
.event-business { border-top: 4px solid #1890ff; }
.event-transfer { border-top: 4px solid #722ed1; }
.event-injury { border-top: 4px solid #ff4d4f; }
.event-internal { border-top: 4px solid #fa8c16; }
.event-media { border-top: 4px solid #13c2c2; }
.event-sponsor { border-top: 4px solid #52c41a; }
.event-competitor { border-top: 4px solid #f5222d; }
.event-league_policy { border-top: 4px solid #2f54eb; }
.event-emergency { border-top: 4px solid #ff7a45; }
.event-honor { border-top: 4px solid #ffd700; }

.event-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.event-icon {
  font-size: 42px;
  flex-shrink: 0;
}

.event-title-group {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.event-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.event-category-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
  
  &.business { background: #e6f7ff; color: #1890ff; }
  &.transfer { background: #f9f0ff; color: #722ed1; }
  &.injury { background: #fff1f0; color: #ff4d4f; }
  &.internal { background: #fff7e6; color: #fa8c16; }
  &.media { background: #e6fffb; color: #13c2c2; }
  &.sponsor { background: #f6ffed; color: #52c41a; }
  &.competitor { background: #fff1f0; color: #f5222d; }
  &.league_policy { background: #f0f5ff; color: #2f54eb; }
  &.emergency { background: #fff7e6; color: #ff7a45; }
  &.honor { background: #fffbe6; color: #faad14; }
}

.event-rarity-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
  
  &.common { background: #f5f5f5; color: #666; }
  &.uncommon { background: #e6f7ff; color: #1890ff; }
  &.rare { background: #f9f0ff; color: #722ed1; }
  &.epic { background: #fff7e6; color: #fa8c16; }
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    background: #e8e8e8;
  }
}

.event-body {
  padding: 20px;
}

.event-description {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 24px;
}

.event-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-option {
  padding: 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #1890ff;
    background: #f0f5ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f5f5f5;
    
    &:hover {
      border-color: #e8e8e8;
      background: #f5f5f5;
      transform: none;
      box-shadow: none;
    }
  }
}

.option-content {
  margin-bottom: 8px;
}

.option-text {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.option-preview {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.option-requirements {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 8px;
}

.event-history {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.event-history h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border-left: 3px solid #1890ff;
}

.history-title {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.history-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.selected-option {
  color: #1890ff;
  font-weight: 500;
}

// 移动端适配
@media (max-width: 768px) {
  .event-header {
    padding: 16px;
  }
  
  .event-title {
    font-size: 18px;
  }
  
  .event-body {
    padding: 16px;
  }
  
  .event-option {
    padding: 14px;
  }
  
  .option-text {
    font-size: 14px;
  }
}
</style>
