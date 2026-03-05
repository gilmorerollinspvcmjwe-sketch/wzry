<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useMatchStore } from '@/stores/match';
import { useGameStore } from '@/stores/game';
import type { Match } from '@/core/models/Match';

const router = useRouter();

const clubStore = useClubStore();
const matchStore = useMatchStore();
const gameStore = useGameStore();

const activeTab = ref<'upcoming' | 'history'>('upcoming');
const showMatchDetail = ref(false);
const selectedMatch = ref<Match | null>(null);
const showSimulateResult = ref(false);
const simulateResult = ref<{ winner: string; homeScore: number; awayScore: number } | null>(null);

// 下一场比赛
const nextMatch = computed(() => matchStore.nextMatch);

// 即将进行的比赛
const upcomingMatches = computed(() => matchStore.upcomingMatches);

// 历史比赛
const matchHistory = computed(() => matchStore.matchHistory);

// 获取俱乐部名称
const getClubName = (clubId: string) => {
  const club = clubStore.getClub(clubId);
  return club?.name || '未知俱乐部';
};

// 获取俱乐部实力
const getClubPower = (clubId: string) => {
  const club = clubStore.getClub(clubId);
  // 使用类型断言访问方法（Pinia持久化后方法会丢失）
  return (club as any)?.getTotalPower?.() || 0;
};

// 打开比赛详情
const openMatchDetail = (match: Match) => {
  selectedMatch.value = match;
  showMatchDetail.value = true;
};

// 关闭比赛详情
const closeMatchDetail = () => {
  showMatchDetail.value = false;
  selectedMatch.value = null;
};

// 检查是否可以开始比赛（需要5名选手）
const canStartMatch = computed(() => {
  const roster = clubStore.currentClub?.roster || [];
  return roster.length >= 5;
});

// 模拟比赛
const simulateMatch = (matchId: string) => {
  // 检查选手人数
  if (!canStartMatch.value) {
    alert('需要至少5名选手才能开始比赛！请前往转会市场招募选手。');
    return;
  }
  
  try {
    const result = matchStore.simulateMatch(matchId);
    simulateResult.value = result;
    showSimulateResult.value = true;
    
    // 更新俱乐部资金（比赛奖励）
    if (result.winner === 'home') {
      const reward = 50; // 胜利奖励50万
      clubStore.addFunds(reward);
    }
  } catch (error) {
    alert('比赛模拟失败');
  }
};

// 跳过比赛（自动模拟）
const skipMatch = (matchId: string) => {
  if (confirm('确定要跳过这场比赛吗？将自动模拟结果。')) {
    simulateMatch(matchId);
  }
};

// 推进到下一天
const advanceDay = () => {
  gameStore.advanceTime(1);
  alert('时间推进一天');
};

// 格式化比赛时间
const formatMatchTime = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

