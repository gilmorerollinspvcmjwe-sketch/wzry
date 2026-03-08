/**
 * 路由常量定义
 * 统一管理所有路由路径和名称，避免硬编码
 */

// 路由名称常量
export const RouteNames = {
  // 根路由
  Root: 'Root',

  // 开始菜单
  Start: 'Start',

  // 主布局下的路由
  Home: 'Home',
  Team: 'Team',
  Match: 'Match',
  League: 'League',
  Transfer: 'Transfer',
  Sponsor: 'Sponsor',
  Fans: 'Fans',
  Heroes: 'Heroes',
  Media: 'Media',
  Achievements: 'Achievements',
  Objectives: 'Objectives',
  Settings: 'Settings',
  BattleReport: 'BattleReport',

  // 更多页面
  More: 'More',

  // 新增页面 - 事件系统
  Events: 'Events',

  // 新增页面 - 新闻系统
  News: 'News',

  // 新增页面 - 采访系统
  Interview: 'Interview',

  // 新增页面 - 社交媒体
  Social: 'Social',

  // 新增页面 - 版本更新
  Version: 'Version',

  // 目标系统子页面
  ObjectiveSeason: 'ObjectiveSeason',
  ObjectiveMilestones: 'ObjectiveMilestones',

  // 新增页面 - 教练系统
  Coach: 'Coach',
  CoachHiring: 'CoachHiring',
  CoachMeeting: 'CoachMeeting',

  // 新增页面 - 粉丝社区
  Community: 'Community',
  CommunityActivities: 'CommunityActivities',
  CommunityCrisis: 'CommunityCrisis',

  // 新增页面 - 主场系统
  Venue: 'Venue',
  VenueConstruction: 'VenueConstruction',
  VenueCommercial: 'VenueCommercial',

  // 新增页面 - 战术系统
  Tactics: 'Tactics',
  TacticsFormation: 'TacticsFormation',
  TacticsBP: 'TacticsBP',

  // 新增页面 - 财务系统
  Finance: 'Finance',
  FinanceReport: 'FinanceReport',
  FinanceInvestment: 'FinanceInvestment',

  // 新增页面 - 青训系统
  Youth: 'Youth',
  YouthCoaches: 'YouthCoaches',
  YouthFacilities: 'YouthFacilities',
  YouthLeague: 'YouthLeague',

  // 新增页面 - 选手商业活动
  PlayerCommercial: 'PlayerCommercial',

  // 新增页面 - 选手故事线
  PlayerStoryline: 'PlayerStoryline',

  // 新增页面 - 选手详情
  PlayerDetail: 'PlayerDetail',

  // 404
  NotFound: 'NotFound',
} as const

// 路由路径常量
export const RoutePaths = {
  // 根路径
  Root: '/',

  // 开始菜单
  Start: '/start',

  // 主布局下的路径
  Home: '/',
  Team: '/team',
  Match: '/match',
  League: '/league',
  Transfer: '/transfer',
  Sponsor: '/sponsor',
  Fans: '/fans',
  Heroes: '/heroes',
  Media: '/media',
  Achievements: '/achievements',
  Objectives: '/objectives',
  ObjectiveSeason: '/objectives/season',
  ObjectiveMilestones: '/objectives/milestones',
  Settings: '/settings',
  BattleReport: '/battle-report',

  // 更多页面
  More: '/more',

  // 新增页面 - 事件系统
  Events: '/events',

  // 新增页面 - 新闻系统
  News: '/news',

  // 新增页面 - 采访系统
  Interview: '/interview',

  // 新增页面 - 社交媒体
  Social: '/social',

  // 新增页面 - 版本更新
  Version: '/version',

  // 新增页面 - 教练系统
  Coach: '/coach',
  CoachHiring: '/coach/hiring',
  CoachMeeting: '/coach/meeting',

  // 新增页面 - 粉丝社区
  Community: '/community',
  CommunityActivities: '/community/activities',
  CommunityCrisis: '/community/crisis',

  // 新增页面 - 主场系统
  Venue: '/venue',
  VenueConstruction: '/venue/construction',
  VenueCommercial: '/venue/commercial',

  // 新增页面 - 战术系统
  Tactics: '/tactics',
  TacticsFormation: '/tactics/formation',
  TacticsBP: '/tactics/bp',

  // 新增页面 - 财务系统
  Finance: '/finance',
  FinanceReport: '/finance/report',
  FinanceInvestment: '/finance/investment',

  // 新增页面 - 青训系统
  Youth: '/youth',
  YouthCoaches: '/youth/coaches',
  YouthFacilities: '/youth/facilities',
  YouthLeague: '/youth/league',

  // 新增页面 - 选手商业活动
  PlayerCommercial: '/player/commercial',

  // 新增页面 - 选手详情
  PlayerDetail: '/player/:id',

  // 新增页面 - 选手故事线
  PlayerStoryline: '/player/storyline',

  // 404
  NotFound: '/:pathMatch(.*)*',
} as const

