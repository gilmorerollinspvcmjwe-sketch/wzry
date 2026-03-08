# 游戏玩法深度增强设计规范 (Gameplay Enhancement Design Spec)

## Why

基于对现有游戏系统的全面分析，发现以下核心问题：
1. **选手缺乏"灵魂"** - 个性化互动严重不足，玩家无法与选手建立情感连接
2. **战术系统过于简单** - BP缺乏深度，没有阵容搭配策略
3. **青训系统单薄** - 缺乏培养路径和青训联赛
4. **教练系统完全缺失** - 没有教练角色，这是电竞俱乐部最核心的职位之一
5. **经济系统过于简单** - 收入来源有限，缺乏商业玩法
6. **比赛观赏性不足** - 只有文字战报，缺乏视觉冲击力
7. **目标感与长期动力不足** - 玩家除了"赢比赛"没有其他明确目标
8. **AI对手缺乏个性** - AI俱乐部只是数据，没有个性
9. **可扩展玩法缺失** - 选手生涯故事、教练团队、主场系统、商业活动等

本规范旨在解决这些问题，深度增强游戏的可玩性和代入感。

## What Changes

### 核心系统增强
- **选手个性化系统**: 选手对话、关系网络、情绪系统、个人诉求
- **战术深度系统**: 阵容搭配策略、版本理解、临场指挥、战术风格
- **青训学院系统**: 青训教练、青训设施、青训联赛、租借系统
- **教练团队系统**: 主教练、助理教练、数据分析师、心理教练、体能教练
- **经济系统扩展**: 门票收入、周边商品、直播分成、投资系统
- **比赛可视化**: 小地图、经济曲线、数据面板、赛后分析
- **目标系统**: 赛季目标、长期目标、里程碑系统
- **AI个性系统**: AI俱乐部性格、转会偏好、战术偏好

### 扩展玩法
- **选手生涯故事系统**: 职业生涯故事线、故事节点、玩家选择影响
- **主场系统**: 主场建设、主场比赛、主场文化、主场商业
- **商业活动系统**: 选手代言、商业活动管理、风险平衡
- **选手关系网络**: 好友、宿敌、师徒关系，影响团队化学反应
- **转会窗口系统**: 夏季/冬季转会窗、竞价系统、谈判系统
- **版本适应系统**: 版本更新、适应期、版本研究
- **退役传承系统**: 退役决策、退役后发展、传承系统
- **联赛生态系统**: 多赛事体系、积分系统、资格系统
- **粉丝社区系统**: 粉丝分层、粉丝活动、危机公关

## Impact

- **受影响的规范**: 
  - comprehensive-game-system-design (扩展和深化)
  - 所有现有系统都需要与新设计集成
  
- **受影响的代码**:
  - `src/core/services/` - 新增/修改服务
  - `src/stores/` - 新增/修改状态管理
  - `src/views/` - 新增/修改页面
  - `src/types/` - 新增/修改类型定义
  - `src/components/` - 新增UI组件

## ADDED Requirements

---

# 第一部分：核心系统增强

---

## Requirement: 选手个性化系统

系统 SHALL 提供选手个性化互动功能，让选手具有"灵魂"。

### Scenario: 选手对话系统
- **WHEN** 玩家点击选手
- **THEN** 显示选手对话界面：
  - 根据选手性格生成不同对话风格
  - 勤奋型选手：主动询问训练计划
  - 懒散型选手：抱怨训练强度
  - 领袖型选手：关心团队状态
  - 独狼型选手：关注个人表现

### Scenario: 选手个人诉求
- **WHEN** 时间推进
- **THEN** 选手可能提出诉求：
  - **上场时间诉求**：替补选手希望更多出场机会
  - **薪资诉求**：表现好的选手希望加薪
  - **转会诉求**：不满的选手希望离队
  - **队友诉求**：希望引进某位好友
  - **设施诉求**：希望升级训练设施

### Scenario: 选手情绪系统
- **WHEN** 发生特定事件
- **THEN** 选手情绪变化：
  - **开心**：连胜、加薪、好友加盟 → 表现提升
  - **沮丧**：连败、被批评、好友离队 → 表现下降
  - **愤怒**：被降薪、被批评、不公平待遇 → 可能申请转会
  - **焦虑**：合同即将到期、表现不佳 → 影响比赛发挥

### Scenario: 选手关系网络
- **WHEN** 选手之间互动
- **THEN** 建立关系：
  - **好友关系**：一起训练、同位置竞争、老乡
  - **宿敌关系**：争夺首发、性格冲突
  - **师徒关系**：老将指导新人
  - **关系影响**：
    - 好友：配合加成 +5%，一人受伤另一人士气 -10
    - 宿敌：训练竞争加成 +3%，可能冲突
    - 师徒：新人成长加速 +20%

### 数据模型
```typescript
interface PlayerPersonalityEnhanced {
  // 对话风格
  dialogueStyle: {
    greeting: string[];        // 问候语库
    happy: string[];           // 开心时对话
    sad: string[];             // 沮丧时对话
    angry: string[];           // 愤怒时对话
    anxious: string[];         // 焦虑时对话
    trainingRequest: string[]; // 训练请求
    matchFeedback: string[];   // 比赛反馈
  };
  
  // 个人诉求
  currentDemands: PlayerDemand[];
  
  // 情绪状态
  emotion: {
    type: 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral';
    value: number;           // 情绪强度 0-100
    reason: string;          // 情绪原因
    duration: number;        // 持续天数
  };
  
  // 关系网络
  relationships: {
    playerId: string;
    type: 'friend' | 'rival' | 'mentor' | 'student';
    strength: number;        // 关系强度 0-100
    history: RelationshipEvent[];
  }[];
}

interface PlayerDemand {
  id: string;
  type: 'playing_time' | 'salary' | 'transfer' | 'teammate' | 'facility';
  urgency: 'low' | 'medium' | 'high';
  description: string;
  deadline: Date;
  satisfied: boolean;
  consequences: {
    satisfied: any;
    unsatisfied: any;
  };
}
```

---

## Requirement: 战术深度系统

系统 SHALL 提供深度的战术系统，让BP和比赛更有策略性。

### Scenario: 阵容搭配策略
- **WHEN** BP阶段
- **THEN** 玩家可以选择战术体系：
  - **四保一体系**：核心射手，四辅助保护，后期发力
  - **野核体系**：打野为核心，前期节奏快
  - **双边体系**：上单射手双核心，分推运营
  - **中野联动**：中单打野配合，游走支援
  - **全球流**：全图支援，快速转线

### Scenario: 版本理解系统
- **WHEN** 新版本发布
- **THEN**：
  - 版本强势英雄/阵容
  - 版本理解度影响BP质量
  - 数据分析师可加速版本理解
  - 某些教练对特定版本有加成

### Scenario: 临场指挥系统
- **WHEN** 比赛进行中
- **THEN** 教练可以：
  - **暂停指挥**：关键时刻叫暂停调整
  - **战术调整**：改变进攻/防守策略
  - **换人决策**：替补选手上场
  - **心态调整**：安抚紧张选手

