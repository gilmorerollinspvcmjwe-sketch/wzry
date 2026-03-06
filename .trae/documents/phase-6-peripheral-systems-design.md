# Phase 6 外围系统详细设计

## 设计目标

Phase 6 旨在完善游戏的外围系统，增强游戏的可玩性和沉浸感。这些系统将与现有的核心系统（比赛、选手、英雄、AI 俱乐部、粉丝声望、赞助商、事件）深度整合，形成一个完整的电竞俱乐部模拟生态。

## 系统概述

Phase 6 包含以下 5 个核心外围系统：

1. **媒体粉丝互动系统** - 深化现有的粉丝声望系统
2. **联赛排名与统计系统** - 扩展联赛数据深度
3. **转会市场系统** - 完善球员交易机制
4. **成就系统** - 增加游戏目标和成就感
5. **赛季目标系统** - 提供长期游戏动力

---

## 系统 1: 媒体粉丝互动系统

### 1.1 系统概述

在现有粉丝声望系统基础上，增加媒体互动、采访、社交媒体等功能，让玩家感受到作为俱乐部经理的媒体曝光和舆论压力。

### 1.2 核心功能

#### 1.2.1 媒体采访系统

**触发时机**：
- 重要比赛后（胜率>80% 或连败>3 场）
- 季后赛/决赛前后
- 重大事件发生后（签约明星选手、俱乐部丑闻等）
- 每 5 周随机触发

**采访类型**：
```typescript
interface Interview {
  id: string;
  type: 'post_match' | 'pre_playoff' | 'transfer' | 'scandal' | 'random';
  media: MediaOutlet;  // 媒体机构
  questions: InterviewQuestion[];
  impact: InterviewImpact;
}

interface InterviewQuestion {
  id: string;
  question: string;
  options: InterviewOption[];
}

interface InterviewOption {
  id: string;
  text: string;
  tone: 'confident' | 'humble' | 'aggressive' | 'diplomatic';
  consequences: {
    fanChange: number;
    reputationChange: number;
    playerMoraleChange: number;
    mediaRelationChange: number;
  };
}
```

**采访示例**：
```
场景：赛后采访 - 刚赢得重要比赛
记者："恭喜获胜！请问您认为获胜的关键是什么？"

选项：
A. "我们的准备更充分，选手发挥出色"（humble）
   → 粉丝 +50, 声望 +0.5, 选手士气 +5
   
B. "对手太弱了，我们还没尽全力"（confident）
   → 粉丝 +100, 声望 +1, 但可能得罪对手俱乐部
   
C. "这是团队共同努力的结果"（diplomatic）
   → 粉丝 +30, 声望 +0.3, 选手士气 +10
```

#### 1.2.2 社交媒体系统

**功能模块**：
```typescript
interface SocialMedia {
  // 微博-like 平台
  weibo: {
    followers: number;      // 粉丝数
    posts: SocialPost[];    // 帖子
    trending: boolean;      // 是否上热搜
    sentiment: 'positive' | 'neutral' | 'negative';
  };
  
  // 直播平台
  streaming: {
    viewers: number;        // 观看人数
    subscribers: number;    // 订阅数
    revenue: number;        // 直播收入
  };
}

interface SocialPost {
  id: string;
  content: string;
  type: 'match_result' | 'player_highlight' | 'announcement' | 'interaction';
  likes: number;
  comments: number;
  shares: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
}
```

**社交媒体互动**：
- 比赛后自动发布战报
- 定期发布选手训练日常
- 回应粉丝关切（选择如何回应负面评论）
- 官宣转会、续约等消息

#### 1.2.3 媒体关系系统

**媒体类型**：
```typescript
type MediaOutlet = {
  id: string;
  name: string;
  type: 'esports_media' | 'mainstream_media' | 'fan_community';
  influence: number;  // 影响力 1-10
  relation: number;   // 关系 -100 到 100
};

// 示例媒体
const MEDIA_OUTLETS: MediaOutlet[] = [
  { id: 'm1', name: '电竞之家', type: 'esports_media', influence: 8, relation: 0 },
  { id: 'm2', name: '腾讯电竞', type: 'mainstream_media', influence: 10, relation: 0 },
  { id: 'm3', name: '贴吧', type: 'fan_community', influence: 6, relation: 0 },
  { id: 'm4', name: 'NGA 电竞版', type: 'fan_community', influence: 7, relation: 0 },
];
```

