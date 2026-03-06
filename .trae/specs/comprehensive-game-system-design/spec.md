# 综合游戏系统设计规范 (Comprehensive Game System Design Spec)

## Why

基于已有的简化版游戏玩法重设计，需要进一步扩展和深化各个系统，构建一个完整的**王者荣耀 KPL 电竞俱乐部模拟经营游戏**。

**重要定位**：
- 这是**电竞比赛模拟**（王者荣耀 KPL），不是传统体育（足球/篮球）
- 玩家扮演**电竞俱乐部经理**，管理王者荣耀职业战队
- 核心体验：BP 博弈→比赛模拟→选手养成→俱乐部运营
- 参考王者荣耀游戏内的结算界面和数据统计系统

当前系统已有基础框架，但缺少深度和可玩性，需要补充完整的比赛机制、选手养成、俱乐部运营等核心系统，并参考王者荣耀的游戏体验设计数据统计和展示系统。

## What Changes

- **比赛系统核心机制**: 实现基于俱乐部的竞赛系统，完整的 BP 流程，自动托管选项
- **随机事件系统**: 10 大类 50 个独特事件，影响俱乐部运营和比赛结果
- **比赛英雄系统**: 完整的英雄属性、熟练度、克制关系系统
- **选手养成系统**: 属性成长、技能专精、训练机制、伤病恢复、状态管理
- **俱乐部运营系统**: 财务管理、球探招募、青训学院、赞助商、设施升级
- **外围系统**: 媒体粉丝互动、联赛排名、转会市场、赛季目标、社区功能
- **集成需求**: 所有系统互联互通，保持一致的 UI/UX 设计语言

## Impact

- **受影响的规范**: 
  - 简化版游戏玩法重设计 spec (扩展和深化)
  - 所有现有系统都需要与新设计集成
  
- **受影响的代码**:
  - `src/core/services/` - 新增所有系统服务
  - `src/stores/` - 新增所有系统状态管理
  - `src/views/` - 新增所有系统页面
  - `src/types/` - 新增所有类型定义

## ADDED Requirements

### Requirement: 比赛系统核心机制

系统 SHALL 提供一个基于俱乐部的竞赛系统，玩家作为俱乐部经理而非实时比赛参与者。

#### Scenario: BP 流程
- **WHEN** 比赛开始前
- **THEN** 玩家可以：
  - 从阵容中选择上场选手
  - 为每个位置选择英雄
  - 选择自动托管 BP 环节
  - 查看详细的赛前分析

#### Scenario: 自动托管
- **WHEN** 玩家选择自动托管
- **THEN** 系统自动：
  - 选择状态最佳的选手
  - 根据熟练度选择英雄
  - 应用预设战术风格
  - 生成详细战报

#### Scenario: 比赛报告
- **WHEN** 比赛结束
- **THEN** 生成包含以下内容的战报：
  - 赛前分析（实力对比、关键对位）
  - 分阶段事件（前期/中期/后期）
  - 选手表现统计（KDA/评分/经济/伤害）
  - MVP 评选（金银牌、最佳选手）
  - 禁用/选用英雄展示
  - 经济曲线和资源控制统计

### Requirement: 随机事件系统

系统 SHALL 提供 10 大类 50 个独特的随机事件，每类至少 5 个事件。

#### Event Categories:
1. **选手相关** - 伤病、状态波动、合同纠纷
2. **俱乐部运营** - 资金问题、设施故障、员工变动
3. **比赛相关** - 裁判争议、设备故障、场地问题
4. **媒体舆论** - 负面新闻、粉丝抗议、媒体批评
5. **正面事件** - 荣誉表彰、商业合作、粉丝增长
6. **转会市场** - 意外报价、球员申请离队
7. **版本更新** - 英雄调整、战术变革
8. **青训系统** - 天才发现、青训成果
9. **赞助商** - 额外要求、合作机会
10. **特殊剧情** - 明星选手、传奇教练、俱乐部里程碑

#### Scenario: 事件触发
- **WHEN** 每天点击"下一天"
- **THEN** 系统：
  - 根据概率触发事件（基础概率 20%）
  - 显示事件描述和影响
  - 提供 2-4 个选择支
  - 每个选择有不同的后果

#### Scenario: 事件后果
- **WHEN** 玩家做出选择
- **THEN** 系统应用：
  - 即时影响（资金、声望、状态）
  - 长期影响（关系、解锁剧情）
  - 连锁反应（触发后续事件）

