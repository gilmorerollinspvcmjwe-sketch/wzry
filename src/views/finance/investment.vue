<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useFinanceStore } from '@/stores/finance';
import { seekInvestment, calculateValuation } from '@/core/services/financeService';
import {
  INVESTMENT_ROUND_NAMES,
  INVESTOR_TYPE_NAMES,
  INVESTMENT_ROUND_RANGES,
} from '@/types/finance';
import type { InvestmentRound, Investment, Valuation } from '@/types/finance';

const router = useRouter();
const clubStore = useClubStore();
const financeStore = useFinanceStore();

const activeTab = ref<'rounds' | 'history' | 'valuation'>('rounds');
const isProcessing = ref(false);
const currentValuation = ref<Valuation | null>(null);

const clubId = computed(() => clubStore.currentClub?.id || '');
const finance = computed(() => financeStore.getFinance(clubId.value));
const investments = computed(() => financeStore.getInvestments(clubId.value));
const totalEquitySold = computed(() => financeStore.getTotalEquitySold(clubId.value));
const remainingEquity = computed(() => Math.max(0, 100 - totalEquitySold.value));

const roundOrder: InvestmentRound[] = ['seed', 'series_a', 'series_b', 'series_c', 'ipo'];

const availableRounds = computed(() => {
  const completedRounds = investments.value.map(i => i.round);
  const nextRoundIndex = completedRounds.length;
  
  return roundOrder.map((round, index) => {
    const config = INVESTMENT_ROUND_RANGES[round];
    return {
      round,
      name: INVESTMENT_ROUND_NAMES[round],
      completed: completedRounds.includes(round),
      available: index === nextRoundIndex,
      config,
    };
  });
});

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '亿';
  }
  return num.toLocaleString() + '万';
};

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const getRoundColor = (round: InvestmentRound) => {
  const colors: Record<InvestmentRound, string> = {
    seed: '#faad14',
    series_a: '#1890ff',
    series_b: '#52c41a',
    series_c: '#722ed1',
    ipo: '#eb2f96',
  };
  return colors[round] || '#999';
};

const goBack = () => {
  router.push('/finance');
};

const handleSeekInvestment = async (round: InvestmentRound) => {
  if (isProcessing.value) return;
  
  isProcessing.value = true;
  
  const result = seekInvestment(clubId.value, round);
  
  if (result.success) {
    alert(result.message);
    updateValuation();
  } else {
    alert(result.message);
  }
  
  isProcessing.value = false;
};

const updateValuation = () => {
  currentValuation.value = calculateValuation(clubId.value);
};

onMounted(() => {
  if (clubId.value && !finance.value) {
    financeStore.initFinance(clubId.value);
  }
  updateValuation();
});
</script>