**媒体关系影响**：
- 关系好：正面报道多，采访请求多
- 关系差：负面新闻多，舆论压力大
- 通过采访、发布会、独家消息等方式维护关系

### 1.3 与现有系统整合

```typescript
// 整合点 1: 比赛结果影响媒体互动
function processMatchResult(won: boolean, isImportant: boolean) {
  // 现有：更新粉丝声望
  fanReputationSystem.processMatchResult(won, isImportant);
  
  // 新增：触发媒体采访
  if (isImportant) {
    interviewSystem.triggerPostMatchInterview(won);
  }
  
  // 新增：社交媒体反应
  socialMediaSystem.postMatchUpdate(won);
}

// 整合点 2: 转会操作影响媒体
function processPlayerTransfer(player: Player, isSigning: boolean) {
  // 现有：更新粉丝声望
  fanReputationSystem.processPlayerTransfer(isSigning, player.power);
  
  // 新增：媒体报导
  if (isStarPlayer(player)) {
    mediaSystem.publishTransferNews(player, isSigning);
    socialMediaSystem.announceTransfer(player, isSigning);
  }
}
```

### 1.4 UI 设计

**媒体中心页面** (`/media`):
```
┌─────────────────────────────────────┐
│ 媒体中心                            │
├─────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┐    │
│ │ 采访    │ 社交媒体│ 媒体关系│    │
│ └─────────┴─────────┴─────────┘    │
│                                     │
│ 待处理采访 (1)                       │
│ ┌───────────────────────────────┐  │
│ │ 📺 电竞之家 赛后采访          │  │
│ │ "请谈谈对今天比赛的看法"      │  │
│ │ [接受采访] [推迟] [拒绝]      │  │
│ └───────────────────────────────┘  │
│                                     │
│ 社交媒体动态                        │
│ ┌───────────────────────────────┐  │
│ │ 📊 微博粉丝：125.3 万 (+1.2 万)│  │
│ │ 🔥 热搜：#XX 战队 五连胜#     │  │
│ │ 👍 最新帖子：2345 点赞        │  │
│ └───────────────────────────────┘  │
│                                     │
│ 媒体关系                            │
│ 电竞之家：████████░░ 80/100       │
│ 腾讯电竞：██████░░░░ 60/100       │
└─────────────────────────────────────┘
```

---

## 系统 2: 联赛排名与统计系统

### 2.1 系统概述

在现有联赛系统基础上，增加详细的数据统计、排行榜、历史数据等功能，让玩家能够深入了解联赛和选手的表现。

### 2.2 核心功能

#### 2.2.1 数据统计中心

**联赛整体统计**：
```typescript
interface LeagueStatistics {
  season: number;
  phase: 'regular' | 'playoff' | 'finished';
  
  // 俱乐部统计
  clubStats: {
    clubId: string;
    clubName: string;
    matches: number;
    wins: number;
    losses: number;
    winRate: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    averageGameDuration: number;
    goldPerMinute: number;
    damagePerMinute: number;
  }[];
  
  // 选手统计
  playerStats: {
    playerId: string;
    playerName: string;
    clubId: string;
    matches: number;
    kda: number;
    kills: number;
    deaths: number;
    assists: number;
    goldPerMinute: number;
    damagePerMinute: number;
    visionScore: number;
    csPerMinute: number;
    mvpCount: number;
    goldMedals: number;
    silverMedals: number;
  }[];
  
  // 英雄统计
  heroStats: {
    heroId: string;
    heroName: string;
    picks: number;
    bans: number;
    wins: number;
    losses: number;
    winRate: number;
    pickRate: number;
    banRate: number;
    averageKDA: number;
  }[];
}
```

**排行榜类型**：
```typescript
type LeaderboardType = 
  | 'kills'           // 击杀榜
  | 'assists'         // 助攻榜
  | 'kda'             // KDA 榜
  | 'gold_per_min'    // 经济榜
  | 'damage_per_min'  // 伤害榜
  | 'vision_score'    // 视野榜
  | 'cs_per_min'      // 补刀榜
  | 'mvp_count';      // MVP 榜
```