### Requirement: 比赛英雄系统

系统 SHALL 提供一个完整的英雄系统，与 KPL 特征对齐。

#### Scenario: 英雄属性
- **WHEN** 查看英雄详情
- **THEN** 显示：
  - 基础定位（坦克/战士/刺客/法师/射手/辅助）
  - 难度等级（1-3 星）
  - 强势期（前期/中期/后期/全程）
  - 版本强度（T0-T5）
  - 克制关系

#### Scenario: 英雄熟练度
- **WHEN** 选手使用英雄
- **THEN**：
  - 熟练度影响属性加成（0-15%）
  - 熟练度通过使用比赛提升
  - 设置熟练度等级（见习/熟练/精通/宗师/传说）

#### Scenario: 英雄获取
- **WHEN** 版本更新或活动
- **THEN**：
  - 新英雄自动解锁
  - 选手自动获得初始熟练度
  - 可通过训练提升熟练度

### Requirement: 选手生成系统

系统 SHALL 提供独立的选手生成系统，生成的选手具有唯一 ID 和完整的人生轨迹。

#### Scenario: 选手唯一性
- **WHEN** 生成新选手
- **THEN**：
  - 分配全局唯一 ID（格式：P_年份_序号，如 P_2024_001）
  - 该 ID 在整个存档周期内永久有效
  - 记录选手的完整生涯历史
  - 即使选手退役，ID 也不重复使用

#### Scenario: 选手基本信息
- **WHEN** 生成选手
- **THEN** 包含：
  - **性别**：男/女（比例可配置，默认 7:3）
  - **年龄**：16-28 岁（青训 16-18，主力 18-24，老将 24+）
  - **国籍**：中国/韩国/越南等（影响外援身份）
  - **身高/体重**：随机生成（符合电竞选手特征）

#### Scenario: 名字生成器
- **WHEN** 生成选手名字
- **THEN**：
  - **姓氏库**：50 个常见姓氏（王/李/张/刘/陈等）
  - **单字库**：50 个常用字（伟/芳/娜/敏/静等）
  - **双字库**：50 个常用组合（志强/秀英/建国等）
  - **性别区分**：男女各有一套字库
  - **生成规则**：
    - 70% 概率双字名（姓 + 双字）
    - 30% 概率单字名（姓 + 单字）
  - **ID 名生成**：随机生成游戏 ID（英文/中文/符号组合）

#### Scenario: 性格特质系统
- **WHEN** 生成选手
- **THEN** 随机分配性格特质：
  - **训练态度**：勤奋（+成长/-体力恢复）/懒散（-成长/+体力恢复）/自律（平衡）
  - **比赛风格**：激进（高风险高回报）/稳健（低失误低亮点）/灵活（适应性强）
  - **团队合作**：独狼（个人能力强/-团队）/团队型（+团队 buff）/领袖（+全队士气）
  - **抗压能力**：大心脏（关键局表现好）/玻璃心（逆风局表现差）/平常心（稳定）
  - **社交能力**：内向（-媒体互动）/外向（+粉丝增长）/领袖（+团队凝聚力）

#### Scenario: 特殊天赋系统
- **WHEN** 生成选手（低概率）
- **THEN** 可能拥有特殊天赋：
  - **天才少年**：18 岁以下潜力 +10
  - **大器晚成**：24 岁后仍有成长
  - **英雄海**：英雄池深度 +50%
  - **关键先生**：决胜局表现 +20%
  - **劳模**：体力消耗 -20%
  - **快速恢复**：体力恢复 +50%
  - **天生领袖**：担任队长时全队士气 +10%
  - **直播达人**：粉丝增长速度 +30%

#### Scenario: 生涯记录系统
- **WHEN** 选手参加比赛
- **THEN** 记录：
  - **比赛历史**：每场比赛的详细数据
  - **荣誉记录**：MVP/金银牌/冠军/亚军
  - **转会历史**：效力过的所有俱乐部
  - **成长轨迹**：属性变化曲线
  - **人际关系**：队友/教练/经理关系值

#### Scenario: 选手生命周期
- **WHEN** 时间推进
- **THEN**：
  - **成长期**（16-22 岁）：属性快速增长
  - **巅峰期**（22-26 岁）：属性稳定，经验丰富
  - **衰退期**（26 岁+）：属性缓慢下降
  - **退役**（30 岁+ 或状态过低）：进入名人堂或转教练
  - **退休后**：可能成为教练/解说/主播

