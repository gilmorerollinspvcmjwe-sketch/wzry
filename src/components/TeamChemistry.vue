<template>
  <div class="team-chemistry">
    <div class="chemistry-header">
      <h3>团队化学反应</h3>
      <button class="refresh-btn" @click="refreshChemistry">
        🔄 刷新
      </button>
    </div>

    <div class="chemistry-overview">
      <div class="chemistry-score">
        <div class="score-circle" :class="getChemistryClass(chemistry.overallChemistry)">
          <span class="score-value">{{ chemistry.overallChemistry }}</span>
          <span class="score-label">团队化学反应</span>
        </div>
      </div>
      <div class="atmosphere-indicator">
        <div class="atmosphere-label">团队氛围</div>
        <div :class="['atmosphere-badge', chemistry.atmosphere]">
          {{ getAtmosphereName(chemistry.atmosphere) }}
        </div>
      </div>
    </div>

    <div class="chemistry-stats">
      <div class="stat-item">
        <span class="stat-icon">👥</span>
        <span class="stat-label">关系数量</span>
        <span class="stat-value">{{ chemistry.relationships.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">⚔️</span>
        <span class="stat-label">活跃冲突</span>
        <span class="stat-value conflict">{{ activeConflicts.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">💡</span>
        <span class="stat-label">建议数量</span>
        <span class="stat-value">{{ chemistry.recommendations.length }}</span>
      </div>
    </div>

    <div v-if="activeConflicts.length > 0" class="conflicts-section">
      <div class="section-header">
        <h4>⚠️ 活跃冲突</h4>
      </div>
      <div class="conflicts-list">
        <div
          v-for="conflict in activeConflicts"
          :key="conflict.id"
          class="conflict-item"
        >
          <div class="conflict-header">
            <span class="conflict-players">
              {{ getPlayerName(conflict.player1Id) }} vs {{ getPlayerName(conflict.player2Id) }}
            </span>
            <span :class="['severity-badge', getSeverityClass(conflict.severity)]">
              严重度: {{ conflict.severity.toFixed(1) }}
            </span>
          </div>
          <div class="conflict-body">
            <div class="conflict-type">
              类型: {{ getConflictTypeName(conflict.type) }}
            </div>
            <div class="conflict-desc">{{ conflict.description }}</div>
          </div>
          <div class="conflict-actions">
            <button class="resolve-btn" @click="resolveConflict(conflict)">
              🤝 调解
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="chemistry.recommendations.length > 0" class="recommendations-section">
      <div class="section-header">
        <h4>📋 改善建议</h4>
      </div>
      <div class="recommendations-list">
        <div
          v-for="(rec, index) in chemistry.recommendations"
          :key="index"
          :class="['recommendation-item', rec.priority]"
        >
          <div class="rec-header">
            <span :class="['priority-badge', rec.priority]">
              {{ getPriorityName(rec.priority) }}
            </span>
            <span class="rec-type">{{ getRecommendationTypeName(rec.type) }}</span>
          </div>
          <div class="rec-desc">{{ rec.description }}</div>
          <div class="rec-improvement">
            预期提升: +{{ rec.expectedImprovement }} 点
          </div>
          <button class="apply-btn" @click="applyRecommendation(rec)">
            执行建议
          </button>
        </div>
      </div>
    </div>

    <div class="relationship-summary">
      <div class="section-header">
        <h4>📊 关系分布</h4>
      </div>
      <div class="distribution-chart">
        <div
          v-for="(count, type) in relationshipDistribution"
          :key="type"
          class="distribution-bar"
        >
          <div class="bar-label">{{ getTypeName(type as RelationshipType) }}</div>
          <div class="bar-container">
            <div
              :class="['bar-fill', type]"
              :style="{ width: getBarWidth(count) }"
            ></div>
          </div>
          <div class="bar-count">{{ count }}</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <button class="action-btn team-building" @click="doTeamBuilding">
        🎉 团建活动
      </button>
      <button class="action-btn meeting" @click="doTeamMeeting">
        🗣️ 团队会议
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRelationshipStore } from '@/stores/relationship';
import { useClubStore } from '@/stores/club';
import type {
  TeamChemistry,
  TeamConflict,
  ChemistryRecommendation,
  RelationshipType,
} from '@/types/relationship';
import {
  TEAM_ATMOSPHERE_NAMES,
  RELATIONSHIP_TYPE_NAMES,
  CONFLICT_TYPE_NAMES,
} from '@/types/relationship';

const props = defineProps<{
  clubId: string;
}>();

const emit = defineEmits<{
  (e: 'teamBuilding'): void;
  (e: 'meeting'): void;
  (e: 'conflictResolved', conflict: TeamConflict): void;
}>();

const relationshipStore = useRelationshipStore();
const clubStore = useClubStore();

const chemistry = computed((): TeamChemistry => {
  return relationshipStore.getTeamChemistry(props.clubId) || {
    clubId: props.clubId,
    overallChemistry: 50,
    relationships: [],
    atmosphere: 'neutral',
    conflicts: [],
    recommendations: [],
    lastUpdated: new Date(),
  };
});

const activeConflicts = computed(() => {
  return chemistry.value.conflicts.filter(
    c => c.status === 'active' || c.status === 'escalating'
  );
});

const relationshipDistribution = computed(() => {
  const distribution: Record<string, number> = {
    friend: 0,
    rival: 0,
    mentor: 0,
    student: 0,
    neutral: 0,
    hostile: 0,
  };

  chemistry.value.relationships.forEach(rel => {
    distribution[rel.type] = (distribution[rel.type] || 0) + 1;
  });

  return distribution;
});

const players = computed(() => {
  const club = clubStore.getClub(props.clubId);
  return club?.roster || [];
});

function getPlayerName(playerId: string): string {
  const player = players.value.find((p: any) => p.id === playerId);
  return player?.name || '未知选手';
}

function getAtmosphereName(atmosphere: string): string {
  return TEAM_ATMOSPHERE_NAMES[atmosphere as keyof typeof TEAM_ATMOSPHERE_NAMES] || atmosphere;
}

function getTypeName(type: RelationshipType): string {
  return RELATIONSHIP_TYPE_NAMES[type] || type;
}

function getConflictTypeName(type: string): string {
  return CONFLICT_TYPE_NAMES[type as keyof typeof CONFLICT_TYPE_NAMES] || type;
}

function getPriorityName(priority: string): string {
  const names: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  };
  return names[priority] || priority;
}

function getRecommendationTypeName(type: string): string {
  const names: Record<string, string> = {
    team_building: '团建活动',
    mediation: '调解',
    role_adjustment: '角色调整',
    communication: '沟通改善',
    rest: '休息调整',
  };
  return names[type] || type;
}

function getChemistryClass(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  if (score >= 20) return 'poor';
  return 'bad';
}

function getSeverityClass(severity: number): string {
  if (severity >= 4) return 'critical';
  if (severity >= 2) return 'high';
  return 'medium';
}

function getBarWidth(count: number): string {
  const total = chemistry.value.relationships.length || 1;
  return `${(count / total) * 100}%`;
}

function refreshChemistry() {
  relationshipStore.recalculateTeamChemistry(props.clubId);
}

function resolveConflict(conflict: TeamConflict) {
  relationshipStore.resolveConflict(conflict.id, '通过调解解决');
  emit('conflictResolved', conflict);
}

function applyRecommendation(rec: ChemistryRecommendation) {
  if (rec.type === 'team_building') {
    doTeamBuilding();
  } else if (rec.type === 'mediation' && rec.targetPlayers && rec.targetPlayers.length >= 2) {
    relationshipStore.updatePlayerRelationship(
      rec.targetPlayers[0]!,
      rec.targetPlayers[1]!,
      15,
      'reconciliation'
    );
    refreshChemistry();
  } else {
    refreshChemistry();
  }
}

function doTeamBuilding() {
  relationshipStore.applyTeamBuilding(props.clubId);
  emit('teamBuilding');
}

function doTeamMeeting() {
  refreshChemistry();
  emit('meeting');
}
</script>

<style scoped>
.team-chemistry {
  background: white;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.chemistry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chemistry-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.refresh-btn {
  padding: 6px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #e0e0e0;
}

.chemistry-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.chemistry-score {
  flex: 1;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.score-circle.excellent {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.score-circle.good {
  background: linear-gradient(135deg, #3498db, #5dade2);
  color: white;
}

.score-circle.average {
  background: linear-gradient(135deg, #f39c12, #f1c40f);
  color: white;
}

.score-circle.poor {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
}

.score-circle.bad {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.score-value {
  font-size: 28px;
  font-weight: bold;
}

.score-label {
  font-size: 10px;
  margin-top: 4px;
}

.atmosphere-indicator {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.atmosphere-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.atmosphere-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
}

.atmosphere-badge.harmonious {
  background: #d4edda;
  color: #155724;
}

.atmosphere-badge.neutral {
  background: #e2e3e5;
  color: #383d41;
}

.atmosphere-badge.tense {
  background: #fff3cd;
  color: #856404;
}

.atmosphere-badge.toxic {
  background: #f8d7da;
  color: #721c24;
}

.chemistry-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.stat-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stat-value.conflict {
  color: #e74c3c;
}

.section-header {
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.conflicts-section {
  margin-bottom: 20px;
}

.conflicts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conflict-item {
  padding: 12px;
  background: #fff5f5;
  border-radius: 8px;
  border-left: 3px solid #e74c3c;
}

.conflict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.conflict-players {
  font-weight: bold;
  color: #333;
  font-size: 13px;
}

.severity-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.severity-badge.critical {
  background: #e74c3c;
  color: white;
}

.severity-badge.high {
  background: #e67e22;
  color: white;
}

.severity-badge.medium {
  background: #f39c12;
  color: white;
}

.conflict-body {
  margin-bottom: 8px;
}

.conflict-type {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.conflict-desc {
  font-size: 12px;
  color: #333;
}

.conflict-actions {
  display: flex;
  justify-content: flex-end;
}

.resolve-btn {
  padding: 6px 12px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.resolve-btn:hover {
  background: #219a52;
}

.recommendations-section {
  margin-bottom: 20px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #3498db;
}

.recommendation-item.high {
  border-left-color: #e74c3c;
}

.recommendation-item.medium {
  border-left-color: #f39c12;
}

.recommendation-item.low {
  border-left-color: #27ae60;
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.priority-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.priority-badge.high {
  background: #f8d7da;
  color: #721c24;
}

.priority-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.priority-badge.low {
  background: #d4edda;
  color: #155724;
}

.rec-type {
  font-size: 12px;
  color: #666;
}

.rec-desc {
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
}

.rec-improvement {
  font-size: 11px;
  color: #27ae60;
  margin-bottom: 8px;
}

.apply-btn {
  padding: 6px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.apply-btn:hover {
  background: #2980b9;
}

.relationship-summary {
  margin-bottom: 20px;
}

.distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distribution-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-label {
  width: 60px;
  font-size: 12px;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 16px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s;
}

.bar-fill.friend {
  background: #27ae60;
}

.bar-fill.rival {
  background: #f39c12;
}

.bar-fill.hostile {
  background: #e74c3c;
}

.bar-fill.neutral {
  background: #95a5a6;
}

.bar-fill.mentor,
.bar-fill.student {
  background: #3498db;
}

.bar-count {
  width: 30px;
  text-align: right;
  font-size: 12px;
  color: #333;
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.action-btn.team-building {
  background: #27ae60;
  color: white;
}

.action-btn.team-building:hover {
  background: #219a52;
}

.action-btn.meeting {
  background: #3498db;
  color: white;
}

.action-btn.meeting:hover {
  background: #2980b9;
}
</style>
