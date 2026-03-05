import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import StartMenu from '@/views/StartMenu.vue';
import Home from '@/views/home/index.vue';
import Team from '@/views/team/index.vue';
import Match from '@/views/match/index.vue';
import Transfer from '@/views/transfer/index.vue';
import Settings from '@/views/settings/index.vue';
import League from '@/views/league/index.vue';
import BattleReport from '@/views/battle-report/index.vue';
import NotFound from '@/views/NotFound.vue';
import { useClubStore } from '@/stores/club';

const routes = [
  {
    path: '/',
    component: StartMenu,
    name: 'StartMenu',
  },
  {
    path: '/game',
    component: MainLayout,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'team', name: 'Team', component: Team },
      { path: 'match', name: 'Match', component: Match },
      { path: 'transfer', name: 'Transfer', component: Transfer },
      { path: 'league', name: 'League', component: League },
      { path: 'battle-report', name: 'BattleReport', component: BattleReport },
      { path: 'settings', name: 'Settings', component: Settings },
    ],
    meta: { requiresGame: true }, // 需要游戏初始化
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    component: NotFound,
    name: 'NotFound',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to) => {
  // 检查是否需要游戏初始化
  if (to.meta.requiresGame) {
    const clubStore = useClubStore();
    
    if (!clubStore.currentClub) {
      // 没有初始化游戏，重定向到开始菜单
      return { path: '/' };
    }
  }
});

export default router;
