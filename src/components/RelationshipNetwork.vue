<template>
  <div class="relationship-network">
    <div class="network-header">
      <h3>选手关系网络</h3>
      <div class="legend">
        <span class="legend-item">
          <span class="legend-line friend"></span> 好友
        </span>
        <span class="legend-item">
          <span class="legend-line rival"></span> 竞争
        </span>
        <span class="legend-item">
          <span class="legend-line hostile"></span> 敌对
        </span>
      </div>
    </div>

    <div class="network-container" ref="containerRef">
      <svg :width="svgWidth" :height="svgHeight" class="network-svg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g class="edges">
          <line
            v-for="edge in edges"
            :key="edge.id"
            :x1="edge.x1"
            :y1="edge.y1"
            :x2="edge.x2"
            :y2="edge.y2"
            :class="['edge', edge.type]"
            :stroke-width="edge.width"
            @click="selectRelationship(edge.relationship)"
          />
        </g>

        <g class="nodes">
          <g
            v-for="node in nodes"
            :key="node.id"
            :transform="`translate(${node.x}, ${node.y})`"
            class="node"
            @click="selectPlayer(node.player)"
          >
            <circle
              :r="node.radius"
              :class="['node-circle', { selected: selectedPlayerId === node.id }]"
              :fill="node.color"
            />
            <text
              class="node-label"
              text-anchor="middle"
              dy="4"
              font-size="12"
            >
              {{ node.label }}
            </text>
            <text
              class="node-name"
              text-anchor="middle"
              :dy="node.radius + 15"
              font-size="11"
            >
              {{ node.name }}
            </text>
          </g>
        </g>
      </svg>
    </div>

    <div v-if="selectedRelationship" class="relationship-detail">
      <div class="detail-header">
        <span :class="['type-badge', selectedRelationship.type]">
          {{ getTypeName(selectedRelationship.type) }}
        </span>
        <span class="strength-value" :class="getStrengthClass(selectedRelationship.strength)">
          关系值: {{ selectedRelationship.strength }}
        </span>
      </div>
      <div class="detail-body">
        <div class="detail-item">
          <span class="label">互动频率:</span>
          <span class="value">{{ selectedRelationship.interactionFrequency }} 次</span>
        </div>
        <div class="detail-item">
          <span class="label">最后互动:</span>
          <span class="value">{{ formatDate(selectedRelationship.lastInteraction) }}</span>
        </div>
        <div v-if="selectedRelationship.effects.length > 0" class="effects-list">
          <div class="label">关系效果:</div>
          <div
            v-for="(effect, index) in selectedRelationship.effects"
            :key="index"
            class="effect-item"
          >
            {{ effect.description }} ({{ effect.value > 0 ? '+' : '' }}{{ effect.value }})
          </div>
        </div>
      </div>
      <div class="detail-history">
        <div class="label">历史记录:</div>
        <div class="history-list">
          <div
            v-for="(history, index) in selectedRelationship.history.slice(-5)"
            :key="index"
            class="history-item"
          >
            <span class="history-date">{{ formatDate(history.date) }}</span>
            <span class="history-desc">{{ history.description }}</span>
            <span :class="['history-change', { positive: history.change > 0, negative: history.change < 0 }]">
              {{ history.change > 0 ? '+' : '' }}{{ history.change }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="selectedPlayer" class="player-detail">
      <div class="player-header">
        <div class="player-avatar" :style="{ background: getPlayerColor(selectedPlayer) }">
          {{ selectedPlayer.name[0] }}
        </div>
        <div class="player-info">
          <div class="player-name">{{ selectedPlayer.name }}</div>
          <div class="player-position">{{ selectedPlayer.position }}</div>
        </div>
      </div>
      <div class="player-relationships">
        <div class="label">与队友的关系:</div>
        <div
          v-for="rel in playerRelationships"
          :key="rel.player2Id"
          class="rel-item"
          @click="selectRelationship(rel)"
        >
          <span class="rel-name">{{ getPlayerName(rel) }}</span>
          <span :class="['rel-type', rel.type]">{{ getTypeName(rel.type) }}</span>
          <span class="rel-strength">{{ rel.strength }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRelationshipStore } from '@/stores/relationship';
import { useClubStore } from '@/stores/club';
import type { PlayerRelationship, RelationshipType } from '@/types/relationship';
import { RELATIONSHIP_TYPE_NAMES } from '@/types/relationship';

interface Node {
  id: string;
  name: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  player: any;
}

interface Edge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
  width: number;
  relationship: PlayerRelationship;
}

