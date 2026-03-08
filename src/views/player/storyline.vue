<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStorylineStore } from '@/stores/storyline';
import { usePlayerStore } from '@/stores/player';
import { usePlayerPersonalityStore } from '@/stores/playerPersonality';
import type { PlayerStoryline, StoryChapter } from '@/types/storyline';
import {
  STORYLINE_TYPE_NAMES,
  STORYLINE_TYPE_DESCRIPTIONS,
} from '@/types/storyline';
import { getStorylineProgress } from '@/core/services/storylineService';
import StoryEvent from '@/components/StoryEvent.vue';

const route = useRoute();
const storylineStore = useStorylineStore();
const playerStore = usePlayerStore();
const personalityStore = usePlayerPersonalityStore();

const selectedStoryline = ref<PlayerStoryline | null>(null);
const showEventModal = ref(false);
const activeChapter = ref<StoryChapter | null>(null);
const activeTab = ref<'active' | 'completed' | 'all'>('active');

const playerId = computed(() => route.query.playerId as string);

const player = computed(() => {
  if (!playerId.value) return null;
  return playerStore.getPlayerById(playerId.value);
});

const personality = computed(() => {
  if (!playerId.value) return null;
  return personalityStore.getPersonality(playerId.value);
});

const activeStorylines = computed(() => {
  if (!playerId.value) return [];
  return storylineStore.getActiveStorylinesForPlayer(playerId.value);
});

const completedStorylines = computed(() => {
  if (!playerId.value) return [];
  return storylineStore.getCompletedStorylinesForPlayer(playerId.value);
});

const allStorylines = computed(() => {
  if (!playerId.value) return [];
  return storylineStore.getStorylinesForPlayer(playerId.value);
});

const displayedStorylines = computed(() => {
  switch (activeTab.value) {
    case 'active':
      return activeStorylines.value;
    case 'completed':
      return completedStorylines.value;
    case 'all':
      return allStorylines.value;
    default:
      return activeStorylines.value;
  }
});

const pendingEvent = computed(() => {
  if (!playerId.value) return null;
  const events = storylineStore.getPendingEvents();
  return events.find(event => {
    const storyline = storylineStore.getStoryline(event.storylineId);
    return storyline?.playerId === playerId.value;
  });
});

const positionNames: Record<string, string> = {
  top: '对抗路',
  jungle: '打野',
  mid: '中路',
  adc: '发育路',
  support: '游走',
};

const storylineTypeColors: Record<string, string> = {
  'rookie-rise': '#52c41a',
  'veteran-twilight': '#faad14',
  'comeback': '#1890ff',
  'transfer-saga': '#722ed1',
  'controversy': '#ff4d4f',
};

const storylineTypeBgColors: Record<string, string> = {
  'rookie-rise': '#f6ffed',
  'veteran-twilight': '#fffbe6',
  'comeback': '#e6f7ff',
  'transfer-saga': '#f9f0ff',
  'controversy': '#fff2f0',
};

const openStorylineDetail = (storyline: PlayerStoryline) => {
  selectedStoryline.value = storyline;
};

const closeStorylineDetail = () => {
  selectedStoryline.value = null;
};

const openEventModal = () => {
  if (!pendingEvent.value) return;

  const storyline = storylineStore.getStoryline(pendingEvent.value.storylineId);
  if (!storyline) return;

  const chapter = storyline.chapters.find(
    c => c.number === pendingEvent.value!.chapterNumber
  );

  if (chapter) {
    activeChapter.value = chapter;
    selectedStoryline.value = storyline;
    showEventModal.value = true;
  }
};

const closeEventModal = () => {
  showEventModal.value = false;
  activeChapter.value = null;
};

const handleChoiceSelected = (choiceId: string) => {
  if (!selectedStoryline.value || !activeChapter.value) return;

  const result = storylineStore.processPlayerChoice(
    playerId.value,
    selectedStoryline.value.id,
    activeChapter.value.number,
    choiceId
  );

  if (result.success) {
    closeEventModal();

    if (result.storylineCompleted) {
      alert('恭喜！故事线已完成！');
    }
  }
};

const generateNewStoryline = () => {
  if (!playerId.value) return;

  if (activeStorylines.value.length >= 2) {
    alert('每个选手最多同时进行2条故事线');
    return;
  }

  storylineStore.generatePlayerStoryline(playerId.value);
};

const abandonStoryline = (storylineId: string) => {
  if (confirm('确定要放弃这条故事线吗？')) {
    storylineStore.abandonStoryline(storylineId);
    if (selectedStoryline.value?.id === storylineId) {
      closeStorylineDetail();
    }
  }
};

const getProgressInfo = (storyline: PlayerStoryline) => {
  return getStorylineProgress(storyline);
};

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

onMounted(() => {
  if (pendingEvent.value) {
    openEventModal();
  }
});
</script>

