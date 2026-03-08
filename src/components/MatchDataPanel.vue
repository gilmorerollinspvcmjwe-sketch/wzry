<template>
  <div class="match-data-panel">
    <div class="panel-header">
      <h3>实时数据</h3>
      <div class="time-display">{{ formatTime(currentTimestamp) }}</div>
    </div>

    <div class="team-comparison">
      <div class="team-stats blue">
        <div class="team-name">{{ blueTeamName }}</div>
        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-icon">⚔️</span>
            <span class="stat-value">{{ currentStats.blueTeam.totalKills }}</span>
            <span class="stat-label">击杀</span>
          </div>
          <div class="stat-box">
            <span class="stat-icon">💰</span>
            <span class="stat-value">{{ formatGold(currentStats.blueTeam.totalGold) }}</span>
            <span class="stat-label">经济</span>
          </div>
          <div class="stat-box">
            <span class="stat-icon">🏰</span>
            <span class="stat-value">{{ currentStats.blueTeam.towers }}</span>
            <span class="stat-label">推塔</span>
          </div>
          <div class="stat-box">
            <span class="stat-icon">🐉</span>
            <span class="stat-value">{{ currentStats.blueTeam.dragons }}</span>
            <span class="stat-label">小龙</span>
          </div>
        </div>
      </div>

      <div class="vs-divider">
        <div class="vs-text">VS</div>
        <div class="gold-diff" :class="goldDiffClass">
          {{ goldDiffText }}
        </div>
      </div>

      <div class="team-stats red">
        <div class="team-name">{{ redTeamName }}</div>
        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-icon">⚔️</span>
            <span class="stat-value">{{ currentStats.redTeam.totalKills }}</span>
            <span class="stat-label">击杀</span>
          </div>
          <div class="stat-box">
            <span class="stat-icon">💰</span>
            <span class="stat-value">{{ formatGold(currentStats.redTeam.totalGold) }}</span>
            <span class="stat-label">经济</span>
          </div>
          <div class="stat-box">
            <span class="stat-icon">🏰</span>
            <span class="stat-value">{{ currentStats.redTeam.towers }}</span>
            <span class="stat-label">推塔</span>
          </div>
          <div class="stat-box">
            <span class="stat-icon">🐉</span>
            <span class="stat-value">{{ currentStats.redTeam.dragons }}</span>
            <span class="stat-label">小龙</span>
          </div>
        </div>
      </div>
    </div>

    <div class="players-section">
      <div class="section-header">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'overview'" class="players-overview">
        <div class="team-column blue">
          <div
            v-for="player in bluePlayers"
            :key="player.playerId"
            class="player-row"
            @click="selectPlayer(player)"
          >
            <div class="player-position">{{ getPositionName(player.position) }}</div>
            <div class="player-hero">{{ player.heroName }}</div>
            <div class="player-name">{{ player.playerName }}</div>
            <div class="player-kda">
              <span class="kills">{{ player.kills }}</span>
              <span class="separator">/</span>
              <span class="deaths">{{ player.deaths }}</span>
              <span class="separator">/</span>
              <span class="assists">{{ player.assists }}</span>
            </div>
            <div class="player-gold">{{ formatGold(player.gold) }}</div>
          </div>
        </div>

        <div class="team-column red">
          <div
            v-for="player in redPlayers"
            :key="player.playerId"
            class="player-row"
            @click="selectPlayer(player)"
          >
            <div class="player-position">{{ getPositionName(player.position) }}</div>
            <div class="player-hero">{{ player.heroName }}</div>
            <div class="player-name">{{ player.playerName }}</div>
            <div class="player-kda">
              <span class="kills">{{ player.kills }}</span>
              <span class="separator">/</span>
              <span class="deaths">{{ player.deaths }}</span>
              <span class="separator">/</span>
              <span class="assists">{{ player.assists }}</span>
            </div>
            <div class="player-gold">{{ formatGold(player.gold) }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'damage'" class="damage-chart">
        <div class="chart-header">
          <span>选手伤害对比</span>
        </div>
        <div class="damage-bars">
          <div
            v-for="player in sortedByDamage"
            :key="player.playerId"
            class="damage-row"
          >
            <div class="damage-player">
              <span :class="['team-dot', player.team]"></span>
              <span class="player-name">{{ player.playerName }}</span>
            </div>
            <div class="damage-bar-container">
              <div
                class="damage-bar"
                :class="player.team"
                :style="{ width: getDamageWidth(player.damage) }"
              >
                <span class="damage-value">{{ formatDamage(player.damage) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'gold'" class="gold-chart">
        <div class="chart-header">
          <span>选手经济对比</span>
        </div>
        <div class="gold-bars">
          <div
            v-for="player in sortedByGold"
            :key="player.playerId"
            class="gold-row"
          >
            <div class="gold-player">
              <span :class="['team-dot', player.team]"></span>
              <span class="player-name">{{ player.playerName }}</span>
            </div>
            <div class="gold-bar-container">
              <div
                class="gold-bar"
                :class="player.team"
                :style="{ width: getGoldWidth(player.gold) }"
              >
                <span class="gold-value">{{ formatGold(player.gold) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedPlayer" class="player-detail">
      <div class="detail-header">
        <span :class="['team-indicator', selectedPlayer.team]"></span>
        <span class="player-name">{{ selectedPlayer.playerName }}</span>
        <span class="hero-name">{{ selectedPlayer.heroName }}</span>
        <button class="close-btn" @click="selectedPlayer = null">×</button>
      </div>
      <div class="detail-stats">
        <div class="detail-stat">
          <span class="stat-label">KDA</span>
          <span class="stat-value">{{ selectedPlayer.kills }}/{{ selectedPlayer.deaths }}/{{ selectedPlayer.assists }}</span>
        </div>
        <div class="detail-stat">
          <span class="stat-label">经济</span>
          <span class="stat-value">{{ formatGold(selectedPlayer.gold) }}</span>
        </div>
        <div class="detail-stat">
          <span class="stat-label">伤害</span>
          <span class="stat-value">{{ formatDamage(selectedPlayer.damage) }}</span>
        </div>
        <div class="detail-stat">
          <span class="stat-label">补刀</span>
          <span class="stat-value">{{ selectedPlayer.cs }}</span>
        </div>
        <div class="detail-stat">
          <span class="stat-label">等级</span>
          <span class="stat-value">{{ selectedPlayer.level }}</span>
        </div>
        <div class="detail-stat">
          <span class="stat-label">参团率</span>
          <span class="stat-value">{{ selectedPlayer.killParticipation.toFixed(1) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LiveStats, PlayerLiveStats, TeamLiveStats } from '@/types/matchVisualization';
import { POSITION_NAMES } from '@/types/matchVisualization';

const props = defineProps<{
  liveStats: LiveStats[];
  currentTimestamp: number;
  blueTeamName?: string;
  redTeamName?: string;
}>();

const emit = defineEmits<{
  (e: 'playerSelect', player: PlayerLiveStats): void;
}>();

const activeTab = ref<'overview' | 'damage' | 'gold'>('overview');
const selectedPlayer = ref<PlayerLiveStats | null>(null);

const tabs = [
  { id: 'overview' as const, label: '总览' },
  { id: 'damage' as const, label: '伤害' },
  { id: 'gold' as const, label: '经济' },
];

const currentStats = computed((): LiveStats => {
  const stats = props.liveStats.find(s => s.timestamp >= props.currentTimestamp);
  return stats || props.liveStats[props.liveStats.length - 1] || {
    timestamp: 0,
    blueTeam: createEmptyTeamStats('blue'),
    redTeam: createEmptyTeamStats('red'),
    players: [],
  };
});

function createEmptyTeamStats(team: 'blue' | 'red'): TeamLiveStats {
  return {
    team,
    totalKills: 0,
    totalDeaths: 0,
    totalGold: 0,
    totalDamage: 0,
    towers: 0,
    dragons: 0,
    barons: 0,
    inhibitors: 0,
    visionScore: 0,
  };
}

const bluePlayers = computed(() => 
  currentStats.value.players.filter(p => p.team === 'blue')
);

const redPlayers = computed(() => 
  currentStats.value.players.filter(p => p.team === 'red')
);

const sortedByDamage = computed(() => 
  [...currentStats.value.players].sort((a, b) => b.damage - a.damage)
);

const sortedByGold = computed(() => 
  [...currentStats.value.players].sort((a, b) => b.gold - a.gold)
);

const maxDamage = computed(() => 
  Math.max(...currentStats.value.players.map(p => p.damage), 1)
);

const maxGold = computed(() => 
  Math.max(...currentStats.value.players.map(p => p.gold), 1)
);

const goldDiff = computed(() => 
  currentStats.value.blueTeam.totalGold - currentStats.value.redTeam.totalGold
);

const goldDiffClass = computed(() => {
  if (goldDiff.value > 0) return 'blue-lead';
  if (goldDiff.value < 0) return 'red-lead';
  return 'even';
});

const goldDiffText = computed(() => {
  const diff = Math.abs(goldDiff.value);
  const prefix = goldDiff.value > 0 ? '蓝方领先' : goldDiff.value < 0 ? '红方领先' : '经济持平';
  return `${prefix} ${formatGold(diff)}`;
});

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatGold(gold: number): string {
  if (gold >= 10000) {
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

function getPositionName(position: string): string {
  return POSITION_NAMES[position] || position;
}

function getDamageWidth(damage: number): string {
  return `${(damage / maxDamage.value) * 100}%`;
}

function getGoldWidth(gold: number): string {
  return `${(gold / maxGold.value) * 100}%`;
}

function selectPlayer(player: PlayerLiveStats) {
  selectedPlayer.value = player;
  emit('playerSelect', player);
}
</script>

<style scoped>
.match-data-panel {
  background: white;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.time-display {
  font-size: 16px;
  font-weight: bold;
  color: #007bff;
  font-family: monospace;
}

.team-comparison {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.team-stats {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
}

.team-stats.blue {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
}

.team-stats.red {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
}

.team-name {
  font-size: 12px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}

.stat-icon {
  font-size: 14px;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 10px;
  color: #666;
}

.vs-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.vs-text {
  font-size: 14px;
  font-weight: bold;
  color: #999;
}

.gold-diff {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 10px;
  margin-top: 8px;
}

.gold-diff.blue-lead {
  background: #3498db;
  color: white;
}

.gold-diff.red-lead {
  background: #e74c3c;
  color: white;
}

.gold-diff.even {
  background: #f0f0f0;
  color: #666;
}

.players-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tab-btn {
  flex: 1;
  padding: 8px;
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

.players-overview {
  display: flex;
  gap: 12px;
  flex: 1;
}

.team-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.player-row:hover {
  background: #f0f0f0;
}

.player-position {
  font-size: 10px;
  color: #999;
  min-width: 30px;
}

.player-hero {
  font-size: 11px;
  color: #666;
  min-width: 50px;
}

.player-name {
  flex: 1;
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.player-kda {
  font-size: 11px;
  min-width: 50px;
  text-align: center;
}

.player-kda .kills {
  color: #27ae60;
}

.player-kda .deaths {
  color: #e74c3c;
}

.player-kda .assists {
  color: #3498db;
}

.player-kda .separator {
  color: #ccc;
  margin: 0 2px;
}

.player-gold {
  font-size: 11px;
  font-weight: bold;
  color: #f39c12;
  min-width: 40px;
  text-align: right;
}

.damage-chart,
.gold-chart {
  flex: 1;
}

.chart-header {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.damage-bars,
.gold-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.damage-row,
.gold-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.damage-player,
.gold-player {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 80px;
}

.team-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.team-dot.blue {
  background: #3498db;
}

.team-dot.red {
  background: #e74c3c;
}

.damage-bar-container,
.gold-bar-container {
  flex: 1;
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.damage-bar,
.gold-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  transition: width 0.3s;
}

.damage-bar.blue,
.gold-bar.blue {
  background: linear-gradient(90deg, #3498db, #5dade2);
}

.damage-bar.red,
.gold-bar.red {
  background: linear-gradient(90deg, #e74c3c, #ec7063);
}

.damage-value,
.gold-value {
  font-size: 10px;
  color: white;
  font-weight: bold;
}

.player-detail {
  margin-top: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.team-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.team-indicator.blue {
  background: #3498db;
}

.team-indicator.red {
  background: #e74c3c;
}

.detail-header .player-name {
  font-weight: bold;
  color: #333;
}

.detail-header .hero-name {
  font-size: 12px;
  color: #666;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.detail-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.detail-stat .stat-label {
  font-size: 10px;
  color: #999;
  margin-bottom: 4px;
}

.detail-stat .stat-value {
  font-size: 12px;
  font-weight: bold;
  color: #333;
}
</style>
