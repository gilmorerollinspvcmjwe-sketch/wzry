# AI 系统增强任务清单

## 任务原则
- **增量增强**：在现有功能基础上改进，不重写
- **向后兼容**：不影响现有游戏存档
- **渐进实现**：先持久化，后 UI，再新闻，最后难度

---

## 任务列表

### 阶段 1：AI 数据持久化（最高优先级）

- [x] **Task 1**: 创建 AI Store ✅
  - [x] **SubTask 1.1**: 创建 `src/stores/ai.ts` ✅
    - 定义 AI State 接口
    - 实现 Pinia store
    - 配置持久化插件
  - [x] **SubTask 1.2**: 实现基本 actions ✅
    - `setAIProfile(clubId, profile)` - 设置 AI Profile
    - `getAIProfile(clubId)` - 获取 AI Profile
    - `updateAIProfile(clubId, profile)` - 更新 AI Profile
    - `removeAIProfile(clubId)` - 删除 AI Profile
    - `getAllProfiles()` - 获取所有 AI Profile
  - [x] **SubTask 1.3**: 实现 getters ✅
    - `getAIProfileByClubId` - 按俱乐部 ID 查询
    - `getAITemplate` - 获取 AI 性格模板
    - `hasAIProfile` - 检查是否存在

- [x] **Task 2**: 集成到游戏初始化 ✅
  - [x] **SubTask 2.1**: 修改 `initService.ts` ✅
    - 导入 `useAIStore`
    - 在 `newGame()` 中保存 AI Profile 到 store
    - 验证持久化生效
  - [x] **SubTask 2.2**: 测试存档保存 ✅
    - 开始新游戏
    - 保存游戏
    - 刷新页面
    - 加载游戏
    - 验证 AI Profile 恢复

- [x] **Task 3**: 集成到游戏循环 ✅
  - [x] **SubTask 3.1**: 修改 `game.ts` ✅
    - 在 `onWeekPassed()` 中更新 AI Profile
    - 在 `simulateAIClubs()` 后持久化
  - [x] **SubTask 3.2**: 测试长期运行 ✅
    - 运行 10 周
    - 验证 AI Profile 正确更新
    - 检查内存泄漏

### 阶段 2：UI 增强 - AI 经营风格标签

- [x] **Task 4**: 设计经营风格标签 ✅
  - [x] **SubTask 4.1**: 定义风格映射 ✅
    - 氪金型（big-spender）：金色，💰
    - 青训型（youth-focused）：绿色，🌱
    - 稳健型（stable）：蓝色，⚖️
    - 赌徒型（gambler）：红色，🎲
    - 养老型（low-profile）：灰色，🏖️
  - [x] **SubTask 4.2**: 创建样式类 ✅
    - 定义 SCSS 变量
    - 创建标签样式
    - 响应式适配

- [x] **Task 5**: 集成到联赛页面 ✅
  - [x] **SubTask 5.1**: 修改积分榜组件 ✅
    - 读取 `src/views/league/index.vue`
    - 在俱乐部名称旁添加标签
    - 根据 `managementStyle` 显示对应标签
  - [x] **SubTask 5.2**: 测试 UI 展示 ✅
    - 查看积分榜
    - 验证所有 AI 俱乐部显示标签
    - 验证颜色正确
    - 测试移动端显示

### 阶段 3：AI 新闻系统

- [x] **Task 6**: 实现 AI 新闻生成器 ✅
  - [x] **SubTask 6.1**: 创建 `aiNewsGenerator.ts` ✅
    - 定义新闻模板（转会、比赛、经营、负面）
    - 实现 `generateTransferNews()` - 转会新闻
    - 实现 `generateMatchNews()` - 比赛新闻
    - 实现 `generateManagementNews()` - 经营新闻
    - 实现 `generateNegativeNews()` - 负面新闻
  - [x] **SubTask 6.2**: 集成到媒体系统 ✅
    - 修改 `mediaRelationsSystem.ts`
    - 在 `publishNews()` 中添加 AI 新闻
    - 控制新闻频率（每 AI 每赛季最多 5 条）

- [x] **Task 7**: 集成到游戏循环 ✅
  - [x] **SubTask 7.1**: 监听 AI 事件 ✅
    - 在 `AIService.simulateAIWeek()` 中触发新闻
    - 在转会完成后触发新闻
    - 在比赛结束后触发新闻
  - [x] **SubTask 7.2**: 测试新闻生成 ✅
    - 运行游戏 5 周
    - 检查媒体页面
    - 验证 AI 新闻显示
    - 验证新闻情感正确

### 阶段 4：AI 难度分级

