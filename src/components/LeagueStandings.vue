<template>
  <div class="league-standings">
    <div class="standings-header">
      <h3 class="title">{{ leagueName }}</h3>
      <div class="league-meta" v-if="league">
        <span class="round-info">第 {{ league.schedule.currentRound }} / {{ league.schedule.totalRounds }} 轮</span>
        <span class="status-badge" :class="league.status">{{ getStatusText(league.status) }}</span>
      </div>
    </div>

    <div class="standings-table-wrapper">
      <table class="standings-table">
        <thead>
          <tr>
            <th class="col-rank">排名</th>
            <th class="col-team">战队</th>
            <th class="col-stat">场次</th>
            <th class="col-stat">胜</th>
            <th class="col-stat">负</th>
            <th class="col-stat">积分</th>
            <th class="col-stat">胜率</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(team, index) in standings"
            :key="team.clubId"
            :class="{
              'my-team': team.clubId === myClubId,
              'promotion-zone': index < promotionZone,
              'relegation-zone': index >= standings.length - relegationZone,
            }"
          >
            <td class="col-rank">
              <span class="rank-number" :class="getRankClass(index)">{{ team.rank }}</span>
            </td>
            <td class="col-team">
              <div class="team-info">
                <span class="team-name">{{ team.clubName }}</span>
                <span v-if="team.clubId === myClubId" class="my-badge">我</span>
              </div>
            </td>
            <td class="col-stat">{{ team.played }}</td>
            <td class="col-stat win">{{ team.won }}</td>
            <td class="col-stat loss">{{ team.lost }}</td>
            <td class="col-stat points">{{ team.points }}</td>
            <td class="col-stat">
              <span class="win-rate" :class="getWinRateClass(team)">
                {{ getWinRate(team) }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="standings-legend">
      <div class="legend-item">
        <span class="legend-color promotion"></span>
        <span class="legend-text">晋级区</span>
      </div>
      <div class="legend-item">
        <span class="legend-color relegation"></span>
        <span class="legend-text">降级区</span>
      </div>
    </div>

    <div class="standings-actions" v-if="showActions && league">
      <button
        v-if="league.status === 'ongoing'"
        class="action-btn primary"
        @click="simulateRound"
        :disabled="isSimulating"
      >
        {{ isSimulating ? '模拟中...' : '模拟本轮' }}
      </button>
      <button
        v-if="league.status === 'upcoming'"
        class="action-btn primary"
        @click="startLeague"
      >
        开始联赛
      </button>
      <button class="action-btn secondary" @click="refreshStandings">
        刷新
      </button>
    </div>

    <div class="prize-info" v-if="showPrizes && league">
      <h4 class="prize-title">奖金池</h4>
      <div class="prize-list">
        <div
          v-for="prize in league.prizes.distribution"
          :key="String(prize.rank)"
          class="prize-item"
        >
          <span class="prize-rank">{{ getPrizeRankText(prize.rank) }}</span>
          <span class="prize-amount">{{ prize.amount }}{{ league.prizes.currency }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useLeagueEcosystemStore } from '@/stores/leagueEcosystem';
import { useClubStore } from '@/stores/club';
import type { League } from '@/types/leagueEcosystem';

const props = defineProps<{
  leagueId?: string;
  showActions?: boolean;
  showPrizes?: boolean;
}>();

const emit = defineEmits<{
  (e: 'roundSimulated'): void;
  (e: 'leagueStarted'): void;
}>();

const ecosystemStore = useLeagueEcosystemStore();
const clubStore = useClubStore();

const isSimulating = ref(false);

const league = computed<League | undefined>(() => {
  if (props.leagueId) {
    return ecosystemStore.leagues.find(l => l.id === props.leagueId);
  }
  return ecosystemStore.primaryLeague;
});

const leagueName = computed(() => league.value?.name || '积分榜');

const standings = computed(() => league.value?.standings || []);

const myClubId = computed(() => clubStore.currentClub?.id);

const promotionZone = computed(() => league.value?.promotionZone || 0);

const relegationZone = computed(() => league.value?.relegationZone || 0);

function getRankClass(index: number): string {
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  if (index === 2) return 'bronze';
  return '';
}

function getWinRate(team: { won: number; played: number }): string {
  if (team.played === 0) return '0.0';
  return ((team.won / team.played) * 100).toFixed(1);
}

function getWinRateClass(team: { won: number; played: number }): string {
  const rate = team.played > 0 ? team.won / team.played : 0;
  if (rate >= 0.7) return 'high';
  if (rate >= 0.5) return 'medium';
  return 'low';
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消',
  };
  return texts[status] || status;
}

