# Tasks - 简化版游戏玩法重设计

## Phase 1: 核心UI重构
- [x] Task 1.1: 重构首页主界面布局
  - [x] SubTask 1.1.1: 设计新的首页布局（左右滑动卡片）
  - [x] SubTask 1.1.2: 实现卡片滑动组件（Swiper）
  - [x] SubTask 1.1.3: 添加卡片指示器
  - [x] SubTask 1.1.4: 实现待处理事项列表组件
  - [x] SubTask 1.1.5: 创建下一天球体按钮组件

- [x] Task 1.2: 创建日报系统
  - [x] SubTask 1.2.1: 创建日报弹窗组件
  - [x] SubTask 1.2.2: 实现日报内容生成逻辑
  - [x] SubTask 1.2.3: 在gameStore中添加日报触发逻辑

- [ ] Task 1.3: 创建周结算系统
  - [ ] SubTask 1.3.1: 创建周报弹窗组件
  - [ ] SubTask 1.3.2: 实现周报内容生成逻辑
  - [ ] SubTask 1.3.3: 在gameStore中添加周结算触发逻辑

## Phase 2: 卡片内容整合
- [x] Task 2.1: 实现阵容卡片
  - [x] SubTask 2.1.1: 创建阵容卡片组件（包含阵容/转会/青训Tab）
  - [x] SubTask 2.1.2: 迁移现有阵容页面功能到阵容Tab
  - [x] SubTask 2.1.3: 迁移转会功能到转会Tab（添加智能推荐）
  - [x] SubTask 2.1.4: 迁移青训功能到青训Tab

- [x] Task 2.2: 实现赛程卡片
  - [x] SubTask 2.2.1: 创建赛程卡片组件（包含赛程/战绩/联赛Tab）
  - [x] SubTask 2.2.2: 迁移赛程功能到赛程Tab
  - [x] SubTask 2.2.3: 迁移战绩功能到战绩Tab
  - [x] SubTask 2.2.4: 迁移联赛功能到联赛Tab

## Phase 3: 自动化系统
- [ ] Task 3.1: 实现自动训练系统
  - [ ] SubTask 3.1.1: 创建训练策略配置（保守/平衡/激进）
  - [ ] SubTask 3.1.2: 实现智能训练强度计算
  - [ ] SubTask 3.1.3: 在每周一自动执行训练
  - [ ] SubTask 3.1.4: 在设置页面添加训练策略选项

- [ ] Task 3.2: 实现自动比赛系统
  - [ ] SubTask 3.2.1: 修改比赛触发逻辑（自动进行）
  - [ ] SubTask 3.2.2: 实现比赛结果通知组件
  - [ ] SubTask 3.2.3: 重要比赛前显示提示
  - [ ] SubTask 3.2.4: 保留手动比赛选项（用于重要比赛）

- [ ] Task 3.3: 实现智能转会建议系统
  - [ ] SubTask 3.3.1: 创建转会建议算法
  - [ ] SubTask 3.3.2: 在主界面显示转会建议卡片
  - [ ] SubTask 3.3.3: 实现选手合同到期提醒
  - [ ] SubTask 3.3.4: 添加快速签约/忽略操作

## Phase 4: 智能提醒系统
- [x] Task 4.1: 实现待处理事项系统
  - [x] SubTask 4.1.1: 创建待处理事项数据结构
  - [ ] SubTask 4.1.2: 实现赞助商到期提醒
  - [ ] SubTask 4.1.3: 实现选手合同到期提醒
  - [ ] SubTask 4.1.4: 实现发现潜力选手提醒
  - [ ] SubTask 4.1.5: 实现紧急事项弹窗提醒

- [ ] Task 4.2: 简化战术系统
  - [ ] SubTask 4.2.1: 将复杂战术简化为3种预设风格
  - [ ] SubTask 4.2.2: 在设置中选择战术风格
  - [ ] SubTask 4.2.3: 自动BP根据战术风格执行

- [x] Task 4.3: 整合赞助商和粉丝系统
  - [x] SubTask 4.3.1: 创建"更多"页面
  - [x] SubTask 4.3.2: 将赞助商页面移到"更多"
  - [x] SubTask 4.3.3: 将粉丝页面移到"更多"
  - [ ] SubTask 4.3.4: 在首页显示赞助商状态摘要

## Phase 5: 导航和布局优化
- [x] Task 5.1: 简化底部导航
  - [x] SubTask 5.1.1: 将导航简化为4个：首页/阵容/比赛/更多
  - [x] SubTask 5.1.2: 调整导航图标和文字
  - [x] SubTask 5.1.3: 更新路由配置

- [x] Task 5.2: 优化主布局
  - [x] SubTask 5.2.1: 调整MainLayout布局
  - [x] SubTask 5.2.2: 确保底部导航不遮挡内容
  - [x] SubTask 5.2.3: 优化顶部状态栏显示

## Phase 6: 测试和调优
- [ ] Task 6.1: 功能测试
  - [ ] SubTask 6.1.1: 测试每日推进流程
  - [ ] SubTask 6.1.2: 测试自动系统
  - [ ] SubTask 6.1.3: 测试简报和报告

- [ ] Task 6.2: 平衡性调优
  - [ ] SubTask 6.2.1: 调整收入/支出平衡
  - [ ] SubTask 6.2.2: 调整选手成长速度
  - [ ] SubTask 6.2.3: 调整事件触发概率

- [ ] Task 6.3: 性能优化
  - [ ] SubTask 6.3.1: 优化自动比赛计算
  - [ ] SubTask 6.3.2: 减少不必要的数据存储
  - [ ] SubTask 6.3.3: 优化页面加载速度

# Task Dependencies
- Task 1.2 和 Task 1.3 依赖于 Task 1.1
- Task 2.1 和 Task 2.2 依赖于 Task 1.1
- Task 3.x 依赖于 Task 2.x
- Task 4.x 依赖于 Task 3.x
- Task 5.x 依赖于 Task 1.x 和 Task 2.x
- Task 6.x 依赖于所有前面的任务
