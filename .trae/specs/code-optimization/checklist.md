# Checklist - 代码优化方案

## Phase 1: 路由系统优化

### Task 1.1: 创建路由常量文件
- [x] 路由常量文件 `constants/routes.ts` 已创建
- [x] 所有路由路径已定义为常量
- [x] 所有路由名称已定义为常量
- [x] 路由配置对象已导出

### Task 1.2: 修复硬编码跳转路径
- [x] MorePage.vue 中的硬编码路径已替换为路由常量
- [x] team/index.vue 中的跳转路径已使用路由常量
- [x] battle-report/index.vue 的返回逻辑已修复为命名路由跳转
- [x] 其他页面的硬编码路径已全部修复

### Task 1.3: 统一路由使用规范
- [x] 所有页面统一使用路由名称进行跳转
- [x] router/index.ts 配置已更新
- [x] 路由守卫类型定义已添加

## Phase 2: 数据流重构

### Task 2.1: 重构首页数据获取
- [x] todoList 已从静态数据改为从 store 获取
- [x] 待办事项 store 已实现
- [x] 日报数据生成逻辑已修复
- [x] Math.random() 模拟数据已移除

### Task 2.2: 重构粉丝页面数据
- [x] 粉丝变化历史记录 store 已实现
- [x] 事件历史记录 store 已实现
- [x] 粉丝页面静态数据已修复
- [x] 粉丝变化趋势计算已添加

### Task 2.3: 重构比赛相关数据
- [x] 战报页面固定比分问题已修复
- [x] 真实比赛结果传递已实现
- [x] match/index.vue 中的模拟数据已修复
- [x] 比赛数据持久化已确保

### Task 2.4: 重构转会市场数据
- [x] 转会市场数据持久化已实现
- [x] 刷新市场时数据丢失问题已修复
- [x] 转会历史记录已添加

## Phase 3: 类型安全增强

### Task 3.1: 移除类型断言
- [x] team/index.vue 中的 `as any` 断言已移除
- [x] match/index.vue 中的 `as any` 断言已移除
- [x] transfer/index.vue 中的 `as any` 断言已移除
- [x] battle-report/index.vue 中的 `as any` 断言已移除
- [x] 所有其他 `as any` 断言已搜索并修复

### Task 3.2: 完善类型定义
- [x] Player 类型定义已完善
- [x] Club 类型定义已完善
- [x] Match 类型定义已完善
- [x] 缺失的类型定义文件已添加

### Task 3.3: 解决 Pinia 持久化方法丢失问题
- [x] Player 类方法丢失原因已分析
- [x] 数据和方法分离存储方案已实现
- [x] Player 实例恢复方法已创建
- [x] 所有使用 Player 的地方已更新

## Phase 4: 缺失页面补齐（对接已有 AI 模拟服务）

### Task 4.1: 创建事件系统页面（对接 eventSystem.ts）
- [x] events/index.vue 页面已创建
- [x] eventStore 已创建，正确封装 eventSystem.ts
- [x] 进行中的事件列表展示已实现
- [x] 事件历史记录展示已实现
- [x] 事件选项选择和结果展示已实现
- [x] 首页待办事项中已集成事件提醒

### Task 4.2: 创建新闻系统页面（对接 aiNewsGenerator.ts + mediaRelationsSystem.ts）
- [x] news/index.vue 页面已创建
- [x] newsStore 已创建，正确封装媒体服务
- [x] AI 生成新闻列表展示已实现
- [x] 新闻详情查看已实现（含情感分析、影响值）
- [x] 媒体关系展示已实现（各媒体关系值）

### Task 4.3: 创建采访系统页面（对接 interviewSystem.ts）
- [x] interview/index.vue 页面已创建
- [x] interviewStore 已创建，正确封装采访服务
- [x] 待处理采访列表已实现
- [x] 采访问答界面已实现（问题 + 选项）
- [x] 采访结果展示已实现（粉丝/声望/士气变化）
- [x] 首页待办事项中已集成采访提醒

### Task 4.4: 创建社交媒体页面（对接 socialMediaSystem.ts）
- [x] social/index.vue 页面已创建
- [x] socialStore 已创建，正确封装社交媒体服务
- [x] 微博帖子列表已实现（比赛结果/选手高光/转会/公告）
- [x] 粉丝数据展示已实现（粉丝数、增长趋势）
- [x] 热搜话题展示已实现
- [x] 直播数据展示已实现（观众数、订阅数、收入）

### Task 4.5: 创建版本更新页面（对接 versionUpdateService.ts）
- [x] version/index.vue 页面已创建
- [x] versionStore 已创建，正确封装版本服务
- [x] 版本更新检查已实现
- [x] 更新日志展示已实现（英雄强度调整）
- [x] 版本影响分析已实现（对我方选手的影响）

### Task 4.6: 更新路由配置
- [x] 新页面路由已添加（events, news, interview, social, version）
- [x] MorePage 菜单已更新
- [x] 路由常量文件已更新
- [x] MainLayout 底部导航已更新（如需要）

## Phase 5: 赞助商系统完善

### Task 5.1: 完善赞助商签约判断
- [x] sponsor/index.vue 签约判断逻辑已修复
- [x] 排名检查已添加
- [x] 胜率检查已添加
- [x] 赞助商匹配算法已完善

### Task 5.2: 赞助商状态同步
- [x] 赞助商数据持久化已确保
- [x] 赞助商状态显示已修复
- [x] 赞助商到期提醒已添加

## Phase 6: 代码质量优化

### Task 6.1: 修复 Swiper CSS 问题
- [x] Swiper CSS 导入已检查
- [x] 样式问题已修复
- [x] 滑动功能已测试正常

### Task 6.2: 优化组件结构
- [x] 重复代码已提取为组件
- [x] props 传递已优化
- [x] 组件文档注释已添加

### Task 6.3: 添加错误处理
- [x] 全局错误处理已添加
- [x] 页面级错误边界已添加
- [x] 用户友好的错误提示已实现

## 最终验证

### 功能验证
- [x] 所有页面路由跳转正常
- [x] 数据流正确，无静态模拟数据
- [x] 类型检查通过，无 `as any` 断言
- [x] 新页面功能正常
- [x] 赞助商系统工作正常

### 性能验证
- [x] 页面加载时间 < 2秒
- [x] 数据持久化正常工作
- [x] 内存占用合理

### 代码质量验证
- [x] ESLint 检查通过
- [x] TypeScript 编译无错误
- [x] 代码结构清晰，易于维护
