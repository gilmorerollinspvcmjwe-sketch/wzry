<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useYouthAcademyStore } from '@/stores/youthAcademy';
import { 
  createYouthLeague, 
  simulateYouthLeague 
} from '@/core/services/youthAcademyService';
import type { YouthLeagueMatch, YouthLeagueStanding } from '@/types/youthAcademy';

const router = useRouter();
const clubStore = useClubStore();
const academyStore = useYouthAcademyStore();

const activeTab = ref<'standings' | 'matches'>('standings');

const clubId = computed(() => clubStore.currentClub?.id || '');
const club = computed(() => clubStore.currentClub);
const academy = computed(() => academyStore.getAcademy(clubId.value));
const league = computed(() => academyStore.getLeague(clubId.value));

const myStanding = computed(() => {
  if (!league.value) return null;
  return league.value.standings.find(s => s.clubId === clubId.value);
});

const myMatches = computed(() => {
  if (!league.value) return [];
  return league.value.matches
    .filter(m => m.homeClubId === clubId.value || m.awayClubId === clubId.value)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const upcomingMatches = computed(() => {
  return myMatches.value.filter(m => !m.played).slice(0, 3);
});

const playedMatches = computed(() => {
  return myMatches.value.filter(m => m.played);
});

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const getStandingStyle = (index: number) => {
  if (index === 0) return { background: '#fff7e6', border: '2px solid #faad14' };
  if (index === 1) return { background: '#f6ffed', border: '2px solid #52c41a' };
  if (index === 2) return { background: '#f0f5ff', border: '2px solid #1890ff' };
  return {};
};

const getResultColor = (result: string) => {
  if (result === 'win') return '#52c41a';
  if (result === 'loss') return '#ff4d4f';
  return '#faad14';
};

const handleJoinLeague = () => {
  const participantClubs = [
    { id: clubId.value, name: club.value?.name || '我的俱乐部' },
    { id: 'youth_club_1', name: '星火青训' },
    { id: 'youth_club_2', name: '雷霆青训' },
    { id: 'youth_club_3', name: '风暴青训' },
    { id: 'youth_club_4', name: '烈焰青训' },
    { id: 'youth_club_5', name: '寒冰青训' },
  ];
  
  const newLeague = createYouthLeague(clubId.value, participantClubs);
  academyStore.setLeague(clubId.value, newLeague);
};

const handleSimulateMatch = () => {
  const result = simulateYouthLeague(clubId.value);
  if (result.success) {
    alert(result.message);
  } else {
    alert(result.message);
  }
};

const goBack = () => {
  router.push('/youth');
};
</script>

<template>
  <div class="league-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <h2 class="page-title">青训联赛</h2>
      <div class="header-spacer"></div>
    </div>
    
    <template v-if="league">
      <div class="league-header">
        <div class="league-info">
          <h3>{{ league.name }}</h3>
          <span class="league-status" :class="league.status">
            {{ league.status === 'ongoing' ? '进行中' : league.status === 'completed' ? '已结束' : '即将开始' }}
          </span>
        </div>
        <div class="my-standing" v-if="myStanding">
          <div class="standing-rank">第 {{ league.standings.findIndex(s => s.clubId === clubId) + 1 }} 名</div>
          <div class="standing-stats">
            <span>{{ myStanding.wins }}胜</span>
            <span>{{ myStanding.draws }}平</span>
            <span>{{ myStanding.losses }}负</span>
            <span class="points">{{ myStanding.points }}分</span>
          </div>
        </div>
      </div>
      
      <div class="quick-actions" v-if="league.status === 'ongoing'">
        <button class="simulate-btn" @click="handleSimulateMatch">
          模拟下一场比赛
        </button>
      </div>
      
      <div class="upcoming-section" v-if="upcomingMatches.length > 0">
        <h4>即将进行的比赛</h4>
        <div class="upcoming-matches">
          <div v-for="match in upcomingMatches" :key="match.id" class="upcoming-match">
            <div class="match-teams">
              <span class="team" :class="{ home: match.homeClubId === clubId }">
                {{ match.homeClubId === clubId ? '我队' : '对手' }}
              </span>
              <span class="vs">VS</span>
              <span class="team" :class="{ home: match.awayClubId === clubId }">
                {{ match.awayClubId === clubId ? '我队' : '对手' }}
              </span>
            </div>
            <div class="match-date">{{ formatDate(match.date) }}</div>
          </div>
        </div>
      </div>
      
      <div class="tab-bar">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'standings' }"
          @click="activeTab = 'standings'"
        >
          积分榜
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'matches' }"
          @click="activeTab = 'matches'"
        >
          比赛记录
        </button>
      </div>
      
      <div v-if="activeTab === 'standings'" class="standings-section">
        <div class="standings-header">
          <span class="col-rank">排名</span>
          <span class="col-team">球队</span>
          <span class="col-stat">胜</span>
          <span class="col-stat">平</span>
          <span class="col-stat">负</span>
          <span class="col-stat">积分</span>
        </div>
        <div class="standings-list">
          <div 
            v-for="(standing, index) in league.standings" 
            :key="standing.clubId"
            class="standing-row"
            :class="{ myteam: standing.clubId === clubId }"
            :style="getStandingStyle(index)"
          >
            <span class="col-rank">{{ index + 1 }}</span>
            <span class="col-team">{{ standing.clubName }}</span>
            <span class="col-stat">{{ standing.wins }}</span>
            <span class="col-stat">{{ standing.draws }}</span>
            <span class="col-stat">{{ standing.losses }}</span>
            <span class="col-stat points">{{ standing.points }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="matches-section">
        <div v-if="playedMatches.length > 0" class="matches-list">
          <div v-for="match in playedMatches" :key="match.id" class="match-card">
            <div class="match-header">
              <span class="match-date">{{ formatDate(match.date) }}</span>
              <span class="match-result" :style="{ color: getResultColor(match.result || 'draw') }">
                {{ match.result === 'win' ? '胜' : match.result === 'loss' ? '负' : '平' }}
              </span>
            </div>
            <div class="match-score">
              <div class="team-side" :class="{ winner: match.result === 'win' && match.homeClubId === clubId }">
                <span class="team-name">{{ match.homeClubId === clubId ? '我队' : '对手' }}</span>
                <span class="score">{{ match.homeScore }}</span>
              </div>
              <span class="score-divider">:</span>
              <div class="team-side" :class="{ winner: match.result === 'win' && match.awayClubId === clubId }">
                <span class="score">{{ match.awayScore }}</span>
                <span class="team-name">{{ match.awayClubId === clubId ? '我队' : '对手' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-matches">
          <p>暂无已完成的比赛</p>
        </div>
      </div>
    </template>
    
    <template v-else>
      <div class="no-league">
        <div class="no-league-icon">🏆</div>
        <h3>尚未参加青训联赛</h3>
        <p>加入青训联赛，让您的青训球员获得宝贵的比赛经验</p>
        <button class="join-btn" @click="handleJoinLeague">加入联赛</button>
        
        <div class="league-info-card">
          <h4>联赛说明</h4>
          <ul>
            <li>双循环赛制，每支球队主客场各战一次</li>
            <li>获胜得3分，平局得1分，失败得0分</li>
            <li>联赛结束后根据积分排名</li>
            <li>冠军球队将获得额外奖励</li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.league-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f5f5f5;
  font-size: 18px;
  cursor: pointer;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-spacer {
  width: 36px;
}

.league-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 15px;
  color: white;
  margin-bottom: 15px;
}

.league-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.league-info h3 {
  margin: 0;
  font-size: 16px;
}

.league-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(255,255,255,0.2);
}

.league-status.ongoing {
  background: #52c41a;
}

.league-status.completed {
  background: #1890ff;
}

.my-standing {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.standing-rank {
  font-size: 20px;
  font-weight: bold;
}

.standing-stats {
  display: flex;
  gap: 10px;
  font-size: 13px;
}

.standing-stats .points {
  font-weight: bold;
  color: #ffd93d;
}

.quick-actions {
  margin-bottom: 15px;
}

.simulate-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: #52c41a;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.upcoming-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.upcoming-section h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
}

.upcoming-matches {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upcoming-match {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.match-teams {
  display: flex;
  align-items: center;
  gap: 10px;
}

.team {
  font-size: 13px;
  color: #666;
}

.team.home {
  color: #1890ff;
  font-weight: 600;
}

.vs {
  font-size: 11px;
  color: #999;
}

.match-date {
  font-size: 12px;
  color: #999;
}

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

.standings-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.standings-header {
  display: flex;
  padding: 12px 15px;
  background: #f5f5f5;
  font-size: 12px;
  color: #999;
  font-weight: 600;
}

.standings-list {
  display: flex;
  flex-direction: column;
}

.standing-row {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.standing-row:last-child {
  border-bottom: none;
}

.standing-row.myteam {
  background: #e6f7ff;
}

.col-rank {
  width: 40px;
  font-weight: 600;
}

.col-team {
  flex: 1;
  font-weight: 500;
}

.col-stat {
  width: 40px;
  text-align: center;
  color: #666;
}

.col-stat.points {
  color: #333;
  font-weight: 600;
}

.matches-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.match-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.match-date {
  font-size: 12px;
  color: #999;
}

.match-result {
  font-size: 14px;
  font-weight: 600;
}

.match-score {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.team-side {
  display: flex;
  align-items: center;
  gap: 10px;
}

.team-side.winner .team-name,
.team-side.winner .score {
  color: #52c41a;
  font-weight: 600;
}

.team-name {
  font-size: 13px;
  color: #666;
}

.score {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.score-divider {
  font-size: 20px;
  color: #999;
}

.empty-matches {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  color: #999;
}

.no-league {
  text-align: center;
  padding: 40px 20px;
}

.no-league-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.no-league h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.no-league p {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.join-btn {
  padding: 14px 40px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 30px;
}

.league-info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.league-info-card h4 {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
}

.league-info-card ul {
  margin: 0;
  padding-left: 20px;
}

.league-info-card li {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}
</style>
