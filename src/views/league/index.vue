<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useLeagueStore } from '@/stores/league';
import { useClubStore } from '@/stores/club';
import { useLeagueStatisticsStore } from '@/stores/leagueStatistics';
import { useHistoricalDataStore } from '@/stores/historicalData';

const leagueStore = useLeagueStore();
const clubStore = useClubStore();
const statisticsStore = useLeagueStatisticsStore();
const historicalDataStore = useHistoricalDataStore();

const activeTab = ref<'overview' | 'standings' | 'schedule' | 'statistics' | 'history'>('overview');

onMounted(() => {
  statisticsStore.initialize();
  historicalDataStore.initialize();
});

// 排行榜类型
const leaderboardTypes = [
  { value: 'kills', label: '击杀', unit: '' },
  { value: 'assists', label: '助攻', unit: '' },
  { value: 'kda', label: 'KDA', unit: '' },
  { value: 'gold_per_min', label: '场均金钱', unit: '' },
  { value: 'damage_per_min', label: '场均伤害', unit: '' },
  { value: 'mvp_count', label: 'MVP', unit: '次' },
];

const selectedLeaderboard = ref('kda');
const currentLeaderboard = computed(() => {
  return statisticsStore.getLeaderboard(selectedLeaderboard.value as any, 10);
});

// 统计数据
const totalMatches = computed(() => statisticsStore.totalMatches);
const totalKills = computed(() => statisticsStore.totalKills);
const averageDuration = computed(() => {
  const seconds = statisticsStore.averageGameDuration;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
});

// 选手统计
const playerStats = computed(() => statisticsStore.playerStats);

// 俱乐部统计
const clubStats = computed(() => statisticsStore.clubStats);

// 英雄统计
const heroStats = computed(() => statisticsStore.heroStats);

// 历史数据
const champions = computed(() => historicalDataStore.champions);
const records = computed(() => historicalDataStore.records);

// 选手位置映射
const positionNames: Record<string, string> = {
  top: '对抗路',
  jungle: '打野',
  mid: '中路',
  adc: '发育路',
  support: '游走',
};

// 当前赛季信息
const currentSeason = computed(() => leagueStore.currentSeason);
const phase = computed(() => leagueStore.phase);
const currentRound = computed(() => leagueStore.currentRound);
const totalRounds = computed(() => leagueStore.totalRounds);
const standings = computed(() => leagueStore.standings);
const myStanding = computed(() => leagueStore.myClubStanding);

// 阶段名称
const phaseNames: Record<string, string> = {
  preparing: '准备期',
  regular: '常规赛',
  playoff: '季后赛',
  offseason: '休赛期',
};

// 创建新赛季
const createSeason = () => {
  const year = new Date().getFullYear();
  leagueStore.createNewSeason(year, 'spring');
};

// 开始赛季
const startSeason = () => {
  leagueStore.startSeason();
};

// 模拟本轮所有比赛
const simulateRound = () => {
  if (confirm('确定要模拟本轮所有比赛吗？')) {
    leagueStore.simulateAllMatchesInRound();
  }
};

// 获取当前轮次的比赛
const currentMatches = computed(() => leagueStore.currentRoundMatches);

// 获取我的比赛
const myMatches = computed(() => leagueStore.myClubMatches);
</script>

