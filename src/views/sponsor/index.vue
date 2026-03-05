<template>
  <div class="sponsor-page">
    <h2 class="page-title">赞助商中心</h2>

    <!-- 加载状态 -->
    <div v-if="!isReady" class="loading card">
      <p>加载中...</p>
    </div>

    <!-- 当前赞助商 -->
    <div v-else-if="sponsorStore.hasSponsor" class="current-sponsor card">
      <h3 class="card-title">当前赞助商</h3>
      <div class="sponsor-info">
        <div class="sponsor-logo">{{ sponsorStore.currentSponsor?.logo }}</div>
        <div class="sponsor-details">
          <h4>{{ sponsorStore.currentSponsor?.name }}</h4>
          <p class="payment">周薪: {{ sponsorStore.weeklyIncome }} 万</p>
          <p class="bonus">奖金: {{ sponsorStore.currentSponsor?.bonus }} 万</p>
          <p class="satisfaction">满意度: {{ sponsorStore.satisfaction }}%</p>
          <p class="remaining">剩余周数: {{ sponsorStore.remainingWeeks }}</p>
        </div>
      </div>

      <div class="requirements">
        <h4>赞助要求</h4>
        <ul>
          <li v-for="(req, index) in sponsorStore.currentSponsor?.requirements" :key="index">
            {{ getRequirementText(req) }}
          </li>
        </ul>
      </div>

      <div class="actions">
        <button @click="renewSponsor" :disabled="sponsorStore.satisfaction < 60">
          续约合同
        </button>
        <button @click="terminateSponsor" class="danger">
          终止合同
        </button>
      </div>
    </div>

    <!-- 无赞助商状态 -->
    <div v-else class="no-sponsor card">
      <h3 class="card-title">暂无赞助商</h3>
      <p class="empty-text">您当前没有赞助商合同。根据您的声望和排名，可以签约以下赞助商：</p>
    </div>

    <!-- 可用赞助商列表 -->
    <div class="available-sponsors">
      <h3 class="section-title">可用赞助商</h3>
      <div class="sponsors-list">
        <div
          v-for="sponsor in availableSponsors"
          :key="sponsor.id"
          class="sponsor-card"
          :class="{ 'can-sign': canSignSponsor(sponsor) }"
        >
          <div class="sponsor-header">
            <span class="logo">{{ sponsor.logo }}</span>
            <h4>{{ sponsor.name }}</h4>
          </div>
          <div class="sponsor-stats">
            <p>周薪: {{ sponsor.weeklyPayment }} 万</p>
            <p>奖金: {{ sponsor.bonus }} 万</p>
          </div>
          <div class="sponsor-requirements">
            <p>要求:</p>
            <ul>
              <li v-for="(req, index) in sponsor.requirements" :key="index">
                {{ getRequirementText(req) }}
              </li>
            </ul>
          </div>
          <button
            v-if="!sponsorStore.hasSponsor"
            @click="signSponsor(sponsor)"
            :disabled="!canSignSponsor(sponsor)"
          >
            签约
          </button>
        </div>
      </div>
    </div>

    <!-- 赞助历史 -->
    <div v-if="sponsorStore.history && sponsorStore.history.length > 0" class="sponsor-history card">
      <h3 class="card-title">赞助历史</h3>
      <div class="history-list">
        <div v-for="(record, index) in sponsorStore.history" :key="index" class="history-item">
          <div class="history-header">
            <span class="sponsor-name">{{ record.sponsorName }}</span>
            <span class="status" :class="{ terminated: record.terminated }">
              {{ record.terminated ? '已终止' : '已完成' }}
            </span>
          </div>
          <div class="history-details">
            <span>第 {{ record.startWeek }} - {{ record.endWeek }} 周</span>
            <span class="income">{{ record.totalEarned }} 万</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="sponsor-stats card">
      <h3 class="card-title">赞助统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="label">总合同数</span>
          <span class="value">{{ sponsorStore.stats.totalContracts }}</span>
        </div>
        <div class="stat-item">
          <span class="label">累计收入</span>
          <span class="value">{{ sponsorStore.stats.totalEarned }} 万</span>
        </div>
        <div class="stat-item">
          <span class="label">平均满意度</span>
          <span class="value">{{ Math.round(sponsorStore.stats.averageSatisfaction) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useSponsorStore } from '@/stores/sponsor';
import { useFanReputationStore } from '@/stores/fanReputation';
import { useGameStore } from '@/stores/game';
import type { Sponsor } from '@/types';

const sponsorStore = useSponsorStore();
const fanReputationStore = useFanReputationStore();
const gameStore = useGameStore();

const isReady = ref(false);

// 确保store已初始化
onMounted(() => {
  if (!sponsorStore.initialized) {
    sponsorStore.initialize();
  }
  if (!fanReputationStore.initialized) {
    fanReputationStore.initialize();
  }
  isReady.value = true;
});

// 可用赞助商
const availableSponsors = computed(() => {
  return sponsorStore.matchSponsorsByReputation(fanReputationStore.reputation);
});

// 获取要求文本
function getRequirementText(req: { type: string; target: number }): string {
  switch (req.type) {
    case 'ranking':
      return `联赛排名前 ${req.target} 名`;
    case 'win_rate':
      return `胜率不低于 ${Math.round(req.target * 100)}%`;
    case 'fans':
      return `粉丝数达到 ${req.target.toLocaleString()}`;
    default:
      return '未知要求';
  }
}

// 是否可以签约
function canSignSponsor(sponsor: Sponsor): boolean {
  return sponsor.requirements.every(req => {
    switch (req.type) {
      case 'ranking':
        return true;
      case 'win_rate':
        return true;
      case 'fans':
        return fanReputationStore.totalFans >= req.target;
      default:
        return true;
    }
  });
}

// 签约赞助商
function signSponsor(sponsor: Sponsor) {
  console.log('签约赞助商:', sponsor);
  const result = sponsorStore.signSponsor(sponsor, gameStore.currentWeek);
  console.log('签约结果:', result);
  alert(result.message);
}

// 续约
function renewSponsor() {
  const result = sponsorStore.renewSponsor();
  alert(result.message);
}

// 终止合同
function terminateSponsor() {
  if (confirm('确定要终止当前赞助商合同吗？需要支付违约金。')) {
    const result = sponsorStore.terminateSponsor(gameStore.currentWeek, '主动终止');
    alert(`合同已终止，违约金: ${result.penalty} 万`);
  }
}
</script>

<style scoped>
.sponsor-page {
  padding: 15px;
  padding-bottom: 80px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 12px 0;
}

.section-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 12px 0;
}

