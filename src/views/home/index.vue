<template>
  <div class="home-page">
    <!-- 卡片滑动区域 -->
    <div class="cards-container">
      <swiper
        :modules="[Pagination]"
        :pagination="{ clickable: true }"
        :space-between="16"
        class="cards-swiper"
      >
        <swiper-slide>
          <TeamCard />
        </swiper-slide>
        <swiper-slide>
          <ScheduleCard />
        </swiper-slide>
      </swiper>
    </div>

    <!-- 下一天按钮 -->
    <NextDayButton @click="handleNextDay" />

    <!-- 待处理事项 -->
    <TodoList :todos="todoList" @action="handleTodoAction" />

    <!-- 日报弹窗 -->
    <DailyReport
      :visible="showDailyReport"
      :report="dailyReport"
      @close="showDailyReport = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import { useGameStore } from '@/stores/game';
import { useClubStore } from '@/stores/club';
import { useLeagueStore } from '@/stores/league';
import { useFanReputationStore } from '@/stores/fanReputation';

import TeamCard from '@/components/TeamCard.vue';
import ScheduleCard from '@/components/ScheduleCard.vue';
import NextDayButton from '@/components/NextDayButton.vue';
import TodoList from '@/components/TodoList.vue';
import DailyReport from '@/components/DailyReport.vue';
import type { Todo } from '@/components/TodoList.vue';

// Swiper CSS imports removed

const gameStore = useGameStore();
const clubStore = useClubStore();
const leagueStore = useLeagueStore();
const fanReputationStore = useFanReputationStore();

// 日报弹窗
const showDailyReport = ref(false);
const dailyReport = ref<{
  day: number;
  date: string;
  matchResult: { opponent: string; homeScore: number; awayScore: number; won: boolean } | undefined;
  finance: { income: number; expense: number; net: number };
  fans: { change: number; total: number };
  playerUpdates: { name: string; message: string }[];
  todos: { message: string; priority: 'low' | 'medium' | 'high' }[];
}>({
  day: 1,
  date: new Date().toLocaleDateString('zh-CN'),
  matchResult: undefined,
  finance: { income: 0, expense: 0, net: 0 },
  fans: { change: 0, total: 10000 },
  playerUpdates: [],
  todos: [],
});

// 待处理事项
const todoList = ref<Todo[]>([
  {
    id: '1',
    type: 'sponsor',
    priority: 'medium',
    message: '赞助商合同还有15天到期',
  },
  {
    id: '2',
    type: 'player_contract',
    priority: 'high',
    message: '张三的合同即将到期（25天）',
  },
]);

// 处理下一天
const handleNextDay = () => {
  // 推进时间
  gameStore.advanceTime();

  // 生成日报
  generateDailyReport();

  // 显示日报
  showDailyReport.value = true;

  // 检查是否是周一，触发周结算
  const currentDate = gameStore.currentDate;
  if (currentDate.getDay() === 1) {
    // 周一触发周结算
    handleWeeklySettlement();
  }
};

// 生成日报
const generateDailyReport = () => {
  const club = clubStore.currentClub;
  if (!club) return;

  // 检查今天是否有比赛
  const todayMatch = leagueStore.myClubMatches.find(m => {
    const matchDate = new Date(m.scheduledDate);
    return matchDate.toDateString() === gameStore.currentDate.toDateString() && !m.isFinished;
  });

  // 模拟比赛结果（实际应该调用比赛系统）
  if (todayMatch) {
    dailyReport.value.matchResult = {
      opponent: todayMatch.homeTeamId === club.id ? todayMatch.awayTeamName : todayMatch.homeTeamName,
      homeScore: Math.floor(Math.random() * 3),
      awayScore: Math.floor(Math.random() * 3),
      won: Math.random() > 0.5,
    };
  } else {
    dailyReport.value.matchResult = undefined;
  }

  // 资金变动
  dailyReport.value.finance = {
    income: Math.floor(Math.random() * 50) + 20,
    expense: Math.floor(Math.random() * 30) + 10,
    net: 0,
  };
  dailyReport.value.finance.net = dailyReport.value.finance.income - dailyReport.value.finance.expense;

  // 粉丝变化
  const fanChange = Math.floor(Math.random() * 200) - 50;
  dailyReport.value.fans = {
    change: fanChange,
    total: fanReputationStore.totalFans + fanChange,
  };

  // 选手状态更新
  dailyReport.value.playerUpdates = club.roster.slice(0, 3).map(p => ({
    name: p.name,
    message: `体力恢复至 ${Math.min(100, (p.condition?.stamina || 0) + 5)}%`,
  }));

  // 待处理事项
  dailyReport.value.todos = todoList.value.map(t => ({
    message: t.message,
    priority: t.priority,
  }));

  dailyReport.value.day = gameStore.currentWeek;
  dailyReport.value.date = gameStore.currentDate.toLocaleDateString('zh-CN');
};

// 周结算
const handleWeeklySettlement = () => {
  // 触发各种周结算逻辑
  console.log('周结算触发');
};

// 处理待处理事项
const handleTodoAction = (todo: Todo) => {
  console.log('处理事项:', todo);
  // 从列表中移除
  todoList.value = todoList.value.filter(t => t.id !== todo.id);
};
</script>

<style scoped>
.home-page {
  padding: 15px;
  padding-bottom: 100px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.cards-container {
  flex: 1;
  min-height: 300px;
  margin-bottom: 10px;
}

.cards-swiper {
  height: 100%;
}

:deep(.swiper-slide) {
  height: auto;
}

:deep(.swiper-pagination) {
  bottom: 0;
}

:deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background: #ddd;
  opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
  background: #007bff;
}
</style>