// 格式化比赛时长
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}分钟`;
};

// 查看战报
const viewBattleReport = (match: Match) => {
  router.push({
    path: '/game/battle-report',
    query: {
      home: match.homeTeam.clubId,
      away: match.awayTeam.clubId,
    },
  });
};

// 获取比赛结果样式
const getResultClass = (match: Match) => {
  if (match.result === 'pending') return 'pending';
  if (match.result === 'draw') return 'draw';
  
  const isHome = match.homeTeam.clubId === clubStore.currentClub?.id;
  const won = isHome ? match.result === 'win' : match.result === 'loss';
  return won ? 'win' : 'loss';
};

// 获取比赛结果文本
const getResultText = (match: Match) => {
  if (match.result === 'pending') return '未开始';
  if (match.result === 'draw') return '平局';
  
  const isHome = match.homeTeam.clubId === clubStore.currentClub?.id;
  const won = isHome ? match.result === 'win' : match.result === 'loss';
  return won ? '胜利' : '失败';
};
</script>

<template>
  <div class="match-page">
    <h2 class="page-title">比赛中心</h2>
    
    <!-- 下一场比赛卡片 -->
    <div v-if="nextMatch" class="next-match-card">
      <div class="match-header">
        <span class="match-label">下一场比赛</span>
        <span class="match-time">{{ formatMatchTime(nextMatch.scheduledAt) }}</span>
      </div>
      
      <div class="match-teams">
        <div class="team home">
          <div class="team-name">{{ getClubName(nextMatch.homeTeam.clubId) }}</div>
          <div class="team-power">实力: {{ getClubPower(nextMatch.homeTeam.clubId) }}</div>
        </div>
        <div class="vs">VS</div>
        <div class="team away">
          <div class="team-name">{{ getClubName(nextMatch.awayTeam.clubId) }}</div>
          <div class="team-power">实力: {{ getClubPower(nextMatch.awayTeam.clubId) }}</div>
        </div>
      </div>
      
      <div class="match-actions">
        <button class="action-btn simulate" @click="simulateMatch(nextMatch.id)">
          开始比赛
        </button>
        <button class="action-btn skip" @click="skipMatch(nextMatch.id)">
          跳过
        </button>
      </div>
    </div>
    
    <div v-else class="no-match-card">
      <p>暂无待进行的比赛</p>
      <button class="action-btn" @click="advanceDay">
        推进一天
      </button>
    </div>
    
    <!-- 标签切换 -->
    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'upcoming' }"
        @click="activeTab = 'upcoming'"
      >
        赛程 ({{ upcomingMatches.length }})
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        战绩 ({{ matchHistory.length }})
      </button>
    </div>
    
    <!-- 即将进行的比赛 -->
    <div v-if="activeTab === 'upcoming'" class="match-list">
      <div 
        v-for="match in upcomingMatches" 
        :key="match.id"
        class="match-item"
        @click="openMatchDetail(match)"
      >
        <div class="match-info">
          <span class="round">第{{ match.round }}轮</span>
          <span class="date">{{ formatMatchTime(match.scheduledAt) }}</span>
        </div>
        <div class="match-teams-row">
          <span class="team-name" :class="{ self: match.homeTeam.clubId === clubStore.currentClub?.id }">
            {{ getClubName(match.homeTeam.clubId) }}
          </span>
          <span class="vs">VS</span>
          <span class="team-name" :class="{ self: match.awayTeam.clubId === clubStore.currentClub?.id }">
            {{ getClubName(match.awayTeam.clubId) }}
          </span>
        </div>
        <div class="match-status pending">未开始</div>
      </div>
      
      <div v-if="upcomingMatches.length === 0" class="empty-state">
        <p>暂无待进行的比赛</p>
      </div>
    </div>
    
    <!-- 历史战绩 -->
    <div v-else class="match-list">
      <div 
        v-for="match in matchHistory" 
        :key="match.id"
        class="match-item finished"
      >
        <div class="match-info">
          <span class="round">第{{ match.round }}轮</span>
          <span class="date">{{ match.playedAt ? formatMatchTime(match.playedAt) : '' }}</span>
        </div>
        <div class="match-teams-row">
          <span class="team-name" :class="{ self: match.homeTeam.clubId === clubStore.currentClub?.id }">
            {{ getClubName(match.homeTeam.clubId) }}
          </span>
          <span class="score">{{ match.homeTeam.score }} - {{ match.awayTeam.score }}</span>
          <span class="team-name" :class="{ self: match.awayTeam.clubId === clubStore.currentClub?.id }">
            {{ getClubName(match.awayTeam.clubId) }}
          </span>
        </div>
        <div class="match-actions">
          <div class="match-status" :class="getResultClass(match)">
            {{ getResultText(match) }}
          </div>
          <button class="report-btn" @click.stop="viewBattleReport(match)">
            📋 战报
          </button>
        </div>
      </div>
      
      <div v-if="matchHistory.length === 0" class="empty-state">
        <p>暂无比赛记录</p>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats-section" v-if="matchHistory.length > 0">
      <h3>赛季统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ matchStore.winRate }}%</div>
          <div class="stat-label">胜率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ matchHistory.filter(m => {
            const isHome = m.homeTeam.clubId === clubStore.currentClub?.id;
            return isHome ? m.result === 'win' : m.result === 'loss';
          }).length }}</div>
          <div class="stat-label">胜场</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ matchHistory.filter(m => {
            const isHome = m.homeTeam.clubId === clubStore.currentClub?.id;
            return isHome ? m.result === 'loss' : m.result === 'win';
          }).length }}</div>
          <div class="stat-label">负场</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ matchHistory.length }}</div>
          <div class="stat-label">总场次</div>
        </div>
      </div>
    </div>
    
    <!-- 比赛详情弹窗 -->
    <div v-if="showMatchDetail && selectedMatch" class="modal-overlay" @click="closeMatchDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>比赛详情</h3>
          <button class="close-btn" @click="closeMatchDetail">×</button>
        </div>
        
        <div class="modal-body">
          <!-- 对阵信息 -->
          <div class="teams-section">
            <div class="team-detail">
              <div class="team-name-large">{{ getClubName(selectedMatch.homeTeam.clubId) }}</div>
              <div class="team-power">实力: {{ getClubPower(selectedMatch.homeTeam.clubId) }}</div>
            </div>
            <div class="score-section" v-if="selectedMatch.result !== 'pending'">
              <div class="final-score">
                {{ selectedMatch.homeTeam.score }} - {{ selectedMatch.awayTeam.score }}
              </div>
              <div class="result-text" :class="getResultClass(selectedMatch)">
                {{ getResultText(selectedMatch) }}
              </div>
            </div>
            <div class="vs-section" v-else>
              <div class="vs-text">VS</div>
              <div class="match-time">{{ formatMatchTime(selectedMatch.scheduledAt) }}</div>
            </div>
            <div class="team-detail">
              <div class="team-name-large">{{ getClubName(selectedMatch.awayTeam.clubId) }}</div>
              <div class="team-power">实力: {{ getClubPower(selectedMatch.awayTeam.clubId) }}</div>
            </div>
          </div>
          
          <!-- 比赛统计 -->
          <div v-if="selectedMatch.stats" class="match-stats">
            <h4>比赛数据</h4>
            <div class="stat-row">
              <span class="stat-label">时长</span>
              <span class="stat-value">{{ formatDuration(selectedMatch.stats.duration) }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">总击杀</span>
              <span class="stat-value">{{ selectedMatch.stats.totalKills }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">总经济</span>
              <span class="stat-value">{{ selectedMatch.stats.totalGold.toLocaleString() }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">一血</span>
              <span class="stat-value">{{ getClubName(selectedMatch.stats.firstBlood) }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">一塔</span>
              <span class="stat-value">{{ getClubName(selectedMatch.stats.firstTower) }}</span>
            </div>
          </div>
          
          <!-- 精彩时刻 -->
          <div v-if="selectedMatch.highlights.length > 0" class="highlights-section">
            <h4>精彩时刻</h4>
            <div 
              v-for="(highlight, index) in selectedMatch.highlights" 
              :key="index"
              class="highlight-item"
            >
              <span class="highlight-time">{{ Math.floor(highlight.time / 60) }}:{{ (highlight.time % 60).toString().padStart(2, '0') }}</span>
              <span class="highlight-desc">{{ highlight.description }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer" v-if="selectedMatch.result === 'pending'">
          <button class="simulate-btn" @click="simulateMatch(selectedMatch.id); closeMatchDetail()">
            开始比赛
          </button>
        </div>
      </div>
    </div>
    
    <!-- 比赛结果弹窗 -->
    <div v-if="showSimulateResult && simulateResult" class="modal-overlay" @click="showSimulateResult = false">
      <div class="modal-content result-modal" @click.stop>
        <div class="result-header">
          <h3>比赛结束</h3>
        </div>
        
        <div class="result-body">
          <div class="final-score-large">
            {{ simulateResult.homeScore }} - {{ simulateResult.awayScore }}
          </div>
          <div class="result-status" :class="simulateResult.winner">
            {{ simulateResult.winner === 'home' ? '主胜' : '客胜' }}
          </div>
          <p class="reward-text" v-if="simulateResult.winner === 'home'">
            获得胜利奖励：50万
          </p>
        </div>
        
        <div class="result-footer">
          <button class="confirm-btn" @click="showSimulateResult = false">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.match-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

/* 下一场比赛卡片 */
.next-match-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  margin-bottom: 20px;
}

.match-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  opacity: 0.9;
}

.match-label {
  font-size: 14px;
}

.match-time {
  font-size: 14px;
}

.match-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.team {
  text-align: center;
  flex: 1;
}

.team-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.team-power {
  font-size: 12px;
  opacity: 0.8;
}

.vs {
  font-size: 24px;
  font-weight: bold;
  padding: 0 20px;
}

.match-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.simulate {
  background: white;
  color: #667eea;
}

.action-btn.skip {
  background: rgba(255,255,255,0.2);
  color: white;
}

.no-match-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.no-match-card p {
  color: #999;
  margin-bottom: 15px;
}

.no-match-card .action-btn {
  background: #007bff;
  color: white;
  max-width: 200px;
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

/* 比赛列表 */
.match-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.match-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.match-item:active {
  transform: scale(0.98);
}

.match-item.finished {
  border-left: 4px solid #007bff;
}

.match-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  color: #999;
}

.match-teams-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.match-teams-row .team-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  text-align: center;
}

.match-teams-row .team-name.self {
  color: #007bff;
  font-weight: bold;
}

.match-teams-row .vs {
  padding: 0 15px;
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

.match-teams-row .score {
  padding: 0 15px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.match-status {
  text-align: center;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.match-status.pending {
  background: #fff3cd;
  color: #856404;
}

.match-status.win {
  background: #d4edda;
  color: #155724;
}

.match-status.loss {
  background: #f8d7da;
  color: #721c24;
}

.match-status.draw {
  background: #e2e3e5;
  color: #383d41;
}

/* 比赛操作区 */
.match-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: #007bff;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.report-btn:hover {
  background: #0056b3;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

/* 统计区域 */
.stats-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stats-section h3 {
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
}

.stat-item .stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
}

.stat-item .stat-label {
  font-size: 12px;
  color: #666;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.result-modal {
  max-width: 300px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.teams-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.team-detail {
  flex: 1;
  text-align: center;
}

.team-name-large {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.team-power {
  font-size: 12px;
  color: #666;
}

.vs-section,
.score-section {
  text-align: center;
  padding: 0 15px;
}

.vs-text {
  font-size: 20px;
  font-weight: bold;
  color: #999;
}

.match-time {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.final-score {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.result-text {
  font-size: 14px;
  font-weight: bold;
  margin-top: 5px;
}

.result-text.win {
  color: #28a745;
}

.result-text.loss {
  color: #dc3545;
}

.result-text.draw {
  color: #6c757d;
}

.match-stats {
  margin-bottom: 20px;
}

.match-stats h4 {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.match-stats .stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid #f5f5f5;
}

.match-stats .stat-label {
  color: #666;
}

.match-stats .stat-value {
  color: #333;
  font-weight: 500;
}

.highlights-section h4 {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.highlight-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
}

.highlight-time {
  font-size: 12px;
  color: #007bff;
  font-weight: bold;
  min-width: 45px;
}

.highlight-desc {
  font-size: 13px;
  color: #333;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.simulate-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

/* 结果弹窗 */
.result-header {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.result-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.result-body {
  padding: 30px 20px;
  text-align: center;
}

.final-score-large {
  font-size: 48px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.result-status {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.result-status.home {
  color: #28a745;
}

.result-status.away {
  color: #dc3545;
}

.reward-text {
  font-size: 14px;
  color: #28a745;
}

.result-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.confirm-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}
</style>
