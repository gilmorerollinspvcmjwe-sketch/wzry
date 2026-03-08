<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePlayerPersonalityStore } from '@/stores/playerPersonality';
import { usePlayerStore } from '@/stores/player';
import { EMOTION_TYPE_NAMES, COMMUNICATION_STYLE_NAMES } from '@/types/playerPersonality';

const props = defineProps<{
  playerId: string;
  showDetails?: boolean;
}>();

const personalityStore = usePlayerPersonalityStore();
const playerStore = usePlayerStore();

const player = computed(() => playerStore.getPlayerById(props.playerId));

const personality = computed(() => personalityStore.getPersonality(props.playerId));

const emotion = computed(() => personality.value?.emotion);

const emotionEffects = computed(() => 
  personalityStore.getPlayerEmotionEffects(props.playerId)
);

const getEmotionIcon = (type: string) => {
  const icons: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    neutral: '😐',
  };
  return icons[type] || '😐';
};

const getEmotionColor = (type: string) => {
  const colors: Record<string, string> = {
    happy: '#52c41a',
    sad: '#1890ff',
    angry: '#ff4d4f',
    anxious: '#faad14',
    neutral: '#8c8c8c',
  };
  return colors[type] || '#8c8c8c';
};

const getEmotionBgColor = (type: string) => {
  const colors: Record<string, string> = {
    happy: '#f6ffed',
    sad: '#e6f7ff',
    angry: '#fff2f0',
    anxious: '#fffbe6',
    neutral: '#f5f5f5',
  };
  return colors[type] || '#f5f5f5';
};

const getEmotionValueColor = (value: number) => {
  if (value >= 50) return '#52c41a';
  if (value >= 20) return '#73d13d';
  if (value >= -20) return '#8c8c8c';
  if (value >= -50) return '#faad14';
  return '#ff4d4f';
};

const getEmotionBarWidth = (value: number) => {
  const normalized = (value + 100) / 2;
  return `${normalized}%`;
};

const getTraitLevel = (value: number) => {
  if (value >= 80) return { label: '很高', color: '#52c41a' };
  if (value >= 60) return { label: '较高', color: '#73d13d' };
  if (value >= 40) return { label: '中等', color: '#faad14' };
  if (value >= 20) return { label: '较低', color: '#ff7a45' };
  return { label: '很低', color: '#ff4d4f' };
};

const initPersonality = () => {
  personalityStore.initPersonality(props.playerId);
};

onMounted(() => {
  if (!personality.value) {
    initPersonality();
  }
});
</script>

