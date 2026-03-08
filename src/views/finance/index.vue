<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useFinanceStore } from '@/stores/finance';
import {
  processMerchandiseSales,
  processStreamingRevenue,
  updateWeeklyFinance,
} from '@/core/services/financeService';
import {
  INCOME_CATEGORY_NAMES,
  EXPENSE_CATEGORY_NAMES,
} from '@/types/finance';
import type { ClubFinance } from '@/types/finance';

const router = useRouter();
const clubStore = useClubStore();
const financeStore = useFinanceStore();

const activeTab = ref<'overview' | 'income' | 'expenses' | 'transactions'>('overview');

const clubId = computed(() => clubStore.currentClub?.id || '');
const finance = computed(() => financeStore.getFinance(clubId.value));
const recentTransactions = computed(() => financeStore.getRecentTransactions(clubId.value, 10));
const totalIncome = computed(() => financeStore.getTotalIncome(clubId.value));
const totalExpenses = computed(() => financeStore.getTotalExpenses(clubId.value));
const netProfit = computed(() => financeStore.getNetProfit(clubId.value));

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const getProfitColor = (value: number) => {
  if (value > 0) return '#52c41a';
  if (value < 0) return '#ff4d4f';
  return '#999';
};

const goToReport = () => {
  router.push('/finance/report');
};

const goToInvestment = () => {
  router.push('/finance/investment');
};

const handleMerchandiseSales = () => {
  const amount = processMerchandiseSales(clubId.value);
  alert(`周边销售完成！获得 ${amount}万`);
};

const handleStreamingRevenue = () => {
  const amount = processStreamingRevenue(clubId.value);
  alert(`直播分成结算完成！获得 ${amount}万`);
};

const handleWeeklyUpdate = () => {
  updateWeeklyFinance(clubId.value);
  alert('财务数据已更新！');
};

onMounted(() => {
  if (clubId.value && !finance.value) {
    financeStore.initFinance(clubId.value);
  }
});
</script>