<template>
  <div class="storyline-page">
    <div class="page-header">
      <div class="player-info" v-if="player">
        <div class="player-avatar">
          {{ player.name[0] }}
        </div>
        <div class="player-details">
          <h2 class="player-name">{{ player.name }}</h2>
          <div class="player-meta">
            <span class="position-tag" :class="player.position">
              {{ positionNames[player.position] }}
            </span>
            <span class="age-tag">{{ player.age }}岁</span>
          </div>
        </div>
      </div>
      <button class="generate-btn" @click="generateNewStoryline" :disabled="activeStorylines.length >= 2">
        开始新故事
      </button>
    </div>

    <div v-if="pendingEvent" class="pending-event-banner" @click="openEventModal">
      <div class="event-icon">!</div>
      <div class="event-info">
        <span class="event-title">有新的故事事件等待处理</span>
        <span class="event-hint">点击查看</span>
      </div>
    </div>

    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'active' }"
        @click="activeTab = 'active'"
      >
        进行中 ({{ activeStorylines.length }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        已完成 ({{ completedStorylines.length }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        全部 ({{ allStorylines.length }})
      </button>
    </div>

    <div class="storyline-list">
      <div
        v-for="storyline in displayedStorylines"
        :key="storyline.id"
        class="storyline-card"
        :style="{
          borderLeftColor: storylineTypeColors[storyline.type],
          backgroundColor: storyline.status === 'completed' ? '#f9f9f9' : 'white'
        }"
        @click="openStorylineDetail(storyline)"
      >
        <div class="storyline-header">
          <span
            class="storyline-type"
            :style="{
              backgroundColor: storylineTypeBgColors[storyline.type],
              color: storylineTypeColors[storyline.type]
            }"
          >
            {{ STORYLINE_TYPE_NAMES[storyline.type] }}
          </span>
          <span class="storyline-status" :class="storyline.status">
            {{ storyline.status === 'active' ? '进行中' : storyline.status === 'completed' ? '已完成' : '已放弃' }}
          </span>
        </div>

        <h3 class="storyline-title">{{ storyline.title }}</h3>
        <p class="storyline-desc">{{ storyline.description }}</p>

        <div class="progress-section">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: getProgressInfo(storyline).progressPercent + '%',
                backgroundColor: storylineTypeColors[storyline.type]
              }"
            ></div>
          </div>
          <span class="progress-text">
            {{ getProgressInfo(storyline).completedChapters }} / {{ getProgressInfo(storyline).totalChapters }} 章节
          </span>
        </div>

        <div class="storyline-footer">
          <span class="start-date">开始于 {{ formatDate(storyline.startedAt) }}</span>
        </div>
      </div>

      <div v-if="displayedStorylines.length === 0" class="empty-state">
        <p v-if="activeTab === 'active'">暂无进行中的故事线</p>
        <p v-else-if="activeTab === 'completed'">暂无已完成的故事线</p>
        <p v-else>暂无故事线记录</p>
        <button v-if="activeTab === 'active'" class="start-btn" @click="generateNewStoryline">
          开始新故事
        </button>
      </div>
    </div>

    <div v-if="selectedStoryline && !showEventModal" class="modal-overlay" @click="closeStorylineDetail">
      <div class="modal-content storyline-detail-modal" @click.stop>
        <div class="modal-header" :style="{ backgroundColor: storylineTypeColors[selectedStoryline.type] }">
          <div class="header-content">
            <span class="storyline-type-tag">
              {{ STORYLINE_TYPE_NAMES[selectedStoryline.type] }}
            </span>
            <h3>{{ selectedStoryline.title }}</h3>
          </div>
          <button class="close-btn" @click="closeStorylineDetail">×</button>
        </div>

        <div class="modal-body">
          <p class="storyline-description">{{ selectedStoryline.description }}</p>

          <div class="chapters-section">
            <h4>章节列表</h4>
            <div class="chapters-list">
              <div
                v-for="chapter in selectedStoryline.chapters"
                :key="chapter.number"
                class="chapter-item"
                :class="{
                  completed: chapter.completed,
                  current: chapter.number === selectedStoryline.currentChapter && !chapter.completed
                }"
              >
                <div class="chapter-number">
                  <span v-if="chapter.completed">✓</span>
                  <span v-else>{{ chapter.number }}</span>
                </div>
                <div class="chapter-content">
                  <h5 class="chapter-title">{{ chapter.title }}</h5>
                  <p class="chapter-desc">{{ chapter.description }}</p>
                  <div v-if="chapter.completed && chapter.selectedChoice" class="selected-choice">
                    <span class="choice-label">选择：</span>
                    <span class="choice-text">
                      {{ chapter.choices.find(c => c.id === chapter.selectedChoice)?.text }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="impact-section" v-if="Object.keys(selectedStoryline.impact).length > 0">
            <h4>累积影响</h4>
            <div class="impact-list">
              <div v-if="selectedStoryline.impact.attributes" class="impact-item">
                <span class="impact-label">属性变化</span>
                <div class="impact-values">
                  <span v-if="selectedStoryline.impact.attributes.mechanics">
                    操作 {{ selectedStoryline.impact.attributes.mechanics > 0 ? '+' : '' }}{{ selectedStoryline.impact.attributes.mechanics }}
                  </span>
                  <span v-if="selectedStoryline.impact.attributes.awareness">
                    意识 {{ selectedStoryline.impact.attributes.awareness > 0 ? '+' : '' }}{{ selectedStoryline.impact.attributes.awareness }}
                  </span>
                  <span v-if="selectedStoryline.impact.attributes.mentality">
                    心态 {{ selectedStoryline.impact.attributes.mentality > 0 ? '+' : '' }}{{ selectedStoryline.impact.attributes.mentality }}
                  </span>
                  <span v-if="selectedStoryline.impact.attributes.teamwork">
                    团队 {{ selectedStoryline.impact.attributes.teamwork > 0 ? '+' : '' }}{{ selectedStoryline.impact.attributes.teamwork }}
                  </span>
                </div>
              </div>
              <div v-if="selectedStoryline.impact.morale" class="impact-item">
                <span class="impact-label">士气</span>
                <span class="impact-value" :class="selectedStoryline.impact.morale > 0 ? 'positive' : 'negative'">
                  {{ selectedStoryline.impact.morale > 0 ? '+' : '' }}{{ selectedStoryline.impact.morale }}
                </span>
              </div>
              <div v-if="selectedStoryline.impact.reputation" class="impact-item">
                <span class="impact-label">声望</span>
                <span class="impact-value" :class="selectedStoryline.impact.reputation > 0 ? 'positive' : 'negative'">
                  {{ selectedStoryline.impact.reputation > 0 ? '+' : '' }}{{ selectedStoryline.impact.reputation }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" v-if="selectedStoryline.status === 'active'">
          <button class="abandon-btn" @click="abandonStoryline(selectedStoryline.id)">
            放弃故事线
          </button>
        </div>
      </div>
    </div>

    <StoryEvent
      v-if="showEventModal && activeChapter && selectedStoryline"
      :storyline="selectedStoryline"
      :chapter="activeChapter"
      @choice-selected="handleChoiceSelected"
      @close="closeEventModal"
    />
  </div>
</template>

<style scoped>
.storyline-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.player-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.player-meta {
  display: flex;
  gap: 8px;
}

.position-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.position-tag.top { background: #e74c3c; }
.position-tag.jungle { background: #27ae60; }
.position-tag.mid { background: #3498db; }
.position-tag.adc { background: #f39c12; }
.position-tag.support { background: #9b59b6; }

.age-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #f0f0f0;
  color: #666;
}

.generate-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pending-event-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fff2f0 0%, #ffebe8 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.pending-event-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
}

.event-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.event-hint {
  font-size: 12px;
  color: #ff4d4f;
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

.storyline-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.storyline-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.storyline-card:active {
  transform: scale(0.98);
}

.storyline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.storyline-type {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.storyline-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.storyline-status.active {
  background: #e6f7ff;
  color: #1890ff;
}

.storyline-status.completed {
  background: #f6ffed;
  color: #52c41a;
}

.storyline-status.abandoned {
  background: #f0f0f0;
  color: #999;
}

.storyline-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.storyline-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.storyline-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.start-date {
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin-bottom: 15px;
}

.start-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  animation: slideUp 0.3s ease;
}

@media (min-width: 768px) {
  .modal-content {
    border-radius: 16px;
    max-height: 80vh;
    animation: fadeIn 0.3s ease;
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.storyline-detail-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  color: white;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.storyline-type-tag {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 12px;
  width: fit-content;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-body {
  padding: 20px;
}

.storyline-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.chapters-section {
  margin-bottom: 24px;
}

.chapters-section h4 {
  font-size: 15px;
  color: #333;
  margin: 0 0 14px 0;
  font-weight: 600;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #f9f9f9;
  border-radius: 10px;
  border-left: 3px solid #d9d9d9;
}

.chapter-item.completed {
  border-left-color: #52c41a;
  opacity: 0.8;
}

.chapter-item.current {
  border-left-color: #1890ff;
  background: #e6f7ff;
}

.chapter-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #d9d9d9;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.chapter-item.completed .chapter-number {
  background: #52c41a;
  color: white;
}

.chapter-item.current .chapter-number {
  background: #1890ff;
  color: white;
}

.chapter-content {
  flex: 1;
}

.chapter-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.chapter-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.selected-choice {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #d9d9d9;
}

.choice-label {
  font-size: 12px;
  color: #999;
}

.choice-text {
  font-size: 12px;
  color: #52c41a;
  font-weight: 500;
}

.impact-section h4 {
  font-size: 15px;
  color: #333;
  margin: 0 0 14px 0;
  font-weight: 600;
}

.impact-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.impact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.impact-label {
  font-size: 13px;
  color: #666;
}

.impact-values {
  display: flex;
  gap: 12px;
}

.impact-values span {
  font-size: 12px;
  color: #333;
}

.impact-value {
  font-size: 14px;
  font-weight: 600;
}

.impact-value.positive {
  color: #52c41a;
}

.impact-value.negative {
  color: #ff4d4f;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
}

.abandon-btn {
  flex: 1;
  padding: 14px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>
