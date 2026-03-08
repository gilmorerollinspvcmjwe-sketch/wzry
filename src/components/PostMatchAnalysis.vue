<template>
  <div class="post-match-analysis">
    <div class="analysis-header">
      <h3>赛后分析</h3>
      <div class="mvp-display" v-if="analysis.mvp">
        <span class="mvp-label">MVP</span>
        <span class="mvp-name">{{ analysis.mvp.playerName }}</span>
        <span class="mvp-hero">{{ analysis.mvp.heroName }}</span>
      </div>
    </div>

    <div class="analysis-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'overview'" class="overview-section">
      <div class="team-comparison">
        <div class="comparison-title">团队表现对比</div>
        <div class="comparison-chart">
          <div
            v-for="metric in comparisonMetrics"
            :key="metric.key"
            class="metric-row"
          >
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-bars">
              <div class="bar-container">
                <div
                  class="bar blue"
                  :style="{ width: analysis.teamComparison.blue[metric.key] + '%' }"
                >
                  {{ analysis.teamComparison.blue[metric.key].toFixed(0) }}
                </div>
              </div>
              <div class="bar-container">
                <div
                  class="bar red"
                  :style="{ width: analysis.teamComparison.red[metric.key] + '%' }"
                >
                  {{ analysis.teamComparison.red[metric.key].toFixed(0) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="turning-points" v-if="analysis.turningPoints.length > 0">
        <div class="section-title">转折点</div>
        <div class="points-list">
          <div
            v-for="point in analysis.turningPoints"
            :key="point.timestamp"
            class="point-item"
          >
            <div class="point-time">{{ formatTime(point.timestamp) }}</div>
            <div class="point-type" :class="point.type">
              {{ getTypeLabel(point.type) }}
            </div>
            <div class="point-desc">{{ point.description }}</div>
            <div class="point-impact" :class="point.goldSwing > 0 ? 'positive' : 'negative'">
              {{ point.goldSwing > 0 ? '+' : '' }}{{ formatGold(point.goldSwing) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'damage'" class="damage-section">
      <div class="section-title">伤害分析</div>
      <div class="damage-list">
        <div
          v-for="breakdown in sortedDamageBreakdown"
          :key="breakdown.playerId"
          class="damage-item"
        >
          <div class="damage-header">
            <span class="player-name">{{ breakdown.playerName }}</span>
            <span class="hero-name">{{ breakdown.heroName }}</span>
          </div>
          <div class="damage-total">
            总伤害: {{ formatDamage(breakdown.totalDamage) }}
          </div>
          <div class="damage-breakdown">
            <div class="breakdown-bar">
              <div
                class="physical"
                :style="{ width: (breakdown.physicalDamage / breakdown.totalDamage * 100) + '%' }"
              ></div>
              <div
                class="magic"
                :style="{ width: (breakdown.magicDamage / breakdown.totalDamage * 100) + '%' }"
              ></div>
              <div
                class="true"
                :style="{ width: (breakdown.trueDamage / breakdown.totalDamage * 100) + '%' }"
              ></div>
            </div>
            <div class="breakdown-legend">
              <span class="legend-item physical">物理 {{ formatDamage(breakdown.physicalDamage) }}</span>
              <span class="legend-item magic">魔法 {{ formatDamage(breakdown.magicDamage) }}</span>
              <span class="legend-item true">真实 {{ formatDamage(breakdown.trueDamage) }}</span>
            </div>
          </div>
          <div class="damage-details">
            <div class="detail">
              <span class="detail-label">对英雄</span>
              <span class="detail-value">{{ formatDamage(breakdown.damageToChampions) }}</span>
            </div>
            <div class="detail">
              <span class="detail-label">对建筑</span>
              <span class="detail-value">{{ formatDamage(breakdown.damageToObjectives) }}</span>
            </div>
            <div class="detail">
              <span class="detail-label">承受</span>
              <span class="detail-value">{{ formatDamage(breakdown.damageTaken) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'vision'" class="vision-section">
      <div class="section-title">视野控制</div>
      <div class="vision-list">
        <div
          v-for="vision in sortedVisionControl"
          :key="vision.playerId"
          class="vision-item"
        >
          <div class="vision-header">
            <span class="player-name">{{ vision.playerName }}</span>
            <span class="vision-score">视野得分: {{ vision.visionScore.toFixed(1) }}</span>
          </div>
          <div class="vision-stats">
            <div class="vision-stat">
              <span class="stat-icon">👁️</span>
              <span class="stat-value">{{ vision.wardsPlaced }}</span>
              <span class="stat-label">插眼</span>
            </div>
            <div class="vision-stat">
              <span class="stat-icon">🔍</span>
              <span class="stat-value">{{ vision.wardsKilled }}</span>
              <span class="stat-label">排眼</span>
            </div>
            <div class="vision-stat">
              <span class="stat-icon">🛒</span>
              <span class="stat-value">{{ vision.controlWardsBought }}</span>
              <span class="stat-label">真眼</span>
            </div>
            <div class="vision-stat">
              <span class="stat-icon">🎯</span>
              <span class="stat-value">{{ vision.detectedEnemies }}</span>
              <span class="stat-label">发现</span>
            </div>
          </div>
          <div class="coverage-bar">
            <div class="coverage-label">地图覆盖率</div>
            <div class="coverage-track">
              <div
                class="coverage-fill"
                :style="{ width: vision.mapCoverage + '%' }"
              ></div>
            </div>
            <div class="coverage-value">{{ vision.mapCoverage.toFixed(1) }}%</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'fights'" class="fights-section">
      <div class="section-title">关键团战</div>
      <div class="fights-list">
        <div
          v-for="fight in analysis.keyFights"
          :key="fight.id"
          class="fight-item"
          :class="fight.impact"
        >
          <div class="fight-header">
            <span class="fight-time">{{ formatTime(fight.timestamp) }}</span>
            <span class="fight-duration">{{ fight.duration }}秒</span>
            <span :class="['fight-result', fight.result]">
              {{ fight.result === 'blue' ? '蓝方胜' : '红方胜' }}
            </span>
          </div>
          <div class="fight-desc">{{ fight.description }}</div>
          <div class="fight-stats">
            <div class="fight-kills">
              <span class="blue-kills">{{ fight.kills.blue }}</span>
              <span class="vs">VS</span>
              <span class="red-kills">{{ fight.kills.red }}</span>
            </div>
            <div class="fight-gold">
              经济波动: {{ fight.goldSwing > 0 ? '+' : '' }}{{ formatGold(fight.goldSwing) }}
            </div>
          </div>
          <div class="fight-impact">
            <span :class="['impact-badge', fight.impact]">
              {{ getImpactLabel(fight.impact) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'heatmap'" class="heatmap-section">
      <div class="section-title">热力图分析</div>
      <div class="heatmap-selector">
        <select v-model="selectedPlayerId" class="player-select">
          <option value="">选择选手</option>
          <option
            v-for="heatmap in analysis.heatmaps"
            :key="heatmap.playerId"
            :value="heatmap.playerId"
          >
            {{ heatmap.playerName }}
          </option>
        </select>
      </div>
      <div v-if="selectedHeatmap" class="heatmap-display">
        <div class="heatmap-map">
          <div
            v-for="point in selectedHeatmap.points"
            :key="`${point.x}-${point.y}`"
            class="heatmap-point"
            :style="{
              left: point.x + '%',
              top: point.y + '%',
              opacity: point.intensity,
            }"
            :class="point.eventType"
          ></div>
        </div>
        <div class="hot-zones">
          <div class="zones-title">热点区域</div>
          <div
            v-for="zone in selectedHeatmap.hotZones"
            :key="zone.name"
            class="zone-item"
          >
            <span class="zone-name">{{ zone.name }}</span>
            <span class="zone-count">{{ zone.eventCount }} 次事件</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PostMatchAnalysis, PlayerHeatmap } from '@/types/matchVisualization';
import { IMPACT_NAMES, EVENT_TYPE_NAMES } from '@/types/matchVisualization';

const props = defineProps<{
  analysis: PostMatchAnalysis;
}>();

const activeTab = ref<'overview' | 'damage' | 'vision' | 'fights' | 'heatmap'>('overview');
const selectedPlayerId = ref<string>('');

const tabs = [
  { id: 'overview' as const, label: '总览' },
  { id: 'damage' as const, label: '伤害' },
  { id: 'vision' as const, label: '视野' },
  { id: 'fights' as const, label: '团战' },
  { id: 'heatmap' as const, label: '热力图' },
];

const comparisonMetrics = [
  { key: 'earlyGame' as const, label: '前期' },
  { key: 'midGame' as const, label: '中期' },
  { key: 'lateGame' as const, label: '后期' },
  { key: 'teamfight' as const, label: '团战' },
  { key: 'objectiveControl' as const, label: '资源' },
  { key: 'visionControl' as const, label: '视野' },
];

const sortedDamageBreakdown = computed(() => 
  [...props.analysis.damageBreakdown].sort((a, b) => b.totalDamage - a.totalDamage)
);

const sortedVisionControl = computed(() => 
  [...props.analysis.visionControl].sort((a, b) => b.visionScore - a.visionScore)
);

const selectedHeatmap = computed((): PlayerHeatmap | null => {
  if (!selectedPlayerId.value) return null;
  return props.analysis.heatmaps.find(h => h.playerId === selectedPlayerId.value) || null;
});

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatGold(gold: number): string {
  if (Math.abs(gold) >= 10000) {
    return (gold / 10000).toFixed(1) + '万';
  }
  return gold.toLocaleString();
}

function formatDamage(damage: number): string {
  if (damage >= 10000) {
    return (damage / 10000).toFixed(1) + '万';
  }
  return damage.toLocaleString();
}

function getTypeLabel(type: string): string {
  return EVENT_TYPE_NAMES[type] || type;
}

function getImpactLabel(impact: string): string {
  return IMPACT_NAMES[impact] || impact;
}
</script>

<style scoped>
.post-match-analysis {
  background: white;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.analysis-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.mvp-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  border-radius: 20px;
  color: white;
}

.mvp-label {
  font-size: 10px;
  font-weight: bold;
}

.mvp-name {
  font-size: 12px;
  font-weight: bold;
}

.mvp-hero {
  font-size: 11px;
  opacity: 0.9;
}

.analysis-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f0f0f0;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.comparison-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.comparison-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-label {
  width: 50px;
  font-size: 12px;
  color: #666;
}

.metric-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bar-container {
  height: 16px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  font-size: 10px;
  color: white;
  font-weight: bold;
  transition: width 0.3s;
}

.bar.blue {
  background: linear-gradient(90deg, #3498db, #5dade2);
}

.bar.red {
  background: linear-gradient(90deg, #e74c3c, #ec7063);
}

.turning-points {
  margin-top: 16px;
}

.points-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.point-time {
  font-size: 12px;
  font-weight: bold;
  color: #007bff;
  min-width: 40px;
}

.point-type {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.point-type.objective {
  background: #fff3cd;
  color: #856404;
}

.point-type.teamfight {
  background: #f8d7da;
  color: #721c24;
}

.point-type.pick {
  background: #d4edda;
  color: #155724;
}

.point-type.baron {
  background: #e2d5f1;
  color: #6b4c9a;
}

.point-type.dragon {
  background: #cce5ff;
  color: #004085;
}

.point-desc {
  flex: 1;
  font-size: 12px;
  color: #333;
}

.point-impact {
  font-size: 12px;
  font-weight: bold;
}

.point-impact.positive {
  color: #27ae60;
}

.point-impact.negative {
  color: #e74c3c;
}

.damage-list,
.vision-list,
.fights-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.damage-item,
.vision-item,
.fight-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.damage-header,
.vision-header,
.fight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.player-name {
  font-weight: bold;
  color: #333;
}

.hero-name {
  font-size: 12px;
  color: #666;
}

.damage-total {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.damage-breakdown {
  margin-bottom: 8px;
}

.breakdown-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.breakdown-bar .physical {
  background: #e74c3c;
}

.breakdown-bar .magic {
  background: #9b59b6;
}

.breakdown-bar .true {
  background: #f39c12;
}

.breakdown-legend {
  display: flex;
  gap: 12px;
  font-size: 10px;
}

.legend-item {
  color: #666;
}

.damage-details {
  display: flex;
  gap: 16px;
}

.detail {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 10px;
  color: #999;
}

.detail-value {
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.vision-score {
  font-size: 12px;
  font-weight: bold;
  color: #3498db;
}

.vision-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.vision-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vision-stat .stat-icon {
  font-size: 14px;
}

.vision-stat .stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.vision-stat .stat-label {
  font-size: 10px;
  color: #666;
}

.coverage-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coverage-label {
  font-size: 11px;
  color: #666;
  min-width: 60px;
}

.coverage-track {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.coverage-fill {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  transition: width 0.3s;
}

.coverage-value {
  font-size: 11px;
  font-weight: bold;
  color: #27ae60;
  min-width: 40px;
}

.fight-item.minor {
  border-left: 3px solid #95a5a6;
}

.fight-item.moderate {
  border-left: 3px solid #f39c12;
}

.fight-item.major {
  border-left: 3px solid #e67e22;
}

.fight-item.decisive {
  border-left: 3px solid #e74c3c;
}

.fight-duration {
  font-size: 11px;
  color: #666;
}

.fight-result {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.fight-result.blue {
  background: #e3f2fd;
  color: #1976d2;
}

.fight-result.red {
  background: #ffebee;
  color: #c62828;
}

.fight-desc {
  font-size: 12px;
  color: #333;
  margin-bottom: 8px;
}

.fight-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fight-kills {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blue-kills {
  font-size: 16px;
  font-weight: bold;
  color: #3498db;
}

.red-kills {
  font-size: 16px;
  font-weight: bold;
  color: #e74c3c;
}

.fight-kills .vs {
  font-size: 12px;
  color: #999;
}

.fight-gold {
  font-size: 11px;
  color: #666;
}

.fight-impact {
  margin-top: 8px;
}

.impact-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
}

.impact-badge.minor {
  background: #e2e3e5;
  color: #383d41;
}

.impact-badge.moderate {
  background: #fff3cd;
  color: #856404;
}

.impact-badge.major {
  background: #ffe0b2;
  color: #e65100;
}

.impact-badge.decisive {
  background: #f8d7da;
  color: #721c24;
}

.heatmap-selector {
  margin-bottom: 12px;
}

.player-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
}

.heatmap-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.heatmap-map {
  position: relative;
  width: 100%;
  height: 200px;
  background: #1a1a2e;
  border-radius: 8px;
  overflow: hidden;
}

.heatmap-point {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.heatmap-point.kill {
  background: #e74c3c;
}

.heatmap-point.death {
  background: #e67e22;
}

.heatmap-point.assist {
  background: #27ae60;
}

.heatmap-point.damage {
  background: #f39c12;
}

.heatmap-point.vision {
  background: #3498db;
}

.hot-zones {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
}

.zones-title {
  font-size: 12px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.zone-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.zone-item:last-child {
  border-bottom: none;
}

.zone-name {
  font-size: 12px;
  color: #333;
}

.zone-count {
  font-size: 11px;
  color: #666;
}
</style>