<template>
  <div class="player-emotion">
    <div v-if="emotion" class="emotion-display">
      <div 
        class="emotion-main"
        :style="{ backgroundColor: getEmotionBgColor(emotion.type) }"
      >
        <div class="emotion-icon">{{ getEmotionIcon(emotion.type) }}</div>
        <div class="emotion-info">
          <span class="emotion-type" :style="{ color: getEmotionColor(emotion.type) }">
            {{ EMOTION_TYPE_NAMES[emotion.type] }}
          </span>
          <span class="emotion-reason">{{ emotion.reason }}</span>
        </div>
      </div>

      <div class="emotion-meter">
        <div class="meter-label">
          <span>情绪值</span>
          <span class="meter-value" :style="{ color: getEmotionValueColor(emotion.value) }">
            {{ emotion.value > 0 ? '+' : '' }}{{ emotion.value }}
          </span>
        </div>
        <div class="meter-bar">
          <div class="meter-bg">
            <div 
              class="meter-fill"
              :style="{ 
                width: getEmotionBarWidth(emotion.value),
                backgroundColor: getEmotionValueColor(emotion.value)
              }"
            ></div>
            <div class="meter-center"></div>
          </div>
        </div>
        <div class="meter-labels">
          <span>消极</span>
          <span>中性</span>
          <span>积极</span>
        </div>
      </div>

      <div v-if="showDetails && personality" class="emotion-details">
        <div class="detail-section">
          <h4>性格特质</h4>
          <div class="traits-grid">
            <div class="trait-item">
              <span class="trait-label">开放性</span>
              <div class="trait-bar">
                <div 
                  class="trait-fill"
                  :style="{ width: `${personality.traits.openness}%` }"
                ></div>
              </div>
              <span class="trait-value">{{ personality.traits.openness }}</span>
            </div>
            <div class="trait-item">
              <span class="trait-label">尽责性</span>
              <div class="trait-bar">
                <div 
                  class="trait-fill"
                  :style="{ width: `${personality.traits.conscientiousness}%` }"
                ></div>
              </div>
              <span class="trait-value">{{ personality.traits.conscientiousness }}</span>
            </div>
            <div class="trait-item">
              <span class="trait-label">外向性</span>
              <div class="trait-bar">
                <div 
                  class="trait-fill"
                  :style="{ width: `${personality.traits.extraversion}%` }"
                ></div>
              </div>
              <span class="trait-value">{{ personality.traits.extraversion }}</span>
            </div>
            <div class="trait-item">
              <span class="trait-label">宜人性</span>
              <div class="trait-bar">
                <div 
                  class="trait-fill"
                  :style="{ width: `${personality.traits.agreeableness}%` }"
                ></div>
              </div>
              <span class="trait-value">{{ personality.traits.agreeableness }}</span>
            </div>
            <div class="trait-item">
              <span class="trait-label">神经质</span>
              <div class="trait-bar neuroticism">
                <div 
                  class="trait-fill"
                  :style="{ width: `${personality.traits.neuroticism}%` }"
                ></div>
              </div>
              <span class="trait-value">{{ personality.traits.neuroticism }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>个性指标</h4>
          <div class="indicators-grid">
            <div class="indicator-item">
              <span class="indicator-label">沟通风格</span>
              <span class="indicator-value">
                {{ COMMUNICATION_STYLE_NAMES[personality.communicationStyle] }}
              </span>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">野心程度</span>
              <div class="indicator-bar">
                <div 
                  class="indicator-fill"
                  :style="{ width: `${personality.ambitionLevel}%` }"
                ></div>
              </div>
              <span class="indicator-value">{{ personality.ambitionLevel }}</span>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">忠诚度</span>
              <div class="indicator-bar loyalty">
                <div 
                  class="indicator-fill"
                  :style="{ width: `${personality.loyaltyLevel}%` }"
                ></div>
              </div>
              <span class="indicator-value">{{ personality.loyaltyLevel }}</span>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">抗压能力</span>
              <div class="indicator-bar stress">
                <div 
                  class="indicator-fill"
                  :style="{ width: `${personality.stressThreshold}%` }"
                ></div>
              </div>
              <span class="indicator-value">{{ personality.stressThreshold }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>情绪影响</h4>
          <div class="effects-grid">
            <div class="effect-item" :class="{ positive: emotionEffects.moraleModifier > 0, negative: emotionEffects.moraleModifier < 0 }">
              <span class="effect-label">士气修正</span>
              <span class="effect-value">
                {{ emotionEffects.moraleModifier > 0 ? '+' : '' }}{{ emotionEffects.moraleModifier }}
              </span>
            </div>
            <div class="effect-item" :class="{ positive: emotionEffects.performanceModifier > 0, negative: emotionEffects.performanceModifier < 0 }">
              <span class="effect-label">表现修正</span>
              <span class="effect-value">
                {{ emotionEffects.performanceModifier > 0 ? '+' : '' }}{{ emotionEffects.performanceModifier }}
              </span>
            </div>
            <div class="effect-item" :class="{ positive: emotionEffects.teamworkModifier > 0, negative: emotionEffects.teamworkModifier < 0 }">
              <span class="effect-label">协作修正</span>
              <span class="effect-value">
                {{ emotionEffects.teamworkModifier > 0 ? '+' : '' }}{{ emotionEffects.teamworkModifier }}
              </span>
            </div>
            <div class="effect-item">
              <span class="effect-label">训练效率</span>
              <span class="effect-value">
                {{ Math.round(emotionEffects.trainingEfficiency * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>暂无情绪数据</p>
    </div>
  </div>
</template>

<style scoped>
.player-emotion {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.emotion-display {
  padding: 16px;
}

.emotion-main {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.emotion-icon {
  font-size: 36px;
  line-height: 1;
}

.emotion-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.emotion-type {
  font-size: 18px;
  font-weight: 600;
}

.emotion-reason {
  font-size: 13px;
  color: #666;
}

.emotion-meter {
  margin-bottom: 16px;
}

.meter-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

.meter-value {
  font-size: 16px;
  font-weight: 600;
}

.meter-bar {
  margin-bottom: 6px;
}

.meter-bg {
  height: 12px;
  background: linear-gradient(to right, #ff4d4f, #faad14, #8c8c8c, #73d13d, #52c41a);
  border-radius: 6px;
  position: relative;
}

.meter-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s;
}

.meter-center {
  position: absolute;
  top: -2px;
  left: 50%;
  width: 2px;
  height: calc(100% + 4px);
  background: rgba(0, 0, 0, 0.3);
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
}

.emotion-details {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 14px;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.traits-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trait-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trait-label {
  width: 60px;
  font-size: 13px;
  color: #666;
}

.trait-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.trait-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border-radius: 4px;
  transition: width 0.3s;
}

.trait-bar.neuroticism .trait-fill {
  background: linear-gradient(90deg, #faad14, #ffc53d);
}

.trait-value {
  width: 30px;
  text-align: right;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.indicators-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.indicator-label {
  width: 70px;
  font-size: 13px;
  color: #666;
}

.indicator-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.indicator-fill {
  height: 100%;
  background: linear-gradient(90deg, #722ed1, #9254de);
  border-radius: 4px;
}

.indicator-bar.loyalty .indicator-fill {
  background: linear-gradient(90deg, #52c41a, #73d13d);
}

.indicator-bar.stress .indicator-fill {
  background: linear-gradient(90deg, #13c2c2, #36cfc9);
}

.indicator-value {
  width: 35px;
  text-align: right;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.effects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.effect-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.effect-item.positive {
  background: #f6ffed;
}

.effect-item.negative {
  background: #fff2f0;
}

.effect-label {
  font-size: 12px;
  color: #666;
}

.effect-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.effect-item.positive .effect-value {
  color: #52c41a;
}

.effect-item.negative .effect-value {
  color: #ff4d4f;
}

.empty-state {
  padding: 30px;
  text-align: center;
  color: #999;
}
</style>
