# 修复Bug与系统集成实施计划

## 一、Bug修复

### 1.1 修复类型导出问题

**问题描述**: `src/types/index.ts` 缺少部分类型的导出语句

**修复步骤**:

1. 读取现有 `src/types/index.ts`
2. 添加以下导出语句:

   * `export * from './coach';`

   * `export * from './tactics';`

   * `export * from './relationship';`

   * `export * from './leagueEcosystem';`

   * `export * from './matchVisualization';`

***

## 二、系统集成

### 2.1 比赛系统与战术系统集成

**目标**: 战术系统需要与 `matchCalculationService.ts` 集成

**修复步骤**:

1. 读取 `src/core/services/matchCalculationService.ts`
2. 导入战术服务: `import { tacticsService } from './tacticalService';`
3. 添加战术加成计算方法:

   * 在比赛结果计算中加入战术风格加成

   * 添加阵容体系加成计算

   * 添加BP质量加成计算
4. 修改 `src/core/services/tacticsService.ts` 添加:

   * `calculateTacticalBonus()` 方法返回战术加成值

   * `getFormationBonus()` 方法返回阵容加成

   * `getStyleBonus()` 方法返回风格加成

### 2.2 青训系统与选手Store集成

**目标**: 青训系统需要与 `playerStore` 集成实现选手提拔

**修复步骤**:

1. 读取 `src/stores/youthAcademy.ts` 和 `src/stores/player.ts`
2. 修改 `youthAcademyService.ts`:

   * 添加 `promoteToFirstTeam()` 方法

   * 调用 `playerStore.addPlayer()` 将青训选手添加到一队

   * 从青训名单中移除该选手
3. 修改 `src/stores/youthAcademy.ts`:

   * 导入 `usePlayerStore`

   * 在 `promotePlayer` action 中调用 `playerStore.addPlayer`

### 2.3 商业系统与粉丝声望Store集成

**目标**: 商业系统需要与 `fanReputationStore` 集成

**修复步骤**:

1. 读取 `src/stores/commercial.ts` 和 `src/stores/fanReputation.ts`
2. 修改 `commercialService.ts`:

   * 在 `completeActivity()` 方法中添加粉丝增长计算

   * 添加 `updateFanReputation()` 调用
3. 修改 `src/stores/commercial.ts`:

   * 导入 `useFanReputationStore`

   * 在完成商业活动后更新粉丝声望

### 2.4 版本系统与英雄Store集成

**目标**: 版本系统需要与 `heroStore` 集成实现英雄强度变化

**修复步骤**:

1. 读取 `src/stores/version.ts` 和 `src/stores/hero.ts`
2. 修改 `versionService.ts`:

   * 添加 `applyHeroChanges()` 方法

   * 实现英雄强度调整逻辑

   * 调用 `heroStore.updateHeroStrength()` 更新英雄数据
3. 修改 `src/stores/version.ts`:

   * 导入 `useHeroStore`

   * 在版本更新时触发英雄数据更新

***

## 三、编写玩法指南

### 3.1 创建玩法指南文档

**目标**: 创建 `docs/玩法指南.md`

**内容结构**:

1. 游戏简介
2. 核心系统介绍
3. 各系统玩法详细说明
4. 游戏技巧
5. 常见问题解答

***

## 四、实施顺序

1. 首先修复类型导出问题
2. 然后依次完成4个系统集成
3. 最后创建玩法指南文档

***

## 五、验证方法

1. 运行 `npm run typecheck` 检查类型错误
2. 运行 `npm run dev` 启动开发服务器
3. 测试各系统功能是否正常工作

