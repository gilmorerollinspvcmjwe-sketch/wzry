<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { usePlayerStore } from '@/stores/player';
import { useHeroStore } from '@/stores/hero';
import { usePlayerPersonalityStore } from '@/stores/playerPersonality';
import { Player } from '@/core/models/Player';
import type { PlayerStats } from '@/types';
import { getPlayerTotalPower, getPlayerHeroStatsList, recoverPlayer } from '@/utils/playerUtils';
import PlayerEmotion from '@/components/PlayerEmotion.vue';
import PlayerDialogue from '@/components/PlayerDialogue.vue';
import PlayerDemands from '@/components/PlayerDemands.vue';
import RelationshipNetwork from '@/components/RelationshipNetwork.vue';
import StoryEvent from '@/components/StoryEvent.vue';
import EndorsementManager from '@/components/EndorsementManager.vue';

const route = useRoute();
const clubStore = useClubStore();
const playerStore = usePlayerStore();
const heroStore = useHeroStore();
const personalityStore = usePlayerPersonalityStore();

const activeTab = ref<'roster' | 'youth'>('roster');
const selectedPlayer = ref<Player | null>(null);
const showPlayerDetail = ref(false);
const playerDetailTab = ref<'stats' | 'heroes' | 'data' | 'personality' | 'dialogue' | 'relationship' | 'story' | 'commercial'>('stats');

const roster = computed(() => clubStore.fixedRoster);
const youthTeam = computed(() => clubStore.fixedYouthTeam);

// 检查 URL 参数，自动打开选手详情
const checkPlayerIdParam = () => {
  const playerId = route.query.playerId as string;
  if (playerId) {
    const player = roster.value.find(p => p.id === playerId) || youthTeam.value.find(p => p.id === playerId);
    if (player) {
      openPlayerDetail(player);
    }
  }
};

onMounted(() => {
  checkPlayerIdParam();
});

// 监听路由参数变化
watch(() => route.query.playerId, () => {
  checkPlayerIdParam();
});

const positionNames: Record<string, string> = {
  top: '对抗路',
  jungle: '打野',
  mid: '中路',
  adc: '发育路',
  support: '游走',
};

const statNames: Record<keyof PlayerStats, string> = {
  mechanics: '操作',
  awareness: '意识',
  mentality: '心态',
  teamwork: '团队',
  heroPool: '英雄池',
};

const personalityNames: Record<string, string> = {
  trainingAttitude: '训练态度',
  playStyle: '比赛风格',
  teamwork: '团队合作',
  pressureResistance: '抗压能力',
  socialSkill: '社交能力',
};

const personalityValueNames: Record<string, string> = {
  diligent: '勤奋',
  lazy: '懒惰',
  'self-disciplined': '自律',
  aggressive: '激进',
  stable: '稳健',
  flexible: '灵活',
  'lone-wolf': '独狼',
  'team-player': '团队型',
  leader: '领袖',
  clutch: '大心脏',
  fragile: '脆弱',
  normal: '普通',
  introverted: '内向',
  extroverted: '外向',
  charismatic: '魅力型',
};

const openPlayerDetail = (player: any) => {
  selectedPlayer.value = player as Player;
  showPlayerDetail.value = true;
  playerDetailTab.value = 'stats';
};

const closePlayerDetail = () => {
  showPlayerDetail.value = false;
  selectedPlayer.value = null;
};

const trainPlayer = (player: any, statType: keyof PlayerStats) => {
  const success = playerStore.trainPlayer(player.id, statType);
  if (success) {
    alert(`训练成功！${statNames[statType]}有所提升`);
  } else {
    alert('体力不足，无法训练');
  }
};

const restPlayer = (player: any) => {
  recoverPlayer(player);
  alert(`${player.name} 已休息恢复`);
};

const promoteYouth = (player: any) => {
  const success = clubStore.promoteYouthPlayer(player.id);
  if (success) {
    alert(`${player.name} 已提拔到一线队`);
  }
};

// 解约选手
const releasePlayer = (player: any) => {
  if (confirm(`确定要解约 ${player.name} 吗？需要支付违约金 ${player.contract.buyoutClause * 0.5}万`)) {
    const success = clubStore.releasePlayer(player.id);
    if (success) {
      alert(`${player.name} 已解约`);
    }
  }
};

