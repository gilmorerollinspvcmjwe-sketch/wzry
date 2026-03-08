<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVersionStore } from '@/stores/version';
import { useHeroStore } from '@/stores/hero';
import { useClubStore } from '@/stores/club';
import type { GameVersion, HeroBalanceChange } from '@/types/version';

const versionStore = useVersionStore();
const heroStore = useHeroStore();
const clubStore = useClubStore();

const activeTab = ref<'current' | 'history' | 'adaptation' | 'research'>('current');
const showUpdateModal = ref(false);
const showResearchModal = ref(false);
const researchTarget = ref<'meta' | 'counter' | 'synergy'>('meta');
const researchInvestment = ref(50);

const currentClubId = computed(() => clubStore.currentClub?.id || '');

const adaptation = computed(() => {
  if (!currentClubId.value) return null;
  return versionStore.getAdaptation(currentClubId.value);
});

const adaptationLevel = computed(() => {
  if (!currentClubId.value) return 0;
  return versionStore.getAdaptationLevel(currentClubId.value);
});

const researches = computed(() => {
  if (!currentClubId.value) return [];
  return versionStore.getResearches(currentClubId.value);
});

const knownMetaHeroes = computed(() => {
  if (!currentClubId.value) return [];
  return versionStore.getKnownMetaHeroes(currentClubId.value);
});

const heroChangeDetails = computed(() => {
  const changes = versionStore.heroChanges;
  return changes.map(change => {
    const hero = heroStore.getHeroById(change.heroId);
    return {
      ...change,
      heroName: hero?.name || change.heroId,
      heroAvatar: hero?.avatar,
    };
  });
});

const buffedHeroes = computed(() => heroChangeDetails.value.filter(h => h.changeType === 'buff'));
const nerfedHeroes = computed(() => heroChangeDetails.value.filter(h => h.changeType === 'nerf'));
const reworkedHeroes = computed(() => heroChangeDetails.value.filter(h => h.changeType === 'rework'));
const newHeroesList = computed(() => heroChangeDetails.value.filter(h => h.changeType === 'new'));

const adaptationProgressStyle = computed(() => {
  const level = adaptationLevel.value;
  if (level >= 80) return { background: 'linear-gradient(90deg, #4CAF50, #8BC34A)' };
  if (level >= 50) return { background: 'linear-gradient(90deg, #FFC107, #FF9800)' };
  return { background: 'linear-gradient(90deg, #F44336, #FF5722)' };
});

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('zh-CN');
}

function getChangeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    buff: '增强',
    nerf: '削弱',
    rework: '重做',
    new: '新英雄',
    adjust: '调整',
  };
  return labels[type] || type;
}

function getChangeTypeClass(type: string): string {
  const classes: Record<string, string> = {
    buff: 'buff',
    nerf: 'nerf',
    rework: 'rework',
    new: 'new',
    adjust: 'adjust',
  };
  return classes[type] || '';
}

function startResearch() {
  if (!currentClubId.value) return;
  
  const research = {
    id: `research_${Date.now()}`,
    clubId: currentClubId.value,
    target: researchTarget.value,
    investment: researchInvestment.value,
    startDate: new Date(),
    progress: 0,
    completed: false,
  };
  
  versionStore.addResearch(currentClubId.value, research);
  showResearchModal.value = false;
  
  // 模拟研究进度
  setTimeout(() => {
    research.progress = 100;
    research.completed = true;
    
    // 增加版本适应度
    const currentLevel = versionStore.getAdaptationLevel(currentClubId.value);
    versionStore.updateAdaptationLevel(currentClubId.value, currentLevel + researchInvestment.value / 10);
  }, 2000);
}

function checkUpdate() {
  const hasUpdate = versionStore.checkForUpdate();
  if (hasUpdate) {
    showUpdateModal.value = true;
  }
}

function applyUpdate() {
  if (versionStore.pendingVersion) {
    versionStore.setCurrentVersion(versionStore.pendingVersion);
    versionStore.clearPendingVersion();
    showUpdateModal.value = false;
  }
}

onMounted(() => {
  versionStore.refreshVersion();
  if (currentClubId.value) {
    versionStore.initAdaptation(currentClubId.value);
  }
});
</script>

