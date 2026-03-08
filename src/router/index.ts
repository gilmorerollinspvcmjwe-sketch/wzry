import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import StartMenu from '@/views/StartMenu.vue';
import Home from '@/views/home/index.vue';
import Team from '@/views/team/index.vue';
import Match from '@/views/match/index.vue';
import Transfer from '@/views/transfer/index.vue';
import MorePage from '@/views/MorePage.vue';
import Settings from '@/views/settings/index.vue';
import League from '@/views/league/index.vue';
import BattleReport from '@/views/battle-report/index.vue';
import Sponsor from '@/views/sponsor/index.vue';
import Fans from '@/views/fans/index.vue';
import Heroes from '@/views/heroes/index.vue';
import Achievements from '@/views/achievements/index.vue';
import Objectives from '@/views/objectives/index.vue';
import ObjectiveSeason from '@/views/objective/season.vue';
import ObjectiveMilestones from '@/views/objective/milestones.vue';
import Media from '@/views/media/index.vue';
import NotFound from '@/views/NotFound.vue';
import { useClubStore } from '@/stores/club';

// 导入路由常量
import { RouteNames, RoutePaths } from '@/constants/routes';

// 新增页面 - 使用动态导入
const Events = () => import('@/views/events/index.vue');
const News = () => import('@/views/news/index.vue');
const Interview = () => import('@/views/interview/index.vue');
const Social = () => import('@/views/social/index.vue');
const Version = () => import('@/views/version/index.vue');
const Coach = () => import('@/views/coach/index.vue');
const CoachHiring = () => import('@/views/coach/hiring.vue');
const CoachMeeting = () => import('@/views/coach/meeting.vue');
const Community = () => import('@/views/community/index.vue');
const CommunityActivities = () => import('@/views/community/activities.vue');
const CommunityCrisis = () => import('@/views/community/crisis.vue');
const Venue = () => import('@/views/venue/index.vue');
const VenueConstruction = () => import('@/views/venue/construction.vue');
const VenueCommercial = () => import('@/views/venue/commercial.vue');
const Tactics = () => import('@/views/tactics/index.vue');
const TacticsFormation = () => import('@/views/tactics/formation.vue');
const TacticsBP = () => import('@/views/tactics/bp.vue');
const Finance = () => import('@/views/finance/index.vue');
const FinanceReport = () => import('@/views/finance/report.vue');
const FinanceInvestment = () => import('@/views/finance/investment.vue');
const Youth = () => import('@/views/youth/index.vue');
const YouthCoaches = () => import('@/views/youth/coaches.vue');
const YouthFacilities = () => import('@/views/youth/facilities.vue');
const YouthLeague = () => import('@/views/youth/league.vue');
const PlayerCommercial = () => import('@/views/player/commercial.vue');
const PlayerStoryline = () => import('@/views/player/storyline.vue');

const routes = [
  {
    path: RoutePaths.Start,
    component: StartMenu,
    name: RouteNames.Start,
  },
  {
    path: RoutePaths.Root,
    component: MainLayout,
    children: [
      { path: RoutePaths.Home, name: RouteNames.Home, component: Home },
      { path: RoutePaths.Team, name: RouteNames.Team, component: Team },
      { path: RoutePaths.Match, name: RouteNames.Match, component: Match },
      { path: RoutePaths.Transfer, name: RouteNames.Transfer, component: Transfer },
      { path: RoutePaths.More, name: RouteNames.More, component: MorePage },
      { path: RoutePaths.League, name: RouteNames.League, component: League },
      { path: RoutePaths.BattleReport, name: RouteNames.BattleReport, component: BattleReport },
      { path: RoutePaths.Sponsor, name: RouteNames.Sponsor, component: Sponsor },
      { path: RoutePaths.Fans, name: RouteNames.Fans, component: Fans },
      { path: RoutePaths.Heroes, name: RouteNames.Heroes, component: Heroes },
      { path: RoutePaths.Achievements, name: RouteNames.Achievements, component: Achievements },
      { path: RoutePaths.Objectives, name: RouteNames.Objectives, component: Objectives },
      { path: RoutePaths.ObjectiveSeason, name: RouteNames.ObjectiveSeason, component: ObjectiveSeason },
      { path: RoutePaths.ObjectiveMilestones, name: RouteNames.ObjectiveMilestones, component: ObjectiveMilestones },
      { path: RoutePaths.Media, name: RouteNames.Media, component: Media },
      { path: RoutePaths.Settings, name: RouteNames.Settings, component: Settings },
      // 新增页面路由
      { path: RoutePaths.Events, name: RouteNames.Events, component: Events },
      { path: RoutePaths.News, name: RouteNames.News, component: News },
      { path: RoutePaths.Interview, name: RouteNames.Interview, component: Interview },
      { path: RoutePaths.Social, name: RouteNames.Social, component: Social },
      { path: RoutePaths.Version, name: RouteNames.Version, component: Version },
      { path: RoutePaths.Coach, name: RouteNames.Coach, component: Coach },
      { path: RoutePaths.CoachHiring, name: RouteNames.CoachHiring, component: CoachHiring },
      { path: RoutePaths.CoachMeeting, name: RouteNames.CoachMeeting, component: CoachMeeting },
      { path: RoutePaths.Community, name: RouteNames.Community, component: Community },
      { path: RoutePaths.CommunityActivities, name: RouteNames.CommunityActivities, component: CommunityActivities },
      { path: RoutePaths.CommunityCrisis, name: RouteNames.CommunityCrisis, component: CommunityCrisis },
      { path: RoutePaths.Venue, name: RouteNames.Venue, component: Venue },
      { path: RoutePaths.VenueConstruction, name: RouteNames.VenueConstruction, component: VenueConstruction },
      { path: RoutePaths.VenueCommercial, name: RouteNames.VenueCommercial, component: VenueCommercial },
      { path: RoutePaths.Tactics, name: RouteNames.Tactics, component: Tactics },
      { path: RoutePaths.TacticsFormation, name: RouteNames.TacticsFormation, component: TacticsFormation },
      { path: RoutePaths.TacticsBP, name: RouteNames.TacticsBP, component: TacticsBP },
      { path: RoutePaths.Finance, name: RouteNames.Finance, component: Finance },
      { path: RoutePaths.FinanceReport, name: RouteNames.FinanceReport, component: FinanceReport },
      { path: RoutePaths.FinanceInvestment, name: RouteNames.FinanceInvestment, component: FinanceInvestment },
      { path: RoutePaths.Youth, name: RouteNames.Youth, component: Youth },
      { path: RoutePaths.YouthCoaches, name: RouteNames.YouthCoaches, component: YouthCoaches },
      { path: RoutePaths.YouthFacilities, name: RouteNames.YouthFacilities, component: YouthFacilities },
      { path: RoutePaths.YouthLeague, name: RouteNames.YouthLeague, component: YouthLeague },
      { path: RoutePaths.PlayerCommercial, name: RouteNames.PlayerCommercial, component: PlayerCommercial },
      { path: RoutePaths.PlayerStoryline, name: RouteNames.PlayerStoryline, component: PlayerStoryline },
    ],
    meta: { requiresGame: true }, // 需要游戏初始化
  },
  // 404 页面
  {
    path: RoutePaths.NotFound,
    component: NotFound,
    name: RouteNames.NotFound,
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
      return { name: RouteNames.Start };
    }
  }
});

export default router;