// 获取状态颜色
const getStaminaColor = (stamina: number) => {
  if (stamina >= 80) return '#28a745';
  if (stamina >= 50) return '#ffc107';
  return '#dc3545';
};

// 获取状态文本
const getConditionText = (player: any) => {
  if (player.condition.injury > 0) return '受伤';
  if (player.condition.stamina < 30) return '疲劳';
  if (player.condition.morale < 50) return '低落';
  return '良好';
};

// 格式化日期
const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

// 获取英雄名称
const getHeroName = (heroId: string): string => {
  const hero = heroStore.getHeroById(heroId);
  return hero?.name || heroId;
};

// 获取英雄定位
const getHeroRole = (heroId: string): string => {
  const hero = heroStore.getHeroById(heroId);
  return hero ? heroStore.getRoleName(hero.role) : '';
};

const getPlayerHeroStats = (player: any) => {
  return getPlayerHeroStatsList(player);
};

// 获取选手英雄偏好
const getPlayerHeroPreference = (player: any) => {
  return player.heroPreference || { preferredRoles: [], preferredTags: [], favoriteHeroes: [] };
};

// 获取选手性格
const getPlayerPersonality = (player: any) => {
  return player.personality || {};
};

// 获取选手天赋
const getPlayerTalents = (player: any) => {
  return player.talents || [];
};

const getPlayerCareerStats = (player: any) => {
  return player.careerStats || { totalMatches: 0, wins: 0, losses: 0, winRate: 0, mvpCount: 0, averageKDA: 0 };
};

const getPlayerPower = (player: any): number => {
  return getPlayerTotalPower(player);
};
</script>