### Scenario: 战术风格系统
- **WHEN** 设置战术风格
- **THEN** 影响比赛：
  - **进攻型**：前期激进，高风险高回报
  - **防守型**：稳健发育，后期发力
  - **运营型**：资源控制，经济碾压
  - **打架型**：频繁团战，节奏快

### 数据模型
```typescript
interface Tactics {
  // 阵容体系
  formation: 'four-protect-one' | 'jungle-core' | 'dual-carry' | 'mid-jungle' | 'global';
  
  // 战术风格
  style: 'aggressive' | 'defensive' | 'balanced' | 'teamfight' | 'split';
  
  // 节奏偏好
  pace: 'early-game' | 'mid-game' | 'late-game';
  
  // 核心选手
  corePlayer?: string;
  
  // BP策略
  bpStrategy: {
    banPriority: 'opponent-specialty' | 'meta-heroes' | 'protect-picks';
    pickPriority: 'signature-heroes' | 'meta-heroes' | 'counter-picks';
    firstPickStrategy: 'secure-core' | 'flexible' | 'counter-ready';
  };
  
  // 临场指挥
  inGameCommands: {
    type: 'pause' | 'tactical-adjust' | 'substitution' | 'morale-boost';
    timing: number;  // 比赛时间点
    effect: any;
  }[];
}

interface VersionUnderstanding {
  currentVersion: string;
  
  // 版本理解度
  understandingLevel: number;  // 0-100
  
  // 强势英雄认知
  metaHeroes: {
    heroId: string;
    perceivedTier: number;
    actualTier: number;
  }[];
  
  // 强势阵容认知
  metaCompositions: string[];
  
  // 理解加成
  bpBonus: number;
  draftBonus: number;
}
```

---

## Requirement: 青训学院系统

系统 SHALL 提供完整的青训培养体系。

### Scenario: 青训教练系统
- **WHEN** 聘请青训教练
- **THEN**：
  - **青训主管**：整体青训质量
  - **位置教练**：特定位置培养加成
  - **教练风格**：影响培养方向
  - **教练等级**：影响培养效果

### Scenario: 青训设施系统
- **WHEN** 升级青训设施
- **THEN**：
  - **训练场**：基础训练效果
  - **宿舍**：选手满意度
  - **康复中心**：伤病预防
  - **分析室**：战术理解培养
  - **设施等级**：1-10级，每级效果递增

### Scenario: 青训联赛系统
- **WHEN** 青训选手参赛
- **THEN**：
  - **青训联赛**：每周比赛获取经验
  - **比赛经验**：加速成长
  - **表现评估**：发现潜力选手
  - **升降级**：表现好的提拔，差的淘汰

### Scenario: 租借系统
- **WHEN** 青训选手需要锻炼
- **THEN**：
  - **租借到其他俱乐部**：获取比赛经验
  - **租借费用**：收入来源
  - **租借条款**：出场时间保证、召回条款
  - **租借评估**：定期获取表现报告

### 数据模型
```typescript
interface YouthAcademy {
  // 青训教练
  coaches: {
    head: YouthCoach;
    positionCoaches: {
      position: Position;
      coach: YouthCoach;
    }[];
  };
  
  // 青训设施
  facilities: {
    trainingGround: FacilityLevel;  // 训练场
    dormitory: FacilityLevel;       // 宿舍
    medicalCenter: FacilityLevel;   // 康复中心
    analysisRoom: FacilityLevel;    // 分析室
  };
  
  // 青训选手
  players: YouthPlayer[];
  
  // 青训联赛
  league: {
    division: number;
    standing: LeagueStanding;
    nextMatch: Match;
  };
  
  // 租借管理
  loans: {
    playerId: string;
    toClub: string;
    startDate: Date;
    endDate: Date;
    fee: number;
    clauses: LoanClause[];
    reports: LoanReport[];
  }[];
}

interface YouthCoach {
  id: string;
  name: string;
  specialty: Position | 'general';
  level: number;  // 1-5
  
  // 培养加成
  bonuses: {
    growthRate: number;
    potentialReveal: number;
    positionBonus: number;
  };
  
  // 教练风格
  style: 'technical' | 'physical' | 'tactical' | 'mental';
}
```

---

## Requirement: 教练团队系统

系统 SHALL 提供完整的教练团队管理功能。

### Scenario: 主教练系统
- **WHEN** 聘请主教练
- **THEN**：
  - **战术能力**：影响战术制定质量
  - **BP能力**：影响BP决策
  - **激励能力**：影响选手士气
  - **培养能力**：影响选手成长
  - **执教风格**：影响比赛风格

### Scenario: 助理教练系统
- **WHEN** 聘请助理教练
- **THEN**：
  - **位置专项教练**：特定位置训练加成
  - **战术执行教练**：战术训练效果
  - **替补教练**：替补选手培养

### Scenario: 数据分析师系统
- **WHEN** 聘请数据分析师
- **THEN**：
  - **对手分析**：提供对手弱点报告
  - **版本研究**：加速版本理解
  - **选手数据追踪**：发现选手问题
  - **战术建议**：提供BP建议

### Scenario: 心理教练系统
- **WHEN** 聘请心理教练
- **THEN**：
  - **心态调节**：缓解选手压力
  - **团队氛围**：改善团队关系
  - **关键时刻辅导**：重要比赛前心理建设

### Scenario: 体能教练系统
- **WHEN** 聘请体能教练
- **THEN**：
  - **体力管理**：优化训练强度
  - **伤病预防**：降低受伤风险
  - **恢复加速**：加快体力恢复

### Scenario: 教练互动系统
- **WHEN** 教练团队会议
- **THEN**：
  - **战术讨论**：制定比赛策略
  - **选手评估**：讨论选手状态
  - **训练计划**：制定训练安排
  - **教练冲突**：不同理念的碰撞

### 数据模型
```typescript
interface Coach {
  id: string;
  name: string;
  type: 'head' | 'assistant' | 'analyst' | 'psychological' | 'physical';
  
  // 基础能力
  abilities: {
    tactics: number;      // 战术能力
    drafting: number;     // BP能力
    motivation: number;   // 激励能力
    development: number;  // 培养能力
    analysis: number;     // 分析能力
  };
  
  // 执教风格
  style: 'aggressive' | 'defensive' | 'balanced' | 'development';
  
  // 专长
  specialties: {
    type: 'formation' | 'position' | 'hero' | 'version';
    value: string;
    bonus: number;
  }[];
  
  // 执教理念
  philosophy: string;
  
  // 合同
  contract: {
    salary: number;
    endDate: Date;
    buyoutClause: number;
  };
  
  // 执教历史
  history: {
    clubId: string;
    startDate: Date;
    endDate: Date;
    achievements: string[];
  }[];
}

interface CoachingStaff {
  headCoach: Coach;
  assistantCoaches: Coach[];
  analysts: Coach[];
  psychologicalCoach?: Coach;
  physicalCoach?: Coach;
  
  // 团队化学反应
  chemistry: number;  // 0-100
  
  // 团队会议
  meetings: {
    type: 'tactical' | 'player-evaluation' | 'training' | 'conflict';
    date: Date;
    participants: string[];
    outcome: string;
  }[];
}
```