const props = defineProps<{
  clubId: string;
}>();

const relationshipStore = useRelationshipStore();
const clubStore = useClubStore();

const containerRef = ref<HTMLElement | null>(null);
const svgWidth = ref(400);
const svgHeight = ref(400);
const selectedPlayerId = ref<string | null>(null);
const selectedRelationship = ref<PlayerRelationship | null>(null);

const players = computed(() => {
  const club = clubStore.getClub(props.clubId);
  return club?.roster || [];
});

const relationships = computed(() => {
  return relationshipStore.getClubRelationships(props.clubId);
});

const nodes = computed((): Node[] => {
  const playerList = players.value;
  if (playerList.length === 0) return [];

  const centerX = svgWidth.value / 2;
  const centerY = svgHeight.value / 2;
  const radius = Math.min(svgWidth.value, svgHeight.value) * 0.35;

  return playerList.map((player: any, index: number) => {
    const angle = (index / playerList.length) * 2 * Math.PI - Math.PI / 2;
    return {
      id: player.id,
      name: player.name,
      label: player.name[0],
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      radius: 25,
      color: getPlayerColor(player),
      player,
    };
  });
});

const edges = computed((): Edge[] => {
  const nodeMap = new Map(nodes.value.map(n => [n.id, n]));
  const result: Edge[] = [];

  relationships.value.forEach(rel => {
    const node1 = nodeMap.get(rel.player1Id);
    const node2 = nodeMap.get(rel.player2Id);

    if (node1 && node2) {
      result.push({
        id: `${rel.player1Id}_${rel.player2Id}`,
        x1: node1.x,
        y1: node1.y,
        x2: node2.x,
        y2: node2.y,
        type: rel.type,
        width: Math.abs(rel.strength) / 20 + 1,
        relationship: rel,
      });
    }
  });

  return result;
});

const selectedPlayer = computed(() => {
  if (!selectedPlayerId.value) return null;
  return players.value.find((p: any) => p.id === selectedPlayerId.value);
});

const playerRelationships = computed(() => {
  if (!selectedPlayerId.value) return [];
  return relationshipStore.getPlayerRelationships(selectedPlayerId.value);
});

function getPlayerColor(player: any): string {
  const colors: Record<string, string> = {
    top: '#e74c3c',
    jungle: '#27ae60',
    mid: '#9b59b6',
    adc: '#f39c12',
    support: '#3498db',
  };
  return colors[player.position] || '#95a5a6';
}

function getTypeName(type: RelationshipType): string {
  return RELATIONSHIP_TYPE_NAMES[type] || type;
}

function getStrengthClass(strength: number): string {
  if (strength >= 50) return 'excellent';
  if (strength >= 20) return 'good';
  if (strength >= -20) return 'neutral';
  if (strength >= -50) return 'poor';
  return 'bad';
}

