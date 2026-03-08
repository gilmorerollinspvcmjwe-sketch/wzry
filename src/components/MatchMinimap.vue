<template>
  <div class="match-minimap">
    <div class="minimap-header">
      <h3>小地图</h3>
      <div class="time-display">
        {{ formatTime(currentTimestamp) }}
      </div>
    </div>

    <div class="minimap-container" ref="minimapRef">
      <div class="minimap-map">
        <div class="map-background">
          <div class="lane lane-top"></div>
          <div class="lane lane-mid"></div>
          <div class="lane lane-bot"></div>
          <div class="jungle jungle-blue"></div>
          <div class="jungle jungle-red"></div>
          <div class="river"></div>
        </div>

        <div
          v-for="objective in currentData.objectives"
          :key="objective.id"
          :class="['objective', objective.type, objective.status]"
          :style="getPositionStyle(objective.position)"
          :title="getObjectiveLabel(objective)"
        >
          <span class="objective-icon">{{ getObjectiveIcon(objective.type) }}</span>
        </div>

        <div
          v-for="event in currentData.events"
          :key="event.id"
          class="event-marker"
          :style="getPositionStyle(event.position)"
          :class="event.type"
        >
          <span class="event-icon">{{ getEventIcon(event.type) }}</span>
        </div>

        <div
          v-for="player in currentData.players"
          :key="player.playerId"
          :class="['player-marker', player.team, { dead: !player.isAlive, selected: selectedPlayerId === player.playerId }]"
          :style="getPositionStyle(player.position)"
          @click="selectPlayer(player)"
        >
          <div class="player-icon">
            {{ getPositionInitial(player.heroName) }}
          </div>
          <div class="player-health" :style="{ width: player.health + '%' }"></div>
          <div class="player-name-tooltip">
            {{ player.playerName }} ({{ player.heroName }})
          </div>
        </div>
      </div>
    </div>

    <div class="minimap-controls">
      <button class="control-btn" @click="togglePlayback" :disabled="!isPlaying">
        {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
      </button>
      <input
        type="range"
        class="timeline-slider"
        :min="0"
        :max="totalDuration"
        :value="currentTimestamp"
        @input="seekTo($event)"
      />
      <div class="speed-control">
        <button
          v-for="s in speeds"
          :key="s"
          :class="['speed-btn', { active: speed === s }]"
          @click="speed = s"
        >
          {{ s }}x
        </button>
      </div>
    </div>

    <div v-if="selectedPlayer" class="player-info">
      <div class="player-header">
        <span :class="['team-indicator', selectedPlayer.team]"></span>
        <span class="player-name">{{ selectedPlayer.playerName }}</span>
        <span class="hero-name">{{ selectedPlayer.heroName }}</span>
      </div>
      <div class="player-stats">
        <div class="stat">
          <span class="stat-label">状态</span>
          <span :class="['stat-value', { dead: !selectedPlayer.isAlive }]">
            {{ selectedPlayer.isAlive ? '存活' : '死亡' }}
          </span>
        </div>
        <div class="stat">
          <span class="stat-label">血量</span>
          <span class="stat-value">{{ selectedPlayer.health }}%</span>
        </div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <span class="legend-icon blue">●</span>
        <span class="legend-label">蓝方</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon red">●</span>
        <span class="legend-label">红方</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon dragon">🐉</span>
        <span class="legend-label">小龙</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon baron">👹</span>
        <span class="legend-label">大龙</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { MinimapData, MinimapPlayer, MinimapObjective } from '@/types/matchVisualization';

const props = defineProps<{
  minimapData: MinimapData[];
  duration: number;
}>();

const emit = defineEmits<{
  (e: 'timestampChange', timestamp: number): void;
  (e: 'playerSelect', player: MinimapPlayer): void;
}>();

const minimapRef = ref<HTMLElement | null>(null);
const currentTimestamp = ref(0);
const isPlaying = ref(false);
const speed = ref(1);
const speeds = [0.5, 1, 2, 4];
const selectedPlayerId = ref<string | null>(null);

let playbackInterval: ReturnType<typeof setInterval> | null = null;

const totalDuration = computed(() => props.duration);

const currentData = computed((): MinimapData => {
  const data = props.minimapData.find(d => d.timestamp >= currentTimestamp.value);
  return data || props.minimapData[props.minimapData.length - 1] || {
    timestamp: 0,
    players: [],
    objectives: [],
    events: [],
  };
});

const selectedPlayer = computed(() => {
  return currentData.value.players.find(p => p.playerId === selectedPlayerId.value);
});

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getPositionStyle(position: { x: number; y: number }) {
  return {
    left: `${position.x}%`,
    top: `${position.y}%`,
  };
}

function getPositionInitial(heroName: string): string {
  return heroName.charAt(0).toUpperCase();
}

function getObjectiveIcon(type: string): string {
  const icons: Record<string, string> = {
    dragon: '🐉',
    baron: '👹',
    tower: '🏰',
    inhibitor: '💎',
  };
  return icons[type] || '📍';
}

function getObjectiveLabel(objective: MinimapObjective): string {
  const statusLabels: Record<string, string> = {
    alive: '存活',
    dead: '已击杀',
    contested: '争夺中',
  };
  return `${objective.type} - ${statusLabels[objective.status]}`;
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    kill: '💀',
    assist: '🤝',
    objective: '🎯',
    teamfight: '⚔️',
  };
  return icons[type] || '📍';
}

