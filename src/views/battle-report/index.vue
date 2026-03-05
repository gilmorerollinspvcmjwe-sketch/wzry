<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { BattleReportService } from '@/core/services/battleReportService';
import type { BattleReport, PlayerPerformance } from '@/types/battleReport';

const route = useRoute();
const router = useRouter();
const clubStore = useClubStore();

// 获取路由参数
const homeClubId = route.query.home as string;
const awayClubId = route.query.away as string;

// 直接从 store 的 clubs 数组中查找俱乐部
const homeClub = computed(() => clubStore.clubs.find(c => c.id === homeClubId));
const awayClub = computed(() => clubStore.clubs.find(c => c.id === awayClubId));

// 生成战报
const report = ref<BattleReport | null>(null);
const winner = ref<'home' | 'away'>('home');
const playerPerformances = ref<PlayerPerformance[]>([]);
const isLoading = ref(true);

// 生成战报的函数
const generateReport = () => {
  if (!homeClub.value || !awayClub.value) {
    isLoading.value = false;
    return;
  }
  
  try {
    // 模拟比赛结果
    const homePower = (homeClub.value as any).getTotalPower?.() || 0;
    const awayPower = (awayClub.value as any).getTotalPower?.() || 0;
    const homeAdvantage = 5;
    const homeRoll = homePower + homeAdvantage + Math.random() * 20;
    const awayRoll = awayPower + Math.random() * 20;
    
    winner.value = homeRoll > awayRoll ? 'home' : 'away';
    
    // 生成战报
    report.value = BattleReportService.generateBattleReport(
      homeClub.value as any,
      awayClub.value as any,
      winner.value
    );
    
    // 生成选手表现
    playerPerformances.value = BattleReportService.generatePlayerPerformances(
      homeClub.value as any,
      awayClub.value as any
    );
  } catch (error) {
    console.error('生成战报失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 组件挂载时生成战报
onMounted(() => {
  generateReport();
});

// 监听俱乐部数据变化
watch([homeClub, awayClub], () => {
  if (homeClub.value && awayClub.value && !report.value) {
    generateReport();
  }
});

// 当前展开的阶段
const expandedPhase = ref<'pre' | 'early' | 'mid' | 'late' | 'post'>('pre');

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 获取事件图标
const getEventIcon = (type: string) => {
  const icons: Record<string, string> = {
    solo_kill: '💥',
    teamfight: '⚔️',
    first_blood: '🩸',
    dragon: '🐉',
    baron: '👑',
    objective: '🎯',
    turnaround: '🔄',
    gank: '🥷',
  };
  return icons[type] || '⚡';
};

// 获取事件类型名称
const getEventTypeName = (type: string) => {
  const names: Record<string, string> = {
    solo_kill: '单杀',
    teamfight: '团战',
    first_blood: '一血',
    dragon: '小龙',
    baron: '大龙',
    objective: '目标',
    turnaround: '逆转',
    gank: 'Gank',
  };
  return names[type] || type;
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="battle-report-page">
    <!-- 头部 -->
    <div class="report-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h2 class="page-title">比赛战报</h2>
    </div>
    
    <!-- 加载中 -->
    <div v-if="isLoading" class="loading">
      加载中...
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="!report" class="error-state">
      <p>无法加载战报</p>
      <p class="error-detail">请确保比赛双方俱乐部存在</p>
      <button class="back-btn" @click="goBack">返回</button>
    </div>
    
    <!-- 战报内容 -->
    <div v-else class="report-content">
      <!-- 比赛结果卡片 -->
      <div class="result-card">
        <div class="teams-display">
          <div class="team home" :class="{ winner: winner === 'home' }">
            <div class="team-name">{{ homeClub?.name }}</div>
            <div class="team-score">{{ winner === 'home' ? '3' : '1' }}</div>
          </div>
          <div class="vs-divider">VS</div>
          <div class="team away" :class="{ winner: winner === 'away' }">
            <div class="team-name">{{ awayClub?.name }}</div>
            <div class="team-score">{{ winner === 'away' ? '3' : '1' }}</div>
          </div>
        </div>
        <div class="match-info">
          <span class="duration">⏱️ 34:52</span>
          <span class="winner-text">
            🏆 {{ winner === 'home' ? homeClub?.name : awayClub?.name }} 获胜
          </span>
        </div>
      </div>
      
      <!-- 赛前分析 -->
      <div class="section-card">
        <div 
          class="section-header" 
          :class="{ expanded: expandedPhase === 'pre' }"
          @click="expandedPhase = expandedPhase === 'pre' ? 'early' : 'pre'"
        >
          <span class="section-icon">📊</span>
          <span class="section-title">赛前分析</span>
          <span class="expand-icon">{{ expandedPhase === 'pre' ? '▼' : '▶' }}</span>
        </div>
        <div v-show="expandedPhase === 'pre'" class="section-content">
          <div class="pre-match-summary">
            <p v-for="(line, index) in report.preMatch.summary" :key="index" class="summary-line">
              {{ line }}
            </p>
          </div>
          
          <div class="key-matchups">
            <h4>关键对位</h4>
            <div class="matchup-list">
              <div v-for="matchup in report.preMatch.keyMatchups" :key="matchup.position" class="matchup-item">
                <div class="position">{{ matchup.position }}</div>
                <div class="players">
                  <span class="home-player">{{ matchup.homePlayer }} ({{ matchup.homeStat }})</span>
                  <span class="vs">vs</span>
                  <span class="away-player">({{ matchup.awayStat }}) {{ matchup.awayPlayer }}</span>
                </div>
                <div class="prediction">{{ matchup.prediction }}</div>
              </div>
            </div>
          </div>
          
          <div class="expert-prediction">
            <strong>专家预测：</strong>{{ report.preMatch.predictions }}
          </div>
        </div>
      </div>
      
      <!-- 前期战报 -->
      <div class="section-card">
        <div 
          class="section-header" 
          :class="{ expanded: expandedPhase === 'early' }"
          @click="expandedPhase = expandedPhase === 'early' ? 'mid' : 'early'"
        >
          <span class="section-icon">🌅</span>
          <span class="section-title">前期战报 (0-15分钟)</span>
          <span class="expand-icon">{{ expandedPhase === 'early' ? '▼' : '▶' }}</span>
        </div>
        <div v-show="expandedPhase === 'early'" class="section-content">
          <div class="phase-narrative">
            <p v-for="(line, index) in report.earlyGame.narrative" :key="index" class="narrative-line">
              {{ line }}
            </p>
          </div>
          
          <div class="events-list">
            <div v-for="event in report.earlyGame.keyEvents" :key="event.time" class="event-card">
              <div class="event-header">
                <span class="event-time">{{ formatTime(event.time) }}</span>
                <span class="event-type">{{ getEventIcon(event.type) }} {{ getEventTypeName(event.type) }}</span>
              </div>
              <div class="event-title">{{ event.title }}</div>
              <div class="event-description">{{ event.description }}</div>
              <div class="event-highlight">{{ event.highlight }}</div>
              
              <!-- 数值解析 -->
              <div class="stat-breakdown">
                <div class="breakdown-title">📊 数值解析</div>
                <div v-for="stat in event.statBreakdown" :key="stat.player" class="stat-item">
                  <div class="player-info">
                    <span class="player-name">{{ stat.player }}</span>
                    <span class="stat-badge">{{ stat.relevantStat }}: {{ stat.statValue }}</span>
                  </div>
                  <div class="impact">{{ stat.impact }}</div>
                  <div class="roll">判定: {{ stat.rollResult.toFixed(1) }}</div>
                </div>
              </div>
              
              <div class="event-result" :class="event.winner">
                <span>{{ event.winner === 'home' ? homeClub?.name : awayClub?.name }} 获得优势</span>
                <span class="gold">💰 +{{ event.goldSwing }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 中期战报 -->
      <div class="section-card">
        <div 
          class="section-header" 
          :class="{ expanded: expandedPhase === 'mid' }"
          @click="expandedPhase = expandedPhase === 'mid' ? 'late' : 'mid'"
        >
          <span class="section-icon">☀️</span>
          <span class="section-title">中期战报 (15-30分钟)</span>
          <span class="expand-icon">{{ expandedPhase === 'mid' ? '▼' : '▶' }}</span>
        </div>
        <div v-show="expandedPhase === 'mid'" class="section-content">
          <div class="phase-narrative">
            <p v-for="(line, index) in report.midGame.narrative" :key="index" class="narrative-line">
              {{ line }}
            </p>
          </div>
          
          <div class="events-list">
            <div v-for="event in report.midGame.keyEvents" :key="event.time" class="event-card">
              <div class="event-header">
                <span class="event-time">{{ formatTime(event.time) }}</span>
                <span class="event-type">{{ getEventIcon(event.type) }} {{ getEventTypeName(event.type) }}</span>
              </div>
              <div class="event-title">{{ event.title }}</div>
              <div class="event-description">{{ event.description }}</div>
              <div class="event-highlight">{{ event.highlight }}</div>
              
              <div class="stat-breakdown">
                <div class="breakdown-title">📊 数值解析</div>
                <div v-for="stat in event.statBreakdown" :key="stat.player" class="stat-item">
                  <div class="player-info">
                    <span class="player-name">{{ stat.player }}</span>
                    <span class="stat-badge">{{ stat.relevantStat }}: {{ stat.statValue }}</span>
                  </div>
                  <div class="impact">{{ stat.impact }}</div>
                  <div class="roll">判定: {{ stat.rollResult.toFixed(1) }}</div>
                </div>
              </div>
              
              <div class="event-result" :class="event.winner">
                <span>{{ event.winner === 'home' ? homeClub?.name : awayClub?.name }} 获得优势</span>
                <span class="gold">💰 +{{ event.goldSwing }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 后期战报 -->
      <div class="section-card">
        <div 
          class="section-header" 
          :class="{ expanded: expandedPhase === 'late' }"
          @click="expandedPhase = expandedPhase === 'late' ? 'post' : 'late'"
        >
          <span class="section-icon">🌙</span>
          <span class="section-title">后期战报 (30分钟+)</span>
          <span class="expand-icon">{{ expandedPhase === 'late' ? '▼' : '▶' }}</span>
        </div>
        <div v-show="expandedPhase === 'late'" class="section-content">
          <div class="phase-narrative">
            <p v-for="(line, index) in report.lateGame.narrative" :key="index" class="narrative-line">
              {{ line }}
            </p>
          </div>
          
          <div class="events-list">
            <div v-for="event in report.lateGame.keyEvents" :key="event.time" class="event-card">
              <div class="event-header">
                <span class="event-time">{{ formatTime(event.time) }}</span>
                <span class="event-type">{{ getEventIcon(event.type) }} {{ getEventTypeName(event.type) }}</span>
              </div>
              <div class="event-title">{{ event.title }}</div>
              <div class="event-description">{{ event.description }}</div>
              <div class="event-highlight">{{ event.highlight }}</div>
              
              <div class="stat-breakdown">
                <div class="breakdown-title">📊 数值解析</div>
                <div v-for="stat in event.statBreakdown" :key="stat.player" class="stat-item">
                  <div class="player-info">
                    <span class="player-name">{{ stat.player }}</span>
                    <span class="stat-badge">{{ stat.relevantStat }}: {{ stat.statValue }}</span>
                  </div>
                  <div class="impact">{{ stat.impact }}</div>
                  <div class="roll">判定: {{ stat.rollResult.toFixed(1) }}</div>
                </div>
              </div>
              
              <div class="event-result" :class="event.winner">
                <span>{{ event.winner === 'home' ? homeClub?.name : awayClub?.name }} 获得优势</span>
                <span class="gold">💰 +{{ event.goldSwing }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 赛后总结 -->
      <div class="section-card">
        <div 
          class="section-header" 
          :class="{ expanded: expandedPhase === 'post' }"
          @click="expandedPhase = 'post'"
        >
          <span class="section-icon">🏆</span>
          <span class="section-title">赛后总结</span>
          <span class="expand-icon">{{ expandedPhase === 'post' ? '▼' : '▶' }}</span>
        </div>
        <div v-show="expandedPhase === 'post'" class="section-content">
          <div class="conclusion-card">
            <div class="final-score">
              <span class="score">{{ report.conclusion.score }}</span>
              <span class="duration">{{ report.conclusion.duration }}</span>
            </div>
            
            <div class="highlights">
              <div v-for="(highlight, index) in report.conclusion.highlights" :key="index" class="highlight-item">
                {{ highlight }}
              </div>
            </div>
            
            <div class="analysis">
              <strong>胜负分析：</strong>{{ report.conclusion.analysis }}
            </div>
          </div>
          
          <!-- 选手表现 -->
          <div class="player-performances">
            <h4>选手表现 TOP 5</h4>
            <div class="performance-list">
              <div v-for="(perf, index) in playerPerformances.slice(0, 5)" :key="perf.playerId" class="performance-item">
                <div class="rank">{{ index + 1 }}</div>
                <div class="player-info">
                  <div class="player-name">{{ perf.playerName }}</div>
                  <div class="player-position">{{ perf.position }}</div>
                </div>
                <div class="stats">
                  <span class="kda">{{ perf.kills }}/{{ perf.deaths }}/{{ perf.assists }}</span>
                  <span class="rating" :class="{ high: perf.rating > 8 }">{{ perf.rating.toFixed(1) }}</span>
                </div>
                <div class="description">{{ perf.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.battle-report-page {
  padding: 15px;
  padding-bottom: 80px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 头部 */
.report-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.back-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* 加载中 */
.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.error-state p {
  color: #666;
  font-size: 16px;
  margin-bottom: 10px;
}

.error-state .error-detail {
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
}

.error-state .back-btn {
  margin-top: 10px;
}

/* 结果卡片 */
.result-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.teams-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.team {
  text-align: center;
  flex: 1;
}

.team.winner .team-score {
  color: #ffd700;
  font-size: 36px;
}

.team-name {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.team-score {
  font-size: 28px;
  font-weight: bold;
}

.vs-divider {
  font-size: 14px;
  opacity: 0.7;
  padding: 0 15px;
}

.match-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba(255,255,255,0.2);
  font-size: 13px;
}

.winner-text {
  font-weight: bold;
}

/* 章节卡片 */
.section-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f8f9fa;
  cursor: pointer;
  transition: background 0.3s ease;
}

.section-header:hover {
  background: #e9ecef;
}

.section-header.expanded {
  background: #e3f2fd;
}

.section-icon {
  font-size: 20px;
}

.section-title {
  flex: 1;
  font-weight: bold;
  color: #333;
}

.expand-icon {
  color: #999;
}

.section-content {
  padding: 15px;
}

/* 赛前分析 */
.pre-match-summary {
  margin-bottom: 20px;
}

.summary-line {
  margin: 8px 0;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
}

.key-matchups h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.matchup-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.matchup-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.position {
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
}

.players {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.vs {
  color: #999;
}

.prediction {
  font-size: 13px;
  color: #666;
}

.expert-prediction {
  margin-top: 20px;
  padding: 12px;
  background: #fff3cd;
  border-radius: 8px;
  font-size: 14px;
}

/* 战报叙述 */
.phase-narrative {
  margin-bottom: 20px;
}

.narrative-line {
  margin: 8px 0;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
}

/* 事件列表 */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  border-left: 4px solid #007bff;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.event-time {
  font-size: 13px;
  color: #666;
  font-weight: bold;
}

.event-type {
  font-size: 13px;
  color: #007bff;
  background: rgba(0,123,255,0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

.event-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.event-description {
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  white-space: pre-line;
}

.event-highlight {
  font-size: 13px;
  color: #28a745;
  font-weight: bold;
  margin-bottom: 12px;
}

/* 数值解析 */
.stat-breakdown {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.breakdown-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.stat-item {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.stat-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.player-name {
  font-weight: bold;
  color: #333;
}

.stat-badge {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.impact {
  font-size: 13px;
  color: #666;
  margin-bottom: 3px;
}

.roll {
  font-size: 12px;
  color: #999;
}

/* 事件结果 */
.event-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
}

.event-result.home {
  background: rgba(0,123,255,0.1);
  color: #007bff;
}

.event-result.away {
  background: rgba(220,53,69,0.1);
  color: #dc3545;
}

.gold {
  color: #ffc107;
}

/* 赛后总结 */
.conclusion-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  margin-bottom: 20px;
}

.final-score {
  text-align: center;
  margin-bottom: 15px;
}

.final-score .score {
  font-size: 32px;
  font-weight: bold;
  display: block;
}

.final-score .duration {
  font-size: 14px;
  opacity: 0.9;
}

.highlights {
  margin-bottom: 15px;
}

.highlight-item {
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  font-size: 14px;
}

.analysis {
  font-size: 14px;
  line-height: 1.6;
}

/* 选手表现 */
.player-performances h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.performance-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px;
}

.performance-item .rank {
  width: 28px;
  height: 28px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.performance-item .player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.performance-item .player-name {
  font-weight: bold;
  color: #333;
}

.performance-item .player-position {
  font-size: 12px;
  color: #999;
}

.performance-item .stats {
  display: flex;
  gap: 10px;
  align-items: center;
}

.performance-item .kda {
  font-size: 13px;
  color: #666;
}

.performance-item .rating {
  background: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;
}

.performance-item .rating.high {
  background: #ffc107;
  color: #333;
}

.performance-item .description {
  font-size: 12px;
  color: #999;
}
</style>