<template>
  <div class="investment-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h2 class="page-title">投资管理</h2>
    </div>

    <div v-if="finance" class="investment-content">
      <div class="equity-card">
        <div class="equity-header">
          <span class="equity-title">股权结构</span>
          <span class="equity-value">剩余 {{ remainingEquity }}%</span>
        </div>
        <div class="equity-bar">
          <div class="equity-sold" :style="{ width: totalEquitySold + '%' }"></div>
        </div>
        <div class="equity-info">
          <span>已稀释: {{ totalEquitySold }}%</span>
          <span>估值: {{ currentValuation ? formatNumber(currentValuation.total) : '-' }}</span>
        </div>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">融资轮次</div>
          <div class="summary-value">{{ investments.length }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">累计融资</div>
          <div class="summary-value">
            {{ formatNumber(investments.reduce((sum, i) => sum + i.amount, 0)) }}
          </div>
        </div>
      </div>

      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'rounds' }"
          @click="activeTab = 'rounds'"
        >
          融资轮次
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          融资历史
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'valuation' }"
          @click="activeTab = 'valuation'"
        >
          估值分析
        </button>
      </div>

      <div v-if="activeTab === 'rounds'" class="rounds-section">
        <div
          v-for="item in availableRounds"
          :key="item.round"
          class="round-card"
          :class="{ completed: item.completed, available: item.available }"
        >
          <div class="round-header">
            <span class="round-name">{{ item.name }}</span>
            <span
              class="round-status"
              :style="{ backgroundColor: getRoundColor(item.round) }"
            >
              {{ item.completed ? '已完成' : item.available ? '可进行' : '未解锁' }}
            </span>
          </div>
          <div class="round-details">
            <div class="detail-item">
              <span class="detail-label">融资金额</span>
              <span class="detail-value">
                {{ item.config.min }} - {{ item.config.max }}万
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">股权出让</span>
              <span class="detail-value">
                {{ item.config.equityRange.min }} - {{ item.config.equityRange.max }}%
              </span>
            </div>
          </div>
          <button
            v-if="item.available && !item.completed"
            class="invest-btn"
            :disabled="isProcessing"
            @click="handleSeekInvestment(item.round)"
          >
            {{ isProcessing ? '处理中...' : '寻求融资' }}
          </button>
          <div v-else-if="item.completed" class="completed-badge">
            ✓ 已完成
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'history'" class="history-section">
        <div v-if="investments.length > 0" class="investments-list">
          <div
            v-for="investment in investments"
            :key="investment.id"
            class="investment-item"
          >
            <div class="investment-header">
              <span
                class="investment-round"
                :style="{ backgroundColor: getRoundColor(investment.round) }"
              >
                {{ INVESTMENT_ROUND_NAMES[investment.round] }}
              </span>
              <span class="investment-date">{{ formatDate(investment.date) }}</span>
            </div>
            <div class="investment-details">
              <div class="detail-row">
                <span class="detail-label">融资金额</span>
                <span class="detail-value highlight">{{ formatNumber(investment.amount) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">投后估值</span>
                <span class="detail-value">{{ formatNumber(investment.valuation) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">出让股权</span>
                <span class="detail-value">{{ investment.equitySold }}%</span>
              </div>
            </div>
            <div class="investors-section">
              <div class="investors-title">投资方</div>
              <div
                v-for="investor in investment.investors"
                :key="investor.id"
                class="investor-item"
              >
                <div class="investor-name">{{ investor.name }}</div>
                <div class="investor-type">{{ INVESTOR_TYPE_NAMES[investor.type] }}</div>
                <div class="investor-equity">{{ investor.equityPercentage }}%</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-investments">
          <p>暂无融资记录</p>
          <p class="hint">完成融资轮次后将在此显示</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'valuation'" class="valuation-section">
        <div v-if="currentValuation" class="valuation-card">
          <div class="valuation-total">
            <span class="valuation-label">当前估值</span>
            <span class="valuation-value">{{ formatNumber(currentValuation.total) }}</span>
          </div>
          <div class="valuation-factors">
            <div
              v-for="factor in currentValuation.factors"
              :key="factor.name"
              class="factor-item"
            >
              <div class="factor-header">
                <span class="factor-name">{{ factor.name }}</span>
                <span class="factor-weight">权重: {{ (factor.weight * 100).toFixed(0) }}%</span>
              </div>
              <div class="factor-bar">
                <div class="factor-fill" :style="{ width: factor.score + '%' }"></div>
              </div>
              <div class="factor-footer">
                <span class="factor-score">得分: {{ factor.score }}</span>
                <span class="factor-contribution">贡献: +{{ factor.contribution }}万</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-valuation">
          <p>暂无估值数据</p>
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
.investment-page {
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
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.equity-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  color: white;
}

.equity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.equity-title {
  font-size: 14px;
  opacity: 0.9;
}

.equity-value {
  font-size: 16px;
  font-weight: bold;
}

.equity-bar {
  height: 10px;
  background: rgba(255,255,255,0.3);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}

.equity-sold {
  height: 100%;
  background: white;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.equity-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.9;
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

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.rounds-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.round-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.round-card.available {
  border-color: #007bff;
}

.round-card.completed {
  opacity: 0.7;
}

.round-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.round-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.round-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  color: white;
}

.round-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-label {
  color: #999;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.invest-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.invest-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.completed-badge {
  text-align: center;
  padding: 10px;
  color: #52c41a;
  font-weight: bold;
}

.history-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.investment-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.investment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.investment-round {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  font-weight: bold;
}

.investment-date {
  font-size: 12px;
  color: #999;
}

.investment-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-value.highlight {
  color: #52c41a;
  font-weight: bold;
}

.investors-section {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 10px;
}

.investors-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.investor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.investor-item:last-child {
  border-bottom: none;
}

.investor-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.investor-type {
  font-size: 11px;
  color: #999;
}

.investor-equity {
  font-size: 13px;
  color: #722ed1;
  font-weight: bold;
}

.no-investments {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-investments .hint {
  font-size: 12px;
  margin-top: 8px;
}

.valuation-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.valuation-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.valuation-total {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 15px;
}

.valuation-label {
  font-size: 12px;
  opacity: 0.9;
  display: block;
  margin-bottom: 5px;
}

.valuation-value {
  font-size: 24px;
  font-weight: bold;
}

.valuation-factors {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.factor-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.factor-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.factor-name {
  color: #333;
  font-weight: 500;
}

.factor-weight {
  color: #999;
  font-size: 11px;
}

.factor-bar {
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

.factor-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
}

.factor-contribution {
  color: #52c41a;
}

.no-valuation {
  text-align: center;
  padding: 40px 20px;
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
