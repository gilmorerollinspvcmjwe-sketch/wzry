# AI 系统增强 Spec

## Why

AI 系统核心功能已完成，但存在 4 个改进机会：
1. **AI 数据持久化** - 当前 AI Profile 存储在 Map 中，刷新页面后丢失
2. **UI 信息展示不足** - 玩家看不到 AI 俱乐部的经营风格
3. **AI 新闻系统缺失** - AI 行为没有实时新闻推送，沉浸感不足
4. **AI 难度单一** - 所有 AI 使用相同逻辑，缺乏难度分级

本 Spec 将详细设计这 4 个增强功能，在不破坏现有功能的前提下提升用户体验。

## What Changes

- **AI 数据持久化**：创建 `useAIStore` Pinia store，实现 AI Profile 持久化
- **UI 增强**：在联赛页面积分榜添加 AI 经营风格标签
- **AI 新闻系统**：实现 AI 新闻生成器，自动推送 AI 行为新闻
- **AI 难度分级**：根据游戏难度调整 AI 决策能力和预算

## Impact

- **受影响的规范**：
  - AI 系统集成 spec（增强功能）
  
- **受影响的代码**：
  - `src/stores/ai.ts` - 新建 Pinia store
  - `src/core/services/aiService.ts` - 集成到 store
  - `src/views/league/index.vue` - 添加经营风格标签
  - `src/core/services/mediaRelationsSystem.ts` - AI 新闻生成
  - `src/stores/game.ts` - 难度分级支持

## ADDED Requirements

### Requirement: AI 数据持久化

系统 SHALL 提供 AI Profile 的持久化存储，刷新页面后自动恢复。

#### Scenario: 新游戏初始化
- **WHEN** 玩家开始新游戏
- **THEN** 系统：
  - 为每个 AI 俱乐部创建 AI Profile
  - 保存到 Pinia store
  - 自动持久化到 localStorage

#### Scenario: 游戏加载
- **WHEN** 玩家加载存档
- **THEN** 系统：
  - 从 localStorage 读取 AI Profile
  - 恢复到 AIService
  - 验证数据完整性

#### Scenario: 游戏保存
- **WHEN** 玩家保存游戏
- **THEN** 系统：
  - AI Profile 自动包含在存档中
  - 无需额外操作

### Requirement: UI 增强 - AI 经营风格标签

系统 SHALL 在联赛页面积分榜显示 AI 俱乐部的经营风格。

#### Scenario: 积分榜展示
- **WHEN** 玩家查看联赛积分榜
- **THEN** 每个 AI 俱乐部显示：
  - 俱乐部名称
  - 经营风格标签（氪金/青训/稳健/赌徒/养老）
  - 不同风格不同颜色

#### Scenario: 标签设计
- **WHEN** 显示经营风格标签
- **THEN** 使用以下视觉设计：
  - 氪金型（big-spender）：金色背景，💰 图标
  - 青训型（youth-focused）：绿色背景，🌱 图标
  - 稳健型（stable）：蓝色背景，⚖️ 图标
  - 赌徒型（gambler）：红色背景，🎲 图标
  - 养老型（low-profile）：灰色背景，🏖️ 图标

### Requirement: AI 新闻系统

系统 SHALL 根据 AI 俱乐部行为自动生成新闻。

#### Scenario: AI 转会新闻
- **WHEN** AI 俱乐部签约选手
- **THEN** 生成新闻：
  - 标题："{AI 俱乐部} 成功签约 {选手}！"
  - 内容：包含选手信息、转会费、俱乐部声明
  - 情感：正面（成功引援）
  - 影响：粉丝 +50，声望 +0.5

#### Scenario: AI 比赛新闻
- **WHEN** AI 俱乐部赢得重要比赛
- **THEN** 生成新闻：
  - 标题："{AI 俱乐部} 豪取 {n} 连胜！"
  - 内容：比赛亮点、选手表现
  - 情感：正面
  - 影响：粉丝 +30，声望 +0.3

#### Scenario: AI 经营新闻
- **WHEN** AI 俱乐部升级设施
- **THEN** 生成新闻：
  - 标题："{AI 俱乐部} 投资 {金额} 万升级训练设施"
  - 内容：设施详情、预期效果
  - 情感：中性
  - 影响：声望 +0.2