#### 2.2.2 历史数据系统

**历史记录**：
```typescript
interface HistoricalData {
  // 历届冠军
  champions: {
    season: number;
    year: number;
    phase: 'spring' | 'summer';
    champion: Club;
    runnerUp: Club;
    finalsMVP: Player;
  }[];
  
  // 个人荣誉
  honors: {
    season: number;
    year: number;
    phase: 'spring' | 'summer';
    regularSeasonMVP: Player;
    finalsMVP: Player;
    bestNewcomer: Player;
    allStarTeam: Player[];
  }[];
  
  // 记录保持者
  records: {
    type: string;
    holder: Player | Club;
    value: number;
    date: Date;
    opponent?: string;
  }[];
}
```

#### 2.2.3 数据可视化

**图表展示**：
- 俱乐部积分趋势图
- 选手属性成长曲线
- 英雄胜率/禁用率变化
- 经济曲线对比（比赛详情）

### 2.3 与现有系统整合

```typescript
// 整合点 1: 比赛结算时更新统计
function updateMatchStatistics(match: Match) {
  // 更新俱乐部统计
  leagueStatistics.clubStats.forEach(stat => {
    if (stat.clubId === match.homeTeamId || stat.clubId === match.awayTeamId) {
      updateClubStats(stat, match);
    }
  });
  
  // 更新选手统计
  match.playerStats.forEach(playerStat => {
    updatePlayerStats(playerStat);
  });
  
  // 更新英雄统计
  match.bpData.homeTeam.heroes.forEach(hero => {
    updateHeroStats(hero, match.winner);
  });
}

// 整合点 2: 选手养成系统读取数据
function getPlayerHonors(playerId: string): Honor[] {
  return historicalData.honors.filter(h => 
    h.regularSeasonMVP?.id === playerId ||
    h.finalsMVP?.id === playerId ||
    h.allStarTeam.some(p => p.id === playerId)
  );
}
```

### 2.4 UI 设计

**联赛统计页面** (`/league/statistics`):
```
┌─────────────────────────────────────┐
│ 联赛统计 2024 春季赛                 │
├─────────────────────────────────────┤
│ [俱乐部] [选手] [英雄] [历史]       │
├─────────────────────────────────────┤
│ 选手排行榜 - KDA TOP10              │
│ ┌─────────────────────────────────┐ │
│ │ 排名 选手   俱乐部  KDA  场次   │ │
│ │ 1    一诺   AG     8.5   15    │ │
│ │ 2    花海   eStar  7.8   15    │ │
│ │ 3    清融   eStar  7.2   15    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 英雄统计                            │
│ ┌─────────────────────────────────┐ │
│ │ 英雄   出场  禁用  胜率  趋势  │ │
│ │ 大司命  15    12    65%   ↑    │ │
│ │ 朵莉亚  14    10    60%   →    │ │
│ │ 姬小满  13    8     55%   ↓    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 系统 3: 转会市场系统

### 3.1 系统概述

在现有转会市场功能基础上，增加竞价系统、球员意愿、经纪人谈判、球探报告等深度机制。

### 3.2 核心功能

#### 3.2.1 竞价系统

**竞价流程**：
```typescript
interface TransferBid {
  id: string;
  playerId: string;
  biddingClubId: string;
  amount: number;        // 报价金额（万）
  salaryOffer: number;   // 承诺周薪（万）
  contractLength: number;// 合同年限
  timestamp: Date;
  status: 'active' | 'outbid' | 'accepted' | 'rejected';
}

interface TransferAuction {
  playerId: string;
  startingBid: number;
  currentBid: TransferBid;
  bids: TransferBid[];
  endTime: Date;
  interestedClubs: string[]; // 感兴趣的俱乐部 ID
}
```

**竞价规则**：
- 热门球员触发竞价
- 每次加价至少 10%
- AI 俱乐部根据财力和需求参与竞价
- 球员有权拒绝报价（即使最高）

#### 3.2.2 球员意愿系统

**意愿因素**：
```typescript
interface PlayerWillingness {
  // 基础意愿（0-100）
  baseWillingness: number;
  