### Requirement: 选手养成系统

系统 SHALL 提供详细的选手发展框架。

#### Scenario: 属性成长
- **WHEN** 选手训练或比赛
- **THEN**：
  - 5 大属性（操作/意识/团队/心态/体力）
  - 年龄影响成长速度（18-22 岁最快）
  - 潜力决定上限（60-95）
  - 突破机制（达到瓶颈后可突破）
  - 英雄池深度（熟练度英雄数量）
  - 个人荣誉（金银牌次数、MVP 次数）

#### Scenario: 技能专精
- **WHEN** 选手达到一定等级
- **THEN** 可选择：
  - 专精方向（进攻型/防守型/全能型）
  - 特殊技能（领导力/关键先生/新人王）
  - 英雄池扩展

#### Scenario: 伤病系统
- **WHEN** 选手连续比赛或高強度训练
- **THEN**：
  - 积累疲劳度
  - 疲劳过高导致伤病
  - 伤病需要时间恢复
  - 严重伤病影响属性

#### Scenario: 状态管理
- **WHEN** 每天/每场比赛
- **THEN**：
  - 状态值（0-100）影响表现
  - 连胜提升状态
  - 连败降低状态
  - 休息恢复状态

### Requirement: AI 俱乐部生成系统

系统 SHALL 提供独立的 AI 俱乐部生成系统，AI 俱乐部具备与玩家俱乐部大部分的数据内容用于真实模拟。

#### Scenario: AI 俱乐部唯一性
- **WHEN** 生成 AI 俱乐部
- **THEN**：
  - 分配全局唯一 ID（格式：C_序号，如 C_001）
  - 俱乐部名称（参考 KPL 真实战队名）
  - 俱乐部 ID 在整个存档周期内永久有效
  - 记录俱乐部的完整历史

#### Scenario: AI 俱乐部基础数据
- **WHEN** 生成 AI 俱乐部
- **THEN** 包含：
  - **基本信息**：名称/队标/成立时间/所在地
  - **主场场馆**：场馆名称/容量/设施等级
  - **粉丝基础**：初始粉丝数（1 万 -10 万随机）
  - **声望等级**：初始声望（30-80 随机）
  - **资金状况**：初始资金（500-2000 万随机）
  - **赞助商**：初始赞助商合同（0-2 个）

#### Scenario: AI 俱乐部运营数据
- **WHEN** AI 俱乐部运营
- **THEN** 维护：
  - **阵容名单**：主力 + 替补 + 青训（与玩家俱乐部相同结构）
  - **财务状况**：收入/支出/资产负债
  - **教练团队**：主教练/助教/数据分析师
  - **设施等级**：训练/医疗/分析/青训设施
  - **合同管理**：选手/教练/员工合同

#### Scenario: AI 俱乐部决策系统
- **WHEN** 转会期/休赛期
- **THEN** AI 俱乐部自主决策：
  - **引援**：根据自身需求和财力签约选手
  - **出售**：挂牌不需要的选手
  - **续约**：合同到期的选手决定是否续约
  - **青训**：投资青训设施和挖掘新人
  - **设施升级**：根据财力升级设施
  - **赞助商**：寻找和签约赞助商

#### Scenario: AI 俱乐部性格系统
- **WHEN** 生成 AI 俱乐部
- **THEN** 分配经营风格：
  - **氪金型**：高投入高回报，喜欢买明星选手
  - **青训型**：注重青训培养，低买高卖
  - **稳健型**：收支平衡，不冒进
  - **赌徒型**：孤注一掷，要么夺冠要么破产
  - **养老型**：低投入，维持现状

#### Scenario: AI 俱乐部生命周期
- **WHEN** 时间推进
- **THEN**：
  - **成绩波动**：根据投入和运气，成绩有起伏
  - **财务变化**：可能盈利/亏损/破产
  - **人员流动**：选手/教练正常流动
  - **设施老化**：设施需要维护升级
  - **破产重组**：资金为 0 时可能破产（低概率）

### Requirement: 俱乐部运营系统

系统 SHALL 提供精简但有深度的俱乐部管理系统。

#### Scenario: 财务管理
- **WHEN** 每周一结算
- **THEN**：
  - 收入项（赞助商/粉丝/比赛奖励/转会）
  - 支出项（薪资/设施/青训/球探）
  - 资金不足警告
  - 贷款选项（高利息）

