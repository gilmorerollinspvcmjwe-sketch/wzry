<script setup lang="ts">
import { computed } from 'vue';
import { useClubStore } from '@/stores/club';

const clubStore = useClubStore();

const currentClub = computed(() => clubStore.currentClub);
const weeklyIncome = computed(() => clubStore.weeklyIncome);
const weeklyExpense = computed(() => clubStore.weeklyExpense);
</script>

<template>
  <div class="home-page">
    <h2 class="page-title">俱乐部概览</h2>
    
    <!-- 俱乐部信息卡片 -->
    <div class="club-card" v-if="currentClub">
      <div class="club-header">
        <h3>{{ currentClub.name }}</h3>
        <span class="founded">成立于 {{ (currentClub.founded instanceof Date ? currentClub.founded : new Date(currentClub.founded)).getFullYear() }}年</span>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">战队实力</div>
          <div class="stat-value">{{ (currentClub as any).getTotalPower?.() || 0 }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">选手人数</div>
          <div class="stat-value">{{ currentClub.roster?.length || 0 }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">青训人数</div>
          <div class="stat-value">{{ currentClub.youthTeam?.length || 0 }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">设施等级</div>
          <div class="stat-value">{{ clubStore.totalFacilityLevel }}</div>
        </div>
      </div>
      
      <div class="finance-section">
        <h4>财务状况</h4>
        <div class="finance-row">
          <span>周收入</span>
          <span class="income">+{{ weeklyIncome.toFixed(1) }}万</span>
        </div>
        <div class="finance-row">
          <span>周支出</span>
          <span class="expense">-{{ weeklyExpense.toFixed(1) }}万</span>
        </div>
        <div class="finance-row total">
          <span>周净收益</span>
          <span :class="weeklyIncome - weeklyExpense >= 0 ? 'profit' : 'loss'">
            {{ (weeklyIncome - weeklyExpense).toFixed(1) }}万
          </span>
        </div>
      </div>
    </div>
    
    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3>快捷操作</h3>
      <div class="action-grid">
        <router-link to="/game/team" class="action-btn">
          <span class="btn-icon">🏋️</span>
          <span>安排训练</span>
        </router-link>
        <router-link to="/game/transfer" class="action-btn">
          <span class="btn-icon">🛒</span>
          <span>转会市场</span>
        </router-link>
        <router-link to="/game/match" class="action-btn">
          <span class="btn-icon">🎮</span>
          <span>下一场</span>
        </router-link>
        <router-link to="/game/team" class="action-btn">
          <span class="btn-icon">⚙️</span>
          <span>战术设置</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding: 15px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.club-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.club-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.club-header h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.founded {
  font-size: 12px;
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.stat-item {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #007bff;
}

.finance-section {
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.finance-section h4 {
  font-size: 14px;
  color: #333;
  margin: 0 0 10px 0;
}

.finance-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 14px;
}

.finance-row.total {
  border-top: 1px solid #eee;
  margin-top: 5px;
  padding-top: 10px;
  font-weight: bold;
}

.income {
  color: #28a745;
}

.expense {
  color: #dc3545;
}

.profit {
  color: #28a745;
}

.loss {
  color: #dc3545;
}

.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.quick-actions h3 {
  font-size: 16px;
  color: #333;
  margin: 0 0 10px 0;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
}

.action-btn:active {
  background: #e9ecef;
}

.btn-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.action-btn span:last-child {
  font-size: 13px;
}
</style>