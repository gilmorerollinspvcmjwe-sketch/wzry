# AI 系统集成 Spec

## Why

当前 AI 系统已实现完整的决策逻辑（训练、转会、战术），但**完全没有集成到游戏循环中**，导致 AI 俱乐部不会自主经营、联赛缺乏动态变化。需要在不增加新 UI 页面的前提下，将 AI 系统集成到现有系统中。

## What Changes

- **AI 周模拟集成**：在 `game.ts` 的 `onWeekPassed()` 中调用 AI 模拟
- **AI 初始化完善**：在 `initService.ts` 的 `newGame()` 中初始化 AI Profile
- **AI 转会竞价**：在玩家签约时添加 AI 竞价逻辑
- **AI 比赛模拟**：在后台模拟 AI 俱乐部之间的比赛
- **UI 集成**：在现有页面展示 AI 相关信息（联赛页面、转会页面、媒体页面）

## Impact

- **受影响的规范**：
  - 综合游戏系统设计 spec（Phase 5 AI 俱乐部与运营系统 - 深化）
  
- **受影响的代码**：
  - `src/stores/game.ts` - 添加 AI 周模拟调用
  - `src/core/services/initService.ts` - 完善 AI 初始化
  - `src/core/services/aiService.ts` - 集成到游戏循环
  - `src/stores/club.ts` - AI 转会竞价
  - `src/stores/leagueStatistics.ts` - AI 比赛结果更新
  - `src/views/league/index.vue` - 展示 AI 比赛结果
  - `src/views/transfer/index.vue` - AI 竞价展示

## ADDED Requirements

### Requirement: AI 周模拟集成

系统 SHALL 在每周结算时自动模拟所有 AI 俱乐部的经营行为。

#### Scenario: 周模拟触发
- **WHEN** 玩家点击"下一天"且触发周结算
- **THEN** 系统自动：
  - 遍历所有 AI 俱乐部（排除玩家俱乐部）
  - 调用 `AIService.simulateAIWeek()` 模拟每个 AI 俱乐部
  - 应用训练、转会、设施升级等决策
  - 更新选手数据和俱乐部状态

#### Scenario: AI 训练决策
- **WHEN** AI 俱乐部模拟训练
- **THEN** 根据 AI 策略：
  - 年轻选手（<22 岁）：高强度训练操作
  - 当打之年（22-26 岁）：中等强度训练团队
  - 老将（>26 岁）：低强度训练意识或休息
  - 体力<30：强制休息

#### Scenario: AI 转会决策
- **WHEN** AI 俱乐部模拟转会
- **THEN** 根据 AI 性格：
  - 评估位置需求（空缺/短板/老龄化）
  - 寻找自由选手
  - 计算性价比（价值/价格比）
  - 在预算内竞价（风险承受度决定预算占比）

### Requirement: AI 初始化完善

系统 SHALL 在新游戏开始时为每个 AI 俱乐部初始化 AI Profile。

#### Scenario: 新游戏初始化
- **WHEN** 玩家开始新游戏
- **THEN** 系统：
  - 生成 AI 俱乐部（已有）
  - 为每个 AI 俱乐部初始化 AI Profile
  - 随机分配 AI 性格模板（激进/平衡/保守/赌徒/开发者）
  - 设置 AI 策略倾向

#### Scenario: AI 性格模板
- **WHEN** 分配 AI 性格
- **THEN** 从以下模板选择：
  - `aggressive`：侵略性 80，耐心 30，风险 75，忠诚 40
  - `balanced`：各项 50-60
  - `conservative`：侵略性 30，耐心 70，风险 30，忠诚 80
  - `gambler`：侵略性 70，耐心 20，风险 90，忠诚 30
  - `developer`：侵略性 40，耐心 90，风险 40，忠诚 70

### Requirement: AI 转会竞价

系统 SHALL 在玩家签约选手时引入 AI 竞价机制。

#### Scenario: 玩家签约选手
- **WHEN** 玩家在转会市场点击"签约"选手
- **THEN** 系统：
  - 检查是否有 AI 俱乐部需要该位置
  - 计算 AI 竞价概率（基于 AI 侵略性）
  - 生成竞价对手（1-3 个 AI 俱乐部）
  - 显示竞价提示