#### Scenario: 球探招募
- **WHEN** 转会期
- **THEN**：
  - 球探报告（3-5 名推荐选手）
  - 隐藏属性探测（潜力/性格）
  - 谈判系统（薪资/合同年限/违约金）
  - 竞价系统（AI 俱乐部参与）

#### Scenario: 青训学院
- **WHEN** 投资青训
- **THEN**：
  - 青训设施等级（1-5 级）
  - 每周生成青训选手
  - 青训选手潜力随机（60-85）
  - 可提拔到一线队

#### Scenario: 赞助商系统
- **WHEN** 赞助商合同期间
- **THEN**：
  - 周薪支付
  - 要求检查（排名/胜率/粉丝）
  - 满意度系统
  - 续约/终止选项

#### Scenario: 设施升级
- **WHEN** 资金充足
- **THEN** 可升级：
  - 训练设施（提升训练效果）
  - 医疗中心（加速恢复）
  - 数据分析室（提升 BP 质量）
  - 青训营（提升青训质量）

### Requirement: 外围系统

系统 SHALL 提供支持系统增强核心游戏体验。

#### Scenario: 媒体粉丝互动
- **WHEN** 比赛后或重大事件
- **THEN**：
  - 媒体评价（正面/负面）
  - 粉丝情绪波动
  - 社交媒体热度
  - 采访选项（影响声望）

#### Scenario: 联赛排名
- **WHEN** 每轮比赛后
- **THEN** 更新：
  - 积分榜（胜/负/净胜分）
  - 排名变化
  - 季后赛资格
  - 降级风险
  - 选手个人数据排名（KDA/场均击杀等）

#### Scenario: 转会市场
- **WHEN** 转会期开放
- **THEN**：
  - 自由球员列表
  - 其他俱乐部报价
  - 球员申请离队
  - 紧急转会（伤病情况下）

#### Scenario: 赛季目标
- **WHEN** 赛季开始
- **THEN**：
  - 董事会目标（排名/成绩）
  - 个人成就（最佳教练/经理人）
  - 奖励（资金/声望）
  - 未达标后果（下课风险）

### Requirement: 集成需求

系统 SHALL 确保所有新系统与现有功能互联。

#### Scenario: 数据一致性
- **WHEN** 保存/加载游戏
- **THEN**：
  - 所有系统状态完整保存
  - 日期/时间连续
  - 关系网络保持
  - 未完成事件记录

#### Scenario: UI/UX一致性
- **WHEN** 访问任何页面
- **THEN**：
  - 统一的设计语言（颜色/字体/间距）
  - 一致的交互模式
  - 响应式布局
  - 加载状态提示

#### Scenario: 跨系统依赖
- **WHEN** 系统间交互
- **THEN**：
  - 比赛结果影响粉丝/赞助商
  - 选手状态影响比赛表现
  - 设施质量影响训练效果
  - 声望影响转会/赞助

## MODIFIED Requirements

### Requirement: 游戏核心循环
**原设计**: 点击下一天推进游戏
**修改后**: 点击下一天推进游戏 + 自动处理日常事务 + 智能提醒重要事项

### Requirement: 比赛进行方式
**原设计**: 手动开始每场比赛
**修改后**: 可选择自动进行或手动 BP，重要比赛可手动控制

### Requirement: 训练系统
**原设计**: 手动训练每个选手的每个属性
**修改后**: 设置训练策略后自动训练，可手动干预重点培养

## REMOVED Requirements

### Requirement: 实时比赛操作
**Reason**: 游戏定位为模拟经营而非 MOBA 游戏
**Migration**: 专注于 BP 和战术选择，比赛过程通过战报展示

### Requirement: 多线操作
**Reason**: 与"轻松放置"的核心理念冲突
**Migration**: 自动化日常事务，玩家专注于战略决策

## Technical Architecture

### 服务层 (Services)
```
src/core/services/
├── matchService.ts          # 比赛模拟服务
├── bpService.ts             # BP 流程服务
├── eventSystem.ts           # 随机事件系统
├── heroSystemService.ts     # 英雄系统服务
├── playerDevelopment.ts     # 选手养成服务
├── clubManagement.ts        # 俱乐部运营服务
├── mediaFanSystem.ts        # 媒体粉丝系统
├── transferMarket.ts        # 转会市场服务
└── achievementSystem.ts     # 成就系统服务
```

