<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useTacticsStore } from '@/stores/tactics';
import { useHeroStore } from '@/stores/hero';
import {
  initializeTactics,
  generateBPRecommendation,
  updateBPStrategy,
  updateVersionUnderstanding,
  analyzeOpponent,
} from '@/core/services/tacticsService';
import type { BPRecommendation, MetaHero } from '@/types/tactics';

const router = useRouter();
const clubStore = useClubStore();
const tacticsStore = useTacticsStore();
const heroStore = useHeroStore();

const clubId = computed(() => clubStore.currentClub?.id || '');
const tactics = computed(() => {
  if (!clubId.value) return null;
  return tacticsStore.getTactics(clubId.value) || initializeTactics(clubId.value);
});

const versionUnderstanding = computed(() => tacticsStore.getVersionUnderstanding(clubId.value));
const allHeroes = computed(() => heroStore.allHeroes);

const bpStrategy = computed(() => tactics.value?.bpStrategy || { priorityHeroes: [], banTargets: [], counterPicks: {}, flexPicks: [], reserveStrategy: [] });

const activeTab = ref<'priority' | 'ban' | 'recommendations' | 'analysis'>('priority');
const searchQuery = ref('');
const selectedOpponent = ref<string | null>(null);

const recommendations = computed(() => generateBPRecommendation(clubId.value));

const metaHeroes = computed(() => versionUnderstanding.value?.metaHeroes || []);

