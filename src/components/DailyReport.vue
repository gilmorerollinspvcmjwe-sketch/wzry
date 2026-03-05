<template>
  <div v-if="visible" class="daily-report-modal" @click="handleBackdropClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>📅 第 {{ report.day }} 天</h3>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <!-- 比赛结果 -->
        <div v-if="report.matchResult" class="report-section match">
          <h4>🎮 比赛结果</h4>
          <div class="match-info">
            <span class="vs">vs {{ report.matchResult.opponent }}</span>
            <span class="score" :class="{ win: report.matchResult.won, loss: !report.matchResult.won }">
              {{ report.matchResult.homeScore }} : {{ report.matchResult.awayScore }}
            </span>
            <span class="result" :class="{ win: report.matchResult.won, loss: !report.matchResult.won }">
              {{ report.matchResult.won ? '胜' : '负' }}
            </span>
          </div>
          <button class="view-report-btn" @click="viewMatchReport">查看战报</button>
        </div>

        <!-- 资金变动 -->
        <div class="report-section finance">
          <h4>💰 资金变动</h4>
          <div class="finance-item income">
            <span>收入</span>
            <span class="amount positive">+{{ report.finance.income }}万</span>
          </div>
          <div class="finance-item expense">
            <span>支出</span>
            <span class="amount negative">-{{ report.finance.expense }}万</span>
          </div>
          <div class="finance-item net">
            <span>净变化</span>
            <span class="amount" :class="{ positive: report.finance.net > 0, negative: report.finance.net < 0 }">
              {{ report.finance.net > 0 ? '+' : '' }}{{ report.finance.net }}万
            </span>
          </div>
        </div>

        <!-- 粉丝变化 -->
        <div class="report-section fans">
          <h4>👥 粉丝变化</h4>
          <p class="fans-change" :class="{ positive: report.fans.change > 0, negative: report.fans.change < 0 }">
            {{ report.fans.change > 0 ? '+' : '' }}{{ report.fans.change }}人
          </p>
          <p class="fans-total">当前粉丝: {{ report.fans.total.toLocaleString() }}</p>
        </div>

        <!-- 选手状态 -->
        <div v-if="report.playerUpdates.length > 0" class="report-section players">
          <h4>📊 选手状态</h4>
          <ul class="player-list">
            <li v-for="(update, index) in report.playerUpdates" :key="index">
              {{ update.name }} {{ update.message }}
            </li>
          </ul>
        </div>

        <!-- 待处理事项 -->
        <div v-if="report.todos.length > 0" class="report-section todos">
          <h4>⚠️ 待处理事项</h4>
          <ul class="todo-list">
            <li v-for="(todo, index) in report.todos" :key="index" :class="todo.priority">
              {{ todo.message }}
            </li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button class="confirm-btn" @click="close">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

interface MatchResult {
  opponent: string;
  homeScore: number;
  awayScore: number;
  won: boolean;
}

interface Finance {
  income: number;
  expense: number;
  net: number;
}

interface Fans {
  change: number;
  total: number;
}

interface PlayerUpdate {
  name: string;
  message: string;
}

interface Todo {
  message: string;
  priority: 'high' | 'medium' | 'low';
}

interface DailyReport {
  day: number;
  date: string;
  matchResult?: MatchResult;
  finance: Finance;
  fans: Fans;
  playerUpdates: PlayerUpdate[];
  todos: Todo[];
}

const props = defineProps<{
  visible: boolean;
  report: DailyReport;
}>();

const emit = defineEmits<{
  close: [];
}>();

const router = useRouter();

const close = () => {
  emit('close');
};

const handleBackdropClick = () => {
  close();
};

const viewMatchReport = () => {
  close();
  router.push('/game/battle-report');
};
</script>

<style scoped>
.daily-report-modal {
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.report-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.report-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.report-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

/* 比赛结果 */
.match-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.match-info .vs {
  font-size: 14px;
  color: #666;
}

.match-info .score {
  font-size: 18px;
  font-weight: bold;
}

.match-info .result {
  font-size: 14px;
  font-weight: bold;
}

.win {
  color: #28a745;
}

.loss {
  color: #dc3545;
}

.view-report-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

/* 资金变动 */
.finance-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.finance-item.net {
  border-top: 1px solid #eee;
  margin-top: 6px;
  padding-top: 10px;
  font-weight: bold;
}

.amount.positive {
  color: #28a745;
}

.amount.negative {
  color: #dc3545;
}

/* 粉丝变化 */
.fans-change {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 6px 0;
}

.fans-change.positive {
  color: #28a745;
}

.fans-change.negative {
  color: #dc3545;
}

.fans-total {
  font-size: 13px;
  color: #999;
  margin: 0;
}

/* 选手状态 */
.player-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #666;
}

.player-list li {
  margin: 4px 0;
}

/* 待处理事项 */
.todo-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
}

.todo-list li {
  margin: 6px 0;
}

.todo-list li.high {
  color: #dc3545;
  font-weight: bold;
}

.todo-list li.medium {
  color: #ffc107;
}

.todo-list li.low {
  color: #007bff;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.confirm-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
}

.confirm-btn:active {
  background: #0056b3;
}
</style>