---

## Requirement: 经济系统扩展

系统 SHALL 提供更丰富的经济玩法。

### Scenario: 门票收入系统
- **WHEN** 主场比赛日
- **THEN**：
  - **门票销售**：根据战绩、对手、重要性
  - **票价等级**：普通/VIP/包厢
  - **上座率**：受战绩和对手影响
  - **特殊活动**：主题日增加收入

### Scenario: 周边商品系统
- **WHEN** 运营周边商店
- **THEN**：
  - **商品类型**：队服、周边、纪念品
  - **明星效应**：明星选手周边销量高
  - **限定商品**：夺冠纪念版
  - **线上/线下**：不同渠道不同收入

### Scenario: 直播分成系统
- **WHEN** 比赛直播
- **THEN**：
  - **直播平台分成**：比赛直播收入
  - **选手直播**：选手个人直播收入分成
  - **订阅收入**：粉丝订阅分成

### Scenario: 投资系统
- **WHEN** 俱乐部估值提升
- **THEN**：
  - **俱乐部估值**：基于成绩、粉丝、品牌
  - **融资轮次**：天使轮/A轮/B轮
  - **投资人关系**：影响决策权
  - **股权稀释**：融资代价

### 数据模型
```typescript
interface ClubFinance {
  // 收入明细
  income: {
    sponsors: number;
    matchPrizes: number;
    tickets: {
      regular: number;
      vip: number;
      suite: number;
    };
    merchandise: {
      jersey: number;
      accessories: number;
      limited: number;
    };
    streaming: {
      match: number;
      player: number;
      subscription: number;
    };
    transfers: number;
    investments: number;
  };
  
  // 支出明细
  expenses: {
    salaries: {
      players: number;
      coaches: number;
      staff: number;
    };
    facilities: number;
    transfers: number;
    operations: number;
  };
  
  // 资产负债
  balance: {
    cash: number;
    assets: number;
    liabilities: number;
    equity: number;
  };
  
  // 估值
  valuation: {
    total: number;
    factors: {
      performance: number;
      fans: number;
      brand: number;
      players: number;
    };
  };
  
  // 投资历史
  investments: {
    round: 'angel' | 'A' | 'B' | 'C';
    amount: number;
    valuation: number;
    equitySold: number;
    investors: string[];
    date: Date;
  }[];
}
```

---

## Requirement: 比赛可视化系统

系统 SHALL 提供更直观的比赛展示。

### Scenario: 小地图实时显示
- **WHEN** 比赛进行
- **THEN**：
  - **选手位置**：实时显示5人位置
  - **资源状态**：暴君/主宰/塔状态
  - **关键事件标记**：团战/击杀/推塔

### Scenario: 经济曲线图
- **WHEN** 查看比赛数据
- **THEN**：
  - **双方经济曲线**：时间轴对比
  - **经济差距**：关键转折点
  - **资源价值**：暴君/主宰经济

### Scenario: 数据面板
- **WHEN** 比赛进行或结束后
- **THEN**：
  - **实时数据**：KDA/经济/伤害
  - **对比数据**：双方对比
  - **历史对比**：与历史比赛对比

### Scenario: 赛后分析
- **WHEN** 比赛结束
- **THEN**：
  - **热力图**：选手移动轨迹
  - **伤害分布**：伤害来源分析
  - **视野控制**：视野得分分布
  - **关键团战复盘**：重要时刻回放

### 数据模型
```typescript
interface MatchVisualization {
  // 小地图数据
  minimap: {
    timestamp: number;
    players: {
      id: string;
      position: { x: number; y: number };
      health: number;
      alive: boolean;
    }[];
    objectives: {
      type: 'dragon' | 'baron' | 'tower';
      position: { x: number; y: number };
      status: 'alive' | 'dead';
      team?: 'blue' | 'red';
    }[];
  }[];
  
  // 经济曲线
  goldCurve: {
    minute: number;
    blue: number;
    red: number;
    difference: number;
  }[];
  
  // 实时数据
  liveStats: {
    timestamp: number;
    players: PlayerLiveStats[];
    teams: TeamLiveStats[];
  }[];
  
  // 赛后分析
  postMatch: {
    heatmaps: {
      playerId: string;
      data: number[][];  // 热力图数据
    }[];
    damageBreakdown: {
      playerId: string;
      toHeroes: number;
      toTowers: number;
      toMinions: number;
    }[];
    visionControl: {
      playerId: string;
      wardsPlaced: number;
      wardsDestroyed: number;
      visionScore: number;
    }[];
    keyFights: {
      timestamp: number;
      participants: string[];
      result: 'blue-win' | 'red-win';
      impact: string;
    }[];
  };
}
```

---

## Requirement: 目标系统

系统 SHALL 提供明确的游戏目标。

### Scenario: 赛季目标
- **WHEN** 赛季开始
- **THEN**：
  - **联赛排名目标**：前X名
  - **培养目标**：培养出X名明星选手
  - **商业目标**：粉丝数/收入目标
  - **特殊目标**：连胜/零封

### Scenario: 长期目标
- **WHEN** 游戏进行
- **THEN**：
  - **建立王朝**：三连冠
  - **培养传奇选手**：MVP次数/冠军数
  - **打造顶级俱乐部**：声望/粉丝/收入

### Scenario: 里程碑系统
- **WHEN** 达成特定成就
- **THEN**：
  - **首胜纪念**：第一场比赛胜利
  - **百胜里程碑**：100场胜利
  - **周年庆典**：俱乐部成立周年
  - **特殊奖励**：资金/声望/解锁

### Scenario: 董事会期望
- **WHEN** 赛季进行
- **THEN**：
  - **期望目标**：董事会设定的目标
  - **耐心度**：未达标的容忍度
  - **评价时机**：定期评价
  - **后果**：奖金/解雇风险

### 数据模型
```typescript
interface SeasonObjective {
  id: string;
  season: number;
  
  // 主要目标
  primary: {
    type: 'ranking' | 'championship' | 'revenue' | 'fans';
    target: number;
    current: number;
    deadline: Date;
    reward: ObjectiveReward;
    penalty: ObjectivePenalty;
  };
  
  // 次要目标
  secondary: {
    type: 'win-streak' | 'player-development' | 'clean-sheets';
    target: number;
    current: number;
    reward: ObjectiveReward;
  }[];
  
  // 特殊目标
  special: {
    type: 'three-peat' | 'perfect-season' | 'legend-player';
    description: string;
    progress: number;
    reward: ObjectiveReward;
  }[];
}

interface BoardExpectation {
  // 期望目标
  expectations: {
    type: string;
    target: number;
    weight: number;  // 权重
  }[];
  
  // 耐心度
  patience: number;  // 0-100
  
  // 评价历史
  evaluations: {
    date: Date;
    score: number;  // S/A/B/C/D
    feedback: string;
    consequences: any;
  }[];
  
  // 解雇风险
  fireRisk: number;  // 0-100
}
```