  // 影响因素
  factors: {
    clubReputation: number;    // 俱乐部声望影响
    salaryOffer: number;       // 薪资影响
    championshipChance: number;// 夺冠概率
    location: number;          // 地理位置
    existingRelationships: number; // 现有队友关系
    coachStyle: number;        // 教练风格匹配
  };
  
  // 性格影响
  personality: {
    ambition: number;   // 野心（高野心偏好强队）
    loyalty: number;    // 忠诚度（高忠诚难挖角）
    moneyDriven: number;// 金钱驱动
  };
}
```

**意愿表现**：
- 意愿>80：球员主动申请转会
- 意愿>60：愿意谈判
- 意愿>40：可以考虑
- 意愿<40：拒绝谈判

#### 3.2.3 经纪人谈判系统

**谈判流程**：
```typescript
interface Negotiation {
  playerId: string;
  agentName: string;
  stage: 'initial' | 'salary' | 'contract' | 'final';
  
  // 谈判项
  salaryNegotiation: {
    playerDemand: number;  // 球员要求
    clubOffer: number;     // 俱乐部报价
    gap: number;           // 差距
  };
  
  contractTerms: {
    length: number;        // 年限
    releaseClause: number; // 违约金
    bonus: Bonus[];        // 奖金条款
  };
  
  // 谈判策略
  strategy: 'hardball' | 'compromise' | 'friendly';
  relationship: number;    // 与经纪人关系
}
```

**谈判选项**：
```
经纪人："球员希望周薪达到 50 万"

选项：
A. "接受，我们很有诚意" 
   → 签约成功率高，但薪资支出高
   
B. "我们可以给 40 万 + 夺冠奖金"
   → 折中方案，需要进一步谈判
   
C. "这个价格太高了，我们最多给 35 万"
   → 可能谈判破裂
```

#### 3.2.4 球探报告系统

**球探等级**：
```typescript
interface Scout {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;  // 球探等级
  specialty: Position[];     // 擅长位置
  
  // 报告准确度
  accuracy: {
    attributes: number;  // 属性准确度
    potential: number;   // 潜力准确度
    personality: number; // 性格准确度
  };
}
```

**球探报告内容**：
```typescript
interface ScoutReport {
  playerId: string;
  playerName: string;
  position: Position;
  age: number;
  
  // 估计值（有误差）
  estimatedAttributes: {
    mechanics: number;
    awareness: number;
    teamwork: number;
    mentality: number;
  };
  
  estimatedPotential: number;
  personalityTraits: string[];
  
  // 球探评价
  summary: string;
  recommendation: 'highly_recommended' | 'recommended' | 'not_recommended';
  confidenceLevel: number;  // 可信度
}
```

### 3.3 与现有系统整合

```typescript
// 整合点 1: AI 俱乐部参与竞价
function processTransferAuction(auction: TransferAuction) {
  // AI 俱乐部根据财力和需求决定是否出价
  aiClubs.forEach(club => {
    if (club.needsPlayer(auction.playerId) && club.canAfford(auction.startingBid)) {
      const bidAmount = calculateBidAmount(club, auction);
      placeBid(auction, club, bidAmount);
    }
  });
}