<template>
  <div class="finance-page">
    <h2 class="page-title">财务中心</h2>

    <div v-if="finance" class="finance-content">
      <div class="summary-cards">
        <div class="summary-card main">
          <div class="summary-label">现金余额</div>
          <div class="summary-value">{{ formatNumber(finance.balance.cash) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">周收入</div>
          <div class="summary-value income">+{{ formatNumber(totalIncome) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">周支出</div>
          <div class="summary-value expense">-{{ formatNumber(totalExpenses) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">净利润</div>
          <div class="summary-value" :style="{ color: getProfitColor(netProfit) }">
            {{ netProfit >= 0 ? '+' : '' }}{{ formatNumber(netProfit) }}
          </div>
        </div>
      </div>

      <div class="valuation-card">
        <div class="valuation-header">
          <span class="valuation-title">俱乐部估值</span>
          <span class="valuation-value">{{ formatNumber(finance.valuation.total) }}</span>
        </div>
        <div class="valuation-factors">
          <div
            v-for="factor in finance.valuation.factors"
            :key="factor.name"
            class="factor-item"
          >
            <div class="factor-name">{{ factor.name }}</div>
            <div class="factor-bar">
              <div class="factor-fill" :style="{ width: factor.score + '%' }"></div>
            </div>
            <div class="factor-score">{{ factor.score }}</div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn primary" @click="goToReport">
          财务报表
        </button>
        <button class="action-btn secondary" @click="goToInvestment">
          投资管理
        </button>
        <button class="action-btn accent" @click="handleWeeklyUpdate">
          更新财务
        </button>
      </div>

      <div class="quick-actions">
        <button class="quick-btn" @click="handleMerchandiseSales">
          周边销售
        </button>
        <button class="quick-btn" @click="handleStreamingRevenue">
          直播分成
        </button>
      </div>

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
          :class="{ active: activeTab === 'income' }"
          @click="activeTab = 'income'"
        >
          收入
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'expenses' }"
          @click="activeTab = 'expenses'"
        >
          支出
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'transactions' }"
          @click="activeTab = 'transactions'"
        >
          交易记录
        </button>
      </div>

      <div v-if="activeTab === 'overview'" class="overview-section">
        <div class="info-card">
          <h3>资产负债表</h3>
          <div class="info-row">
            <span class="info-label">现金</span>
            <span class="info-value">{{ finance.balance.cash }}万</span>
          </div>
          <div class="info-row">
            <span class="info-label">资产</span>
            <span class="info-value">{{ finance.balance.assets }}万</span>
          </div>
          <div class="info-row">
            <span class="info-label">负债</span>
            <span class="info-value">{{ finance.balance.liabilities }}万</span>
          </div>
          <div class="info-row">
            <span class="info-label">净资产</span>
            <span class="info-value">{{ finance.balance.equity }}万</span>
          </div>
        </div>

        <div class="info-card">
          <h3>财务指标</h3>
          <div class="info-row">
            <span class="info-label">利润率</span>
            <span class="info-value" :style="{ color: getProfitColor(finance.profitMargin) }">
              {{ finance.profitMargin }}%
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">投资轮次</span>
            <span class="info-value">{{ finance.investments.length }}轮</span>
          </div>
          <div class="info-row">
            <span class="info-label">累计融资</span>
            <span class="info-value">
              {{ finance.investments.reduce((sum, i) => sum + i.amount, 0) }}万
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">股权稀释</span>
            <span class="info-value">
              {{ finance.investments.reduce((sum, i) => sum + i.equitySold, 0) }}%
            </span>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'income'" class="income-section">
        <div class="detail-card">
          <h3>收入明细</h3>
          <div
            v-for="(value, key) in finance.income"
            :key="key"
            class="detail-row"
          >
            <span class="detail-label">{{ INCOME_CATEGORY_NAMES[key as keyof typeof INCOME_CATEGORY_NAMES] }}</span>
            <span class="detail-value income">+{{ value }}万</span>
          </div>
          <div class="detail-row total">
            <span class="detail-label">总计</span>
            <span class="detail-value">+{{ totalIncome }}万</span>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'expenses'" class="expenses-section">
        <div class="detail-card">
          <h3>支出明细</h3>
          <div
            v-for="(value, key) in finance.expenses"
            :key="key"
            class="detail-row"
          >
            <span class="detail-label">{{ EXPENSE_CATEGORY_NAMES[key as keyof typeof EXPENSE_CATEGORY_NAMES] }}</span>
            <span class="detail-value expense">-{{ value }}万</span>
          </div>
          <div class="detail-row total">
            <span class="detail-label">总计</span>
            <span class="detail-value">-{{ totalExpenses }}万</span>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'transactions'" class="transactions-section">
        <div class="transactions-list">
          <div
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="transaction-item"
          >
            <div class="transaction-info">
              <div class="transaction-desc">{{ transaction.description }}</div>
              <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
            </div>
            <div
              class="transaction-amount"
              :class="transaction.type"
            >
              {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount }}万
            </div>
          </div>
          <div v-if="recentTransactions.length === 0" class="no-transactions">
            暂无交易记录
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-finance">
      <p>尚未初始化财务数据</p>
      <button class="create-btn" @click="financeStore.initFinance(clubId.value)">
        初始化财务
      </button>
    </div>
  </div>
</template>

<style scoped>
.finance-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.summary-card.main {
  grid-column: span 2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.summary-card.main .summary-label,
.summary-card.main .summary-value {
  color: white;
}

.summary-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.summary-value.income {
  color: #52c41a;
}

.summary-value.expense {
  color: #ff4d4f;
}

.valuation-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 15px;
}

.valuation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.valuation-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.valuation-value {
  font-size: 20px;
  font-weight: bold;
  color: #722ed1;
}

.valuation-factors {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.factor-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.factor-name {
  width: 60px;
  font-size: 12px;
  color: #666;
}

.factor-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.factor-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.factor-score {
  width: 30px;
  font-size: 12px;
  color: #333;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.secondary {
  background: #28a745;
  color: white;
}

.action-btn.accent {
  background: #fd7e14;
  color: white;
}

.quick-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.quick-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  min-width: 70px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.overview-section,
.income-section,
.expenses-section,
.transactions-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-card,
.detail-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-card h3,
.detail-card h3 {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.info-row,
.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.info-label,
.detail-label {
  color: #999;
}

.info-value,
.detail-value {
  color: #333;
  font-weight: 500;
}

.detail-value.income {
  color: #52c41a;
}

.detail-value.expense {
  color: #ff4d4f;
}

.detail-row.total {
  padding-top: 12px;
  border-top: 1px solid #eee;
  font-weight: bold;
}

.transactions-list {
  background: white;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  flex: 1;
}

.transaction-desc {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.transaction-date {
  font-size: 11px;
  color: #999;
}

.transaction-amount {
  font-size: 15px;
  font-weight: bold;
}

.transaction-amount.income {
  color: #52c41a;
}

.transaction-amount.expense {
  color: #ff4d4f;
}

.no-transactions {
  text-align: center;
  padding: 30px;
  color: #999;
}

.no-finance {
  text-align: center;
  padding: 60px 20px;
}

.no-finance p {
  color: #999;
  margin-bottom: 20px;
}

.create-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>
