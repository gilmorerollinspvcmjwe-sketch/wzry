<template>
  <div class="community-page">
    <h2 class="page-title">粉丝社区</h2>

    <div v-if="!isReady" class="loading card">
      <p>加载中...</p>
    </div>

    <template v-else>
      <div class="overview-cards">
        <div class="overview-card members">
          <div class="icon">👥</div>
          <div class="info">
            <span class="label">社区成员</span>
            <span class="value">{{ totalMembers.toLocaleString() }}</span>
            <span class="sub">活跃率 {{ (activeRate * 100).toFixed(1) }}%</span>
          </div>
        </div>

        <div class="overview-card sentiment">
          <div class="icon">{{ sentimentEmoji }}</div>
          <div class="info">
            <span class="label">社区情绪</span>
            <span class="value">{{ overallSentiment }}/100</span>
            <span class="sub" :class="sentimentTrendClass">{{ sentimentTrendText }}</span>
          </div>
        </div>

        <div class="overview-card activities">
          <div class="icon">📅</div>
          <div class="info">
            <span class="label">进行中活动</span>
            <span class="value">{{ activeActivitiesCount }}</span>
            <span class="sub">{{ upcomingActivitiesCount }} 个即将开始</span>
          </div>
        </div>

        <div class="overview-card risk">
          <div class="icon">{{ riskIcon }}</div>
          <div class="info">
            <span class="label">风险等级</span>
            <span class="value" :class="riskClass">{{ riskText }}</span>
            <span class="sub">{{ pendingFeedbackCount }} 条待处理反馈</span>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.name }}
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'segments'" class="segments-section">
          <h3 class="section-title">粉丝分层</h3>
          <div class="segments-list">
            <div
              v-for="segment in segments"
              :key="segment.type"
              class="segment-card"
              :class="segment.type"
            >
              <div class="segment-header">
                <span class="segment-icon">{{ getSegmentIcon(segment.type) }}</span>
                <span class="segment-name">{{ getSegmentName(segment.type) }}</span>
                <span class="segment-percentage">{{ segment.percentage }}%</span>
              </div>
              <div class="segment-stats">
                <div class="stat">
                  <span class="stat-label">人数</span>
                  <span class="stat-value">{{ segment.count.toLocaleString() }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">参与度</span>
                  <div class="progress-bar">
                    <div class="fill" :style="{ width: segment.engagement + '%' }"></div>
                  </div>
                  <span class="stat-value">{{ segment.engagement }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">忠诚度</span>
                  <div class="progress-bar">
                    <div class="fill" :style="{ width: segment.loyalty + '%' }"></div>
                  </div>
                  <span class="stat-value">{{ segment.loyalty }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">消费力</span>
                  <span class="stat-value">¥{{ segment.spending }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'sentiment'" class="sentiment-section">
          <h3 class="section-title">情绪分析</h3>
          <div class="sentiment-overview card">
            <div class="sentiment-breakdown">
              <div class="breakdown-item positive">
                <span class="label">正面</span>
                <div class="bar">
                  <div class="fill" :style="{ width: sentimentBreakdown.positive + '%' }"></div>
                </div>
                <span class="value">{{ sentimentBreakdown.positive }}%</span>
              </div>
              <div class="breakdown-item neutral">
                <span class="label">中性</span>
                <div class="bar">
                  <div class="fill" :style="{ width: sentimentBreakdown.neutral + '%' }"></div>
                </div>
                <span class="value">{{ sentimentBreakdown.neutral }}%</span>
              </div>
              <div class="breakdown-item negative">
                <span class="label">负面</span>
                <div class="bar">
                  <div class="fill" :style="{ width: sentimentBreakdown.negative + '%' }"></div>
                </div>
                <span class="value">{{ sentimentBreakdown.negative }}%</span>
              </div>
            </div>
          </div>

          <div class="hot-topics card">
            <h4>热门话题</h4>
            <div class="topics-list">
              <div
                v-for="(topic, index) in hotTopics"
                :key="index"
                class="topic-item"
              >
                <span class="topic-name">#{{ topic.topic }}</span>
                <span class="topic-mentions">{{ topic.mentions }} 讨论</span>
                <span class="topic-sentiment" :class="{ positive: topic.sentiment > 50, negative: topic.sentiment < 40 }">
                  {{ topic.sentiment }}
                </span>
              </div>
              <p v-if="hotTopics.length === 0" class="no-data">暂无热门话题</p>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'feedback'" class="feedback-section">
          <h3 class="section-title">粉丝反馈</h3>
          <div class="feedback-actions">
            <button class="action-btn" @click="simulateFeedback">
              📊 生成模拟反馈
            </button>
            <button class="action-btn" @click="calculateSentiment">
              🔄 更新情绪分析
            </button>
          </div>
          <div class="feedback-list">
            <div
              v-for="item in feedback.slice(0, 10)"
              :key="item.id"
              class="feedback-item"
              :class="item.priority"
            >
              <div class="feedback-header">
                <span class="feedback-type">{{ getFeedbackTypeIcon(item.type) }} {{ getFeedbackTypeName(item.type) }}</span>
                <span class="feedback-priority" :class="item.priority">{{ getPriorityName(item.priority) }}</span>
                <span class="feedback-source">{{ getSourceName(item.source) }}</span>
              </div>
              <p class="feedback-content">{{ item.content }}</p>
              <div class="feedback-footer">
                <span class="feedback-sentiment">情绪值: {{ item.sentiment }}</span>
                <span class="feedback-likes">👍 {{ item.likes }}</span>
                <span class="feedback-status" :class="item.status">{{ getStatusName(item.status) }}</span>
              </div>
              <div v-if="item.status === 'pending'" class="feedback-actions-row">
                <button class="small-btn" @click="respondToFeedback(item.id, '感谢您的反馈，我们会认真考虑！')">
                  回复
                </button>
                <button class="small-btn secondary" @click="markAsReviewed(item.id)">
                  已阅
                </button>
              </div>
            </div>
            <p v-if="feedback.length === 0" class="no-data">暂无反馈</p>
          </div>
        </div>

        <div v-if="activeTab === 'culture'" class="culture-section">
          <h3 class="section-title">社区文化</h3>
          <div class="culture-grid">
            <div class="culture-card values">
              <h4>🎯 核心价值观</h4>
              <ul>
                <li v-for="(value, index) in culture?.values" :key="index">{{ value }}</li>
              </ul>
            </div>
            <div class="culture-card traditions">
              <h4>🎉 传统活动</h4>
              <ul>
                <li v-for="(tradition, index) in culture?.traditions" :key="index">{{ tradition }}</li>
              </ul>
            </div>
            <div class="culture-card slogans">
              <h4>📢 口号标语</h4>
              <ul>
                <li v-for="(slogan, index) in culture?.slogans" :key="index">{{ slogan }}</li>
              </ul>
            </div>
            <div class="culture-card symbols">
              <h4>🏆 文化符号</h4>
              <ul>
                <li v-for="(symbol, index) in culture?.symbols" :key="index">{{ symbol }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions card">
        <h3>快捷操作</h3>
        <div class="actions-grid">
          <router-link to="/community/activities" class="action-card">
            <span class="action-icon">📅</span>
            <span class="action-name">管理活动</span>
          </router-link>
          <router-link to="/community/crisis" class="action-card">
            <span class="action-icon">🚨</span>
            <span class="action-name">危机公关</span>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFanCommunityStore } from '@/stores/fanCommunity';
import { useClubStore } from '@/stores/club';

const fanCommunityStore = useFanCommunityStore();
const clubStore = useClubStore();
const isReady = ref(false);
const activeTab = ref('segments');

const tabs = [
  { id: 'segments', name: '粉丝分层', icon: '👥' },
  { id: 'sentiment', name: '情绪分析', icon: '📊' },
  { id: 'feedback', name: '粉丝反馈', icon: '💬' },
  { id: 'culture', name: '社区文化', icon: '🎭' },
];

onMounted(() => {
  const clubId = clubStore.club?.id || 'default';
  if (!fanCommunityStore.initialized) {
    fanCommunityStore.initialize(clubId);
  }
  isReady.value = true;
});

const totalMembers = computed(() => fanCommunityStore.totalMembers);
const activeRate = computed(() => fanCommunityStore.activeRate);
const overallSentiment = computed(() => fanCommunityStore.overallSentiment);
const segments = computed(() => fanCommunityStore.segments);
const feedback = computed(() => fanCommunityStore.feedback);
const culture = computed(() => fanCommunityStore.culture);
const sentimentAnalysis = computed(() => fanCommunityStore.sentimentAnalysis);

const sentimentEmoji = computed(() => {
  const value = overallSentiment.value;
  if (value >= 80) return '😄';
  if (value >= 60) return '🙂';
  if (value >= 40) return '😐';
  if (value >= 20) return '😕';
  return '😠';
});

const sentimentTrendText = computed(() => {
  const trend = fanCommunityStore.sentimentTrend;
  if (trend === 'rising') return '📈 上升中';
  if (trend === 'falling') return '📉 下降中';
  return '➡️ 稳定';
});

const sentimentTrendClass = computed(() => {
  const trend = fanCommunityStore.sentimentTrend;
  return {
    positive: trend === 'rising',
    negative: trend === 'falling',
    neutral: trend === 'stable',
  };
});

const activeActivitiesCount = computed(() => fanCommunityStore.ongoingActivities.length);
const upcomingActivitiesCount = computed(() => fanCommunityStore.upcomingActivities.length);
const pendingFeedbackCount = computed(() => fanCommunityStore.pendingFeedback.length);

const riskClass = computed(() => {
  const risk = fanCommunityStore.sentimentRiskLevel;
  return {
    'risk-low': risk === 'low',
    'risk-medium': risk === 'medium',
    'risk-high': risk === 'high',
    'risk-critical': risk === 'critical',
  };
});

const riskText = computed(() => {
  const risk = fanCommunityStore.sentimentRiskLevel;
  const texts = { low: '低', medium: '中', high: '高', critical: '严重' };
  return texts[risk];
});

const riskIcon = computed(() => {
  const risk = fanCommunityStore.sentimentRiskLevel;
  const icons = { low: '✅', medium: '⚠️', high: '🔶', critical: '🚨' };
  return icons[risk];
});

const sentimentBreakdown = computed(() => {
  return sentimentAnalysis.value?.breakdown || { positive: 40, neutral: 40, negative: 20 };
});

const hotTopics = computed(() => sentimentAnalysis.value?.hotTopics || []);

function getSegmentIcon(type: string): string {
  const icons: Record<string, string> = {
    core: '💎',
    active: '⭐',
    regular: '👤',
    casual: '👥',
  };
  return icons[type] || '👤';
}

function getSegmentName(type: string): string {
  const names: Record<string, string> = {
    core: '核心粉丝',
    active: '活跃粉丝',
    regular: '普通粉丝',
    casual: '路人粉丝',
  };
  return names[type] || type;
}

function getFeedbackTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    suggestion: '💡',
    complaint: '😤',
    praise: '👏',
    question: '❓',
  };
  return icons[type] || '💬';
}

function getFeedbackTypeName(type: string): string {
  const names: Record<string, string> = {
    suggestion: '建议',
    complaint: '投诉',
    praise: '表扬',
    question: '提问',
  };
  return names[type] || type;
}

function getPriorityName(priority: string): string {
  const names: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  };
  return names[priority] || priority;
}

function getSourceName(source: string): string {
  const names: Record<string, string> = {
    social_media: '社交媒体',
    official_forum: '官方论坛',
    event: '线下活动',
    survey: '问卷调查',
  };
  return names[source] || source;
}

function getStatusName(status: string): string {
  const names: Record<string, string> = {
    pending: '待处理',
    reviewed: '已阅',
    addressed: '已回复',
    ignored: '已忽略',
  };
  return names[status] || status;
}

function simulateFeedback() {
  fanCommunityStore.simulateFeedback(5);
}

function calculateSentiment() {
  fanCommunityStore.calculateSentiment();
}

function respondToFeedback(feedbackId: string, response: string) {
  fanCommunityStore.respondToFeedback(feedbackId, response);
}

function markAsReviewed(feedbackId: string) {
  fanCommunityStore.respondToFeedback(feedbackId, '已阅');
}
</script>

<style scoped>
.community-page {
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

.overview-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.overview-card .icon {
  font-size: 28px;
}

.overview-card .info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.overview-card .label {
  font-size: 12px;
  color: #666;
}

.overview-card .value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.overview-card .sub {
  font-size: 11px;
  color: #999;
}

.overview-card .sub.positive {
  color: #28a745;
}

.overview-card .sub.negative {
  color: #dc3545;
}

.risk-low { color: #28a745; }
.risk-medium { color: #ffc107; }
.risk-high { color: #ff9800; }
.risk-critical { color: #dc3545; }

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.section-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 12px 0;
}

.segments-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.segment-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.segment-card.core { border-left: 4px solid #9c27b0; }
.segment-card.active { border-left: 4px solid #2196f3; }
.segment-card.regular { border-left: 4px solid #4caf50; }
.segment-card.casual { border-left: 4px solid #9e9e9e; }

.segment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.segment-icon {
  font-size: 20px;
}

.segment-name {
  font-weight: 600;
  flex: 1;
}

.segment-percentage {
  font-size: 14px;
  color: #666;
}

.segment-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  width: 50px;
  font-size: 12px;
  color: #666;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar .fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s;
}

.stat-value {
  width: 40px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
}

.sentiment-overview {
  margin-bottom: 15px;
}

.sentiment-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.breakdown-item .label {
  width: 40px;
  font-size: 13px;
}

.breakdown-item .bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.breakdown-item.positive .fill { background: #28a745; }
.breakdown-item.neutral .fill { background: #ffc107; }
.breakdown-item.negative .fill { background: #dc3545; }

.breakdown-item .value {
  width: 40px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
}

.hot-topics h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 8px;
}

.topic-name {
  flex: 1;
  font-weight: 500;
}

.topic-mentions {
  font-size: 12px;
  color: #666;
}

.topic-sentiment {
  font-size: 12px;
  font-weight: 600;
}

.topic-sentiment.positive { color: #28a745; }
.topic-sentiment.negative { color: #dc3545; }

.feedback-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.3s;
}

.action-btn:hover {
  background: #0056b3;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feedback-item {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feedback-item.urgent { border-left: 4px solid #dc3545; }
.feedback-item.high { border-left: 4px solid #ff9800; }
.feedback-item.medium { border-left: 4px solid #ffc107; }
.feedback-item.low { border-left: 4px solid #28a745; }

.feedback-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.feedback-type {
  font-weight: 500;
  font-size: 13px;
}

.feedback-priority {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.feedback-priority.urgent { background: #dc3545; color: white; }
.feedback-priority.high { background: #ff9800; color: white; }
.feedback-priority.medium { background: #ffc107; }
.feedback-priority.low { background: #28a745; color: white; }

.feedback-source {
  font-size: 11px;
  color: #999;
  margin-left: auto;
}

.feedback-content {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.feedback-footer {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.feedback-status {
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 4px;
}

.feedback-status.pending { background: #fff3cd; color: #856404; }
.feedback-status.reviewed { background: #e3f2fd; color: #1565c0; }
.feedback-status.addressed { background: #e8f5e9; color: #2e7d32; }

.feedback-actions-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.small-btn {
  padding: 4px 12px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.small-btn.secondary {
  background: #6c757d;
}

.culture-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.culture-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.culture-card h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
}

.culture-card ul {
  margin: 0;
  padding-left: 20px;
}

.culture-card li {
  margin-bottom: 6px;
  font-size: 13px;
  color: #666;
}

.quick-actions h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
}

.action-card:hover {
  background: #e3f2fd;
}

.action-icon {
  font-size: 28px;
}

.action-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}
</style>