---

## Requirement: AI个性系统

系统 SHALL 让AI俱乐部具有鲜明的个性。

### Scenario: AI俱乐部性格
- **WHEN** 生成AI俱乐部
- **THEN** 分配性格：
  - **土豪型**：疯狂买明星选手，高薪资
  - **青训工厂**：培养新星，低买高卖
  - **老牌豪门**：稳健经营，历史悠久
  - **新贵崛起**：大投入，快速崛起
  - **保级专业户**：低投入，勉强保级

### Scenario: AI转会偏好
- **WHEN** 转会期
- **THEN** AI根据性格决策：
  - **偏好年轻选手**：青训型俱乐部
  - **偏好明星选手**：土豪型俱乐部
  - **预算比例**：不同性格不同比例

### Scenario: AI战术偏好
- **WHEN** 比赛时
- **THEN** AI根据性格选择：
  - **Ban人优先级**：针对/版本/保护
  - **选人优先级**：绝活/版本/克制
  - **战术风格**：进攻/防守/运营

### Scenario: AI教练风格
- **WHEN** 训练时
- **THEN**：
  - **训练强度**：保守/平衡/激进
  - **轮换政策**：固定/灵活
  - **培养重点**：技术/战术/心理

### Scenario: AI故事系统
- **WHEN** 时间推进
- **THEN** AI俱乐部有"故事"：
  - **土豪俱乐部**：疯狂买人，可能破产
  - **青训工厂**：培养出明星选手，可能被挖角
  - **老牌豪门**：成绩稳定，偶尔低谷
  - **新贵崛起**：快速崛起，可能昙花一现

### 数据模型
```typescript
interface AIPersonality {
  clubId: string;
  
  // 俱乐部性格
  personality: 'big-spender' | 'youth-factory' | 'traditional' | 'rising-star' | 'survivor';
  
  // 转会偏好
  transferPreference: {
    preferYoung: boolean;
    preferStar: boolean;
    budgetRatio: number;
    maxSalary: number;
    patience: number;  // 谈判耐心
  };
  
  // 战术偏好
  tacticalPreference: {
    favoriteFormation: string;
    banPriority: ('opponent-specialty' | 'meta-heroes' | 'protect-picks')[];
    pickPriority: ('signature-heroes' | 'meta-heroes' | 'counter-picks')[];
    style: 'aggressive' | 'defensive' | 'balanced';
  };
  
  // 教练风格
  coachingStyle: {
    trainingIntensity: 'conservative' | 'balanced' | 'aggressive';
    rotationPolicy: 'fixed' | 'flexible';
    developmentFocus: ('technical' | 'tactical' | 'mental')[];
  };
  
  // 行为特征
  behaviors: {
    riskTolerance: number;     // 风险承受度
    spendingHabits: number;    // 消费习惯
    patience: number;          // 耐心度
    ambition: number;          // 野心
  };
  
  // 故事线
  storyline: {
    type: string;
    currentChapter: number;
    events: string[];
  };
}
```

---

# 第二部分：扩展玩法系统

---

## Requirement: 选手生涯故事系统

系统 SHALL 为每个选手提供独特的职业生涯故事线。

### Scenario: 故事线生成
- **WHEN** 生成新选手
- **THEN** 随机分配故事线类型：
  - **新人崛起**：青训营脱颖而出 → 首次登场 → 遭遇新秀墙 → 突破/沉沦
  - **老将暮年**：状态下滑 → 失去首发 → 转型/退役/坚持 → 告别赛
  - **王者归来**：巅峰 → 低谷 → 复出 → 重回巅峰
  - **转会风波**：与俱乐部矛盾 → 申请转会 → 新环境 → 证明自己
  - **争议事件**：负面新闻 → 舆论压力 → 澄清/承认 → 救赎

### Scenario: 故事节点触发
- **WHEN** 满足故事触发条件
- **THEN**：
  - 显示故事章节
  - 提供玩家选择
  - 每个选择有不同后果
  - 影响选手发展和剧情走向

### Scenario: 故事影响选手
- **WHEN** 故事发展
- **THEN**：
  - **属性变化**：突破瓶颈/状态下滑
  - **情绪变化**：开心/沮丧/愤怒
  - **关系变化**：与队友/教练关系
  - **职业轨迹**：续约/转会/退役

### 数据模型
```typescript
interface PlayerStoryline {
  playerId: string;
  
  // 故事类型
  type: 'rookie-rise' | 'veteran-twilight' | 'comeback' | 'transfer-saga' | 'controversy';
  
  // 当前章节
  currentChapter: number;
  
  // 章节列表
  chapters: {
    number: number;
    title: string;
    description: string;
    
    // 触发条件
    trigger: {
      type: 'age' | 'performance' | 'event' | 'time';
      condition: any;
    };
    
    // 玩家选择
    choices: {
      id: string;
      text: string;
      consequences: {
        attribute?: { [key: string]: number };
        emotion?: string;
        relationship?: { playerId: string; change: number };
        storyline?: string;  // 跳转到其他故事线
      };
    }[];
    
    // 已完成
    completed: boolean;
    selectedChoice?: string;
  }[];
  
  // 故事影响
  impact: {
    attributes: { [key: string]: number };
    morale: number;
    relationships: { [playerId: string]: number };
  };
}
```

---

## Requirement: 主场系统

系统 SHALL 提供主场建设和运营功能。

### Scenario: 主场建设
- **WHEN** 投资主场
- **THEN**：
  - **场馆规模**：小型(5000)→中型(15000)→大型(30000)→超大型(50000)
  - **设施升级**：观众席、VIP区、训练室、媒体中心
  - **主场氛围**：灯光、音响、应援区、大屏幕
  - **建设成本**：规模越大成本越高

### Scenario: 主场比赛
- **WHEN** 主场比赛日
- **THEN**：
  - **门票收入**：根据上座率和票价
  - **主场优势**：选手士气加成
  - **粉丝互动**：主场粉丝活动
  - **特殊活动**：主题日、纪念日活动

### Scenario: 主场文化
- **WHEN** 长期运营主场
- **THEN**：
  - **队歌**：专属队歌
  - **队服**：主场/客场队服
  - **吉祥物**：俱乐部吉祥物
  - **主场传统**：开赛仪式、粉丝互动环节
  - **主场连胜纪录**：激励选手

### Scenario: 主场商业
- **WHEN** 商业运营
- **THEN**：
  - **冠名权**：出售场馆冠名权
  - **场馆广告**：广告位出租
  - **周边商店**：主场周边销售
  - **餐饮服务**：比赛日餐饮收入