#### Scenario: AI 负面新闻
- **WHEN** AI 俱乐部连败或财政危机
- **THEN** 生成新闻：
  - 标题："{AI 俱乐部} 遭遇连败，教练面临下课危机"
  - 内容：问题分析、可能的解决方案
  - 情感：负面
  - 影响：粉丝 -30，声望 -0.3

### Requirement: AI 难度分级

系统 SHALL 根据游戏难度调整 AI 决策能力。

#### Scenario: 简单难度
- **WHEN** 玩家选择"简单"难度
- **THEN** AI 俱乐部：
  - 预算减少 30%（资金 0.7 倍）
  - 决策准确率降低（70% 正常水平）
  - 转会竞价概率降低（50% 正常概率）
  - 训练效果降低（0.8 倍增益）
  - 比赛战术选择单一（更多失误）

#### Scenario: 普通难度
- **WHEN** 玩家选择"普通"难度
- **THEN** AI 俱乐部：
  - 预算正常（100%）
  - 决策准确率正常（100%）
  - 转会竞价概率正常（100%）
  - 训练效果正常（1.0 倍）
  - 比赛战术选择标准

#### Scenario: 困难难度
- **WHEN** 玩家选择"困难"难度
- **THEN** AI 俱乐部：
  - 预算增加 30%（资金 1.3 倍）
  - 决策准确率提高（120% 正常水平）
  - 转会竞价概率提高（150% 正常概率）
  - 训练效果提高（1.2 倍增益）
  - 比赛战术选择多样（更少失误）

#### Scenario: 难度影响范围
- **WHEN** 难度设置生效
- **THEN** 影响以下方面：
  - 转会预算
  - 训练决策质量
  - 竞价概率
  - 比赛战术
  - 但不影响 AI 性格（性格仍然随机）

## MODIFIED Requirements

### Requirement: AI 初始化
**原需求**：在 `initService.ts` 的 `newGame()` 中初始化 AI Profile

**修改后**：初始化 AI Profile 并保存到 Pinia store

```typescript
// 在 initService.ts 的 newGame() 中：
import { useAIStore } from '@/stores/ai';

const aiStore = useAIStore();

aiClubNames.forEach(name => {
  const club = clubStore.addAIClub(name);
  const aiTemplate = getRandomAITemplate();
  const profile = AIService.initAIClub(club.id, aiTemplate);
  // 新增：保存到 store 进行持久化
  aiStore.setAIProfile(club.id, profile);
});
```

### Requirement: AI 周模拟
**原需求**：在 `game.ts` 的 `onWeekPassed()` 中调用 AI 模拟

**修改后**：AI 模拟后更新 store 持久化

```typescript
// 在 game.ts 的 onWeekPassed() 中：
aiClubs.forEach(club => {
  AIService.simulateAIWeek(club, availablePlayers);
  // 新增：更新 store 持久化
  const profile = AIService.getAIProfile(club.id);
  if (profile) {
    aiStore.updateAIProfile(club.id, profile);
  }
});
```

## REMOVED Requirements

**无移除需求** - 所有修改均为增量增强，不破坏现有功能。

## Technical Notes

### 数据持久化策略
- 使用 `pinia-plugin-persistedstate` 插件
- AI Profile 存储路径：`localStorage.ai`
- 序列化：JSON.stringify / JSON.parse
- 版本控制：添加 schema version 字段

### UI 复用策略
- 联赛页面：在积分榜组件添加标签列
- 使用 Vant 的 Tag 组件
- 颜色映射到经营风格
- 响应式设计，适配移动端

### 新闻生成策略
- 事件驱动：监听 AI 行为事件
- 模板填充：使用新闻模板 + 实际数据
- 频率控制：避免新闻过载（每 AI 每赛季最多 5 条）
- 情感分析：根据事件类型自动判断

### 难度分级策略
- 难度系数：简单 0.7，普通 1.0，困难 1.3
- 线性缩放：所有数值基于系数调整
- 不影响随机性：性格、模板选择仍然随机
- 动态调整：可在游戏过程中改变难度

## Success Metrics

1. **持久化**：刷新页面后 AI Profile 100% 恢复
2. **UI 展示**：所有 AI 俱乐部显示经营风格标签
3. **新闻系统**：每赛季生成 20-40 条 AI 新闻
4. **难度分级**：
   - 简单难度：玩家胜率>70%
   - 普通难度：玩家胜率 40-60%
   - 困难难度：玩家胜率<40%
5. **性能**：持久化操作<10ms，不影响游戏体验