#### Scenario: AI 竞价逻辑
- **WHEN** AI 参与竞价
- **THEN**：
  - 激进型 AI（侵略性>70）：必定竞价，加价 10-30%
  - 平衡型 AI（50-70）：50% 概率竞价，加价 5-15%
  - 保守型 AI（<50）：30% 概率竞价，不加价
  - 玩家最终决定权（可接受/拒绝 AI 竞价）

### Requirement: AI 比赛模拟

系统 SHALL 在后台模拟 AI 俱乐部之间的比赛。

#### Scenario: AI vs AI 比赛
- **WHEN** 赛程表中有 AI 俱乐部的比赛
- **THEN** 系统：
  - 获取双方俱乐部实力
  - 获取 AI 战术配置
  - 模拟比赛结果（基于实力 + 战术+ 随机性）
  - 更新联赛排名
  - 生成简要战报

#### Scenario: 比赛结果展示
- **WHEN** 玩家查看联赛页面
- **THEN** 在现有 UI 中：
  - 积分榜包含所有俱乐部（玩家+AI）
  - 赛程表显示 AI 比赛结果
  - 最近赛果包含 AI 比赛

### Requirement: UI 集成（无新页面）

系统 SHALL 在现有 UI 页面中展示 AI 相关信息。

#### Scenario: 联赛页面集成
- **WHEN** 玩家查看联赛页面
- **THEN** 在现有 `league/index.vue` 中：
  - 积分榜显示所有俱乐部（已有）
  - 赛程表显示 AI 比赛结果（新增）
  - 点击 AI 俱乐部可查看基本信息（新增）

#### Scenario: 转会页面集成
- **WHEN** 玩家在转会市场
- **THEN** 在现有 `transfer/index.vue` 中：
  - 显示 AI 竞价提示（新增）
  - 显示其他俱乐部需求（新增）
  - 竞价成功/失败通知（已有）

#### Scenario: 媒体页面集成
- **WHEN** 玩家查看媒体中心
- **THEN** 在现有 `media/index.vue` 中：
  - 新闻 feed 包含 AI 俱乐部新闻（新增）
  - AI 俱乐部转会官宣（新增）
  - AI 比赛相关新闻（新增）

## MODIFIED Requirements

### Requirement: 游戏周循环
**原需求**：周结算处理赞助商、粉丝声望、选手恢复

**修改后**：周结算处理赞助商、粉丝声望、选手恢复、**AI 俱乐部模拟**

```typescript
// 在 game.ts 的 onWeekPassed() 中：
onWeekPassed() {
  // 1. 赞助商结算（已有）
  // 2. 粉丝声望结算（已有）
  // 3. 媒体系统更新（已有）
  // 4. 选手恢复（已有）
  // 5. AI 俱乐部模拟（新增）
  this.simulateAIWeek();
  // 6. 生成周报（已有，增加 AI 相关内容）
}
```

### Requirement: 俱乐部初始化
**原需求**：生成 AI 俱乐部基础数据

**修改后**：生成 AI 俱乐部基础数据 + 初始化 AI Profile

```typescript
// 在 initService.ts 的 newGame() 中：
aiClubNames.forEach(name => {
  const club = clubStore.addAIClub(name);
  // 新增：初始化 AI Profile
  AIService.initAIClub(club.id, getRandomAITemplate());
});
```

## REMOVED Requirements

**无移除需求** - 所有修改均为增量集成，不破坏现有功能。

## Technical Notes

### 数据持久化
- AI Profile 当前存储在 `AIService.aiProfiles` (Map) 中
- **暂不持久化**（简化实现），每次游戏加载时重新初始化
- 未来可通过 Pinia store 实现持久化

### UI 复用策略
- **不创建新页面**
- 联赛页面：复用积分榜、赛程表组件
- 转会页面：复用选手卡片、签约流程
- 媒体页面：复用新闻列表组件

### 性能考虑
- AI 周模拟在后台异步执行
- 避免阻塞 UI 渲染
- 限制 AI 俱乐部数量（最多 16 个）

## Success Metrics

1. **AI 自主经营**：AI 俱乐部每周自动训练、引援
2. **联赛动态**：AI 比赛结果实时更新积分榜
3. **转会有竞争**：玩家签约时 30-50% 概率遇到 AI 竞价
4. **UI 一致性**：所有 AI 信息在现有页面展示，无新页面
5. **性能达标**：周结算延迟<500ms（包含 AI 模拟）
