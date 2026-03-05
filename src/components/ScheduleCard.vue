<template>
  <div class="schedule-card">
    <div class="card-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="card-content">
      <!-- 赛程Tab -->
      <div v-if="activeTab === 'schedule'" class="tab-panel">
        <div class="schedule-list">
          <div
            v-for="(match, index) in upcomingMatches"
            :key="match.id"
            class="match-item"
            :class="{ next: index === 0 }"
          >
            <div class="match-round">第{{ match.round }}轮</div>
            <div class="match-teams">
              <span class="team" :class="{ me: match.isHome }">{{ match.homeTeam }}</span>
              <span class="vs">VS</span>
              <span class="team" :class="{ me: !match.isHome }">{{ match.awayTeam }}</span>
            </div>
            <div class="match-status">
              <span v-if="index === 0" class="status-badge next">即将开始</span>
              <span v-else class="date">{{ match.date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 战绩Tab -->
      <div v-if="activeTab === 'results'" class="tab-panel">
        <div class="results-chart">
          <div class="chart-row">
            <span class="chart-label">近5场</span>
            <div class="chart-bars">
              <div
                v-for="(result, index) in recentResults"
                :key="index"
                class="result-bar"
                :class="result"
              ></div>
            </div>
          </div>
          <div class="chart-stats">
            <div class="stat">
              <span class="stat-num win">{{ winCount }}</span>
              <span class="stat-label">胜</span>
            </div>
            <div class="stat">
              <span class="stat-num loss">{{ lossCount }}</span>
              <span class="stat-label">负</span>
            </div>
          </div>
        </div>
        <div class="recent-matches">
          <div
            v-for="match in recentMatches"
            :key="match.id"
            class="recent-item"
          >
            <span class="opponent">vs {{ match.opponent }}</span>
            <span class="score" :class="{ win: match.won, loss: !match.won }">
              {{ match.score }}
            </span>
          </div>
        </div>
      </div>

      <!-- 联赛Tab -->
      <div v-if="activeTab === 'league'" class="tab-panel">
        <div class="my-rank">
          <div class="rank-number">#{{ myStanding?.rank || '-' }}</div>
          <div class="rank-info">
            <span class="rank-label">当前排名</span>
            <span class="rank-points">{{ myStanding?.points || 0 }} 积分</span>
          </div>
        </div>
        <div class="standings-list">
          <div
            v-for="(team, index) in topStandings"
            :key="team.clubId"
            class="standing-item"
            :class="{ me: team.clubId === myClubId }"
          >
            <span class="standing-rank">{{ index + 1 }}</span>
            <span class="standing-name">{{ team.clubName }}</span>
            <span class="standing-points">{{ team.points }}</span>
          </div>
        </div>
        <button class="view-full-btn" @click="goToLeague">
          查看完整积分榜
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLeagueStore } from '@/stores/league';
import { useClubStore } from '@/stores/club';

const router = useRouter();
const leagueStore = useLeagueStore();
const clubStore = useClubStore();

const tabs = [
  { key: 'schedule', label: '赛程' },
  { key: 'results', label: '战绩' },
  { key: 'league', label: '联赛' },
];

const activeTab = ref('schedule');

const myClubId = computed(() => clubStore.currentClub?.id);

// 即将开始的比赛
const upcomingMatches = computed(() => {
  const matches = leagueStore.myClubMatches || [];
  return matches
    .filter(m => !m.isFinished)
    .slice(0, 3)
    .map(m => ({
      id: m.id,
      round: m.round,
      homeTeam: m.homeTeamName,
      awayTeam: m.awayTeamName,
      isHome: m.homeTeamId === myClubId.value,
      date: m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '',
    }));
});

// 最近战绩
const recentResults = computed(() => {
  const matches = leagueStore.myClubMatches || [];
  return matches
    .filter(m => m.isFinished)
    .slice(-5)
    .map(m => m.winnerId === myClubId.value ? 'win' : 'loss');
});

const winCount = computed(() => recentResults.value.filter(r => r === 'win').length);
const lossCount = computed(() => recentResults.value.filter(r => r === 'loss').length);

// 最近比赛
const recentMatches = computed(() => {
  const matches = leagueStore.myClubMatches || [];
  return matches
    .filter(m => m.isFinished)
    .slice(-5)
    .map(m => ({
      id: m.id,
      opponent: m.homeTeamId === myClubId.value ? m.awayTeamName : m.homeTeamName,
      score: `${m.homeScore ?? 0}:${m.awayScore ?? 0}`,
      won: m.winnerId === myClubId.value,
    }));
});

// 积分榜
const myStanding = computed(() => leagueStore.myClubStanding);

const topStandings = computed(() => {
  return (leagueStore.standings || []).slice(0, 5);
});

const goToLeague = () => {
  router.push('/game/league');
};
</script>

<style scoped>
.schedule-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: #f9f9f9;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: white;
  color: #007bff;
  font-weight: bold;
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.tab-panel {
  height: 100%;
}

/* 赛程样式 */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid transparent;
}

.match-item.next {
  background: #fff8e1;
  border-left-color: #ffc107;
}

.match-round {
  font-size: 11px;
  color: #999;
  margin-bottom: 6px;
}

.match-teams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}

.team {
  font-size: 14px;
  color: #333;
}

.team.me {
  font-weight: bold;
  color: #007bff;
}

.vs {
  font-size: 12px;
  color: #999;
}

.match-status {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.status-badge.next {
  background: #ffc107;
  color: #333;
}

.date {
  font-size: 12px;
  color: #999;
}

/* 战绩样式 */
.results-chart {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.chart-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.chart-label {
  font-size: 12px;
  color: #666;
  width: 50px;
}

.chart-bars {
  flex: 1;
  display: flex;
  gap: 4px;
}

.result-bar {
  flex: 1;
  height: 20px;
  border-radius: 4px;
}

.result-bar.win {
  background: #28a745;
}

.result-bar.loss {
  background: #dc3545;
}

.chart-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.stat {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 20px;
  font-weight: bold;
}

.stat-num.win {
  color: #28a745;
}

.stat-num.loss {
  color: #dc3545;
}

.stat-label {
  font-size: 11px;
  color: #999;
}

.recent-matches {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.opponent {
  font-size: 13px;
  color: #333;
}

.score {
  font-size: 14px;
  font-weight: bold;
}

.score.win {
  color: #28a745;
}

.score.loss {
  color: #dc3545;
}

/* 联赛样式 */
.my-rank {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 12px;
  color: white;
}

.rank-number {
  font-size: 32px;
  font-weight: bold;
}

.rank-info {
  display: flex;
  flex-direction: column;
}

.rank-label {
  font-size: 12px;
  opacity: 0.8;
}

.rank-points {
  font-size: 16px;
  font-weight: bold;
}

.standings-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.standing-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
}

.standing-item.me {
  background: #e3f2fd;
  border-left: 3px solid #007bff;
}

.standing-rank {
  width: 30px;
  font-weight: bold;
  color: #666;
}

.standing-name {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.standing-points {
  font-weight: bold;
  color: #007bff;
}

.view-full-btn {
  width: 100%;
  padding: 10px;
  background: #f9f9f9;
  border: 1px dashed #ddd;
  border-radius: 6px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
}
</style>