<template>
  <div class="version-page">
    <div class="page-header">
      <h1 class="page-title">版本系统</h1>
      <div class="header-actions">
        <button v-if="versionStore.hasPendingUpdate" class="btn btn-primary" @click="showUpdateModal = true">
          有新版本可用
        </button>
        <button class="btn btn-secondary" @click="checkUpdate">
          检查更新
        </button>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="tab-nav">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'current' }"
        @click="activeTab = 'current'"
      >
        当前版本
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        版本历史
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'adaptation' }"
        @click="activeTab = 'adaptation'"
      >
        版本适应
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'research' }"
        @click="activeTab = 'research'"
      >
        版本研究
      </button>
    </div>

    <!-- 当前版本 -->
    <div v-if="activeTab === 'current'" class="tab-content">
      <div class="version-info card">
        <div class="version-header">
          <div class="version-number">{{ versionStore.versionNumber }}</div>
          <div class="version-date">发布日期: {{ formatDate(versionStore.releaseDate) }}</div>
        </div>
        <div class="version-description">
          {{ versionStore.description }}
        </div>
      </div>

      <!-- 英雄调整 -->
      <div v-if="heroChangeDetails.length > 0" class="hero-changes card">
        <h3 class="section-title">英雄调整</h3>
        
        <div v-if="buffedHeroes.length > 0" class="change-section">
          <h4 class="change-title buff">增强</h4>
          <div class="hero-list">
            <div v-for="hero in buffedHeroes" :key="hero.heroId" class="hero-item">
              <div class="hero-avatar" v-if="hero.heroAvatar">
                <img :src="hero.heroAvatar" :alt="hero.heroName">
              </div>
              <div class="hero-info">
                <div class="hero-name">{{ hero.heroName }}</div>
                <div class="hero-desc">{{ hero.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="nerfedHeroes.length > 0" class="change-section">
          <h4 class="change-title nerf">削弱</h4>
          <div class="hero-list">
            <div v-for="hero in nerfedHeroes" :key="hero.heroId" class="hero-item">
              <div class="hero-avatar" v-if="hero.heroAvatar">
                <img :src="hero.heroAvatar" :alt="hero.heroName">
              </div>
              <div class="hero-info">
                <div class="hero-name">{{ hero.heroName }}</div>
                <div class="hero-desc">{{ hero.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="reworkedHeroes.length > 0" class="change-section">
          <h4 class="change-title rework">重做</h4>
          <div class="hero-list">
            <div v-for="hero in reworkedHeroes" :key="hero.heroId" class="hero-item">
              <div class="hero-avatar" v-if="hero.heroAvatar">
                <img :src="hero.heroAvatar" :alt="hero.heroName">
              </div>
              <div class="hero-info">
                <div class="hero-name">{{ hero.heroName }}</div>
                <div class="hero-desc">{{ hero.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="newHeroesList.length > 0" class="change-section">
          <h4 class="change-title new">新英雄</h4>
          <div class="hero-list">
            <div v-for="hero in newHeroesList" :key="hero.heroId" class="hero-item">
              <div class="hero-avatar" v-if="hero.heroAvatar">
                <img :src="hero.heroAvatar" :alt="hero.heroName">
              </div>
              <div class="hero-info">
                <div class="hero-name">{{ hero.heroName }}</div>
                <div class="hero-desc">{{ hero.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 更新日志 -->
      <div v-if="versionStore.patchNotes" class="patch-notes card">
        <h3 class="section-title">更新日志</h3>
        <pre class="patch-content">{{ versionStore.patchNotes }}</pre>
      </div>
    </div>

    <!-- 版本历史 -->
    <div v-if="activeTab === 'history'" class="tab-content">
      <div class="history-list">
        <div v-for="(item, index) in versionStore.versionHistory" :key="index" class="history-item card">
          <div class="history-version">{{ item.version }}</div>
          <div class="history-date">{{ formatDate(item.date) }}</div>
          <div class="history-heroes">{{ item.heroCount }} 位英雄调整</div>
        </div>
      </div>
    </div>

    <!-- 版本适应 -->
    <div v-if="activeTab === 'adaptation'" class="tab-content">
      <div class="adaptation-card card">
        <h3 class="section-title">版本适应度</h3>
        <div class="adaptation-level">
          <div class="level-number">{{ adaptationLevel }}%</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: adaptationLevel + '%', ...adaptationProgressStyle }"></div>
          </div>
        </div>
        <div class="adaptation-desc">
          版本适应度影响BP质量和战术执行效果。通过版本研究可以提升适应度。
        </div>
      </div>

      <div v-if="knownMetaHeroes.length > 0" class="known-heroes card">
        <h3 class="section-title">已掌握强势英雄</h3>
        <div class="hero-tags">
          <span v-for="heroId in knownMetaHeroes" :key="heroId" class="hero-tag">
            {{ heroStore.getHeroById(heroId)?.name || heroId }}
          </span>
        </div>
      </div>
    </div>

    <!-- 版本研究 -->
    <div v-if="activeTab === 'research'" class="tab-content">
      <div class="research-actions card">
        <h3 class="section-title">开始研究</h3>
        <button class="btn btn-primary" @click="showResearchModal = true">
          新版本研究
        </button>
      </div>

      <div class="research-list">
        <h3 class="section-title">研究记录</h3>
        <div v-for="research in researches" :key="research.id" class="research-item card">
          <div class="research-header">
            <span class="research-target">{{ research.target === 'meta' ? 'Meta研究' : research.target === 'counter' ? 'Counter研究' : 'Synergy研究' }}</span>
            <span class="research-status" :class="{ completed: research.completed }">
              {{ research.completed ? '已完成' : '进行中' }}
            </span>
          </div>
          <div class="research-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: research.progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ research.progress }}%</span>
          </div>
          <div class="research-investment">投入: {{ research.investment }} 研究点</div>
        </div>
      </div>
    </div>

    <!-- 更新弹窗 -->
    <div v-if="showUpdateModal" class="modal-overlay" @click="showUpdateModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">新版本可用</h3>
        <div class="modal-body">
          <p>版本 {{ versionStore.pendingVersion?.version }} 已发布</p>
          <p>{{ versionStore.pendingVersion?.characteristics?.description }}</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showUpdateModal = false">稍后更新</button>
          <button class="btn btn-primary" @click="applyUpdate">立即更新</button>
        </div>
      </div>
    </div>

    <!-- 研究弹窗 -->
    <div v-if="showResearchModal" class="modal-overlay" @click="showResearchModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">版本研究</h3>
        <div class="modal-body">
          <div class="form-group">
            <label>研究目标</label>
            <select v-model="researchTarget" class="form-select">
              <option value="meta">Meta研究 - 发现强势英雄</option>
              <option value="counter">Counter研究 - 发现克制关系</option>
              <option value="synergy">Synergy研究 - 发现组合搭配</option>
            </select>
          </div>
          <div class="form-group">
            <label>研究投入 ({{ researchInvestment }} 点)</label>
            <input type="range" v-model="researchInvestment" min="10" max="100" class="form-range">
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showResearchModal = false">取消</button>
          <button class="btn btn-primary" @click="startResearch">开始研究</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.version-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.tab-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #667eea;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.version-number {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.version-date {
  color: #666;
  font-size: 14px;
}

.version-description {
  color: #555;
  line-height: 1.6;
}

.change-section {
  margin-bottom: 24px;
}

.change-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
}

.change-title.buff {
  background: #e8f5e9;
  color: #2e7d32;
}

.change-title.nerf {
  background: #ffebee;
  color: #c62828;
}

.change-title.rework {
  background: #e3f2fd;
  color: #1565c0;
}

.change-title.new {
  background: #fff3e0;
  color: #ef6c00;
}

.hero-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.hero-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.hero-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.hero-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.hero-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.patch-notes {
  background: #f8f9fa;
}

.patch-content {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.history-version {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.history-date {
  color: #666;
  font-size: 14px;
}

.history-heroes {
  color: #667eea;
  font-weight: 500;
}

.adaptation-card {
  text-align: center;
}

.adaptation-level {
  margin: 24px 0;
}

.level-number {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
}

.progress-bar {
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.adaptation-desc {
  color: #666;
  font-size: 14px;
  margin-top: 16px;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-tag {
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.research-actions {
  text-align: center;
}

.research-list {
  margin-top: 24px;
}

.research-item {
  margin-bottom: 12px;
}

.research-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.research-target {
  font-weight: 600;
  color: #333;
}

.research-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #fff3e0;
  color: #ef6c00;
}

.research-status.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.research-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.research-progress .progress-bar {
  flex: 1;
}

.progress-text {
  font-size: 13px;
  color: #666;
  min-width: 40px;
}

.research-investment {
  font-size: 13px;
  color: #888;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-body p {
  margin: 8px 0;
  color: #555;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.form-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
}
</style>