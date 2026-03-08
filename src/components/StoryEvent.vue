<script setup lang="ts">
import { computed } from 'vue';
import type { PlayerStoryline, StoryChapter, StoryChoice, StoryImpact } from '@/types/storyline';
import { STORYLINE_TYPE_NAMES } from '@/types/storyline';

const props = defineProps<{
  storyline: PlayerStoryline;
  chapter: StoryChapter;
}>();

const emit = defineEmits<{
  choiceSelected: [choiceId: string];
  close: [];
}>();

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

const chapterProgress = computed(() => {
  return `${props.chapter.number} / ${props.storyline.chapters.length}`;
});

const availableChoices = computed(() => {
  return props.chapter.choices.filter(c => !c.locked);
});

const getImpactText = (impact: StoryImpact): string[] => {
  const texts: string[] = [];

  if (impact.attributes) {
    if (impact.attributes.mechanics) {
      texts.push(`操作 ${impact.attributes.mechanics > 0 ? '+' : ''}${impact.attributes.mechanics}`);
    }
    if (impact.attributes.awareness) {
      texts.push(`意识 ${impact.attributes.awareness > 0 ? '+' : ''}${impact.attributes.awareness}`);
    }
    if (impact.attributes.mentality) {
      texts.push(`心态 ${impact.attributes.mentality > 0 ? '+' : ''}${impact.attributes.mentality}`);
    }
    if (impact.attributes.teamwork) {
      texts.push(`团队 ${impact.attributes.teamwork > 0 ? '+' : ''}${impact.attributes.teamwork}`);
    }
  }

  if (impact.morale !== undefined) {
    texts.push(`士气 ${impact.morale > 0 ? '+' : ''}${impact.morale}`);
  }

  if (impact.reputation !== undefined) {
    texts.push(`声望 ${impact.reputation > 0 ? '+' : ''}${impact.reputation}`);
  }

  if (impact.loyalty !== undefined) {
    texts.push(`忠诚 ${impact.loyalty > 0 ? '+' : ''}${impact.loyalty}`);
  }

  if (impact.stress !== undefined) {
    texts.push(`压力 ${impact.stress > 0 ? '+' : ''}${impact.stress}`);
  }

  return texts;
};

const isPositiveImpact = (impact: StoryImpact): boolean => {
  let positive = 0;
  let negative = 0;

  if (impact.attributes) {
    Object.values(impact.attributes).forEach(v => {
      if (v && v > 0) positive++;
      if (v && v < 0) negative++;
    });
  }

  if (impact.morale && impact.morale > 0) positive++;
  if (impact.morale && impact.morale < 0) negative++;
  if (impact.reputation && impact.reputation > 0) positive++;
  if (impact.reputation && impact.reputation < 0) negative++;
  if (impact.loyalty && impact.loyalty > 0) positive++;
  if (impact.loyalty && impact.loyalty < 0) negative++;
  if (impact.stress && impact.stress < 0) positive++;
  if (impact.stress && impact.stress > 0) negative++;

  return positive >= negative;
};

const handleChoice = (choice: StoryChoice) => {
  if (choice.locked) return;
  emit('choiceSelected', choice.id);
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-content story-event-modal" @click.stop>
      <div class="modal-header" :style="{ backgroundColor: storylineTypeColors[storyline.type] }">
        <div class="header-top">
          <span class="storyline-type">
            {{ STORYLINE_TYPE_NAMES[storyline.type] }}
          </span>
          <span class="chapter-progress">{{ chapterProgress }}</span>
        </div>
        <h2 class="chapter-title">{{ chapter.title }}</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <div class="story-context">
          <p class="storyline-name">{{ storyline.title }}</p>
        </div>

        <div class="chapter-description">
          <p>{{ chapter.description }}</p>
        </div>

        <div class="choices-section">
          <h3>做出选择</h3>
          <div class="choices-list">
            <div
              v-for="choice in availableChoices"
              :key="choice.id"
              class="choice-card"
              :class="{ locked: choice.locked }"
              @click="handleChoice(choice)"
            >
              <div class="choice-text">{{ choice.text }}</div>
              <div class="choice-impact">
                <span
                  v-for="(text, index) in getImpactText(choice.consequences)"
                  :key="index"
                  class="impact-tag"
                  :class="{ positive: isPositiveImpact(choice.consequences), negative: !isPositiveImpact(choice.consequences) }"
                >
                  {{ text }}
                </span>
              </div>
              <div v-if="choice.locked" class="lock-overlay">
                <span class="lock-icon">🔒</span>
                <span class="lock-reason">{{ choice.lockReason || '条件未满足' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="availableChoices.length === 0" class="no-choices">
          <p>当前没有可选的选项</p>
        </div>
      </div>

      <div class="modal-footer">
        <p class="hint-text">你的选择将影响选手的属性和发展</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  max-height: 85vh;
  overflow-y: auto;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  position: relative;
  padding: 24px 20px;
  color: white;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.storyline-type {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.chapter-progress {
  font-size: 12px;
  opacity: 0.9;
}

.chapter-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  padding-right: 30px;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 20px;
}

.story-context {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.storyline-name {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.chapter-description {
  margin-bottom: 24px;
}

.chapter-description p {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin: 0;
}

.choices-section h3 {
  font-size: 15px;
  color: #333;
  margin: 0 0 14px 0;
  font-weight: 600;
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choice-card {
  position: relative;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.choice-card:hover:not(.locked) {
  background: #f0f7ff;
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.choice-card:active:not(.locked) {
  transform: translateY(0);
}

.choice-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.choice-text {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
}

.choice-impact {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.impact-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.impact-tag.positive {
  background: #f6ffed;
  color: #52c41a;
}

.impact-tag.negative {
  background: #fff2f0;
  color: #ff4d4f;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.lock-icon {
  font-size: 20px;
}

.lock-reason {
  font-size: 12px;
  color: #999;
}

.no-choices {
  text-align: center;
  padding: 30px;
  color: #999;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  border-radius: 0 0 16px 16px;
}

.hint-text {
  margin: 0;
  font-size: 12px;
  color: #999;
  text-align: center;
}
</style>