<template>
  <div class="team-page">
    <h2 class="page-title">阵容管理</h2>
    
    <!-- 标签切换 -->
    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'roster' }"
        @click="activeTab = 'roster'"
      >
        一线队 ({{ roster.length }})
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'youth' }"
        @click="activeTab = 'youth'"
      >
        青训队 ({{ youthTeam.length }})
      </button>
    </div>
    
    <!-- 一线队列表 -->
    <div v-if="activeTab === 'roster'" class="player-list">
      <div 
        v-for="player in roster" 
        :key="player.id"
        class="player-card"
        @click="openPlayerDetail(player)"
      >
        <div class="player-header">
          <div class="player-position" :class="player.position">
            {{ positionNames[player.position] }}
          </div>
          <div class="player-name">{{ player.name }}</div>
          <div class="player-age">{{ player.age }}岁</div>
        </div>
        
        <div class="player-stats">
          <div class="stat-row">
            <span class="stat-label">实力</span>
            <div class="stat-bar">
              <div 
                class="stat-fill" 
                :style="{ width: getPlayerPower(player) + '%' }"
              ></div>
            </div>
            <span class="stat-value">{{ getPlayerPower(player) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">体力</span>
            <div class="stat-bar">
              <div 
                class="stat-fill stamina" 
                :style="{ 
                  width: player.condition.stamina + '%',
                  backgroundColor: getStaminaColor(player.condition.stamina)
                }"
              ></div>
            </div>
            <span class="stat-value">{{ player.condition.stamina }}</span>
          </div>
        </div>
        
        <div class="player-footer">
          <span class="condition-badge" :class="getConditionText(player)">
            {{ getConditionText(player) }}
          </span>
          <span class="salary">{{ player.contract.salary }}万/周</span>
        </div>
      </div>
      
      <div v-if="roster.length === 0" class="empty-state">
        <p>暂无选手，请前往转会市场签约</p>
        <router-link to="/game/transfer" class="link-btn">
          去签约
        </router-link>
      </div>
    </div>
    
    <!-- 青训队列表 -->
    <div v-else class="player-list">
      <div 
        v-for="player in youthTeam" 
        :key="player.id"
        class="player-card youth"
        @click="openPlayerDetail(player)"
      >
        <div class="player-header">
          <div class="player-position" :class="player.position">
            {{ positionNames[player.position] }}
          </div>
          <div class="player-name">{{ player.name }}</div>
          <div class="player-age">{{ player.age }}岁</div>
        </div>
        
        <div class="player-stats">
          <div class="stat-row">
            <span class="stat-label">潜力</span>
            <div class="stat-bar">
              <div 
                class="stat-fill potential" 
                :style="{ width: player.potential + '%' }"
              ></div>
            </div>
            <span class="stat-value">{{ player.potential }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">当前</span>
            <div class="stat-bar">
              <div 
                class="stat-fill" 
                :style="{ width: getPlayerPower(player) + '%' }"
              ></div>
            </div>
            <span class="stat-value">{{ getPlayerPower(player) }}</span>
          </div>
        </div>
        
        <div class="player-footer">
          <button 
            class="action-btn promote"
            @click.stop="promoteYouth(player)"
          >
            提拔
          </button>
        </div>
      </div>
      
      <div v-if="youthTeam.length === 0" class="empty-state">
        <p>暂无青训选手</p>
      </div>
    </div>
    
    <!-- 选手详情弹窗 -->
    <div v-if="showPlayerDetail && selectedPlayer" class="modal-overlay" @click="closePlayerDetail">
      <div class="modal-content player-detail-modal" @click.stop>
        <!-- 弹窗头部 -->
        <div class="modal-header">
          <div class="player-header-info">
            <div class="player-avatar">
              {{ selectedPlayer.name[0] }}
            </div>
            <div class="player-title">
              <h3>{{ selectedPlayer.name }}</h3>
              <div class="player-subtitle">
                <span class="position-tag" :class="selectedPlayer.position">
                  {{ positionNames[selectedPlayer.position] }}
                </span>
                <span class="age-tag">{{ selectedPlayer.age }}岁</span>
              </div>
            </div>
          </div>
          <button class="close-btn" @click="closePlayerDetail">×</button>
        </div>

        <!-- 详情标签页 -->
        <div class="detail-tabs">
          <button 
            class="detail-tab"
            :class="{ active: playerDetailTab === 'stats' }"
            @click="playerDetailTab = 'stats'"
          >
            属性
          </button>
          <button 
            class="detail-tab"
            :class="{ active: playerDetailTab === 'heroes' }"
            @click="playerDetailTab = 'heroes'"
          >
            英雄
          </button>
          <button 
            class="detail-tab"
            :class="{ active: playerDetailTab === 'data' }"
            @click="playerDetailTab = 'data'"
          >
            数据
          </button>
          <button 
            class="detail-tab"
            :class="{ active: playerDetailTab === 'personality' }"
            @click="playerDetailTab = 'personality'"
          >
            个性
          </button>
          <button 
            class="detail-tab"
            :class="{ active: playerDetailTab === 'dialogue' }"
            @click="playerDetailTab = 'dialogue'"
          >
            对话
          </button>
          <button 
            class="detail-tab"
            :class="{ active: playerDetailTab === 'relationship' }"
            @click="playerDetailTab = 'relationship'"
          >
            关系
          </button>
          <button 
            class="detail-tab"
            :class="{ active: playerDetailTab === 'story' }"
            @click="playerDetailTab = 'story'"
          >
            故事
          </button>
          <button 
            class="detail-tab"
            :class="{ active: playerDetailTab === 'commercial' }"
            @click="playerDetailTab = 'commercial'"
          >
            商业
          </button>
        </div>
        
        <div class="modal-body">
          <!-- 属性标签页 -->
          <div v-if="playerDetailTab === 'stats'" class="tab-content">
            <!-- 基础信息 -->
            <div class="info-section">
              <h4>基础信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">潜力</span>
                  <span class="info-value">{{ selectedPlayer.potential }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">总实力</span>
                  <span class="info-value highlight">{{ getPlayerPower(selectedPlayer) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">周薪</span>
                  <span class="info-value">{{ selectedPlayer.contract.salary }}万</span>
                </div>
                <div class="info-item">
                  <span class="info-label">合同到期</span>
                  <span class="info-value">{{ formatDate(selectedPlayer.contract.endDate) }}</span>
                </div>
              </div>
            </div>
            
            <!-- 属性详情 -->
            <div class="stats-section">
              <h4>属性详情</h4>
              <div 
                v-for="(value, key) in selectedPlayer.stats" 
                :key="key"
                class="detail-stat-row"
              >
                <span class="stat-name">{{ statNames[key] }}</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: value + '%' }"></div>
                </div>
                <span class="stat-num">{{ Math.round(value) }}</span>
              </div>
            </div>
            
            <!-- 性格特质 -->
            <div class="personality-section" v-if="Object.keys(getPlayerPersonality(selectedPlayer)).length > 0">
              <h4>性格特质</h4>
              <div class="personality-grid">
                <div 
                  v-for="(value, key) in getPlayerPersonality(selectedPlayer)" 
                  :key="key"
                  class="personality-item"
                >
                  <span class="personality-label">{{ personalityNames[key] || key }}</span>
                  <span class="personality-value">{{ personalityValueNames[value] || value }}</span>
                </div>
              </div>
            </div>

            <!-- 特殊天赋 -->
            <div class="talents-section" v-if="getPlayerTalents(selectedPlayer).length > 0">
              <h4>特殊天赋</h4>
              <div class="talents-list">
                <div 
                  v-for="talent in getPlayerTalents(selectedPlayer)" 
                  :key="talent.id"
                  class="talent-item"
                >
                  <span class="talent-name">{{ talent.name }}</span>
                  <span class="talent-desc">{{ talent.description }}</span>
                </div>
              </div>
            </div>
            
            <!-- 当前状态 -->
            <div class="condition-section">
              <h4>当前状态</h4>
              <div class="condition-grid">
                <div class="condition-item">
                  <span class="condition-label">体力</span>
                  <span class="condition-value" :style="{ color: getStaminaColor(selectedPlayer.condition.stamina) }">
                    {{ selectedPlayer.condition.stamina }}
                  </span>
                </div>
                <div class="condition-item">
                  <span class="condition-label">心态</span>
                  <span class="condition-value">{{ selectedPlayer.condition.mentality }}</span>
                </div>
                <div class="condition-item">
                  <span class="condition-label">士气</span>
                  <span class="condition-value">{{ selectedPlayer.condition.morale }}</span>
                </div>
                <div class="condition-item">
                  <span class="condition-label">伤病</span>
                  <span class="condition-value" :class="{ injured: selectedPlayer.condition.injury > 0 }">
                    {{ selectedPlayer.condition.injury }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 训练 -->
            <div class="action-section" v-if="activeTab === 'roster'">
              <h4>训练</h4>
              <div class="train-buttons">
                <button 
                  v-for="(name, key) in statNames" 
                  :key="key"
                  class="train-btn"
                  :disabled="selectedPlayer.condition.stamina < 20"
                  @click="trainPlayer(selectedPlayer, key)"
                >
                  {{ name }}
                </button>
              </div>
              <p class="train-hint" v-if="selectedPlayer.condition.stamina < 20">
                体力不足，请先休息
              </p>
            </div>
          </div>

          <!-- 英雄标签页 -->
          <div v-else-if="playerDetailTab === 'heroes'" class="tab-content">
            <!-- 英雄偏好 -->
            <div class="hero-preference-section">
              <h4>英雄偏好</h4>
              <div class="preference-content">
                <div class="preference-item" v-if="getPlayerHeroPreference(selectedPlayer).preferredRoles.length > 0">
                  <span class="preference-label">擅长定位</span>
                  <div class="preference-tags">
                    <span 
                      v-for="role in getPlayerHeroPreference(selectedPlayer).preferredRoles" 
                      :key="role"
                      class="preference-tag"
                    >
                      {{ heroStore.getRoleName(role) }}
                    </span>
                  </div>
                </div>
                <div class="preference-item" v-if="getPlayerHeroPreference(selectedPlayer).preferredTags.length > 0">
                  <span class="preference-label">偏好标签</span>
                  <div class="preference-tags">
                    <span 
                      v-for="tag in getPlayerHeroPreference(selectedPlayer).preferredTags" 
                      :key="tag"
                      class="preference-tag tag-style"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div class="preference-item" v-if="getPlayerHeroPreference(selectedPlayer).favoriteHeroes.length > 0">
                  <span class="preference-label">Favorite英雄</span>
                  <div class="preference-tags">
                    <span 
                      v-for="heroId in getPlayerHeroPreference(selectedPlayer).favoriteHeroes" 
                      :key="heroId"
                      class="preference-tag hero-style"
                    >
                      {{ getHeroName(heroId) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 英雄使用统计 -->
            <div class="hero-stats-section">
              <h4>英雄使用统计</h4>
              <div v-if="getPlayerHeroStats(selectedPlayer).length > 0" class="hero-stats-list">
                <div 
                  v-for="stat in getPlayerHeroStats(selectedPlayer)" 
                  :key="stat.heroId"
                  class="hero-stat-item"
                >
                  <div class="hero-stat-header">
                    <div class="hero-info">
                      <span class="hero-name">{{ stat.heroName }}</span>
                      <span class="hero-role">{{ getHeroRole(stat.heroId) }}</span>
                    </div>
                    <div class="hero-winrate" :class="{ good: stat.winRate >= 55, bad: stat.winRate < 45 }">
                      {{ stat.winRate }}%
                    </div>
                  </div>
                  <div class="hero-stat-details">
                    <div class="stat-detail">
                      <span class="detail-label">场次</span>
                      <span class="detail-value">{{ stat.games }}</span>
                    </div>
                    <div class="stat-detail">
                      <span class="detail-label">胜场</span>
                      <span class="detail-value win">{{ stat.wins }}</span>
                    </div>
                    <div class="stat-detail">
                      <span class="detail-label">KDA</span>
                      <span class="detail-value">{{ stat.avgKDA }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-hero-stats">
                <p>暂无英雄使用记录</p>
              </div>
            </div>
          </div>

          <!-- 数据标签页 -->
          <div v-else-if="playerDetailTab === 'data'" class="tab-content">
            <!-- 生涯统计 -->
            <div class="career-stats-section">
              <h4>生涯统计</h4>
              <div class="career-stats-grid">
                <div class="career-stat-item">
                  <span class="career-stat-value">{{ getPlayerCareerStats(selectedPlayer).totalMatches }}</span>
                  <span class="career-stat-label">总场次</span>
                </div>
                <div class="career-stat-item">
                  <span class="career-stat-value win">{{ getPlayerCareerStats(selectedPlayer).wins }}</span>
                  <span class="career-stat-label">胜场</span>
                </div>
                <div class="career-stat-item">
                  <span class="career-stat-value loss">{{ getPlayerCareerStats(selectedPlayer).losses }}</span>
                  <span class="career-stat-label">负场</span>
                </div>
                <div class="career-stat-item">
                  <span class="career-stat-value" :class="{ good: getPlayerCareerStats(selectedPlayer).winRate >= 55 }">
                    {{ getPlayerCareerStats(selectedPlayer).winRate }}%
                  </span>
                  <span class="career-stat-label">胜率</span>
                </div>
                <div class="career-stat-item">
                  <span class="career-stat-value">{{ getPlayerCareerStats(selectedPlayer).mvpCount || 0 }}</span>
                  <span class="career-stat-label">MVP</span>
                </div>
                <div class="career-stat-item">
                  <span class="career-stat-value">{{ getPlayerCareerStats(selectedPlayer).averageKDA || 0 }}</span>
                  <span class="career-stat-label">平均KDA</span>
                </div>
              </div>
            </div>

            <!-- 合同信息 -->
            <div class="contract-section">
              <h4>合同信息</h4>
              <div class="info-list">
                <div class="info-row">
                  <span class="info-label">周薪</span>
                  <span class="info-value">{{ selectedPlayer.contract.salary }}万</span>
                </div>
                <div class="info-row">
                  <span class="info-label">违约金</span>
                  <span class="info-value">{{ selectedPlayer.contract.buyoutClause.toFixed(1) }}万</span>
                </div>
                <div class="info-row">
                  <span class="info-label">合同到期</span>
                  <span class="info-value">{{ formatDate(selectedPlayer.contract.endDate) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 个性标签页 -->
          <div v-else-if="playerDetailTab === 'personality'" class="tab-content personality-tab">
            <PlayerEmotion 
              :player-id="selectedPlayer.id" 
              :show-details="true"
            />
            
            <div class="personality-sections">
              <div class="section-card">
                <PlayerDemands 
                  :player-id="selectedPlayer.id"
                  @demand-processed="(id, satisfied) => console.log('Demand processed:', id, satisfied)"
                />
              </div>
              
              <div class="section-card">
                <PlayerDialogue :player-id="selectedPlayer.id" />
              </div>
            </div>
          </div>

          <!-- 对话标签页 -->
          <div v-else-if="playerDetailTab === 'dialogue'" class="tab-content dialogue-tab">
            <div class="dialogue-container">
              <PlayerDialogue :player-id="selectedPlayer.id" />
            </div>
          </div>

          <!-- 关系标签页 -->
          <div v-else-if="playerDetailTab === 'relationship'" class="tab-content relationship-tab">
            <div class="relationship-container">
              <RelationshipNetwork :club-id="clubStore.currentClub?.id || ''" />
            </div>
          </div>

          <!-- 故事标签页 -->
          <div v-else-if="playerDetailTab === 'story'" class="tab-content story-tab">
            <div class="story-container">
              <h4>选手故事线</h4>
              <div class="story-placeholder">
                <p>{{ selectedPlayer.name }} 的故事正在书写中...</p>
                <p class="story-hint">随着比赛和训练，故事将逐步展开</p>
              </div>
            </div>
          </div>

          <!-- 商业标签页 -->
          <div v-else-if="playerDetailTab === 'commercial'" class="tab-content commercial-tab">
            <div class="commercial-container">
              <EndorsementManager 
                :player-id="selectedPlayer.id"
                :endorsements="selectedPlayer.endorsements || []"
                @complete="handleEndorsementComplete"
                @terminate="handleEndorsementTerminate"
              />
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            v-if="activeTab === 'roster'"
            class="rest-btn"
            @click="restPlayer(selectedPlayer)"
          >
            休息恢复
          </button>
          <button 
            v-if="activeTab === 'roster'"
            class="release-btn"
            @click="releasePlayer(selectedPlayer); closePlayerDetail()"
          >
            解约
          </button>
          <button 
            v-if="activeTab === 'youth'"
            class="promote-btn"
            @click="promoteYouth(selectedPlayer); closePlayerDetail()"
          >
            提拔到一线队
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
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

/* 选手列表 */
.player-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.player-card:active {
  transform: scale(0.98);
}

.player-card.youth {
  border-left: 4px solid #28a745;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.player-position {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.player-position.top { background: #e74c3c; }
.player-position.jungle { background: #27ae60; }
.player-position.mid { background: #3498db; }
.player-position.adc { background: #f39c12; }
.player-position.support { background: #9b59b6; }

.player-name {
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.player-age {
  font-size: 12px;
  color: #999;
}

/* 属性条 */
.player-stats {
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.stat-label {
  width: 40px;
  font-size: 12px;
  color: #666;
}

.stat-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: #007bff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stat-fill.stamina {
  background: #28a745;
}

.stat-fill.potential {
  background: #9b59b6;
}

.stat-value {
  width: 35px;
  text-align: right;
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

/* 底部信息 */
.player-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.condition-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.condition-badge.良好 {
  background: #d4edda;
  color: #155724;
}

.condition-badge.疲劳 {
  background: #fff3cd;
  color: #856404;
}

.condition-badge.受伤 {
  background: #f8d7da;
  color: #721c24;
}

.condition-badge.低落 {
  background: #e2e3e5;
  color: #383d41;
}

.salary {
  font-size: 12px;
  color: #28a745;
  font-weight: bold;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.promote {
  background: #28a745;
  color: white;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin-bottom: 15px;
}

.link-btn {
  display: inline-block;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
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
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-content {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@media (min-width: 768px) {
  .modal-content {
    border-radius: 16px;
    max-height: 80vh;
    animation: fadeIn 0.3s ease;
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* 选手详情弹窗样式 */
.player-detail-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.player-header-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.player-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  border: 2px solid rgba(255,255,255,0.3);
}

.player-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.player-subtitle {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.position-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.position-tag.top { background: #e74c3c; }
.position-tag.jungle { background: #27ae60; }
.position-tag.mid { background: #3498db; }
.position-tag.adc { background: #f39c12; }
.position-tag.support { background: #9b59b6; }

.age-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: rgba(255,255,255,0.2);
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255,255,255,0.3);
}

/* 详情标签页 */
.detail-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
}

.detail-tab {
  flex: 1;
  padding: 14px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.detail-tab.active {
  color: #007bff;
  font-weight: 600;
}

.detail-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 3px;
  background: #007bff;
  border-radius: 3px 3px 0 0;
}

.modal-body {
  padding: 20px;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

/* 通用区块样式 */
.info-section,
.stats-section,
.personality-section,
.talents-section,
.condition-section,
.action-section,
.hero-preference-section,
.hero-stats-section,
.career-stats-section,
.contract-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.info-section:last-child,
.stats-section:last-child,
.personality-section:last-child,
.talents-section:last-child,
.condition-section:last-child,
.action-section:last-child,
.hero-preference-section:last-child,
.hero-stats-section:last-child,
.career-stats-section:last-child,
.contract-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

h4 {
  font-size: 15px;
  color: #333;
  margin: 0 0 14px 0;
  font-weight: 600;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.info-label {
  font-size: 12px;
  color: #999;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.info-value.highlight {
  color: #007bff;
  font-size: 18px;
}

/* 属性详情 */
.detail-stat-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.stat-name {
  width: 50px;
  font-size: 13px;
  color: #666;
}

.stat-num {
  width: 36px;
  text-align: right;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

/* 性格特质 */
.personality-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.personality-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.personality-label {
  font-size: 12px;
  color: #999;
}

.personality-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 天赋 */
.talents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.talent-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%);
  border-radius: 8px;
  border-left: 3px solid #faad14;
}

.talent-name {
  font-size: 14px;
  font-weight: 600;
  color: #d48806;
}

.talent-desc {
  font-size: 12px;
  color: #666;
}

/* 状态 */
.condition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.condition-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.condition-label {
  font-size: 13px;
  color: #666;
}

.condition-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.condition-value.injured {
  color: #dc3545;
}

/* 训练按钮 */
.train-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.train-btn {
  padding: 12px;
  border: 1px solid #007bff;
  border-radius: 8px;
  background: white;
  color: #007bff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.train-btn:active:not(:disabled) {
  background: #007bff;
  color: white;
}

.train-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ccc;
  color: #999;
}

.train-hint {
  font-size: 12px;
  color: #dc3545;
  margin-top: 12px;
  text-align: center;
}

/* 英雄偏好 */
.preference-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.preference-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preference-label {
  font-size: 13px;
  color: #666;
}

.preference-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preference-tag {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  background: #e6f7ff;
  color: #1890ff;
}

.preference-tag.tag-style {
  background: #f6ffed;
  color: #52c41a;
}

.preference-tag.hero-style {
  background: #fff7e6;
  color: #fa8c16;
}

/* 英雄统计 */
.hero-stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-stat-item {
  padding: 14px;
  background: #f9f9f9;
  border-radius: 10px;
}

.hero-stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.hero-role {
  font-size: 12px;
  color: #999;
}

.hero-winrate {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.hero-winrate.good {
  color: #52c41a;
}

.hero-winrate.bad {
  color: #ff4d4f;
}

.hero-stat-details {
  display: flex;
  gap: 20px;
}

.stat-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 11px;
  color: #999;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.detail-value.win {
  color: #52c41a;
}

.empty-hero-stats {
  text-align: center;
  padding: 30px;
  color: #999;
  background: #f9f9f9;
  border-radius: 10px;
}

/* 生涯统计 */
.career-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.career-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 10px;
  background: #f9f9f9;
  border-radius: 10px;
}

.career-stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.career-stat-value.win {
  color: #52c41a;
}

.career-stat-value.loss {
  color: #ff4d4f;
}

.career-stat-value.good {
  color: #52c41a;
}

.career-stat-label {
  font-size: 12px;
  color: #999;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

 .personality-tab {
  padding: 0;
}

.personality-tab {
  padding: 16px;
}

.dialogue-tab {
  padding: 16px;
}

.dialogue-container {
  min-height: 200px;
}

.relationship-tab {
  padding: 16px;
}

.relationship-container {
  min-height: 300px;
}

.story-tab {
  padding: 16px;
}

.story-container {
  min-height: 200px;
}

.story-container h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  color: #333;
}

.story-placeholder {
  text-align: center;
  padding: 40px;
  color: #999;
}

.story-placeholder p {
  margin: 5px 0;
}

.story-hint {
  font-size: 12px;
  color: #666;
}

.commercial-tab {
  padding: 16px;
}

.commercial-container {
  min-height: 200px;
}

/* 弹窗底部 */
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
}

.modal-footer button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.rest-btn {
  background: #52c41a;
  color: white;
}

.release-btn {
  background: #ff4d4f;
  color: white;
}

.promote-btn {
  background: #007bff;
  color: white;
}

/* 个性标签页样式 */
.personality-tab {
  padding: 0;
}

.personality-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.section-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
</style>
