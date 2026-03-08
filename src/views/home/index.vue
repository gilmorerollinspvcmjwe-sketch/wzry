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
    <TodoList :todos="todoStore.sortedTodos" @action="handleTodoAction" />

    <!-- 日报弹窗 -->
    <DailyReport
      :visible="showDailyReport"
      :report="dailyReport"
      @close="showDailyReport = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import { useGameStore } from '@/stores/game';
import { useClubStore } from '@/stores/club';
import { useLeagueStore } from '@/stores/league';
import { useFanReputationStore } from '@/stores/fanReputation';
import { useTodoStore, type Todo } from '@/stores/todo';
import { useEventStore } from '@/stores/event';
import { useInterviewStore } from '@/stores/interview';

import TeamCard from '@/components/TeamCard.vue';
import ScheduleCard from '@/components/ScheduleCard.vue';
import NextDayButton from '@/components/NextDayButton.vue';
import TodoList from '@/components/TodoList.vue';
import DailyReport from '@/components/DailyReport.vue';

const gameStore = useGameStore();
const clubStore = useClubStore();
const leagueStore = useLeagueStore();
const fanReputationStore = useFanReputationStore();
const todoStore = useTodoStore();
const eventStore = useEventStore();
const interviewStore = useInterviewStore();

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

onMounted(() => {
  todoStore.generateTodos();
});

const handleNextDay = () => {
  gameStore.advanceTime();

  eventStore.triggerDailyEvent();
  interviewStore.triggerPostMatchInterview();

  generateDailyReport();

  showDailyReport.value = true;

  todoStore.generateTodos();

  const currentDate = gameStore.currentDate;
  if (currentDate.getDay() === 1) {
    handleWeeklySettlement();
  }
};

const generateDailyReport = () => {
  const club = clubStore.currentClub;
  if (!club) return;

  const todayMatch = leagueStore.myClubMatches.find(m => {
    const matchDate = new Date(m.scheduledDate);
    return matchDate.toDateString() === gameStore.currentDate.toDateString() && !m.isFinished;
  });

  if (todayMatch && todayMatch.result) {
    const isHome = todayMatch.homeTeamId === club.id;
    dailyReport.value.matchResult = {
      opponent: isHome ? todayMatch.awayTeamName : todayMatch.homeTeamName,
      homeScore: todayMatch.result.homeScore,
      awayScore: todayMatch.result.awayScore,
      won: isHome ? todayMatch.result.homeScore > todayMatch.result.awayScore : todayMatch.result.awayScore > todayMatch.result.homeScore,
    };
  } else {
    dailyReport.value.matchResult = undefined;
  }

  const baseIncome = club.funds > 0 ? Math.floor(club.funds * 0.01) : 0;
  const baseExpense = club.roster.reduce((sum, p) => sum + (p.salary || 0), 0) / 7;
  
  dailyReport.value.finance = {
    income: baseIncome,
    expense: Math.floor(baseExpense),
    net: baseIncome - Math.floor(baseExpense),
  };

  const fanChange = eventStore.lastEventConsequences?.fans || 0;
  dailyReport.value.fans = {
    change: fanChange,
    total: fanReputationStore.totalFans + fanChange,
  };

  dailyReport.value.playerUpdates = club.roster.slice(0, 3).map(p => {
    const staminaRecovery = 5;
    const newStamina = Math.min(100, (p.condition?.stamina || 0) + staminaRecovery);
    return {
      name: p.name,
      message: `体力恢复至 ${newStamina}%`,
    };
  });

  dailyReport.value.todos = todoStore.sortedTodos.slice(0, 5).map(t => ({
    message: t.message,
    priority: t.priority,
  }));

  dailyReport.value.day = gameStore.currentWeek;
  dailyReport.value.date = gameStore.currentDate.toLocaleDateString('zh-CN');
};

const handleWeeklySettlement = () => {
  console.log('周结算触发');
};

const handleTodoAction = (todo: Todo) => {
  console.log('处理事项:', todo);
  todoStore.removeTodo(todo.id);
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