function formatDate(date: Date): string {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getPlayerName(rel: PlayerRelationship): string {
  const player = players.value.find(
    (p: any) => p.id === rel.player1Id || p.id === rel.player2Id
  );
  return player?.name || '未知';
}

function selectPlayer(player: any) {
  selectedPlayerId.value = player.id;
  selectedRelationship.value = null;
}

function selectRelationship(rel: PlayerRelationship) {
  selectedRelationship.value = rel;
}

function updateSize() {
  if (containerRef.value) {
    svgWidth.value = containerRef.value.clientWidth;
    svgHeight.value = Math.max(300, containerRef.value.clientHeight);
  }
}

onMounted(() => {
  updateSize();
  window.addEventListener('resize', updateSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateSize);
});
</script>

<style scoped>
.relationship-network {
  background: white;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.network-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.network-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-line {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.legend-line.friend {
  background: #27ae60;
}

.legend-line.rival {
  background: #f39c12;
}

.legend-line.hostile {
  background: #e74c3c;
}

.network-container {
  flex: 1;
  min-height: 300px;
  position: relative;
  overflow: hidden;
}

.network-svg {
  display: block;
}

.edge {
  stroke-linecap: round;
  cursor: pointer;
  transition: stroke-width 0.2s;
}

.edge:hover {
  stroke-width: 5 !important;
}

.edge.friend {
  stroke: #27ae60;
  opacity: 0.7;
}

.edge.neutral {
  stroke: #95a5a6;
  opacity: 0.5;
}

.edge.rival {
  stroke: #f39c12;
  opacity: 0.7;
}

.edge.hostile {
  stroke: #e74c3c;
  opacity: 0.8;
}

.edge.student,
.edge.mentor {
  stroke: #3498db;
  opacity: 0.7;
}

.node {
  cursor: pointer;
  transition: transform 0.2s;
}

.node:hover {
  transform: scale(1.1);
}

.node-circle {
  stroke: white;
  stroke-width: 3;
  transition: all 0.2s;
}

.node-circle.selected {
  stroke-width: 4;
  filter: url(#glow);
}

.node-label {
  fill: white;
  font-weight: bold;
  pointer-events: none;
}

.node-name {
  fill: #333;
  pointer-events: none;
}

.relationship-detail,
.player-detail {
  margin-top: 16px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.detail-header,
.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.type-badge.friend {
  background: #d4edda;
  color: #155724;
}

.type-badge.rival {
  background: #fff3cd;
  color: #856404;
}

.type-badge.hostile {
  background: #f8d7da;
  color: #721c24;
}

.type-badge.neutral {
  background: #e2e3e5;
  color: #383d41;
}

.type-badge.mentor,
.type-badge.student {
  background: #cce5ff;
  color: #004085;
}

.strength-value {
  font-weight: bold;
}

.strength-value.excellent {
  color: #27ae60;
}

.strength-value.good {
  color: #2ecc71;
}

.strength-value.neutral {
  color: #95a5a6;
}

.strength-value.poor {
  color: #e67e22;
}

.strength-value.bad {
  color: #e74c3c;
}

.detail-body {
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 4px;
}

.detail-item .label {
  color: #666;
}

.effects-list {
  margin-top: 8px;
}

.effect-item {
  font-size: 12px;
  color: #666;
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  margin-top: 4px;
}

.detail-history .label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.history-list {
  max-height: 120px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 4px;
}

.history-date {
  color: #999;
}

.history-desc {
  flex: 1;
  margin: 0 8px;
  color: #333;
}

.history-change.positive {
  color: #27ae60;
}

.history-change.negative {
  color: #e74c3c;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: bold;
  color: #333;
}

.player-position {
  font-size: 12px;
  color: #999;
}

.player-relationships .label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.rel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;
}

.rel-item:hover {
  background: #f0f0f0;
}

.rel-name {
  font-size: 13px;
  color: #333;
}

.rel-type {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.rel-type.friend {
  background: #d4edda;
  color: #155724;
}

.rel-type.rival {
  background: #fff3cd;
  color: #856404;
}

.rel-type.hostile {
  background: #f8d7da;
  color: #721c24;
}

.rel-strength {
  font-size: 12px;
  font-weight: bold;
  color: #666;
}
</style>