### 数据模型
```typescript
interface HomeVenue {
  id: string;
  name: string;
  
  // 场馆规模
  capacity: number;
  level: 'small' | 'medium' | 'large' | 'xlarge';
  
  // 设施
  facilities: {
    stands: FacilityLevel;      // 观众席
    vipArea: FacilityLevel;     // VIP区
    trainingRoom: FacilityLevel; // 训练室
    mediaCenter: FacilityLevel;  // 媒体中心
    lockerRoom: FacilityLevel;   // 更衣室
  };
  
  // 氛围
  atmosphere: {
    lighting: number;   // 灯光效果
    sound: number;      // 音响效果
    screen: number;     // 大屏幕
    fanZone: number;    // 应援区
  };
  
  // 文化
  culture: {
    anthem?: string;      // 队歌
    mascot?: string;      // 吉祥物
    traditions: string[]; // 传统
    winStreak: number;    // 主场连胜
  };
  
  // 商业
  commercial: {
    namingRights?: {
      sponsor: string;
      fee: number;
      endDate: Date;
    };
    advertisements: {
      position: string;
      sponsor: string;
      fee: number;
    }[];
    merchandiseShop: boolean;
    catering: boolean;
  };
  
  // 比赛日数据
  matchDay: {
    averageAttendance: number;
    ticketRevenue: number;
    fanSatisfaction: number;
  };
}
```

---

## Requirement: 商业活动系统

系统 SHALL 提供选手商业活动管理功能。

### Scenario: 选手代言
- **WHEN** 明星选手获得代言机会
- **THEN**：
  - **代言类型**：游戏外设、能量饮料、服装、电子产品
  - **代言收益**：一次性签约费 + 分成
  - **代言影响**：粉丝增长、声望提升
  - **代言风险**：训练时间减少、受伤风险

### Scenario: 商业活动管理
- **WHEN** 安排商业活动
- **THEN**：
  - **活动类型**：直播、粉丝见面会、商业拍摄、采访
  - **活动收益**：出场费
  - **活动影响**：体力消耗、训练时间损失
  - **活动风险**：争议风险、表现下滑

### Scenario: 商业平衡
- **WHEN** 选择商业活动
- **THEN**：
  - **高收益代言**：收入高但训练时间少
  - **低收益代言**：收入少但影响小
  - **拒绝代言**：专注训练但可能影响选手心情
  - **合理安排**：平衡商业与竞技

### Scenario: 商业争议
- **WHEN** 商业活动引发争议
- **THEN**：
  - **负面新闻**：代言产品问题
  - **粉丝不满**：过度商业化
  - **处理选择**：道歉/解约/澄清
  - **后果影响**：声望/粉丝/士气

### 数据模型
```typescript
interface CommercialActivity {
  id: string;
  playerId: string;
  
  // 活动类型
  type: 'endorsement' | 'streaming' | 'fan-meet' | 'photoshoot' | 'interview';
  
  // 基本信息
  title: string;
  brand?: string;
  
  // 收益
  income: {
    upfront: number;      // 签约费
    royalty?: number;     // 分成比例
    total: number;
  };
  
  // 影响
  impact: {
    fanGain: number;
    reputationGain: number;
    staminaCost: number;
    trainingLoss: number;  // 训练时间损失
    moraleEffect: number;
  };
  
  // 风险
  risks: {
    injuryRisk: number;
    controversyRisk: number;
    performanceDrop: number;
  };
  
  // 时间
  schedule: {
    startDate: Date;
    endDate?: Date;
    duration: number;  // 持续天数
  };
  
  // 状态
  status: 'offered' | 'accepted' | 'rejected' | 'completed' | 'controversy';
}

interface PlayerCommercialProfile {
  playerId: string;
  
  // 商业价值
  commercialValue: number;  // 0-100
  
  // 当前代言
  activeEndorsements: CommercialActivity[];
  
  // 历史代言
  pastEndorsements: CommercialActivity[];
  
  // 商业偏好
  preferences: {
    maxActivities: number;      // 最大同时活动数
    preferredTypes: string[];   // 偏好类型
    minIncome: number;          // 最低收入要求
  };
  
  // 商业声誉
  reputation: {
    professionalism: number;    // 专业度
    reliability: number;        // 可靠性
    fanAppeal: number;          // 粉丝吸引力
  };
}
```

---

## Requirement: 选手关系网络系统

系统 SHALL 提供选手之间的关系网络管理。

### Scenario: 关系建立
- **WHEN** 选手互动
- **THEN** 建立关系：
  - **好友**：一起训练、同位置、老乡、性格相投
  - **宿敌**：争夺首发、性格冲突、历史矛盾
  - **师徒**：老将指导新人、同位置传承
  - **关系强度**：0-100，随互动变化

### Scenario: 关系影响
- **WHEN** 关系存在
- **THEN**：
  - **好友影响**：
    - 配合加成 +5%
    - 一人受伤另一人士气 -10
    - 转会时可能要求打包
    - 训练时互相激励
  - **宿敌影响**：
    - 训练竞争加成 +3%
    - 可能发生冲突
    - 争夺首发位置
    - 影响团队氛围
  - **师徒影响**：
    - 新人成长加速 +20%
    - 老将获得满足感
    - 传承技术和经验

### Scenario: 关系事件
- **WHEN** 关系发展
- **THEN** 触发事件：
  - **好友事件**：一起吃饭、互相鼓励、庆祝生日
  - **宿敌事件**：训练冲突、公开发言、冷战
  - **师徒事件**：技术指导、心理辅导、职业建议

### Scenario: 关系管理
- **WHEN** 管理团队关系
- **THEN**：
  - **调解冲突**：处理宿敌关系
  - **促进友谊**：安排团队活动
  - **师徒配对**：指定师徒关系
  - **关系报告**：查看团队关系网络

### 数据模型
```typescript
interface PlayerRelationship {
  player1Id: string;
  player2Id: string;
  
  // 关系类型
  type: 'friend' | 'rival' | 'mentor' | 'student' | 'neutral' | 'hostile';
  
  // 关系强度
  strength: number;  // 0-100
  
  // 关系历史
  history: {
    date: Date;
    event: string;
    change: number;  // 强度变化
  }[];
  
  // 影响效果
  effects: {
    synergyBonus: number;      // 配合加成
    moraleEffect: number;      // 士气影响
    communicationBonus: number; // 沟通加成
    trainingBonus: number;     // 训练加成
  };
  
  // 互动频率
  interactionFrequency: number;  // 每周互动次数
  
  // 最近互动
  lastInteraction: Date;
}

interface TeamChemistry {
  // 团队化学反应
  overallChemistry: number;  // 0-100
  
  // 关系网络
  relationships: PlayerRelationship[];
  
  // 团队氛围
  atmosphere: 'harmonious' | 'neutral' | 'tense' | 'toxic';
  
  // 潜在冲突
  conflicts: {
    player1Id: string;
    player2Id: string;
    severity: 'low' | 'medium' | 'high';
    reason: string;
  }[];
  
  // 建议行动
  recommendations: {
    type: 'team-building' | 'mediation' | 'separation';
    description: string;
  }[];
}
```

---

## Requirement: 转会窗口系统