// 整合点 2: 球员意愿影响转会
function canNegotiateTransfer(player: Player, targetClub: Club): boolean {
  const willingness = calculateWillingness(player, targetClub);
  
  // 检查球员意愿
  if (willingness.baseWillingness < 40) {
    return false; // 球员拒绝谈判
  }
  
  // 检查当前俱乐部态度
  const currentClub = getClubByPlayer(player);
  if (currentClub.isKeyPlayer(player)) {
    return false; // 非卖品
  }
  
  return true;
}
```

### 3.4 UI 设计

**转会市场页面增强** (`/transfer`):
```
┌─────────────────────────────────────┐
│ 转会市场                            │
├─────────────────────────────────────┤
│ [转会市场] [自由签约] [我的阵容]    │
├─────────────────────────────────────┤
│ 正在进行竞价 (2)                     │
│ ┌───────────────────────────────┐  │
│ │ 一诺 (射手) - AG 超玩会        │  │
│ │ 当前报价：800 万              │  │
│ │ 你的报价：-                   │  │
│ │ 剩余时间：2 天 5 小时          │  │
│ │ [出价] [退出]                 │  │
│ └───────────────────────────────┘  │
│                                     │
│ 可签约球员                          │
│ ┌───────────────────────────────┐  │
│ │ 花海 (打野) - 自由球员       │  │
│ │ 实力：88  潜力：90           │  │
│ │ 周薪要求：45 万               │  │
│ │ 意愿：★★★★☆ (75/100)      │  │
│ │ [谈判] [查看报告]             │  │
│ └───────────────────────────────┘  │
│                                     │
│ 球探服务                            │
│ [挖掘新人 -50 万] [搜索特定位置]   │
└─────────────────────────────────────┘
```

---

## 系统 4: 成就系统

### 4.1 系统概述

成就系统提供长期游戏目标和成就感，记录玩家的里程碑时刻，增加游戏重玩价值。

### 4.2 核心功能

#### 4.2.1 成就分类

**成就类别**：
```typescript
type AchievementCategory = 
  | 'career'        // 职业生涯
  | 'competition'   // 比赛竞技
  | 'management'    // 俱乐部管理
  | 'development'   // 选手养成
  | 'social'        // 社交互动
  | 'special'       // 特殊成就
  ;
```

**成就示例**：
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // 完成条件
  condition: {
    type: string;
    target: number;
    current: number;
  };
  
  // 奖励
  rewards: {
    funds?: number;
    reputation?: number;
    fans?: number;
    unlock?: string;  // 解锁特殊内容
  };
  
  // 完成状态
  completed: boolean;
  completedAt?: Date;
}

// 示例成就
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    name: '初出茅庐',
    description: '赢得第一场比赛',
    category: 'competition',
    rarity: 'common',
    condition: { type: 'wins', target: 1, current: 0 },
    rewards: { funds: 10, reputation: 1 },
    completed: false,
  },
  {
    id: 'a2',
    name: '冠军教头',
    description: '带领俱乐部获得联赛冠军',
    category: 'competition',
    rarity: 'legendary',
    condition: { type: 'championships', target: 1, current: 0 },
    rewards: { funds: 500, reputation: 20, fans: 10000 },
    completed: false,
  },
  {
    id: 'a3',
    name: '伯乐',
    description: '培养出 10 名明星选手',
    category: 'development',
    rarity: 'epic',
    condition: { type: 'star_players_developed', target: 10, current: 0 },
    rewards: { reputation: 10, unlock: 'special_scout' },
    completed: false,
  },
];
```

#### 4.2.2 成就追踪

**进度追踪**：
```typescript
interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
  milestones: {
    percentage: number;
    reached: boolean;
  }[];
}
```

**通知系统**：
```typescript
// 成就完成时弹出通知
function onAchievementUnlocked(achievement: Achievement) {
  showNotification({
    title: '🏆 成就解锁',
    message: achievement.name,
    description: achievement.description,
    rewards: achievement.rewards,
  });
  
  // 播放特效
  playAchievementAnimation(achievement.rarity);
}
```

#### 4.2.3 成就奖励

**奖励类型**：
- 资金奖励
- 声望奖励
- 粉丝增长
- 解锁特殊内容（特殊队服、特殊场馆等）
- 解锁新功能（高级球探、特殊训练等）

### 4.3 与现有系统整合

```typescript
// 整合点 1: 比赛结果检查成就
function checkAchievementsAfterMatch(match: Match) {
  const club = getCurrentClub();
  
  // 胜利场次成就
  if (match.winner === club.id) {
    incrementAchievementProgress('total_wins');
    
    if (match.isPlayoff && match.isFinal) {
      unlockAchievement('championship');
    }
  }
  
  // 选手表现成就
  match.playerStats.forEach(stat => {
    if (stat.kills >= 10) {
      incrementAchievementProgress('pentakill');
    }
  });
}

// 整合点 2: 转会操作检查成就
function checkAchievementsAfterTransfer(player: Player, isSigning: boolean) {
  if (isSigning && isStarPlayer(player)) {
    incrementAchievementProgress('star_signings');
  }
  
  if (isSigning && player.age <= 18) {
    incrementAchievementProgress('youth_development');
  }
}
```

