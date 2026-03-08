<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useTacticsStore } from '@/stores/tactics';
import {
  initializeTactics,
  setFormation,
  setStyle,
  setPace,
  setCorePlayer,
  getRecommendedFormation,
  calculateTacticalBonus,
} from '@/core/services/tacticsService';
import type { FormationType, TacticalStyle, PacePreference } from '@/types/tactics';
import {
  FORMATION_NAMES,
  FORMATION_DESCRIPTIONS,
  FORMATION_BONUSES,
  TACTICAL_STYLE_NAMES,
  TACTICAL_STYLE_DESCRIPTIONS,
  STYLE_BONUSES,
  PACE_NAMES,
  PACE_DESCRIPTIONS,
} from '@/types/tactics';

const router = useRouter();
const clubStore = useClubStore();
const tacticsStore = useTacticsStore();

const clubId = computed(() => clubStore.currentClub?.id || '');
const tactics = computed(() => {
  if (!clubId.value) return null;
  return tacticsStore.getTactics(clubId.value) || initializeTactics(clubId.value);
});

const roster = computed(() => clubStore.currentClub?.roster || []);
const tacticalBonus = computed(() => calculateTacticalBonus(clubId.value));

const selectedFormation = ref<FormationType>(tactics.value?.formation || 'balanced');
const selectedStyle = ref<TacticalStyle>(tactics.value?.style || 'balanced');
const selectedPace = ref<PacePreference>(tactics.value?.pace || 'mid-game');
const selectedCorePlayer = ref<string | null>(tactics.value?.corePlayer || null);

const showFormationDetail = ref(false);
const showStyleDetail = ref(false);
const showPaceDetail = ref(false);

const formations: FormationType[] = ['four-protect-one', 'jungle-core', 'dual-carry', 'mid-jungle', 'global'];
const styles: TacticalStyle[] = ['aggressive', 'defensive', 'balanced', 'teamfight', 'split'];
const paces: PacePreference[] = ['early-game', 'mid-game', 'late-game'];

const recommendedFormation = computed(() => getRecommendedFormation(clubId.value));

onMounted(() => {
  if (clubId.value) {
    initializeTactics(clubId.value);
    selectedFormation.value = tactics.value?.formation || 'balanced';
    selectedStyle.value = tactics.value?.style || 'balanced';
    selectedPace.value = tactics.value?.pace || 'mid-game';
    selectedCorePlayer.value = tactics.value?.corePlayer || null;
  }
});

const selectFormation = (formation: FormationType) => {
  selectedFormation.value = formation;
  const result = setFormation(clubId.value, formation);
  if (result.success) {
    showFormationDetail.value = false;
  }
};

const selectStyle = (style: TacticalStyle) => {
  selectedStyle.value = style;
  const result = setStyle(clubId.value, style);
  if (result.success) {
    showStyleDetail.value = false;
  }
};

const selectPace = (pace: PacePreference) => {
  selectedPace.value = pace;
  const result = setPace(clubId.value, pace);
  if (result.success) {
    showPaceDetail.value = false;
  }
};

const selectCorePlayer = (playerId: string | null) => {
  selectedCorePlayer.value = playerId;
  setCorePlayer(clubId.value, playerId);
};

const goBack = () => {
  router.push('/tactics');
};

const getPlayerPower = (playerId: string) => {
  const player = roster.value.find(p => p.id === playerId);
  return player?.getTotalPower() || 0;
};

const getBonusColor = (value: number) => {
  if (value >= 15) return '#52c41a';
  if (value >= 10) return '#1890ff';
  if (value >= 5) return '#faad14';
  return '#999';
};
</script>