系统 SHALL 提供真实的转会窗口机制。

### Scenario: 夏季转会窗
- **WHEN** 6月-7月
- **THEN**：
  - **主要转会期**：大量选手可签约
  - **转会费折扣**：部分选手降价
  - **更多选择**：自由球员增多
  - **AI活跃**：AI俱乐部积极引援

### Scenario: 冬季转会窗
- **WHEN** 12月-1月
- **THEN**：
  - **小规模调整**：针对性补强
  - **转会费较高**：供需关系
  - **选手选择较少**：大部分已有合同
  - **紧急转会**：伤病情况下的特殊通道

### Scenario: 非转会期
- **WHEN** 转会窗关闭
- **THEN**：
  - **自由球员**：只能签约无合同选手
  - **违约金买断**：支付违约金强制转会
  - **租借交易**：短期租借选手
  - **等待转会窗**：提前谈判，窗口开启后完成

### Scenario: 竞价系统
- **WHEN** 多家俱乐部竞争同一选手
- **THEN**：
  - **公开竞价**：所有俱乐部可见当前最高价
  - **实时竞价**：倒计时内可加价
  - **秘密竞价**：一次性报价，卖家选择
  - **竞价规则**：最低加价幅度、截止时间

### Scenario: 谈判系统
- **WHEN** 与选手/俱乐部谈判
- **THEN**：
  - **多轮谈判**：初始报价 → 反报价 → 最终协议
  - **条件交换**：转会费 + 球员交换
  - **分期付款**：转会费分期支付
  - **附加条款**：出场次数奖金、夺冠奖金

### 数据模型
```typescript
interface TransferWindow {
  type: 'summer' | 'winter';
  year: number;
  
  // 时间范围
  startDate: Date;
  endDate: Date;
  
  // 状态
  status: 'upcoming' | 'open' | 'closed';
  
  // 活动统计
  statistics: {
    totalTransfers: number;
    totalFees: number;
    biggestTransfer: {
      playerId: string;
      fee: number;
      fromClub: string;
      toClub: string;
    };
  };
  
  // 特殊规则
  rules: {
    discountRate: number;      // 转会费折扣
    freeAgentBonus: number;    // 自由球员加成
    emergencyAllowed: boolean; // 紧急转会是否允许
  };
}

interface TransferBid {
  id: string;
  playerId: string;
  
  // 竞价类型
  type: 'open' | 'sealed';
  
  // 当前状态
  status: 'active' | 'accepted' | 'rejected' | 'withdrawn';
  
  // 报价列表
  bids: {
    clubId: string;
    amount: number;
    timestamp: Date;
    conditions?: TransferCondition[];
  }[];
  
  // 最高报价
  highestBid: {
    clubId: string;
    amount: number;
  };
  
  // 截止时间
  deadline: Date;
  
  // 选手意愿
  playerPreference: {
    [clubId: string]: number;  // 意愿值 0-100
  };
}

interface TransferNegotiation {
  id: string;
  playerId: string;
  buyingClubId: string;
  sellingClubId: string;
  
  // 谈判轮次
  rounds: {
    number: number;
    buyerOffer: {
      transferFee: number;
      playerExchange?: string;
      installments?: { amount: number; date: Date }[];
      clauses?: TransferClause[];
    };
    sellerResponse: {
      accepted: boolean;
      counterOffer?: any;
      reason?: string;
    };
  }[];
  
  // 当前状态
  status: 'negotiating' | 'agreed' | 'failed';
  
  // 最终协议
  agreement?: {
    transferFee: number;
    playerExchange?: string;
    installments?: { amount: number; date: Date }[];
    clauses?: TransferClause[];
  };
}
```

---

## Requirement: 版本适应系统

系统 SHALL 提供游戏版本更新和适应机制。

### Scenario: 版本更新
- **WHEN** 定期版本更新
- **THEN**：
  - **英雄调整**：Buff/Nerf/重做
  - **装备调整**：新装备/装备改动
  - **机制调整**：游戏机制变化
  - **版本号**：如 v3.52 → v3.53

### Scenario: 版本适应期
- **WHEN** 新版本发布
- **THEN**：
  - **适应期**：7-14天
  - **表现下滑**：适应期内表现可能下降
  - **数据分析师**：加速适应
  - **版本天赋**：某些选手对特定版本有加成

### Scenario: 版本研究
- **WHEN** 投入资源研究版本
- **THEN**：
  - **发现强势英雄**：版本OP英雄
  - **开发新战术**：新阵容体系
  - **抢占优势**：版本理解领先对手
  - **研究成本**：资金和时间投入

### Scenario: 版本影响
- **WHEN** 版本变化
- **THEN**：
  - **英雄强度变化**：T0变T3，T3变T0
  - **战术环境变化**：前期版本→后期版本
  - **选手影响**：绝活英雄被削/被加强
  - **BP策略调整**：Ban/Pick优先级变化

### 数据模型
```typescript
interface GameVersion {
  version: string;
  releaseDate: Date;
  
  // 英雄调整
  heroChanges: {
    heroId: string;
    changeType: 'buff' | 'nerf' | 'rework' | 'new';
    tierChange: number;  // 强度变化
    description: string;
  }[];
  
  // 装备调整
  itemChanges: {
    itemId: string;
    changeType: 'buff' | 'nerf' | 'rework' | 'new' | 'removed';
    description: string;
  }[];
  
  // 机制调整
  mechanicChanges: {
    type: string;
    description: string;
    impact: 'minor' | 'moderate' | 'major';
  }[];
  
  // 版本特点
  characteristics: {
    pace: 'faster' | 'slower' | 'same';
    meta: 'early-game' | 'mid-game' | 'late-game' | 'balanced';
    dominantRoles: Position[];
  };
}

interface VersionAdaptation {
  clubId: string;
  currentVersion: string;
  
  // 适应度
  adaptationLevel: number;  // 0-100
  
  // 强势英雄认知
  knownMetaHeroes: {
    heroId: string;
    perceivedTier: number;
    actualTier: number;
    discovered: boolean;
  }[];
  
  // 强势阵容认知
  knownCompositions: string[];
  
  // 研究投入
  researchInvestment: {
    funds: number;
    analystHours: number;
  };
  
  // 适应加成
  bonuses: {
    bpQuality: number;
    draftEfficiency: number;
    playerPerformance: number;
  };
}
```

---

## Requirement: 退役传承系统

系统 SHALL 提供选手退役和传承机制。

### Scenario: 退役决策
- **WHEN** 选手考虑退役
- **THEN**：
  - **主动退役**：选手自己决定
  - **劝退**：俱乐部建议退役
  - **强制退役**：年龄/伤病达到临界点
  - **退役条件**：年龄30+、状态过低、伤病严重

### Scenario: 退役仪式
- **WHEN** 选手退役
- **THEN**：
  - **告别赛**：最后一场比赛
  - **粉丝互动**：感谢粉丝
  - **俱乐部荣誉**：名人堂、退役号码
  - **媒体报道**：生涯回顾