### 状态层 (Stores)
```
src/stores/
├── match.ts                 # 比赛状态
├── bp.ts                    # BP 状态
├── events.ts                # 事件状态
├── hero.ts                  # 英雄状态
├── playerDev.ts             # 选手养成状态
├── club.ts                  # 俱乐部状态
├── media.ts                 # 媒体状态
├── transfer.ts              # 转会状态
└── achievement.ts           # 成就状态
```

### 视图层 (Views)
```
src/views/
├── match/
│   ├── index.vue           # 比赛列表
│   ├── bp.vue              # BP 页面
│   └── report.vue          # 战报页面
├── training/
│   ├── index.vue           # 训练中心
│   └── details.vue         # 训练详情
├── club/
│   ├── management.vue      # 俱乐部管理
│   ├── facilities.vue      # 设施管理
│   └── finance.vue         # 财务详情
├── transfer/
│   ├── market.vue          # 转会市场
│   └── negotiation.vue     # 谈判页面
└── events/
    ├── timeline.vue        # 事件时间线
    └── archive.vue         # 事件档案
```

## KPL 特色系统

### 王者荣耀游戏机制

#### 游戏目标
- 摧毁敌方水晶获胜
- 平均游戏时长：10-20 分钟
- 5v5 MOBA 对战

#### 资源系统
- **金币**：购买装备，影响英雄强度曲线
- **经验**：提升英雄等级（1-15 级）
- **野区资源**：红蓝 Buff、暴君、主宰

#### 地图机制
- **暴君**：击杀后获得金币/经验/Buff
- **主宰**：击杀后召唤主宰先锋
- **防御塔**：保护水晶，提供视野
- **草丛**：提供隐身效果

#### 胜利条件
- 摧毁敌方水晶
- 敌方投降
- 时间到后比较经济/推塔数（特定模式）

### 数据统计系统（参考王者荣耀）

#### 选手个人数据
- **KDA**：击杀/死亡/助攻
- **评分**：1-16 分综合评分
- **经济**：总金币获取
- **伤害**：对英雄/建筑/野怪伤害
- **承伤**：承受伤害
- **视野**：视野得分
- **补刀**：小兵和野怪击杀数

#### 荣誉系统
- **MVP**：全场最佳（败方也可获得）
- **金牌**：表现优异（前 25%）
- **银牌**：表现良好（前 50%）
- **铜牌**：表现合格

#### 段位系统
- 倔强青铜 → 秩序白银 → 荣耀黄金 → 尊贵铂金 → 永恒钻石 → 至尊星耀 → 最强王者 → 传奇王者
- 每个段位有小段（I-IV 或 1-5）
- 星星累积升段

## Data Models

