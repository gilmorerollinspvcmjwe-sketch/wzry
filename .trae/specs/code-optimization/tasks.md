# Tasks - 代码优化方案

## Phase 1: 路由系统优化
- [x] Task 1.1: 创建路由常量文件
  - [x] SubTask 1.1.1: 创建 `constants/routes.ts` 文件
  - [x] SubTask 1.1.2: 定义所有路由路径常量
  - [x] SubTask 1.1.3: 定义路由名称常量
  - [x] SubTask 1.1.4: 导出路由配置对象

- [x] Task 1.2: 修复硬编码跳转路径
  - [x] SubTask 1.2.1: 修复 MorePage.vue 中的硬编码路径
  - [x] SubTask 1.2.2: 修复 team/index.vue 中的跳转路径
  - [x] SubTask 1.2.3: 修复 battle-report/index.vue 的返回逻辑
  - [x] SubTask 1.2.4: 修复其他页面的硬编码路径

- [x] Task 1.3: 统一路由使用规范
  - [x] SubTask 1.3.1: 统一使用路由名称进行跳转
  - [x] SubTask 1.3.2: 更新 router/index.ts 配置
  - [x] SubTask 1.3.3: 添加路由守卫类型定义

## Phase 2: 数据流重构
- [x] Task 2.1: 重构首页数据获取
  - [x] SubTask 2.1.1: 将 todoList 从静态数据改为从 store 获取
  - [x] SubTask 2.1.2: 实现待办事项 store
  - [x] SubTask 2.1.3: 修复日报数据生成逻辑
  - [x] SubTask 2.1.4: 移除 Math.random() 模拟数据

- [x] Task 2.2: 重构粉丝页面数据
  - [x] SubTask 2.2.1: 实现粉丝变化历史记录 store
  - [x] SubTask 2.2.2: 实现事件历史记录 store
  - [x] SubTask 2.2.3: 修复粉丝页面静态数据
  - [x] SubTask 2.2.4: 添加粉丝变化趋势计算

- [x] Task 2.3: 重构比赛相关数据
  - [x] SubTask 2.3.1: 修复战报页面固定比分问题
  - [x] SubTask 2.3.2: 实现真实比赛结果传递
  - [x] SubTask 2.3.3: 修复 match/index.vue 中的模拟数据
  - [x] SubTask 2.3.4: 确保比赛数据持久化

- [x] Task 2.4: 重构转会市场数据
  - [x] SubTask 2.4.1: 实现转会市场数据持久化
  - [x] SubTask 2.4.2: 修复刷新市场时数据丢失问题
  - [x] SubTask 2.4.3: 添加转会历史记录

## Phase 3: 类型安全增强
- [x] Task 3.1: 移除类型断言
  - [x] SubTask 3.1.1: 修复 team/index.vue 中的 `as any` 断言
  - [x] SubTask 3.1.2: 修复 match/index.vue 中的 `as any` 断言
  - [x] SubTask 3.1.3: 修复 transfer/index.vue 中的 `as any` 断言
  - [x] SubTask 3.1.4: 修复 league/index.vue 中的 `as any` 断言
  - [x] SubTask 3.1.5: 修复 achievements/index.vue 中的 `as any` 断言
  - [x] SubTask 3.1.6: 修复 TeamCard.vue 中的 `as any` 断言
  - [x] SubTask 3.1.7: 修复 club.ts store 中的 `as any` 断言
  - [x] SubTask 3.1.8: 修复 league.ts store 中的 `as any` 断言

- [x] Task 3.2: 完善类型定义
  - [x] SubTask 3.2.1: 创建 utils/playerUtils.ts 工具函数
  - [x] SubTask 3.2.2: 创建 utils/clubUtils.ts 工具函数
  - [x] SubTask 3.2.3: 添加 LeaderboardType 类型导入
  - [x] SubTask 3.2.4: 添加 AchievementCategory 类型定义

- [ ] Task 3.3: 解决服务层类型问题（低优先级）
  - [ ] SubTask 3.3.1: 修复 battleReportService.ts 中的 `as any`
  - [ ] SubTask 3.3.2: 修复 matchCalculationService.ts 中的 `as any`
  - [ ] SubTask 3.3.3: 修复其他服务层文件中的 `as any`

## Phase 4: 缺失页面补齐（对接已有 AI 模拟服务）

### Task 4.1: 创建事件系统页面（对接 eventSystem.ts）✅
- [x] SubTask 4.1.1: 创建 events/index.vue 页面
- [x] SubTask 4.1.2: 创建 eventStore，封装 eventSystem.ts 的调用
- [x] SubTask 4.1.3: 实现进行中的事件列表展示
- [x] SubTask 4.1.4: 实现事件历史记录展示
- [x] SubTask 4.1.5: 实现事件选项选择和结果展示
- [x] SubTask 4.1.6: 在首页待办事项中集成事件提醒

### Task 4.2: 创建新闻系统页面（对接 aiNewsGenerator.ts + mediaRelationsSystem.ts）✅
- [x] SubTask 4.2.1: 创建 news/index.vue 页面
- [x] SubTask 4.2.2: 创建 newsStore，封装媒体服务调用
- [x] SubTask 4.2.3: 实现 AI 生成新闻列表展示
- [x] SubTask 4.2.4: 实现新闻详情查看（含情感分析、影响值）
- [x] SubTask 4.2.5: 实现媒体关系展示（各媒体关系值）