### 4.4 UI 设计

**成就页面** (`/achievements`):
```
┌─────────────────────────────────────┐
│ 成就系统                            │
├─────────────────────────────────────┤
│ 总进度：████████░░ 80/100          │
│ 已完成：45  进行中：12  未解锁：43  │
├─────────────────────────────────────┤
│ [全部] [生涯] [比赛] [管理] [养成]  │
├─────────────────────────────────────┤
│ 传奇成就 (1/5)                      │
│ ┌───────────────────────────────┐  │
│ │ 🏆 冠军教头                   │  │
│ │ 带领俱乐部获得联赛冠军        │  │
│ │ 进度：█░░░░░░░░░ 1/1 ✅      │  │
│ │ 奖励：500 万，20 声望         │  │
│ └───────────────────────────────┘  │
│                                     │
│ 史诗成就 (3/15)                     │
│ ┌───────────────────────────────┐  │
│ │ ⭐ 伯乐                       │  │
│ │ 培养出 10 名明星选手            │  │
│ │ 进度：█████░░░░░ 5/10        │  │
│ │ 奖励：10 声望，解锁特殊球探   │  │
│ └───────────────────────────────┘  │
│                                     │
│ 稀有成就 (8/30)                     │
│ ...                                 │
└─────────────────────────────────────┘
```

---

## 系统 5: 赛季目标系统

### 5.1 系统概述

赛季目标系统为每个赛季设定具体目标，提供明确的游戏方向和评价标准，完成目标可获得丰厚奖励。

### 5.2 核心功能

#### 5.2.1 目标生成

**目标类型**：
```typescript
interface SeasonObjective {
  id: string;
  type: ObjectiveType;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legend';
  
  // 目标条件
  condition: {
    metric: string;
    target: number;
    current: number;
  };
  
  // 奖励（根据难度）
  rewards: {
    funds: number;
    reputation: number;
    fans: number;
    special?: string;
  };
  
  // 完成状态
  completed: boolean;
  failed: boolean;
}

type ObjectiveType = 
  | 'ranking'         // 联赛排名
  | 'wins'           // 胜场数
  | 'development'    // 选手培养
  | 'financial'      // 财务目标
  | 'reputation'     // 声望目标
  | 'playoff'        // 季后赛成绩
  ;
```

**目标示例**：
```typescript
const SEASON_OBJECTIVES: SeasonObjective[] = [
  {
    id: 'o1',
    type: 'ranking',
    title: '冲击季后赛',
    description: '常规赛进入前 8 名',
    difficulty: 'medium',
    condition: {
      metric: 'final_ranking',
      target: 8,
      current: 0,
    },
    rewards: {
      funds: 100,
      reputation: 5,
      fans: 5000,
    },
    completed: false,
  },
  {
    id: 'o2',
    type: 'development',
    title: '明日之星',
    description: '培养一名潜力达到 90 的选手',
    difficulty: 'hard',
    condition: {
      metric: 'player_potential',
      target: 90,
      current: 0,
    },
    rewards: {
      funds: 200,
      reputation: 10,
      special: 'youth_academy_discount',
    },
    completed: false,
  },
];
```

#### 5.2.2 董事会期望

**董事会期望系统**：
```typescript
interface BoardExpectation {
  // 赛季目标
  primaryObjective: SeasonObjective;
  secondaryObjectives: SeasonObjective[];
  
  // 期望等级
  expectationLevel: 'survival' | 'playoff' | 'championship' | 'dynasty';
  
  // 耐心度
  patience: number;  // 0-100，低于 50 可能被解雇
  
  // 评价
  evaluation: {
    performance: number;  // 表现评分
    trend: 'up' | 'stable' | 'down';
    comments: string;
  };
}
```

**董事会评价时机**：
- 每 5 周一次小评价
- 赛季结束大评价
- 连续失败后紧急评价

#### 5.2.3 目标追踪