const filteredHeroes = computed(() => {
  if (!searchQuery.value) return allHeroes.value;
  return allHeroes.value.filter(h => 
    h.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const opponentAnalysis = computed(() => {
  if (!selectedOpponent.value) return null;
  return analyzeOpponent(selectedOpponent.value);
});

const priorityHeroesList = computed(() => {
  return bpStrategy.value.priorityHeroes.map(heroId => {
    const hero = allHeroes.value.find(h => h.id === heroId);
    return hero ? { id: heroId, name: hero.name, role: hero.role } : null;
  }).filter(Boolean);
});

const banTargetsList = computed(() => {
  return bpStrategy.value.banTargets.map(heroId => {
    const hero = allHeroes.value.find(h => h.id === heroId);
    return hero ? { id: heroId, name: hero.name, role: hero.role } : null;
  }).filter(Boolean);
});

onMounted(() => {
  if (clubId.value) {
    initializeTactics(clubId.value);
    updateVersionUnderstanding(clubId.value);
  }
});

const addPriorityHero = (heroId: string) => {
  if (!bpStrategy.value.priorityHeroes.includes(heroId)) {
    updateBPStrategy(clubId.value, {
      priorityHeroes: [...bpStrategy.value.priorityHeroes, heroId]
    });
  }
};

const removePriorityHero = (heroId: string) => {
  updateBPStrategy(clubId.value, {
    priorityHeroes: bpStrategy.value.priorityHeroes.filter(id => id !== heroId)
  });
};

const addBanTarget = (heroId: string) => {
  if (!bpStrategy.value.banTargets.includes(heroId)) {
    updateBPStrategy(clubId.value, {
      banTargets: [...bpStrategy.value.banTargets, heroId]
    });
  }
};

const removeBanTarget = (heroId: string) => {
  updateBPStrategy(clubId.value, {
    banTargets: bpStrategy.value.banTargets.filter(id => id !== heroId)
  });
};

const goBack = () => {
  router.push('/tactics');
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'S': return '#ff4d4f';
    case 'A': return '#fa8c16';
    case 'B': return '#faad14';
    default: return '#8c8c8c';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return '#ff4d4f';
    case 'medium': return '#faad14';
    case 'low': return '#52c41a';
    default: return '#8c8c8c';
  }
};
</script>

<template>
  <div class="bp-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <h2 class="page-title">BP策略</h2>
    </div>

    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-label">优先英雄</div>
        <div class="summary-value">{{ bpStrategy.priorityHeroes.length }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">禁用目标</div>
        <div class="summary-value">{{ bpStrategy.banTargets.length }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">版本理解</div>
        <div class="summary-value">Lv.{{ versionUnderstanding?.understandingLevel || 0 }}</div>
      </div>
    </div>

    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'priority' }"
        @click="activeTab = 'priority'"
      >
        优先选择
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'ban' }"
        @click="activeTab = 'ban'"
      >
        禁用目标
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'recommendations' }"
        @click="activeTab = 'recommendations'"
      >
        AI推荐
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'analysis' }"
        @click="activeTab = 'analysis'"
      >
        对手分析
      </button>
    </div>

    <div v-if="activeTab === 'priority'" class="priority-section">
      <div class="section-header">
        <h3 class="section-title">优先选择英雄</h3>
        <span class="hint">点击英雄添加到优先列表</span>
      </div>

      <div v-if="priorityHeroesList.length > 0" class="selected-heroes">
        <div v-for="hero in priorityHeroesList" :key="hero?.id" class="selected-hero-card">
          <span class="hero-name">{{ hero?.name }}</span>
          <span class="hero-role">{{ hero?.role }}</span>
          <button class="remove-btn" @click="removePriorityHero(hero?.id || '')">×</button>
        </div>
      </div>

      <div class="search-box">
        <input 
          v-model="searchQuery" 
          placeholder="搜索英雄..." 
          class="search-input"
        />
      </div>

      <div class="heroes-grid">
        <div 
          v-for="hero in filteredHeroes.slice(0, 20)" 
          :key="hero.id"
          class="hero-card"
          :class="{ selected: bpStrategy.priorityHeroes.includes(hero.id) }"
          @click="addPriorityHero(hero.id)"
        >
          <div class="hero-name">{{ hero.name }}</div>
          <div class="hero-role">{{ hero.role }}</div>
          <div class="hero-tier">T{{ hero.tier + 1 }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'ban'" class="ban-section">
      <div class="section-header">
        <h3 class="section-title">禁用目标</h3>
        <span class="hint">优先禁用这些英雄</span>
      </div>

      <div v-if="banTargetsList.length > 0" class="selected-heroes">
        <div v-for="hero in banTargetsList" :key="hero?.id" class="selected-hero-card ban">
          <span class="hero-name">{{ hero?.name }}</span>
          <span class="hero-role">{{ hero?.role }}</span>
          <button class="remove-btn" @click="removeBanTarget(hero?.id || '')">×</button>
        </div>
      </div>

      <div class="search-box">
        <input 
          v-model="searchQuery" 
          placeholder="搜索英雄..." 
          class="search-input"
        />
      </div>

      <div class="heroes-grid">
        <div 
          v-for="hero in filteredHeroes.slice(0, 20)" 
          :key="hero.id"
          class="hero-card"
          :class="{ selected: bpStrategy.banTargets.includes(hero.id) }"
          @click="addBanTarget(hero.id)"
        >
          <div class="hero-name">{{ hero.name }}</div>
          <div class="hero-role">{{ hero.role }}</div>
          <div class="hero-tier">T{{ hero.tier + 1 }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'recommendations'" class="recommendations-section">
      <div class="section-header">
        <h3 class="section-title">AI推荐</h3>
        <span class="hint">基于版本和阵容的智能推荐</span>
      </div>

      <div class="meta-heroes" v-if="metaHeroes.length > 0">
        <h4 class="sub-title">版本强势英雄</h4>
        <div class="meta-grid">
          <div v-for="hero in metaHeroes.slice(0, 6)" :key="hero.heroId" class="meta-card">
            <div class="meta-tier" :style="{ color: getTierColor(hero.tier) }">{{ hero.tier }}</div>
            <div class="meta-name">{{ hero.heroName }}</div>
            <div class="meta-stats">
              <span>胜率: {{ hero.winRate.toFixed(1) }}%</span>
              <span>登场: {{ hero.pickRate.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="recommendations-list">
        <h4 class="sub-title">BP推荐</h4>
        <div v-for="rec in recommendations" :key="rec.heroId + rec.phase" class="recommendation-card">
          <div class="rec-header">
            <span class="rec-phase" :class="rec.phase">{{ rec.phase === 'ban' ? '禁用' : '选择' }}</span>
            <span class="rec-priority" :style="{ color: getPriorityColor(rec.priority) }">
              {{ rec.priority === 'high' ? '高优先' : rec.priority === 'medium' ? '中优先' : '低优先' }}
            </span>
          </div>
          <div class="rec-hero">{{ rec.heroName }}</div>
          <div class="rec-reason">{{ rec.reason }}</div>
          <div class="rec-winrate" v-if="rec.phase === 'pick'">
            预期胜率: {{ rec.expectedWinRate.toFixed(1) }}%
          </div>
          <div class="rec-actions">
            <button 
              v-if="rec.phase === 'pick'" 
              class="action-btn add-priority"
              @click="addPriorityHero(rec.heroId)"
            >
              加入优先
            </button>
            <button 
              v-else 
              class="action-btn add-ban"
              @click="addBanTarget(rec.heroId)"
            >
              加入禁用
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'analysis'" class="analysis-section">
      <div class="section-header">
        <h3 class="section-title">对手分析</h3>
      </div>

      <div class="opponent-selector">
        <p class="hint">选择对手进行分析（功能开发中）</p>
      </div>

      <div v-if="opponentAnalysis" class="analysis-result">
        <div class="analysis-card">
          <h4>预测阵容</h4>
          <p>{{ opponentAnalysis.opponentFormation || '未知' }}</p>
        </div>
        <div class="analysis-card">
          <h4>预测风格</h4>
          <p>{{ opponentAnalysis.opponentStyle || '未知' }}</p>
        </div>
        <div class="analysis-card">
          <h4>弱点分析</h4>
          <ul>
            <li v-for="(weakness, idx) in opponentAnalysis.weaknesses" :key="idx">
              {{ weakness }}
            </li>
          </ul>
        </div>
        <div class="analysis-card">
          <h4>战术建议</h4>
          <ul>
            <li v-for="(rec, idx) in opponentAnalysis.recommendations" :key="idx">
              {{ rec }}
            </li>
          </ul>
        </div>
      </div>

      <div v-else class="empty-analysis">
        <p>选择对手后查看分析结果</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bp-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f0f0f0;
  font-size: 18px;
  cursor: pointer;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.tab-btn {
  flex: 1;
  padding: 10px 8px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.hint {
  font-size: 12px;
  color: #999;
}

.selected-heroes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.selected-hero-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 8px 12px;
}

.selected-hero-card.ban {
  background: #fff1f0;
  border-color: #ffa39e;
}

.hero-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.hero-role {
  font-size: 11px;
  color: #666;
}

.remove-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-box {
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
}

.heroes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.hero-card {
  background: white;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
}

.hero-card.selected {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.hero-tier {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
}

.sub-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.meta-card {
  background: white;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.meta-tier {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.meta-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.meta-stats {
  font-size: 10px;
  color: #999;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recommendation-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.rec-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.rec-phase {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
}

.rec-phase.ban {
  background: #fff1f0;
  color: #ff4d4f;
}

.rec-phase.pick {
  background: #e6f7ff;
  color: #1890ff;
}

.rec-priority {
  font-size: 12px;
  font-weight: 600;
}

.rec-hero {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.rec-reason {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.rec-winrate {
  font-size: 12px;
  color: #52c41a;
  margin-bottom: 10px;
}

.rec-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.add-priority {
  background: #007bff;
  color: white;
}

.add-ban {
  background: #ff4d4f;
  color: white;
}

.opponent-selector {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  margin-bottom: 15px;
}

.analysis-result {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.analysis-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.analysis-card h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}

.analysis-card p {
  font-size: 13px;
  color: #666;
}

.analysis-card ul {
  list-style: none;
  padding: 0;
}

.analysis-card li {
  font-size: 12px;
  color: #666;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.analysis-card li:last-child {
  border-bottom: none;
}

.empty-analysis {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  color: #999;
}
</style>