### Task 4.3: 创建采访系统页面（对接 interviewSystem.ts）✅
- [x] SubTask 4.3.1: 创建 interview/index.vue 页面
- [x] SubTask 4.3.2: 创建 interviewStore，封装采访服务
- [x] SubTask 4.3.3: 实现待处理采访列表
- [x] SubTask 4.3.4: 实现采访问答界面（问题 + 选项）
- [x] SubTask 4.3.5: 实现采访结果展示（粉丝/声望/士气变化）
- [x] SubTask 4.3.6: 在首页待办事项中集成采访提醒

### Task 4.4: 创建社交媒体页面（对接 socialMediaSystem.ts）✅
- [x] SubTask 4.4.1: 创建 social/index.vue 页面（基础版本）
- [x] SubTask 4.4.2: 创建 socialStore，封装社交媒体服务
- [x] SubTask 4.4.3: 实现微博帖子列表（比赛结果/选手高光/转会/公告）
- [x] SubTask 4.4.4: 实现粉丝数据展示（粉丝数、增长趋势）
- [x] SubTask 4.4.5: 实现热搜话题展示
- [x] SubTask 4.4.6: 实现直播数据展示（观众数、订阅数、收入）

### Task 4.5: 创建版本更新页面（对接 versionUpdateService.ts）✅
- [x] SubTask 4.5.1: 创建 version/index.vue 页面（基础版本）
- [x] SubTask 4.5.2: 创建 versionStore，封装版本服务
- [x] SubTask 4.5.3: 实现版本更新检查
- [x] SubTask 4.5.4: 实现更新日志展示（英雄强度调整）
- [x] SubTask 4.5.5: 实现版本影响分析（对我方选手的影响）

### Task 4.6: 更新路由配置 ✅
- [x] SubTask 4.6.1: 添加新页面路由（events, news, interview, social, version）
- [x] SubTask 4.6.2: 更新 MorePage 菜单，添加新入口
- [x] SubTask 4.6.3: 更新路由常量文件
- [x] SubTask 4.6.4: 更新 MainLayout 底部导航（如需要）

## Phase 5: 赞助商系统完善
- [ ] Task 5.1: 完善赞助商签约判断
  - [ ] SubTask 5.1.1: 修复 sponsor/index.vue 签约判断逻辑
  - [ ] SubTask 5.1.2: 添加排名检查
  - [ ] SubTask 5.1.3: 添加胜率检查
  - [ ] SubTask 5.1.4: 完善赞助商匹配算法

- [ ] Task 5.2: 赞助商状态同步
  - [ ] SubTask 5.2.1: 确保赞助商数据持久化
  - [ ] SubTask 5.2.2: 修复赞助商状态显示
  - [ ] SubTask 5.2.3: 添加赞助商到期提醒

## Phase 6: 代码质量优化
- [ ] Task 6.1: 修复 Swiper CSS 问题
  - [ ] SubTask 6.1.1: 检查 Swiper CSS 导入
  - [ ] SubTask 6.1.2: 修复样式问题
  - [ ] SubTask 6.1.3: 测试滑动功能

- [ ] Task 6.2: 优化组件结构
  - [ ] SubTask 6.2.1: 提取重复代码为组件
  - [ ] SubTask 6.2.2: 优化 props 传递
  - [ ] SubTask 6.2.3: 添加组件文档注释

- [ ] Task 6.3: 添加错误处理
  - [ ] SubTask 6.3.1: 添加全局错误处理
  - [ ] SubTask 6.3.2: 添加页面级错误边界
  - [ ] SubTask 6.3.3: 添加用户友好的错误提示

# Task Dependencies
- Task 1.x 是其他任务的基础，应该首先完成
- Task 2.x 和 Task 3.x 可以并行进行
- Task 4.x 依赖于 Task 1.x
- Task 5.x 依赖于 Task 2.x
- Task 6.x 依赖于所有前面的任务

# 当前进度总结

## 已完成 ✅
1. **路由系统优化** - 创建了路由常量文件，修复了硬编码路径
2. **事件系统页面** - 完整实现，包含 Store 和页面功能
3. **新闻系统页面** - 完整实现，包含 Store 和页面功能
4. **采访系统页面** - 完整实现，包含 Store 和页面功能
5. **社交媒体页面** - 完整实现，包含 Store 和页面功能
6. **版本更新页面** - 完整实现，包含 Store 和页面功能
7. **路由配置更新** - 添加了所有新页面路由
8. **首页数据重构** - 创建 todoStore，移除静态待办数据，修复日报生成逻辑
9. **粉丝页面重构** - 移除静态模拟数据，使用 eventStore 获取事件历史
10. **比赛数据重构** - 确认已正确使用 matchStore 和 battleReportService
11. **转会市场重构** - 确认已正确使用 playerStore，数据持久化正常
12. **类型安全增强** - 移除所有 Vue 文件和 Store 文件中的 `as any` 断言
13. **工具函数创建** - 创建 playerUtils.ts 和 clubUtils.ts 解决 Pinia 持久化方法丢失问题

## 待完成 ⏳
1. **服务层类型优化** - 修复服务层文件中的 `as any`（低优先级）
2. **赞助商系统** - 完善签约判断逻辑
3. **代码质量优化** - Swiper CSS、组件结构、错误处理
