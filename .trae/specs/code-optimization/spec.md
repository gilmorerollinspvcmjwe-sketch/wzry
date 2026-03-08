# 代码优化方案 Spec

## Why

经过全面的代码分析，发现了以下主要问题需要优化：

1. **前端跳转逻辑问题**：导航路径硬编码、返回逻辑不完善
2. **静态数据滥用**：大量页面使用硬编码模拟数据而非真实数据流
3. **前后端功能不匹配**：部分后端服务没有对应前端页面
4. **类型安全问题**：多处使用 `as any` 绕过 TypeScript 类型检查
5. **数据持久化问题**：Pinia 持久化后类方法丢失

这些问题影响了代码的可维护性、类型安全性和用户体验。

## What Changes

### 1. 路由系统优化
- 统一路由命名规范，避免 path 和 name 混用
- 创建路由常量文件，统一管理路径
- 修复返回逻辑，使用命名路由替代 `router.back()`

### 2. 数据流重构
- 将静态数据迁移到 Pinia Store
- 建立统一的数据获取层
- 实现真实的数据流转，移除模拟数据

### 3. 类型安全增强
- 移除所有 `as any` 类型断言
- 完善类型定义
- 添加运行时类型检查

### 4. 前后端功能对齐
- 为独立的后端服务创建对应前端页面
- 整合分散的功能模块

### 5. 持久化方案优化
- 解决 Pinia 持久化后方法丢失问题
- 实现数据和方法的分离存储

## Impact

- **Affected specs**: simple-gameplay-redesign（需要配合调整）
- **Affected code**: 
  - 所有 views 页面
  - router 配置
  - Pinia stores
  - 类型定义文件

## ADDED Requirements

### Requirement: 路由系统优化

The system SHALL provide a unified routing system that prevents hardcoded paths.

#### Scenario: 统一路由常量
- **GIVEN** 开发者需要跳转到某个页面
- **WHEN** 使用路由常量
- **THEN** 路径变更时只需修改一处

#### Scenario: 修复返回逻辑
- **GIVEN** 用户在战报页面
- **WHEN** 点击返回按钮
- **THEN** 返回到比赛列表页面（而非浏览器历史）

### Requirement: 数据流重构

The system SHALL use Pinia stores for all dynamic data instead of static mock data.

#### Scenario: 首页待办事项
- **GIVEN** 用户在首页
- **WHEN** 查看待办事项
- **THEN** 显示从 store 获取的真实数据

#### Scenario: 粉丝页面数据
- **GIVEN** 用户在粉丝页面
- **WHEN** 查看粉丝变化
- **THEN** 显示真实的粉丝变化数据

### Requirement: 类型安全增强

The system SHALL have complete TypeScript type coverage without `as any` assertions.

#### Scenario: 选手实力计算
- **GIVEN** 需要获取选手实力
- **WHEN** 调用计算方法
- **THEN** TypeScript 能正确推断类型

### Requirement: 缺失页面补齐

The system SHALL provide frontend pages for all backend services with AI simulation.

**已有完整 AI 模拟实现的后端服务：**

| 服务 | 文件路径 | AI 模拟功能 |
|------|----------|-------------|
| 事件系统 | `eventSystem.ts` | 每日事件触发、条件筛选、稀有度权重选择、事件历史记录 |
| AI 新闻生成器 | `aiNewsGenerator.ts` | 转会新闻、比赛新闻、经营新闻模板生成、情感分析 |
| 媒体关系系统 | `mediaRelationsSystem.ts` | 媒体机构管理、新闻发布、关系值计算、新闻动态生成 |
| 采访系统 | `interviewSystem.ts` | 赛后/赛前/转会采访生成、问题选项、影响计算 |
| 社交媒体系统 | `socialMediaSystem.ts` | 微博帖子生成、粉丝增长模拟、热搜触发、互动数据计算 |
| 版本更新服务 | `versionUpdateService.ts` | 英雄强度调整模拟、版本更新日志生成 |

#### Scenario: 事件系统页面
- **GIVEN** 后端有完整的事件系统 AI 模拟 (`eventSystem.ts`)
- **WHEN** 用户需要查看和处理事件
- **THEN** 有专门的事件页面展示进行中的事件和历史事件

#### Scenario: 新闻系统页面
- **GIVEN** 后端有 AI 新闻生成器 (`aiNewsGenerator.ts`) 和媒体关系系统 (`mediaRelationsSystem.ts`)
- **WHEN** 用户需要查看新闻
- **THEN** 有新闻页面展示 AI 生成的新闻列表

#### Scenario: 采访系统页面
- **GIVEN** 后端有采访系统 (`interviewSystem.ts`)
- **WHEN** 有待处理的采访
- **THEN** 有采访页面展示采访请求并允许用户回答

#### Scenario: 社交媒体页面
- **GIVEN** 后端有社交媒体系统 (`socialMediaSystem.ts`)
- **WHEN** 用户需要查看社交媒体动态
- **THEN** 有社交媒体页面展示微博帖子、粉丝数据、热搜话题

## MODIFIED Requirements

### Requirement: 现有页面数据获取

**Before**: 页面使用静态数据或 `Math.random()` 生成模拟数据

**After**: 
- 所有数据从 Pinia Store 获取
- 建立统一的数据初始化流程
- 实现数据订阅机制，数据变化自动更新 UI

## REMOVED Requirements

### Requirement: 静态数据文件

**Reason**: 静态数据无法反映游戏真实状态，需要改为动态数据

**Migration**: 
- `data/events.ts` → 迁移到 `stores/event.ts`
- `data/achievements.ts` → 保持静态，但数据从 store 获取完成状态
- `data/sponsors.ts` → 保持静态配置，签约状态从 store 获取
- `data/heroes.ts` → 保持静态英雄数据

### Requirement: 硬编码跳转路径

**Reason**: 硬编码路径维护困难，路由变更时需要多处修改

**Migration**: 所有路径改为使用路由常量