<template>
  <div class="formation-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <h2 class="page-title">阵容体系</h2>
    </div>

    <div class="current-config">
      <div class="config-item">
        <span class="config-label">当前阵容</span>
        <span class="config-value">{{ FORMATION_NAMES[selectedFormation] }}</span>
      </div>
      <div class="config-item">
        <span class="config-label">战术风格</span>
        <span class="config-value">{{ TACTICAL_STYLE_NAMES[selectedStyle] }}</span>
      </div>
      <div class="config-item">
        <span class="config-label">节奏偏好</span>
        <span class="config-value">{{ PACE_NAMES[selectedPace] }}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3 class="section-title">阵容体系</h3>
        <span class="recommendation" v-if="recommendedFormation !== selectedFormation">
          推荐: {{ FORMATION_NAMES[recommendedFormation] }}
        </span>
      </div>
      <div class="formation-grid">
        <div 
          v-for="formation in formations" 
          :key="formation"
          class="formation-card"
          :class="{ 
            selected: selectedFormation === formation,
            recommended: recommendedFormation === formation 
          }"
          @click="selectFormation(formation)"
        >
          <div class="formation-icon">{{ FORMATION_NAMES[formation].charAt(0) }}</div>
          <div class="formation-name">{{ FORMATION_NAMES[formation] }}</div>
          <div class="formation-desc">{{ FORMATION_DESCRIPTIONS[formation] }}</div>
          <div class="formation-bonuses">
            <span v-for="(value, key) in FORMATION_BONUSES[formation]" :key="key" class="bonus-tag">
              {{ key }}: +{{ value }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">战术风格</h3>
      <div class="style-grid">
        <div 
          v-for="style in styles" 
          :key="style"
          class="style-card"
          :class="{ selected: selectedStyle === style }"
          @click="selectStyle(style)"
        >
          <div class="style-name">{{ TACTICAL_STYLE_NAMES[style] }}</div>
          <div class="style-desc">{{ TACTICAL_STYLE_DESCRIPTIONS[style] }}</div>
          <div class="style-bonuses">
            <span v-for="(value, key) in STYLE_BONUSES[style]" :key="key" class="bonus-tag">
              {{ key }}: +{{ value }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">节奏偏好</h3>
      <div class="pace-grid">
        <div 
          v-for="pace in paces" 
          :key="pace"
          class="pace-card"
          :class="{ selected: selectedPace === pace }"
          @click="selectPace(pace)"
        >
          <div class="pace-name">{{ PACE_NAMES[pace] }}</div>
          <div class="pace-desc">{{ PACE_DESCRIPTIONS[pace] }}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">核心选手</h3>
      <div class="core-player-section">
        <div 
          class="player-card"
          :class="{ selected: selectedCorePlayer === null }"
          @click="selectCorePlayer(null)"
        >
          <div class="player-name">自动选择</div>
          <div class="player-desc">根据阵容自动确定核心</div>
        </div>
        <div 
          v-for="player in roster" 
          :key="player.id"
          class="player-card"
          :class="{ selected: selectedCorePlayer === player.id }"
          @click="selectCorePlayer(player.id)"
        >
          <div class="player-header">
            <span class="player-name">{{ player.name }}</span>
            <span class="player-position">{{ player.position }}</span>
          </div>
          <div class="player-power">实力: {{ player.getTotalPower() }}</div>
          <div class="player-heroes" v-if="player.heroPreference.favoriteHeroes.length">
            擅长: {{ player.heroPreference.favoriteHeroes.slice(0, 3).join(', ') }}
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">战术加成预览</h3>
      <div class="bonus-preview">
        <div v-for="(value, key) in tacticalBonus" :key="key" class="preview-item">
          <span class="preview-label">{{ key }}</span>
          <div class="preview-bar">
            <div 
              class="preview-fill" 
              :style="{ 
                width: Math.min(100, value * 2) + '%',
                backgroundColor: getBonusColor(value)
              }"
            ></div>
          </div>
          <span class="preview-value" :style="{ color: getBonusColor(value) }">+{{ value }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.formation-page {
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
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f0f0f0;
  font-size: 18px;
  cursor: pointer;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.current-config {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.config-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.config-item:last-child {
  border-bottom: none;
}

.config-label {
  color: #999;
  font-size: 13px;
}

.config-value {
  color: #333;
  font-size: 13px;
  font-weight: 600;
}

.section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.recommendation {
  font-size: 12px;
  color: #007bff;
  background: rgba(0, 123, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.formation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.formation-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.formation-card.selected {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.formation-card.recommended {
  border-color: #52c41a;
}

.formation-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.formation-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.formation-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.4;
}

.formation-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.bonus-tag {
  font-size: 10px;
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.style-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.style-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.style-card.selected {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.style-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.style-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.style-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.pace-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.pace-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
}

.pace-card.selected {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.pace-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.pace-desc {
  font-size: 11px;
  color: #666;
}

.core-player-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.player-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.player-card.selected {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.player-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.player-position {
  font-size: 11px;
  color: #007bff;
  background: rgba(0, 123, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.player-power {
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
}

.player-heroes {
  font-size: 11px;
  color: #999;
}

.player-desc {
  font-size: 12px;
  color: #666;
}

.bonus-preview {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-label {
  width: 80px;
  font-size: 12px;
  color: #666;
}

.preview-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.preview-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.preview-value {
  width: 50px;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
}
</style>