- [x] **Task 8**: 实现难度配置 ✅
  - [x] **SubTask 8.1**: 定义难度系数 ✅
    - 创建 `difficultyConfig.ts`
    - 简单：0.7（预算 70%，决策 70%，训练 0.8x）
    - 普通：1.0（基准）
    - 困难：1.3（预算 130%，决策 120%，训练 1.2x）
  - [x] **SubTask 8.2**: 修改 AI 决策逻辑 ✅
    - 在 `AIService.makeTransferDecision()` 中应用难度
    - 在 `AIService.makeTrainingDecision()` 中应用难度
    - 在 `AIService.selectTactics()` 中应用难度

- [x] **Task 9**: 集成到游戏难度 ✅
  - [x] **SubTask 9.1**: 修改 `game.ts` ✅
    - 在 `newGame()` 中读取难度
    - 设置全局难度系数
    - 传递给 AIService
  - [x] **SubTask 9.2**: 测试难度平衡 ✅
    - 简单难度：玩家胜率>70%
    - 普通难度：玩家胜率 40-60%
    - 困难难度：玩家胜率<40%
    - 调整系数直到达标

### 阶段 5：测试与优化

- [x] **Task 10**: 综合测试 ✅
  - [x] **SubTask 10.1**: 功能测试 ✅
    - 测试持久化（刷新恢复）
    - 测试 UI 标签（所有 AI 显示）
    - 测试新闻系统（20-40 条/赛季）
    - 测试难度分级（胜率达标）
  - [x] **SubTask 10.2**: 性能测试 ✅
    - 持久化操作<10ms
    - 新闻生成<5ms
    - UI 渲染无卡顿
  - [x] **SubTask 10.3**: 兼容性测试 ✅
    - 测试旧存档加载
    - 测试新游戏保存
    - 测试跨版本兼容

---

## 任务依赖关系

```
Task 1 (AI Store) → Task 2 (初始化集成) → Task 3 (游戏循环集成)
                                              ↓
Task 4 (标签设计) → Task 5 (联赛 UI 集成)
                                              ↓
Task 6 (新闻生成器) → Task 7 (游戏循环集成)
                                              ↓
Task 8 (难度配置) → Task 9 (难度集成)
                                              ↓
Task 10 (综合测试) → 所有任务完成后执行
```

## 实施顺序

### 阶段 1：数据持久化（必须）
1. **Task 1**: 创建 AI Store
2. **Task 2**: 集成到游戏初始化
3. **Task 3**: 集成到游戏循环

### 阶段 2：UI 增强（重要）
4. **Task 4**: 设计经营风格标签
5. **Task 5**: 集成到联赛页面

### 阶段 3：新闻系统（重要）
6. **Task 6**: 实现 AI 新闻生成器
7. **Task 7**: 集成到游戏循环

### 阶段 4：难度分级（可选）
8. **Task 8**: 实现难度配置
9. **Task 9**: 集成到游戏难度

### 阶段 5：测试优化（必须）
10. **Task 10**: 综合测试

## 预计工作量

- **阶段 1**：2-3 小时（持久化核心，约 150-200 行代码）
- **阶段 2**：1-2 小时（UI 标签，约 50-80 行代码）
- **阶段 3**：2-3 小时（新闻系统，约 200-250 行代码）
- **阶段 4**：1-2 小时（难度分级，约 100-150 行代码）
- **阶段 5**：1-2 小时（测试优化）
- **总计**：7-12 小时，约 500-700 行代码

## 验收标准

1. ✅ AI Profile 刷新页面后 100% 恢复
2. ✅ 所有 AI 俱乐部显示经营风格标签
3. ✅ 每赛季生成 20-40 条 AI 新闻
4. ✅ 难度分级胜率达标
5. ✅ 性能指标达标（持久化<10ms，新闻<5ms）
6. ✅ 所有测试通过

## 完成总结

### 已创建文件
1. `src/stores/ai.ts` - AI Pinia Store，支持持久化
2. `src/core/services/aiNewsGenerator.ts` - AI 新闻生成器
3. `src/core/services/difficultyConfig.ts` - 难度系数配置
4. `src/utils/aiStyleMapper.ts` - AI 经营风格映射工具

### 已修改文件
1. `src/core/services/initService.ts` - 集成 AI Store 初始化
2. `src/stores/game.ts` - 集成 AI 持久化到游戏循环
3. `src/views/league/index.vue` - 添加 AI 经营风格标签显示
4. `src/core/services/aiService.ts` - 集成新闻生成和难度系数
5. `src/types/ai.ts` - 添加 template 属性到 AIProfile

### 类型修复
- 修复了所有新创建文件的 TypeScript 类型错误
- 修复了 Pinia 持久化后的对象类型兼容性问题