### Scenario: 退役后发展
- **WHEN** 选手退役后
- **THEN** 选择发展路径：
  - **留队转型**：
    - 助理教练：培养新人
    - 数据分析师：战术分析
    - 青训教练：青训培养
    - 形象大使：俱乐部代言
  - **转会其他俱乐部**：
    - 继续选手生涯（低概率）
    - 转型教练
  - **完全退役**：
    - 直播生涯：成为主播
    - 解说生涯：成为解说
    - 其他行业：离开电竞

### Scenario: 传承系统
- **WHEN** 老将退役
- **THEN**：
  - **技术传承**：
    - 指定接班人
    - 属性加成传承（部分）
    - 英雄熟练度传承
  - **精神传承**：
    - 队长袖标传承
    - 俱乐部精神传承
    - 粉丝情感传承
  - **荣誉传承**：
    - 退役号码
    - 俱乐部名人堂
    - 传奇故事记录

### 数据模型
```typescript
interface Retirement {
  playerId: string;
  
  // 退役类型
  type: 'voluntary' | 'advised' | 'forced';
  
  // 退役原因
  reason: {
    primary: 'age' | 'injury' | 'performance' | 'personal';
    details: string;
  };
  
  // 退役仪式
  ceremony: {
    farewellMatch: boolean;
    fanEvent: boolean;
    hallOfFame: boolean;
    retiredNumber: boolean;
  };
  
  // 退役后发展
  postCareer: {
    path: 'stay-coach' | 'stay-analyst' | 'stay-youth-coach' | 'stay-ambassador' |
          'transfer-player' | 'transfer-coach' | 'streamer' | 'caster' | 'other';
    details: string;
  };
  
  // 传承
  legacy: {
    successor?: string;  // 接班人
    attributesTransferred?: { [key: string]: number };
    heroProficiencyTransferred?: { [heroId: string]: number };
    captaincyTransferred?: string;
    numberRetired?: number;
  };
}

interface ClubHallOfFame {
  // 名人堂成员
  members: {
    playerId: string;
    inductedDate: Date;
    achievements: string[];
    legacyNumber?: number;
    story: string;
  }[];
  
  // 退役号码
  retiredNumbers: number[];
  
  // 传奇故事
  legends: {
    title: string;
    playerId: string;
    story: string;
    season: number;
  }[];
}
```

---

## Requirement: 联赛生态系统

系统 SHALL 提供多赛事体系的联赛生态。

### Scenario: 常规联赛
- **WHEN** 联赛赛季
- **THEN**：
  - **KPL春季赛**：3-6月
  - **KPL夏季赛**：7-10月
  - **KPL秋季赛**：10-12月
  - **积分系统**：胜+3分，负+0分

### Scenario: 杯赛系统
- **WHEN** 杯赛期间
- **THEN**：
  - **冠军杯**：年度最高荣誉
  - **挑战者杯**：次级联赛队伍参与
  - **邀请赛**：邀请制赛事
  - **淘汰赛制**：单场淘汰

### Scenario: 国际赛事
- **WHEN** 国际赛事期间
- **THEN**：
  - **世界冠军杯**：全球顶级赛事
  - **亚洲邀请赛**：亚洲区赛事
  - **全明星赛**：明星选手表演赛
  - **资格系统**：联赛成绩决定资格

### Scenario: 次级联赛
- **WHEN** 次级联赛进行
- **THEN**：
  - **KGL**：发展联赛
  - **青训联赛**：青训选手比赛
  - **城市赛**：地方性赛事
  - **升降级**：与顶级联赛联动

### Scenario: 特殊赛事
- **WHEN** 特殊时期
- **THEN**：
  - **表演赛**：娱乐性质
  - **明星赛**：粉丝投票选人
  - **娱乐赛**：趣味规则

### Scenario: 积分系统
- **WHEN** 赛事进行
- **THEN**：
  - **联赛积分**：决定排名
  - **世界排名积分**：国际赛事资格
  - **历史积分**：俱乐部历史地位
  - **种子系统**：赛事种子排名

### 数据模型
```typescript
interface LeagueEcosystem {
  // 当前赛季
  currentSeason: {
    number: number;
    phase: 'spring' | 'summer' | 'autumn' | 'offseason';
  };
  
  // 联赛列表
  leagues: League[];
  
  // 杯赛列表
  cups: Cup[];
  
  // 国际赛事
  internationalEvents: InternationalEvent[];
  
  // 次级联赛
  developmentalLeagues: DevelopmentalLeague[];
}

interface League {
  id: string;
  name: string;
  type: 'kpl-spring' | 'kpl-summer' | 'kpl-autumn';
  
  // 赛程
  schedule: {
    startDate: Date;
    endDate: Date;
    matches: Match[];
  };
  
  // 积分榜
  standings: LeagueStanding[];
  
  // 季后赛
  playoffs?: {
    teams: string[];
    bracket: PlayoffBracket;
  };
  
  // 奖励
  prizes: {
    position: number;
    prize: number;
    qualification?: string;  // 资格
  }[];
}

interface Cup {
  id: string;
  name: string;
  type: 'champion-cup' | 'challenger-cup' | 'invitational';
  
  // 赛制
  format: 'single-elimination' | 'double-elimination' | 'group-knockout';
  
  // 参赛队伍
  participants: string[];
  
  // 对阵表
  bracket: PlayoffBracket;
  
  // 奖励
  prizes: {
    position: number;
    prize: number;
  }[];
}

interface InternationalEvent {
  id: string;
  name: string;
  type: 'world-championship' | 'asia-invitational' | 'all-star';
  
  // 资格系统
  qualification: {
    method: 'league-position' | 'regional-qualifier' | 'invitation';
    slots: number;
    regions: string[];
  };
  
  // 赛程
  schedule: {
    groupStage?: any;
    knockoutStage?: any;
  };
  
  // 奖励
  prizes: {
    position: number;
    prize: number;
    worldRankingPoints: number;
  }[];
}
```

---

## Requirement: 粉丝社区系统

系统 SHALL 提供深度的粉丝管理和互动功能。

### Scenario: 粉丝分层
- **WHEN** 管理粉丝群体
- **THEN**：
  - **核心粉丝**：最忠诚，影响力大，占比5%
  - **活跃粉丝**：经常互动，占比20%
  - **普通粉丝**：关注但不活跃，占比50%
  - **路人粉**：偶尔关注，占比25%

### Scenario: 粉丝活动
- **WHEN** 举办粉丝活动
- **THEN**：
  - **粉丝见面会**：线下互动
  - **训练营开放日**：观看训练
  - **线上互动活动**：直播互动
  - **慈善活动**：公益活动

### Scenario: 粉丝反馈
- **WHEN** 收集粉丝反馈
- **THEN**：
  - **战术建议**：粉丝建议
  - **选手评价**：选手人气
  - **运营建议**：俱乐部运营建议
  - **投诉与表扬**：服务反馈