<template>
  <div class="league-page">
    <h2 class="page-title">联赛中心</h2>
    
    <!-- 无赛季状态 -->
    <div v-if="!currentSeason" class="no-season">
      <div class="empty-card">
        <p>暂无进行中的联赛</p>
        <button class="action-btn primary" @click="createSeason">
          创建新赛季
        </button>
      </div>
    </div>
    
    <!-- 有赛季状态 -->
    <div v-else class="season-content">
      <!-- 赛季信息卡片 -->
      <div class="season-info-card">
        <div class="season-header">
          <div class="season-title">
            {{ currentSeason.year }}年{{ currentSeason.season === 'spring' ? '春季' : '夏季' }}赛
          </div>
          <div class="phase-badge" :class="phase">
            {{ phaseNames[phase] }}
          </div>
        </div>
        
        <div class="season-progress" v-if="phase === 'regular'">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (currentRound / totalRounds * 100) + '%' }"></div>
          </div>
          <div class="progress-text">
            第 {{ currentRound }} / {{ totalRounds }} 轮
          </div>
        </div>
        
        <div class="season-actions" v-if="phase === 'preparing'">
          <button class="action-btn primary" @click="startSeason">
            开始赛季
          </button>
        </div>
        
        <div class="season-actions" v-if="phase === 'regular'">
          <button class="action-btn primary" @click="simulateRound">
            模拟本轮比赛
          </button>
        </div>
      </div>
      
      <!-- 我的排名 -->
      <div v-if="myStanding" class="my-standing-card">
        <div class="standing-header">
          <span class="rank">#{{ myStanding.rank }}</span>
          <span class="club-name">{{ myStanding.clubName }}</span>
        </div>
        <div class="standing-stats">
          <div class="stat-item">
            <span class="stat-value">{{ myStanding.played }}</span>
            <span class="stat-label">已赛场次</span>
          </div>
          <div class="stat-item">
            <span class="stat-value win">{{ myStanding.won }}</span>
            <span class="stat-label">胜</span>
          </div>
          <div class="stat-item">
            <span class="stat-value loss">{{ myStanding.lost }}</span>
            <span class="stat-label">负</span>
          </div>
          <div class="stat-item">
            <span class="stat-value points">{{ myStanding.points }}</span>
            <span class="stat-label">积分</span>
          </div>
        </div>
      </div>
      
      <!-- 标签切换 -->
      <div class="tab-bar">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          概览
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'standings' }"
          @click="activeTab = 'standings'"
        >
          积分榜
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'schedule' }"
          @click="activeTab = 'schedule'"
        >
          赛程
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'statistics' }"
          @click="activeTab = 'statistics'"
        >
          数据
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          历史
        </button>
      </div>
      
      <!-- 概览页 -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- 近期比赛 -->
        <div class="section">
          <h3>近期比赛</h3>
          <div class="match-list">
            <div 
              v-for="match in myMatches.slice(0, 3)" 
              :key="match.id"
              class="match-item"
              :class="{ finished: match.isFinished }"
            >
              <div class="match-teams">
                <span :class="{ winner: match.isFinished && match.winnerId === match.homeTeamId }">
                  {{ match.homeTeamName }}
                </span>
                <span class="vs">VS</span>
                <span :class="{ winner: match.isFinished && match.winnerId === match.awayTeamId }">
                  {{ match.awayTeamName }}
                </span>
              </div>
              <div class="match-result" v-if="match.isFinished">
                {{ match.homeScore }} - {{ match.awayScore }}
              </div>
              <div class="match-status" v-else>
                未开始
              </div>
            </div>
          </div>
        </div>
        
        <!-- 积分榜前5 -->
        <div class="section">
          <h3>积分榜 TOP 5</h3>
          <div class="standings-preview">
            <div 
              v-for="(team, index) in standings.slice(0, 5)" 
              :key="team.clubId"
              class="standing-row"
              :class="{ 'is-me': team.clubId === clubStore.currentClub?.id }"
            >
              <span class="rank">{{ index + 1 }}</span>
              <span class="name">{{ team.clubName }}</span>
              <span class="points">{{ team.points }}分</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 积分榜页 -->
      <div v-if="activeTab === 'standings'" class="tab-content">
        <div class="standings-table">
          <div class="table-header">
            <span class="col-rank">排名</span>
            <span class="col-name">俱乐部</span>
            <span class="col-played">赛</span>
            <span class="col-won">胜</span>
            <span class="col-lost">负</span>
            <span class="col-points">积分</span>
          </div>
          <div 
            v-for="team in standings" 
            :key="team.clubId"
            class="table-row"
            :class="{ 'is-me': team.clubId === clubStore.currentClub?.id }"
          >
            <span class="col-rank">{{ team.rank }}</span>
            <span class="col-name">{{ team.clubName }}</span>
            <span class="col-played">{{ team.played }}</span>
            <span class="col-won">{{ team.won }}</span>
            <span class="col-lost">{{ team.lost }}</span>
            <span class="col-points">{{ team.points }}</span>
          </div>
        </div>
      </div>
      
      <!-- 赛程页 -->
      <div v-if="activeTab === 'schedule'" class="tab-content">
        <div class="schedule-list">
          <div 
            v-for="match in currentMatches" 
            :key="match.id"
            class="schedule-item"
            :class="{ finished: match.isFinished }"
          >
            <div class="match-round">第{{ match.round }}轮</div>
            <div class="match-teams">
              <span :class="{ winner: match.isFinished && match.winnerId === match.homeTeamId }">
                {{ match.homeTeamName }}
              </span>
              <span class="vs">VS</span>
              <span :class="{ winner: match.isFinished && match.winnerId === match.awayTeamId }">
                {{ match.awayTeamName }}
              </span>
            </div>
            <div class="match-result" v-if="match.isFinished">
              {{ match.homeScore }} - {{ match.awayScore }}
            </div>
            <div class="match-date" v-else>
              {{ new Date(match.scheduledDate).toLocaleDateString() }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 数据统计页 -->
      <div v-if="activeTab === 'statistics'" class="tab-content">
        <!-- 联赛概览 -->
        <div class="section">
          <h3>联赛概览</h3>
          <div class="stats-overview">
            <div class="stat-card">
              <span class="stat-num">{{ totalMatches }}</span>
              <span class="stat-label">总场次</span>
            </div>
            <div class="stat-card">
              <span class="stat-num">{{ totalKills }}</span>
              <span class="stat-label">总击杀</span>
            </div>
            <div class="stat-card">
              <span class="stat-num">{{ averageDuration }}</span>
              <span class="stat-label">平均时长</span>
            </div>
          </div>
        </div>
        
        <!-- 选手排行榜 -->
        <div class="section">
          <h3>选手排行榜</h3>
          <div class="leaderboard-tabs">
            <button 
              v-for="type in leaderboardTypes" 
              :key="type.value"
              class="leaderboard-tab"
              :class="{ active: selectedLeaderboard === type.value }"
              @click="selectedLeaderboard = type.value"
            >
              {{ type.label }}
            </button>
          </div>
          <div class="leaderboard-list">
            <div 
              v-for="entry in currentLeaderboard" 
              :key="entry.playerId"
              class="leaderboard-item"
            >
              <span class="rank" :class="{ top3: entry.rank <= 3 }">{{ entry.rank }}</span>
              <span class="player-name">{{ entry.playerName }}</span>
              <span class="club-name">{{ entry.clubName }}</span>
              <span class="value">{{ entry.value.toFixed(1) }}{{ type.unit }}</span>
            </div>
          </div>
        </div>
        
        <!-- 选手详细统计 -->
        <div class="section">
          <h3>选手统计</h3>
          <div class="player-stats-table">
            <div class="table-header">
              <span class="col-name">选手</span>
              <span class="col-club">俱乐部</span>
              <span class="col-kda">KDA</span>
              <span class="col-matches">场次</span>
              <span class="col-mvp">MVP</span>
            </div>
            <div 
              v-for="stat in playerStats.slice(0, 10)" 
              :key="stat.playerId"
              class="table-row"
            >
              <span class="col-name">{{ stat.playerName }}</span>
              <span class="col-club">{{ stat.clubName }}</span>
              <span class="col-kda">{{ stat.kda.toFixed(2) }}</span>
              <span class="col-matches">{{ stat.matches }}</span>
              <span class="col-mvp">{{ stat.mvpCount }}</span>
            </div>
          </div>
        </div>
        
        <!-- 俱乐部统计 -->
        <div class="section">
          <h3>俱乐部统计</h3>
          <div class="club-stats-table">
            <div class="table-header">
              <span class="col-name">俱乐部</span>
              <span class="col-wins">胜</span>
              <span class="col-losses">负</span>
              <span class="col-winrate">胜率</span>
              <span class="col-kills">总击杀</span>
            </div>
            <div 
              v-for="stat in clubStats.slice(0, 10)" 
              :key="stat.clubId"
              class="table-row"
            >
              <span class="col-name">{{ stat.clubName }}</span>
              <span class="col-wins">{{ stat.wins }}</span>
              <span class="col-losses">{{ stat.losses }}</span>
              <span class="col-winrate">{{ stat.winRate.toFixed(1) }}%</span>
              <span class="col-kills">{{ stat.totalKills }}</span>
            </div>
          </div>
        </div>
        
        <!-- 英雄统计 -->
        <div class="section">
          <h3>英雄数据</h3>
          <div class="hero-stats-table">
            <div class="table-header">
              <span class="col-name">英雄</span>
              <span class="col-picks">出场</span>
              <span class="col-bans">禁用</span>
              <span class="col-winrate">胜率</span>
              <span class="col-kda">KDA</span>
            </div>
            <div 
              v-for="stat in heroStats.slice(0, 10)" 
              :key="stat.heroId"
              class="table-row"
            >
              <span class="col-name">{{ stat.heroName }}</span>
              <span class="col-picks">{{ stat.picks }}</span>
              <span class="col-bans">{{ stat.bans }}</span>
              <span class="col-winrate">{{ stat.winRate.toFixed(1) }}%</span>
              <span class="col-kda">{{ stat.averageKDA.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 历史数据页 -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <!-- 历届冠军 -->
        <div class="section">
          <h3>历届冠军</h3>
          <div class="champions-list">
            <div 
              v-for="champion in champions" 
              :key="`${champion.season}-${champion.phase}`"
              class="champion-item"
            >
              <div class="champion-year">{{ champion.year }}{{ champion.phase === 'spring' ? '春季' : '夏季' }}赛</div>
              <div class="champion-info">
                <span class="champion-name">{{ champion.championName }}</span>
                <span class="vs-text">4:2</span>
                <span class="runner-up">{{ champion.runnerUpName }}</span>
              </div>
              <div class="finals-mvp">FMVP: {{ champion.finalsMVPName }}</div>
            </div>
          </div>
        </div>
        
        <!-- 记录保持者 -->
        <div class="section">
          <h3>记录保持者</h3>
          <div class="records-list">
            <div 
              v-for="record in records" 
              :key="record.id"
              class="record-item"
            >
              <div class="record-title">{{ record.title }}</div>
              <div class="record-holder">
                <span class="holder-name">{{ record.holderName }}</span>
                <span class="holder-value">{{ record.value }} {{ record.unit }}</span>
              </div>
              <div class="record-date">{{ record.date.toLocaleDateString() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.league-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

/* 无赛季状态 */
.no-season {
  padding: 40px 20px;
}

.empty-card {
  background: white;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-card p {
  color: #999;
  margin-bottom: 20px;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn:active {
  transform: scale(0.98);
}

/* 赛季信息卡片 */
.season-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  margin-bottom: 15px;
}

.season-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.season-title {
  font-size: 18px;
  font-weight: bold;
}

.phase-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  background: rgba(255,255,255,0.2);
}

.phase-badge.regular {
  background: #28a745;
}

.phase-badge.playoff {
  background: #ffc107;
  color: #333;
}

.season-progress {
  margin-bottom: 15px;
}

.progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 13px;
  opacity: 0.9;
}

.season-actions {
  display: flex;
  gap: 10px;
}

.season-actions .action-btn {
  flex: 1;
  background: white;
  color: #667eea;
}

/* 我的排名卡片 */
.my-standing-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.standing-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.rank {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.club-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.standing-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.stat-value.win {
  color: #28a745;
}

.stat-value.loss {
  color: #dc3545;
}

.stat-value.points {
  color: #007bff;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* 标签栏 */
.tab-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

/* 内容区域 */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section h3 {
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
}

/* 比赛列表 */
.match-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.match-item.finished {
  background: #f0f8ff;
  border-left: 3px solid #007bff;
}

.match-teams {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.match-teams .winner {
  font-weight: bold;
  color: #28a745;
}

.vs {
  color: #999;
  font-size: 12px;
}

.match-result {
  font-weight: bold;
  color: #007bff;
}

.match-status {
  font-size: 12px;
  color: #999;
}

/* 积分榜预览 */
.standings-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.standing-row {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.standing-row.is-me {
  background: #e3f2fd;
  border-left: 3px solid #007bff;
}

.standing-row .rank {
  width: 30px;
  font-weight: bold;
  color: #666;
}

.standing-row .name {
  flex: 1;
  color: #333;
}

.standing-row .points {
  font-weight: bold;
  color: #007bff;
}

/* 积分榜表格 */
.standings-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 50px 1fr 40px 40px 40px 60px;
  gap: 10px;
  padding: 12px 15px;
  background: #f5f5f5;
  font-size: 12px;
  font-weight: bold;
  color: #666;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 1fr 40px 40px 40px 60px;
  gap: 10px;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.is-me {
  background: #e3f2fd;
}

.col-rank {
  color: #666;
  font-weight: bold;
}

.col-name {
  color: #333;
}

.col-points {
  font-weight: bold;
  color: #007bff;
}

/* 赛程列表 */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.schedule-item.finished {
  border-left: 3px solid #28a745;
}

.match-round {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.match-date {
  font-size: 12px;
  color: #999;
}

/* 统计页面样式 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.stat-card .stat-num {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
}

.stat-card .stat-label {
  font-size: 12px;
  color: #666;
}

/* 排行榜样式 */
.leaderboard-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.leaderboard-tab {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.leaderboard-tab.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.leaderboard-item .rank {
  width: 30px;
  font-weight: bold;
  color: #666;
}

.leaderboard-item .rank.top3 {
  color: #ffc107;
}

.leaderboard-item .player-name {
  flex: 1;
  font-weight: bold;
  color: #333;
}

.leaderboard-item .club-name {
  color: #666;
  font-size: 12px;
  margin-right: 10px;
}

.leaderboard-item .value {
  font-weight: bold;
  color: #007bff;
}

/* 数据表格样式 */
.player-stats-table,
.club-stats-table,
.hero-stats-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  gap: 10px;
  padding: 10px 12px;
  background: #f5f5f5;
  font-size: 12px;
  font-weight: bold;
  color: #666;
}

.player-stats-table .table-header {
  grid-template-columns: 1fr 80px 60px 50px 50px;
}

.club-stats-table .table-header {
  grid-template-columns: 1fr 50px 50px 70px 70px;
}

.hero-stats-table .table-header {
  grid-template-columns: 1fr 50px 50px 60px 60px;
}

.table-row {
  display: grid;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row .col-name {
  font-weight: bold;
  color: #333;
}

.table-row .col-kda,
.table-row .col-winrate {
  font-weight: bold;
  color: #007bff;
}

.table-row .col-mvp {
  color: #ffc107;
  font-weight: bold;
}

/* 冠军列表样式 */
.champions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.champion-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
}

.champion-year {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.champion-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.champion-name {
  font-weight: bold;
  color: #ffc107;
  font-size: 16px;
}

.champion-info .vs-text {
  color: #999;
}

.runner-up {
  color: #666;
}

.finals-mvp {
  font-size: 12px;
  color: #666;
}

/* 记录列表样式 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
}

.record-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.record-holder {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.holder-name {
  color: #666;
}

.holder-value {
  font-weight: bold;
  color: #007bff;
}

.record-date {
  font-size: 11px;
  color: #999;
}
</style>