function selectPlayer(player: MinimapPlayer) {
  selectedPlayerId.value = player.playerId;
  emit('playerSelect', player);
}

function togglePlayback() {
  isPlaying.value = !isPlaying.value;
  
  if (isPlaying.value) {
    startPlayback();
  } else {
    stopPlayback();
  }
}

function startPlayback() {
  if (playbackInterval) {
    clearInterval(playbackInterval);
  }
  
  playbackInterval = setInterval(() => {
    currentTimestamp.value += speed.value;
    
    if (currentTimestamp.value >= totalDuration.value) {
      currentTimestamp.value = 0;
    }
    
    emit('timestampChange', currentTimestamp.value);
  }, 1000);
}

function stopPlayback() {
  if (playbackInterval) {
    clearInterval(playbackInterval);
    playbackInterval = null;
  }
}

function seekTo(event: Event) {
  const target = event.target as HTMLInputElement;
  currentTimestamp.value = parseInt(target.value, 10);
  emit('timestampChange', currentTimestamp.value);
}

watch(isPlaying, (playing) => {
  if (playing) {
    startPlayback();
  } else {
    stopPlayback();
  }
});

onMounted(() => {
  if (props.minimapData.length > 0) {
    currentTimestamp.value = props.minimapData[0].timestamp;
  }
});

onUnmounted(() => {
  stopPlayback();
});
</script>

<style scoped>
.match-minimap {
  background: white;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.minimap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.minimap-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.time-display {
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
  font-family: monospace;
}

.minimap-container {
  flex: 1;
  min-height: 200px;
  margin-bottom: 12px;
}

.minimap-map {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1a2e;
  border-radius: 8px;
  overflow: hidden;
}

.map-background {
  position: absolute;
  inset: 0;
}

.lane {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
}

.lane-top {
  width: 4px;
  height: 40%;
  top: 5%;
  left: 15%;
  transform: rotate(-45deg);
  transform-origin: top left;
}

.lane-mid {
  width: 4px;
  height: 70%;
  top: 15%;
  left: 15%;
  transform: rotate(45deg);
  transform-origin: top left;
}

.lane-bot {
  width: 4px;
  height: 40%;
  bottom: 5%;
  right: 15%;
  transform: rotate(-45deg);
  transform-origin: bottom right;
}

.jungle {
  position: absolute;
  width: 35%;
  height: 35%;
  border-radius: 50%;
  opacity: 0.2;
}

.jungle-blue {
  bottom: 5%;
  left: 5%;
  background: #3498db;
}

.jungle-red {
  top: 5%;
  right: 5%;
  background: #e74c3c;
}

.river {
  position: absolute;
  width: 80%;
  height: 4px;
  top: 50%;
  left: 10%;
  background: linear-gradient(90deg, transparent, #3498db, #e74c3c, transparent);
  transform: translateY(-50%);
}

.objective {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  font-size: 12px;
  z-index: 10;
}

.objective.dragon {
  background: rgba(52, 152, 219, 0.8);
}

.objective.baron {
  background: rgba(155, 89, 182, 0.8);
}

.objective.tower {
  background: rgba(241, 196, 15, 0.8);
}

.objective.inhibitor {
  background: rgba(46, 204, 113, 0.8);
}

.objective.dead {
  opacity: 0.4;
}

.objective.contested {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
}

.event-marker {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  font-size: 10px;
  z-index: 15;
  animation: fadeIn 0.3s;
}

.event-marker.kill {
  background: rgba(231, 76, 60, 0.9);
}

.event-marker.assist {
  background: rgba(46, 204, 113, 0.9);
}

.event-marker.objective {
  background: rgba(241, 196, 15, 0.9);
}

.event-marker.teamfight {
  background: rgba(155, 89, 182, 0.9);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.player-marker {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s;
}

.player-marker.blue {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: 2px solid #3498db;
}

.player-marker.red {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: 2px solid #e74c3c;
}

.player-marker.dead {
  opacity: 0.3;
}

.player-marker.selected {
  transform: translate(-50%, -50%) scale(1.3);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.player-icon {
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.player-health {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  height: 3px;
  background: #2ecc71;
  border-radius: 2px;
  transition: width 0.3s;
}

.player-name-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.player-marker:hover .player-name-tooltip {
  opacity: 1;
}

.minimap-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.control-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.control-btn:hover {
  background: #0056b3;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timeline-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: #e0e0e0;
  border-radius: 3px;
  outline: none;
}

.timeline-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
}

.speed-control {
  display: flex;
  gap: 4px;
}

.speed-btn {
  padding: 4px 8px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
}

.speed-btn.active {
  background: #007bff;
  color: white;
}

.player-info {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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

.player-name {
  font-weight: bold;
  color: #333;
}

.hero-name {
  color: #666;
  font-size: 12px;
}

.player-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 10px;
  color: #999;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.stat-value.dead {
  color: #e74c3c;
}

.legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

.legend-icon {
  font-size: 12px;
}

.legend-icon.blue {
  color: #3498db;
}

.legend-icon.red {
  color: #e74c3c;
}
</style>