### 核心数据模型
```typescript
interface Match {
  id: string;
  homeTeam: Club;
  awayTeam: Club;
  scheduledDate: Date;
  status: 'scheduled' | 'bp' | 'in_progress' | 'finished';
  bpData: BPData;
  report: BattleReport;
  isAuto: boolean;
  gameDuration: number; // 游戏时长（分钟）
  winner: 'home' | 'away';
  score: {
    home: number;
    away: number;
  };
}

interface BPData {
  homeTeam: {
    players: Player[];
    heroes: Hero[];
    bans: string[]; // hero IDs
  };
  awayTeam: {
    players: Player[];
    heroes: Hero[];
    bans: string[];
  };
  blueSide: 'home' | 'away';
}

interface PlayerMatchStats {
  playerId: string;
  heroId: string;
  kills: number;
  deaths: number;
  assists: number;
  goldEarned: number;
  damageDealt: number;
  damageTaken: number;
  visionScore: number;
  cs: number; // 补刀数
  kda: number;
  score: number; // 1-16 分
  medals: ('gold' | 'silver' | 'mvp')[]; // 金银牌、MVP
  items: string[]; // 装备 ID 列表
  summonerSpells: string[]; // 召唤师技能
  level: number;
}

interface TeamMatchStats {
  teamId: string;
  totalKills: number;
  totalGold: number;
  totalDamage: number;
  towers: number;
  dragons: number;
  barons: number;
  firstBlood: boolean;
  firstTower: boolean;
  firstDragon: boolean;
}

interface BattleReport {
  matchId: string;
  duration: number;
  winner: 'home' | 'away';
  blueSide: 'home' | 'away';
  bans: {
    blue: string[];
    red: string[];
  };
  picks: {
    blue: { playerId: string; heroId: string }[];
    red: { playerId: string; heroId: string }[];
  };
  playerStats: PlayerMatchStats[];
  teamStats: {
    blue: TeamMatchStats;
    red: TeamMatchStats;
  };
  timeline: MatchEvent[];
  mvp: string; // playerId
  goldCurve: { minute: number; blue: number; red: number }[];
}

interface GameEvent {
  id: string;
  category: EventCategory;
  title: string;
  description: string;
  choices: EventChoice[];
  triggered: boolean;
  consequences: EventConsequence;
}

interface Player {
  id: string;               // 全局唯一 ID（P_年份_序号）
  name: string;             // 真实姓名
  gameId: string;           // 游戏 ID（ID 名）
  gender: 'male' | 'female';
  age: number;
  nationality: string;
  height: number;           // cm
  weight: number;           // kg
  position: Position;
  attributes: {
    mechanics: number;      // 操作
    awareness: number;      // 意识
    teamwork: number;       // 团队
    mentality: number;      // 心态
    stamina: number;        // 体力
  };
  potential: number;        // 潜力 60-95
  personality: {
    trainingAttitude: 'diligent' | 'lazy' | 'self-disciplined';
    playStyle: 'aggressive' | 'stable' | 'flexible';
    teamwork: 'lone-wolf' | 'team-player' | 'leader';
    pressureResistance: 'clutch' | 'fragile' | 'normal';
    socialSkill: 'introverted' | 'extroverted' | 'charismatic';
  };
  talents: string[];        // 特殊天赋列表
  contract: {
    clubId: string;
    salary: number;
    endDate: Date;
    releaseClause?: number;
  };
  careerHistory: {
    matches: MatchRecord[];
    honors: Honor[];
    clubs: ClubHistory[];
    growthCurve: GrowthRecord[];
    relationships: Relationship[];
  };
}

interface PlayerDevelopment {
  attributes: {
    mechanics: number;      // 操作
    awareness: number;      // 意识
    teamwork: number;       // 团队
    mentality: number;      // 心态
    stamina: number;        // 体力
  };
  specialization?: 'offense' | 'defense' | 'allround';
  skills: string[];
  injury?: Injury;
  form: number;             // 状态 0-100
  morale: number;           // 士气 0-100
  // 个人历史数据
  careerStats: {
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
    mvpCount: number;
    goldMedals: number;
    silverMedals: number;
    averageKDA: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    favoriteHeroes: string[]; // 常用英雄 ID
  };
  // 段位和荣誉
  rank?: {
    tier: number;           // 段位等级
    stars: number;          // 星星数量
    rankName: string;       // 段位名称（如至尊星耀 II）
  };
}

interface ClubFacility {
  type: 'training' | 'medical' | 'analysis' | 'academy';
  level: number;            // 1-5
  capacity: number;
  efficiency: number;
  upgradeCost: number;
}

interface AIClub {
  id: string;               // 全局唯一 ID（C_序号）
  name: string;             // 俱乐部名称
  logo: string;             // 队标
  foundedYear: number;      // 成立年份
  location: string;         // 所在地
  homeVenue: {
    name: string;
    capacity: number;
    facilityLevel: number;
  };
  fans: number;             // 粉丝数
  reputation: number;       // 声望 0-100
  funds: number;            // 资金（万）
  sponsors: SponsorContract[];
  roster: Player[];         // 阵容名单
  coachingStaff: {
    headCoach: Coach;
    assistantCoaches: Coach[];
    analysts: Analyst[];
  };
  facilities: {
    training: ClubFacility;
    medical: ClubFacility;
    analysis: ClubFacility;
    academy: ClubFacility;
  };
  managementStyle: 'big-spender' | 'youth-focused' | 'stable' | 'gambler' | 'low-profile';
  history: {
    seasons: SeasonRecord[];
    transfers: TransferRecord[];
    honors: Honor[];
    financialHistory: FinancialRecord[];
  };
  aiDecisionMaking: {
    transferBudget: number;
    salaryBudget: number;
    priority: 'championship' | 'profit' | 'survival';
    riskTolerance: number;  // 0-100
  };
}
```

## Performance Requirements

- 比赛模拟：< 2 秒完成
- 事件触发：每日加载时间 < 1 秒
- 数据存储：本地存储 < 5MB
- 内存占用：< 100MB

## Security Requirements

- 存档数据验证
- 防止作弊修改
- 敏感操作确认（解约/交易）

## Accessibility Requirements

- 色盲友好配色
- 字体大小可调
- 关键信息多感官提示
