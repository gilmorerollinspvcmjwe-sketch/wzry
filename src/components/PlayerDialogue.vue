<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePlayerPersonalityStore } from '@/stores/playerPersonality';
import { usePlayerStore } from '@/stores/player';
import type { DialogueContext, DialogueMessage } from '@/types/playerPersonality';
import { EMOTION_TYPE_NAMES } from '@/types/playerPersonality';

const props = defineProps<{
  playerId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const personalityStore = usePlayerPersonalityStore();
const playerStore = usePlayerStore();

const selectedContext = ref<DialogueContext>('greeting');
const currentDialogue = ref<DialogueMessage | null>(null);
const isGenerating = ref(false);

const player = computed(() => playerStore.getPlayerById(props.playerId));

const personality = computed(() => personalityStore.getPersonality(props.playerId));

const dialogueHistory = computed(() => 
  personalityStore.getDialogueHistory(props.playerId, 5)
);

const contextOptions: { value: DialogueContext; label: string }[] = [
  { value: 'greeting', label: '问候' },
  { value: 'happy', label: '开心' },
  { value: 'sad', label: '沮丧' },
  { value: 'angry', label: '愤怒' },
  { value: 'anxious', label: '焦虑' },
  { value: 'training_request', label: '训练请求' },
  { value: 'match_feedback', label: '比赛反馈' },
  { value: 'demand', label: '诉求' },
  { value: 'contract', label: '合同' },
  { value: 'transfer', label: '转会' },
];

const emotionColor = computed(() => {
  if (!personality.value) return '#666';
  const type = personality.value.emotion.type;
  const colors: Record<string, string> = {
    happy: '#52c41a',
    sad: '#1890ff',
    angry: '#ff4d4f',
    anxious: '#faad14',
    neutral: '#666',
  };
  return colors[type] || '#666';
});

const emotionBgColor = computed(() => {
  if (!personality.value) return '#f5f5f5';
  const type = personality.value.emotion.type;
  const colors: Record<string, string> = {
    happy: '#f6ffed',
    sad: '#e6f7ff',
    angry: '#fff2f0',
    anxious: '#fffbe6',
    neutral: '#f5f5f5',
  };
  return colors[type] || '#f5f5f5';
});

const generateDialogue = () => {
  if (!personality.value) {
    initPersonality();
  }

  isGenerating.value = true;

  setTimeout(() => {
    currentDialogue.value = personalityStore.generatePlayerDialogue(
      props.playerId,
      selectedContext.value
    );
    isGenerating.value = false;
  }, 300);
};

const initPersonality = () => {
  personalityStore.initPersonality(props.playerId);
};

const formatTime = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

onMounted(() => {
  if (!personality.value) {
    initPersonality();
  }
});
</script>

<template>
  <div class="player-dialogue">
    <div class="dialogue-header">
      <div class="player-info">
        <span class="player-name">{{ player?.name || '未知选手' }}</span>
        <span 
          class="emotion-tag" 
          :style="{ backgroundColor: emotionBgColor, color: emotionColor }"
        >
          {{ EMOTION_TYPE_NAMES[personality?.emotion.type || 'neutral'] }}
        </span>
      </div>
    </div>

    <div class="dialogue-content">
      <div v-if="currentDialogue" class="current-dialogue">
        <div class="dialogue-bubble player">
          <p class="message">{{ currentDialogue.message }}</p>
          <span class="time">{{ formatTime(currentDialogue.timestamp) }}</span>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>选择对话场景开始交流</p>
      </div>

      <div v-if="dialogueHistory.length > 0" class="history-section">
        <h4>历史对话</h4>
        <div class="history-list">
          <div 
            v-for="msg in dialogueHistory" 
            :key="msg.id" 
            class="history-item"
          >
            <span class="context-tag">{{ contextOptions.find(c => c.value === msg.context)?.label }}</span>
            <p class="history-message">{{ msg.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="dialogue-controls">
      <div class="context-selector">
        <label>对话场景</label>
        <select v-model="selectedContext">
          <option 
            v-for="option in contextOptions" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <button 
        class="generate-btn" 
        :disabled="isGenerating"
        @click="generateDialogue"
      >
        {{ isGenerating ? '生成中...' : '开始对话' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.player-dialogue {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.dialogue-header {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.player-name {
  font-size: 16px;
  font-weight: 600;
}

.emotion-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.dialogue-content {
  padding: 16px;
  min-height: 200px;
}

.current-dialogue {
  margin-bottom: 20px;
}

.dialogue-bubble {
  padding: 14px 16px;
  border-radius: 16px;
  max-width: 85%;
  position: relative;
}

.dialogue-bubble.player {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  margin-right: auto;
}

.message {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.time {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 6px;
  text-align: right;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #999;
}

.history-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.history-section h4 {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 8px;
}

.context-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 11px;
  margin-bottom: 6px;
}

.history-message {
  margin: 0;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}

.dialogue-controls {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.context-selector {
  margin-bottom: 12px;
}

.context-selector label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.context-selector select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.generate-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
