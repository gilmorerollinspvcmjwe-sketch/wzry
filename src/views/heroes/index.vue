<template>
  <div class="heroes-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">英雄图鉴</h1>
      <p class="page-subtitle">查看英雄强度、克制关系和版本变化</p>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-section">
      <!-- 定位筛选 -->
      <div class="filter-group">
        <span class="filter-label">定位</span>
        <div class="filter-options">
          <button
            v-for="role in roles"
            :key="role.value"
            :class="['filter-btn', { active: currentRole === role.value }]"
            @click="currentRole = role.value"
          >
            <span class="filter-icon">{{ role.icon }}</span>
            <span class="filter-text">{{ role.label }}</span>
          </button>
        </div>
      </div>

      <!-- 强度筛选 -->
      <div class="filter-group">
        <span class="filter-label">强度</span>
        <div class="filter-options">
          <button
            v-for="tier in tiers"
            :key="tier.value"
            :class="['filter-btn', 'tier-btn', { active: currentTier === tier.value }]"
            @click="currentTier = tier.value"
            :style="currentTier === tier.value ? { background: tier.color, color: '#fff' } : { color: tier.color }"
          >
            {{ tier.label }}
          </button>
        </div>
      </div>

      <!-- 标签筛选 -->
      <div class="filter-group" v-if="allTags.length > 0">
        <span class="filter-label">标签</span>
        <div class="filter-options">
          <button
            v-for="tag in allTags.slice(0, 8)"
            :key="tag"
            :class="['filter-btn', 'tag-btn', { active: currentTag === tag }]"
            @click="currentTag = currentTag === tag ? '' : tag"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>

    <!-- 英雄列表 -->
    <div class="heroes-grid">
      <div
        v-for="hero in filteredHeroes"
        :key="hero.id"
        class="hero-card"
        @click="showHeroDetail(hero)"
      >
        <div class="hero-card-header">
          <div class="hero-avatar">
            {{ heroStore.getRoleIcon(hero.role) }}
          </div>
          <div class="hero-basic-info">
            <h3 class="hero-name">{{ hero.name }}</h3>
            <div class="hero-meta">
              <span class="role-tag">{{ heroStore.getRoleName(hero.role) }}</span>
              <span 
                class="tier-tag"
                :style="{ background: heroStore.getHeroTierColor(hero.tier) }"
              >
                T{{ hero.tier }}
              </span>
            </div>
          </div>
        </div>

        <div class="hero-tags">
          <span v-for="tag in hero.tags.slice(0, 3)" :key="tag" class="hero-tag">
            {{ tag }}
          </span>
        </div>

        <div class="hero-counters" v-if="hero.counters.length > 0 || hero.counteredBy.length > 0">
          <div class="counter-section" v-if="hero.counters.length > 0">
            <span class="counter-label">克制</span>
            <div class="counter-heroes">
              <span 
                v-for="counterId in hero.counters.slice(0, 3)" 
                :key="counterId"
                class="counter-hero"
              >
                {{ getHeroName(counterId) }}
              </span>
            </div>
          </div>
          <div class="counter-section" v-if="hero.counteredBy.length > 0">
            <span class="counter-label">被克制</span>
            <div class="counter-heroes">
              <span 
                v-for="counterId in hero.counteredBy.slice(0, 3)" 
                :key="counterId"
                class="counter-hero danger"
              >
                {{ getHeroName(counterId) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 英雄详情弹窗 -->
    <div v-if="selectedHero" class="hero-modal" @click.self="closeHeroDetail">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-hero-info">
            <div class="modal-avatar">
              {{ heroStore.getRoleIcon(selectedHero.role) }}
            </div>
            <div class="modal-title-group">
              <h2>{{ selectedHero.name }}</h2>
              <div class="modal-meta">
                <span class="role-badge">{{ heroStore.getRoleName(selectedHero.role) }}</span>
                <span 
                  class="tier-badge"
                  :style="{ background: heroStore.getHeroTierColor(selectedHero.tier) }"
                >
                  T{{ selectedHero.tier }}
                </span>
              </div>
            </div>
          </div>
          <button class="close-btn" @click="closeHeroDetail">×</button>
        </div>

        <div class="modal-body">
          <!-- 标签 -->
          <div class="detail-section">
            <h3>标签</h3>
            <div class="tags-list">
              <span v-for="tag in selectedHero.tags" :key="tag" class="detail-tag">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 克制关系 -->
          <div class="detail-section" v-if="selectedHero.counters.length > 0">
            <h3>克制</h3>
            <div class="counters-grid">
              <div 
                v-for="counterId in selectedHero.counters" 
                :key="counterId"
                class="counter-card"
              >
                <span class="counter-icon">{{ getHeroIcon(counterId) }}</span>
                <span class="counter-name">{{ getHeroName(counterId) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="selectedHero.counteredBy.length > 0">
            <h3>被克制</h3>
            <div class="counters-grid">
              <div 
                v-for="counterId in selectedHero.counteredBy" 
                :key="counterId"
                class="counter-card danger"
              >
                <span class="counter-icon">{{ getHeroIcon(counterId) }}</span>
                <span class="counter-name">{{ getHeroName(counterId) }}</span>
              </div>
            </div>
          </div>

          <!-- 版本变化 -->
          <div class="detail-section" v-if="selectedHero.versionHistory.length > 0">
            <h3>版本变化</h3>
            <div class="version-history">
              <div 
                v-for="(change, index) in selectedHero.versionHistory" 
                :key="index"
                class="version-item"
              >
                <div class="version-header">
                  <span class="version-name">{{ change.version }}</span>
                  <span 
                    class="change-type"
                    :style="{ background: heroStore.getChangeTypeColor(change.change) }"
                  >
                    {{ heroStore.getChangeTypeText(change.change) }}
                  </span>
                  <span class="tier-change">
                    T{{ change.tierBefore }} → T{{ change.tierAfter }}
                  </span>
                </div>
                <p class="change-desc">{{ change.description }}</p>
              </div>
            </div>
          </div>

          <div class="detail-section empty" v-else>
            <h3>版本变化</h3>
            <p class="empty-text">暂无版本变化记录</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHeroStore } from '@/stores/hero'
import type { Hero } from '@/core/models/Hero'

const heroStore = useHeroStore()

// 筛选状态
const currentRole = ref('all')
const currentTier = ref('all')
const currentTag = ref('')

// 角色选项
const roles = [
  { value: 'all', label: '全部', icon: '🎮' },
  { value: 'tank', label: '坦克', icon: '🛡️' },
  { value: 'fighter', label: '战士', icon: '⚔️' },
  { value: 'assassin', label: '刺客', icon: '🗡️' },
  { value: 'mage', label: '法师', icon: '🔮' },
  { value: 'marksman', label: '射手', icon: '🏹' },
  { value: 'support', label: '辅助', icon: '💚' }
]

// 强度选项
const tiers = [
  { value: 'all', label: '全部', color: '#333' },
  { value: '0', label: 'T0', color: '#ff4d4f' },
  { value: '1', label: 'T1', color: '#ff7a45' },
  { value: '2', label: 'T2', color: '#ffa940' },
  { value: '3', label: 'T3', color: '#73d13d' },
  { value: '4', label: 'T4', color: '#40a9ff' },
  { value: '5', label: 'T5', color: '#8c8c8c' }
]

// 所有标签
const allTags = computed(() => heroStore.allTags)

// 筛选后的英雄
const filteredHeroes = computed(() => {
  let heroes = heroStore.allHeroes
  
  if (currentRole.value !== 'all') {
    heroes = heroes.filter(h => h.role === currentRole.value)
  }
  
  if (currentTier.value !== 'all') {
    heroes = heroes.filter(h => h.tier === parseInt(currentTier.value))
  }

  if (currentTag.value) {
    heroes = heroes.filter(h => h.tags.includes(currentTag.value))
  }
  
  return heroes
})

// 英雄详情
const selectedHero = ref<Hero | null>(null)

function showHeroDetail(hero: Hero) {
  selectedHero.value = hero
}

function closeHeroDetail() {
  selectedHero.value = null
}

// 获取英雄名称
function getHeroName(heroId: string): string {
  const hero = heroStore.getHeroById(heroId)
  return hero?.name || heroId
}

// 获取英雄图标
function getHeroIcon(heroId: string): string {
  const hero = heroStore.getHeroById(heroId)
  return hero ? heroStore.getRoleIcon(hero.role) : '❓'
}
</script>

<style scoped lang="scss">
.heroes-page {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  margin-bottom: 20px;
  
  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 4px;
  }
  
  .page-subtitle {
    font-size: 14px;
    color: #999;
  }
}

.filter-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  min-width: 40px;
  padding-top: 6px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #666;
  
  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
  
  &.active {
    background: #1890ff;
    border-color: #1890ff;
    color: #fff;
  }
  
  .filter-icon {
    font-size: 14px;
  }
}

.tier-btn {
  font-weight: 600;
  min-width: 44px;
  justify-content: center;
}

.tag-btn {
  font-size: 12px;
  padding: 4px 10px;
}

.heroes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.hero-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

.hero-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.hero-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.hero-basic-info {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-meta {
  display: flex;
  gap: 6px;
  align-items: center;
}

.role-tag {
  font-size: 11px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.tier-tag {
  font-size: 11px;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.hero-tag {
  font-size: 11px;
  color: #1890ff;
  background: #e6f7ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.hero-counters {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.counter-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.counter-label {
  font-size: 11px;
  color: #999;
  min-width: 40px;
}

.counter-heroes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.counter-hero {
  font-size: 11px;
  color: #52c41a;
  background: #f6ffed;
  padding: 2px 6px;
  border-radius: 4px;
  
  &.danger {
    color: #ff4d4f;
    background: #fff2f0;
  }
}

// 弹窗样式
.hero-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  
  @media (min-width: 768px) {
    align-items: center;
  }
}

.modal-content {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  
  @media (min-width: 768px) {
    border-radius: 16px;
    max-height: 80vh;
    animation: fadeIn 0.3s ease;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}

.modal-hero-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.modal-title-group {
  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 6px;
  }
}

.modal-meta {
  display: flex;
  gap: 8px;
}

.role-badge {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 6px;
}

.tier-badge {
  font-size: 12px;
  color: #fff;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  font-size: 22px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #e8e8e8;
  }
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 12px;
  }
  
  &.empty {
    .empty-text {
      font-size: 14px;
      color: #999;
      text-align: center;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 10px;
    }
  }
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tag {
  font-size: 13px;
  color: #1890ff;
  background: #e6f7ff;
  padding: 6px 12px;
  border-radius: 8px;
}

.counters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.counter-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: #f6ffed;
  border-radius: 10px;
  
  &.danger {
    background: #fff2f0;
  }
  
  .counter-icon {
    font-size: 24px;
  }
  
  .counter-name {
    font-size: 12px;
    color: #1a1a1a;
    text-align: center;
  }
}

.version-history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-item {
  padding: 14px;
  background: #f5f7fa;
  border-radius: 10px;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.version-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.change-type {
  font-size: 11px;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.tier-change {
  font-size: 12px;
  color: #666;
  background: #fff;
  padding: 2px 8px;
  border-radius: 4px;
}

.change-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

// 移动端适配
@media (max-width: 768px) {
  .heroes-page {
    padding: 12px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .filter-section {
    padding: 12px;
  }
  
  .filter-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .filter-label {
    padding-top: 0;
  }
  
  .heroes-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .hero-card {
    padding: 10px;
  }
  
  .hero-avatar {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .hero-name {
    font-size: 14px;
  }
  
  .counters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 375px) {
  .heroes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