.empty-text {
  color: #666;
  font-size: 14px;
}

.current-sponsor .sponsor-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.sponsor-logo {
  font-size: 48px;
}

.sponsor-details h4 {
  margin: 0 0 6px 0;
  font-size: 16px;
  color: #333;
}

.sponsor-details p {
  margin: 3px 0;
  color: #666;
  font-size: 13px;
}

.sponsor-details .payment {
  color: #28a745;
  font-weight: bold;
  font-size: 15px;
}

.requirements {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.requirements h4 {
  font-size: 14px;
  color: #333;
  margin: 0 0 8px 0;
}

.requirements ul {
  margin: 0;
  padding-left: 18px;
}

.requirements li {
  color: #666;
  margin: 4px 0;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.actions button:active:not(:disabled) {
  background: #0056b3;
}

.actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.actions button.danger {
  background: #dc3545;
}

.actions button.danger:active {
  background: #c82333;
}

.sponsors-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sponsor-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.sponsor-card.can-sign {
  border-color: #28a745;
}

.sponsor-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.sponsor-header .logo {
  font-size: 28px;
}

.sponsor-header h4 {
  margin: 0;
  font-size: 15px;
  color: #333;
}

.sponsor-stats p {
  margin: 4px 0;
  color: #666;
  font-size: 13px;
}

.sponsor-requirements {
  margin: 10px 0;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 6px;
}

.sponsor-requirements p {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #666;
}

.sponsor-requirements ul {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
}

.sponsor-requirements li {
  color: #666;
  margin: 3px 0;
}

.sponsor-card button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
  transition: all 0.3s ease;
}

.sponsor-card button:active:not(:disabled) {
  background: #0056b3;
}

.sponsor-card button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.sponsor-name {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #d4edda;
  color: #155724;
}

.status.terminated {
  background: #f8d7da;
  color: #721c24;
}

.history-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.history-details .income {
  color: #28a745;
  font-weight: bold;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.stat-item .label {
  display: block;
  color: #666;
  margin-bottom: 6px;
  font-size: 12px;
}

.stat-item .value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
</style>