// 带参数的路由路径生成器
export const RoutePathWithParams = {
  // 战报页面，需要比赛ID
  BattleReport: (matchId: string) => `${RoutePaths.BattleReport}/${matchId}`,

  // 选手详情
  PlayerDetail: (playerId: string) => `/player/${playerId}`,

  // 比赛详情（预留）
  MatchDetail: (matchId: string) => `/match/${matchId}`,
} as const

// 底部导航配置
export const BottomNavItems = [
  {
    name: RouteNames.Home,
    path: RoutePaths.Home,
    title: '首页',
    icon: 'home-o',
  },
  {
    name: RouteNames.Team,
    path: RoutePaths.Team,
    title: '阵容',
    icon: 'friends-o',
  },
  {
    name: RouteNames.Match,
    path: RoutePaths.Match,
    title: '比赛',
    icon: 'fire-o',
  },
  {
    name: RouteNames.More,
    path: RoutePaths.More,
    title: '更多',
    icon: 'apps-o',
  },
] as const

// 更多页面菜单配置
export const MorePageMenus = [
  {
    name: RouteNames.League,
    path: RoutePaths.League,
    title: '联赛',
    icon: 'medal-o',
    color: '#ff6b6b',
  },
  {
    name: RouteNames.Transfer,
    path: RoutePaths.Transfer,
    title: '转会市场',
    icon: 'exchange',
    color: '#4ecdc4',
  },
  {
    name: RouteNames.Sponsor,
    path: RoutePaths.Sponsor,
    title: '赞助商',
    icon: 'gem-o',
    color: '#ffd93d',
  },
  {
    name: RouteNames.Fans,
    path: RoutePaths.Fans,
    title: '粉丝',
    icon: 'like-o',
    color: '#ff6b9d',
  },
  {
    name: RouteNames.Heroes,
    path: RoutePaths.Heroes,
    title: '英雄',
    icon: 'user-o',
    color: '#c44569',
  },
  {
    name: RouteNames.Media,
    path: RoutePaths.Media,
    title: '媒体',
    icon: 'newspaper-o',
    color: '#a29bfe',
  },
  {
    name: RouteNames.Achievements,
    path: RoutePaths.Achievements,
    title: '成就',
    icon: 'trophy-o',
    color: '#fdcb6e',
  },
  {
    name: RouteNames.Objectives,
    path: RoutePaths.Objectives,
    title: '目标',
    icon: 'flag-o',
    color: '#6c5ce7',
  },
  {
    name: RouteNames.Settings,
    path: RoutePaths.Settings,
    title: '设置',
    icon: 'setting-o',
    color: '#74b9ff',
  },
  {
    name: RouteNames.Events,
    path: RoutePaths.Events,
    title: '事件',
    icon: 'bell-o',
    color: '#e17055',
  },
  {
    name: RouteNames.News,
    path: RoutePaths.News,
    title: '新闻',
    icon: 'newspaper-o',
    color: '#00b894',
  },
  {
    name: RouteNames.Interview,
    path: RoutePaths.Interview,
    title: '采访',
    icon: 'chat-o',
    color: '#0984e3',
  },
  {
    name: RouteNames.Social,
    path: RoutePaths.Social,
    title: '社交',
    icon: 'share-o',
    color: '#e84393',
  },
  {
    name: RouteNames.Version,
    path: RoutePaths.Version,
    title: '版本',
    icon: 'upgrade',
    color: '#00cec9',
  },
  {
    name: RouteNames.Tactics,
    path: RoutePaths.Tactics,
    title: '战术',
    icon: 'cluster-o',
    color: '#636e72',
  },
  {
    name: RouteNames.Youth,
    path: RoutePaths.Youth,
    title: '青训',
    icon: 'friends-o',
    color: '#52c41a',
  },
  {
    name: RouteNames.Coach,
    path: RoutePaths.Coach,
    title: '教练团队',
    icon: 'manager-o',
    color: '#722ed1',
  },
  {
    name: RouteNames.Venue,
    path: RoutePaths.Venue,
    title: '主场管理',
    icon: 'location-o',
    color: '#13c2c2',
  },
  {
    name: RouteNames.Finance,
    path: RoutePaths.Finance,
    title: '财务中心',
    icon: 'gold-coin-o',
    color: '#faad14',
  },
  {
    name: RouteNames.Community,
    path: RoutePaths.Community,
    title: '粉丝社区',
    icon: 'cluster-o',
    color: '#eb2f96',
  },
] as const

// 路由元信息类型
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  hideBottomNav?: boolean
  keepAlive?: boolean
}

// 导出类型
export type RouteName = (typeof RouteNames)[keyof typeof RouteNames]
export type RoutePath = (typeof RoutePaths)[keyof typeof RoutePaths]