**进度更新**：
```typescript
function updateObjectiveProgress(objective: SeasonObjective, newValue: number) {
  objective.condition.current = newValue;
  
  const progress = newValue / objective.condition.target;
  
  if (progress >= 1) {
    completeObjective(objective);
  }
}

function completeObjective(objective: SeasonObjective) {
  objective.completed = true;
  
  // 发放奖励
  club.addFunds(objective.rewards.funds);
  fanReputationSystem.addReputation(objective.rewards.reputation);
  fanReputationSystem.addFans(objective.rewards.fans);
  
  // 解锁特殊内容
  if (objective.rewards.special) {
    unlockSpecialContent(objective.rewards.special);
  }
  
  // 通知玩家
  showObjectiveCompletionNotification(objective);
}
```

#### 5.2.4 赛季评价

**评价等级**：
```typescript
type SeasonEvaluation = 
  | 'S'  // 完美赛季（完成所有目标 + 额外成就）
  | 'A'  // 优秀赛季（完成主要目标）
  | 'B'  // 合格赛季（完成部分目标）
  | 'C'  // 不合格赛季（未完成主要目标）
  | 'D'  // 失败赛季（董事会失去耐心）
  ;
```

**评价影响**：
- S/A: 董事会奖金、声望提升、解锁新目标
- B: 保留职位、少量奖金
- C: 警告、董事会耐心下降
- D: 可能被解雇（游戏结束或新挑战）

### 5.3 与现有系统整合

```typescript
// 整合点 1: 联赛系统更新目标进度
function updateLeagueObjectives(standings: Standing[]) {
  const myClub = getCurrentClub();
  const myStanding = standings.find(s => s.clubId === myClub.id);
  
  if (myStanding) {
    const rankingObjective = objectives.find(o => o.type === 'ranking');
    if (rankingObjective) {
      updateObjectiveProgress(rankingObjective, myStanding.rank);
    }
  }
}

// 整合点 2: 财务系统更新目标进度
function updateFinancialObjectives() {
  const club = getCurrentClub();
  
  const financialObjective = objectives.find(o => o.type === 'financial');
  if (financialObjective) {
    updateObjectiveProgress(financialObjective, club.funds);
  }
}

// 整合点 3: 选手养成系统更新目标进度
function updateDevelopmentObjectives(player: Player) {
  const devObjective = objectives.find(o => o.type === 'development');
  if (devObjective && devObjective.condition.metric === 'player_potential') {
    if (player.potential >= devObjective.condition.target) {
      completeObjective(devObjective);
    }
  }
}
```

### 5.4 UI 设计

**赛季目标页面** (`/objectives`):
```
┌─────────────────────────────────────┐
│ 2024 春季赛 目标                     │
├─────────────────────────────────────┤
│ 董事会期望：进入季后赛             │
│ 耐心度：████████░░ 80/100         │
│ 下次评价：5 周后                    │
├─────────────────────────────────────┤
│ 主要目标                            │
│ ┌───────────────────────────────┐  │
│ │ 🎯 冲击季后赛                 │  │
│ │ 常规赛进入前 8 名              │  │
│ │ 进度：████████░░ 6/8         │  │
│ │ 奖励：100 万，5 声望，5000 粉丝│  │
│ └───────────────────────────────┘  │
├─────────────────────────────────────┤
│ 次要目标 (2/3)                      │
│ ┌───────────────────────────────┐  │
│ │ 💰 财务健康                   │  │
│ │ 赛季末资金达到 500 万          │  │
│ │ 进度：████░░░░░░ 320/500 万  │  │
│ │ 奖励：50 万，2 声望           │  │
│ └───────────────────────────────┘  │
│ ┌───────────────────────────────┐  │
│ │ ⭐ 明日之星                   │  │
│ │ 培养一名潜力 90+ 的选手        │  │
│ │ 进度：██░░░░░░░░ 1/1 ✅     │  │
│ │ 已完成！奖励已发放           │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 系统集成架构

### 整体数据流

```
┌──────────────────────────────────────────────────────────┐
│                      游戏核心循环                        │
└──────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  比赛系统     │  │  时间推进     │  │  玩家操作     │
│  (Match)      │  │  (GameLoop)   │  │  (Actions)    │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                   事件分发层                             │
│              (Event Dispatcher)                         │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ 粉丝声望系统  │  │  媒体系统     │  │  成就系统     │
│ (Fan/Rep)     │  │  (Media)      │  │ (Achievement) │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  联赛系统     │  │  转会市场     │  │  目标系统     │
│  (League)     │  │  (Transfer)   │  │ (Objective)   │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 状态管理