### Scenario: 粉丝文化
- **WHEN** 培养粉丝文化
- **THEN**：
  - **粉丝应援**：应援口号、应援物
  - **粉丝创作**：同人作品、视频
  - **粉丝社群**：官方粉丝群
  - **粉丝代表**：核心粉丝代表

### Scenario: 危机公关
- **WHEN** 发生负面事件
- **THEN**：
  - **负面事件类型**：选手丑闻、战绩不佳、管理争议
  - **公关策略**：官方声明、选手道歉、媒体沟通、粉丝安抚
  - **舆论监控**：社交媒体监控、粉丝情绪分析
  - **危机预警**：提前发现问题

### 数据模型
```typescript
interface FanCommunity {
  // 粉丝分层
  segments: {
    core: number;      // 核心粉丝数
    active: number;    // 活跃粉丝数
    regular: number;   // 普通粉丝数
    casual: number;    // 路人粉数
  };
  
  // 粉丝活动
  activities: {
    type: 'fan-meet' | 'open-training' | 'online-event' | 'charity';
    date: Date;
    participants: number;
    satisfaction: number;
  }[];
  
  // 粉丝反馈
  feedback: {
    type: 'tactical' | 'player' | 'operational' | 'complaint' | 'praise';
    content: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    date: Date;
  }[];
  
  // 粉丝文化
  culture: {
    chants: string[];        // 应援口号
    merchandise: string[];   // 粉丝周边
    communityGroups: number; // 社群数量
    fanRepresentatives: string[];
  };
  
  // 舆论监控
  sentimentAnalysis: {
    overall: 'positive' | 'neutral' | 'negative';
    score: number;  // 0-100
    trendingTopics: string[];
    concerns: string[];
  };
}

interface CrisisManagement {
  // 危机事件
  crisis: {
    type: 'player-scandal' | 'poor-performance' | 'management-issue';
    severity: 'low' | 'medium' | 'high';
    description: string;
    date: Date;
  };
  
  // 公关策略
  strategy: {
    type: 'statement' | 'apology' | 'media-interview' | 'fan-event';
    content: string;
    executed: boolean;
    result?: string;
  };
  
  // 影响
  impact: {
    fanChange: number;
    sentimentChange: number;
    reputationChange: number;
  };
}
```

---

## MODIFIED Requirements

### Requirement: 选手详情页
**原设计**: 显示属性、英雄、数据三个标签页
**修改后**: 
- 增加对话标签页：与选手互动
- 增加关系标签页：查看选手关系网络
- 增加故事标签页：查看选手生涯故事线
- 增加商业标签页：管理选手商业活动

### Requirement: 比赛页面
**原设计**: 文字战报
**修改后**: 
- 增加小地图实时显示
- 增加经济曲线图
- 增加数据面板
- 增加赛后分析

### Requirement: 俱乐部管理页面
**原设计**: 基础设施管理
**修改后**: 
- 增加主场管理
- 增加教练团队管理
- 增加财务详情
- 增加粉丝社区管理

### Requirement: 转会市场页面
**原设计**: 简单的选手列表
**修改后**: 
- 增加转会窗口状态
- 增加竞价系统
- 增加谈判系统
- 增加球探服务

---

## Technical Architecture

### 新增服务层
```
src/core/services/
├── playerPersonalityService.ts   # 选手个性化服务
├── tacticsService.ts              # 战术系统服务
├── youthAcademyService.ts         # 青训学院服务
├── coachService.ts                # 教练团队服务
├── financeService.ts              # 财务管理服务
├── matchVisualizationService.ts   # 比赛可视化服务
├── objectiveService.ts            # 目标系统服务
├── aiPersonalityService.ts        # AI个性服务
├── storylineService.ts            # 故事线服务
├── homeVenueService.ts            # 主场系统服务
├── commercialService.ts           # 商业活动服务
├── relationshipService.ts         # 关系网络服务
├── transferWindowService.ts       # 转会窗口服务
├── versionService.ts              # 版本系统服务
├── retirementService.ts           # 退役传承服务
├── leagueEcosystemService.ts      # 联赛生态服务
└── fanCommunityService.ts         # 粉丝社区服务
```

### 新增状态层
```
src/stores/
├── playerPersonality.ts           # 选手个性化状态
├── tactics.ts                      # 战术状态
├── youthAcademy.ts                 # 青训状态
├── coach.ts                        # 教练状态
├── finance.ts                      # 财务状态
├── objective.ts                    # 目标状态
├── aiPersonality.ts                # AI个性状态
├── storyline.ts                    # 故事线状态
├── homeVenue.ts                    # 主场状态
├── commercial.ts                   # 商业活动状态
├── relationship.ts                 # 关系网络状态
├── transferWindow.ts               # 转会窗口状态
├── version.ts                      # 版本状态
├── retirement.ts                   # 退役状态
├── leagueEcosystem.ts              # 联赛生态状态
└── fanCommunity.ts                 # 粉丝社区状态
```

### 新增视图层
```
src/views/
├── player/
│   ├── dialogue.vue               # 选手对话
│   ├── relationships.vue          # 关系网络
│   ├── storyline.vue              # 生涯故事
│   └── commercial.vue             # 商业活动
├── tactics/
│   ├── index.vue                  # 战术中心
│   ├── formation.vue              # 阵容体系
│   └── bp.vue                     # BP策略
├── youth/
│   ├── index.vue                  # 青训学院
│   ├── coaches.vue                # 青训教练
│   ├── facilities.vue             # 青训设施
│   └── league.vue                 # 青训联赛
├── coach/
│   ├── index.vue                  # 教练团队
│   ├── hiring.vue                 # 聘请教练
│   └── meeting.vue                # 教练会议
├── venue/
│   ├── index.vue                  # 主场管理
│   ├── construction.vue           # 主场建设
│   └── commercial.vue             # 主场商业
├── finance/
│   ├── index.vue                  # 财务中心
│   ├── report.vue                 # 财务报表
│   └── investment.vue             # 投资管理
├── objective/
│   ├── index.vue                  # 目标中心
│   ├── season.vue                 # 赛季目标
│   └── milestones.vue             # 里程碑
└── community/
    ├── index.vue                  # 粉丝社区
    ├── activities.vue             # 粉丝活动
    └── crisis.vue                 # 危机公关
```

---

## Performance Requirements

- 选手对话生成：< 500ms
- 战术计算：< 1s
- 比赛可视化加载：< 2s
- 关系网络计算：< 1s
- 本地存储扩展：< 10MB（原5MB基础上增加）
- 内存占用：< 150MB（原100MB基础上增加）

---

## Implementation Priority

### 高优先级（核心体验提升）
1. 教练团队系统
2. 选手个性化系统
3. 战术深度系统
4. 目标系统

### 中优先级（玩法丰富）
5. 青训学院系统
6. 主场系统
7. 转会窗口系统
8. 版本适应系统

### 低优先级（锦上添花）
9. 选手生涯故事系统
10. 商业活动系统
11. 退役传承系统
12. 联赛生态系统
13. 粉丝社区系统