function getPrizeRankText(rank: number | 'participant'): string {
  if (rank === 'participant') return '参与奖';
  if (rank === 1) return '冠军';
  if (rank === 2) return '亚军';
  if (rank === 3) return '季军';
  if (rank === 4) return '殿军';
  return `第${rank}名`;
}

async function simulateRound() {
  if (!league.value || isSimulating.value) return;

  isSimulating.value = true;
  try {
    ecosystemStore.simulateCurrentLeagueRound(league.value.id);
    emit('roundSimulated');
  } finally {
    isSimulating.value = false;
  }
}

function startLeague() {
  if (!league.value) return;
  ecosystemStore.startLeague(league.value.id);
  emit('leagueStarted');
}

function refreshStandings() {
  // 触发响应式更新
}
</script>

<style scoped>
.league-standings {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.standings-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.league-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.round-info {
  font-size: 13px;
  color: #666;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.status-badge.upcoming {
  background: #fff3cd;
  color: #856404;
}

.status-badge.ongoing {
  background: #d4edda;
  color: #155724;
}

.status-badge.completed {
  background: #e2e3e5;
  color: #383d41;
}

.standings-table-wrapper {
  flex: 1;
  overflow-y: auto;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
}

.standings-table th {
  position: sticky;
  top: 0;
  background: #f9f9f9;
  padding: 10px 8px;
  font-size: 12px;
  font-weight: bold;
  color: #666;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.standings-table th.col-team {
  text-align: left;
}

.standings-table td {
  padding: 10px 8px;
  font-size: 13px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.standings-table td.col-team {
  text-align: left;
}

.standings-table tr.my-team {
  background: #e3f2fd;
}

.standings-table tr.promotion-zone {
  border-left: 3px solid #28a745;
}

.standings-table tr.relegation-zone {
  border-left: 3px solid #dc3545;
}

.rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
}

.rank-number.gold {
  background: linear-gradient(135deg, #ffd700, #ffec8b);
  color: #333;
}

.rank-number.silver {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #333;
}

.rank-number.bronze {
  background: linear-gradient(135deg, #cd7f32, #daa06d);
  color: white;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.team-name {
  font-weight: 500;
  color: #333;
}

.my-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
}

.col-stat.win {
  color: #28a745;
  font-weight: bold;
}

.col-stat.loss {
  color: #dc3545;
}

.col-stat.points {
  color: #007bff;
  font-weight: bold;
}

.win-rate {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.win-rate.high {
  background: #d4edda;
  color: #155724;
}

.win-rate.medium {
  background: #fff3cd;
  color: #856404;
}

.win-rate.low {
  background: #f8d7da;
  color: #721c24;
}

.standings-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 10px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.promotion {
  background: #28a745;
}

.legend-color.relegation {
  background: #dc3545;
}

.standings-actions {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid #eee;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #0056b3;
}

.action-btn.primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: #f9f9f9;
  color: #666;
  border: 1px solid #ddd;
}

.action-btn.secondary:hover {
  background: #e9ecef;
}

.prize-info {
  padding: 12px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
}

.prize-title {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.prize-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
}

.prize-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.prize-rank {
  font-size: 11px;
  color: #666;
}

.prize-amount {
  font-size: 14px;
  font-weight: bold;
  color: #007bff;
}
</style>