```typescript
// 统一的 Store 结构
interface GameState {
  // 核心状态
  club: ClubState;
  players: PlayerState;
  heroes: HeroState;
  
  // 比赛状态
  match: MatchState;
  league: LeagueState;
  
  // 外围系统状态
  fanReputation: FanReputationState;
  media: MediaState;
  transfer: TransferState;
  achievement: AchievementState;
  objective: ObjectiveState;
  
  // 游戏进度
  game: {
    week: number;
    season: number;
    phase: SeasonPhase;
  };
}
```

### 服务层设计

```typescript
// 统一的服务接口
interface PeripheralSystemService {
  // 初始化
  initialize(): void;
  
  // 处理时间推进
  onWeekAdvance(week: number): void;
  
  // 处理比赛结果
  onMatchResult(match: Match): void;
  
  // 处理玩家操作
  onPlayerAction(action: PlayerAction): void;
  
  // 获取状态
  getState(): any;
  
  // 重置
  reset(): void;
}
```

---

## 实现优先级

### 第一阶段：核心外围系统（高优先级）
1. **联赛统计系统** - 完善联赛数据深度
2. **成就系统** - 提供游戏目标
3. **赛季目标系统** - 明确游戏方向

### 第二阶段：互动系统（中优先级）
4. **媒体粉丝互动** - 增强沉浸感
5. **转会市场深化** - 完善交易机制

### 第三阶段：优化与整合（低优先级）
6. **UI/UX 统一化**
7. **性能优化**
8. **新手引导**

---

## 技术实现要点

### 1. 数据持久化

```typescript
// 确保所有新系统状态都被持久化
const persistConfig = {
  key: 'game-save',
  storage: localStorage,
  whitelist: [
    'club',
    'players',
    'league',
    'fanReputation',
    'media',
    'achievement',
    'objective',
    'transfer',
  ],
};
```

### 2. 性能优化

```typescript
// 使用计算属性缓存
const playerStats = computed(() => {
  // 缓存统计计算结果
  return memoizedCalculateStats();
});

// 分批处理大量数据
function processLargeData(data: any[]) {
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    processBatch(batch);
    // 避免阻塞 UI
    await nextTick();
  }
}
```

### 3. 错误处理

```typescript
// 统一的错误处理
function handleSystemError(error: Error, context: string) {
  console.error(`[${context}]`, error);
  
  // 记录到错误日志
  errorLogger.log(error, context);
  
  // 通知玩家（如果是严重错误）
  if (error.severity === 'critical') {
    showErrorNotification('系统错误，请重试或联系支持');
  }
}
```

---

## 测试策略

### 单元测试

```typescript
// 成就系统测试
describe('AchievementSystem', () => {
  it('should unlock achievement when condition is met', () => {
    const system = new AchievementSystem();
    system.incrementProgress('wins', 1);
    expect(system.isUnlocked('first_win')).toBe(true);
  });
  
  it('should grant rewards on completion', () => {
    const system = new AchievementSystem();
    const rewards = system.completeAchievement('championship');
    expect(rewards.funds).toBe(500);
  });
});
```

### 集成测试

```typescript
// 测试系统间交互
describe('System Integration', () => {
  it('should update objectives after match', async () => {
    const match = createMockMatch({ winner: playerClub });
    await matchService.finishMatch(match);
    
    expect(objectiveService.getProgress('wins')).toBe(1);
    expect(achievementService.getProgress('total_wins')).toBe(1);
  });
});
```

---

## 总结

Phase 6 外围系统的设计目标是：

1. **增强游戏深度** - 通过统计、成就、目标等系统增加游戏可玩性
2. **提升沉浸感** - 通过媒体互动、社交系统等让玩家感受俱乐部经营的压力和乐趣
3. **提供长期目标** - 通过成就和赛季目标系统，让玩家有持续的游戏动力
4. **完善游戏生态** - 所有系统相互关联，形成完整的电竞俱乐部模拟

这些系统与现有核心系统（比赛、选手、英雄、AI 俱乐部）深度整合，共同构建一个丰富、真实、有趣的 KPL 电竞俱乐部模拟游戏。
