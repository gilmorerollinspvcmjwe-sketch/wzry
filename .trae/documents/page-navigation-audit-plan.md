# 页面跳转自查方案

## 问题描述
项目中存在页面跳转问题，需要对所有按钮、功能入口和页面返回进行全面检查。

## 检查范围

### 1. 主入口页面
- **StartMenu.vue** - 游戏开始菜单
- **MainLayout.vue** - 游戏主布局（包含底部导航）

### 2. 功能页面（5个主要入口）
1. **Home** - 首页/仪表盘
2. **Team** - 阵容管理
3. **Match** - 比赛中心
4. **Transfer** - 转会市场
5. **Settings** - 设置

### 3. 页面内弹窗和子功能
- 选手详情弹窗
- 比赛详情弹窗
- 存档列表弹窗
- 确认弹窗

---

## 检查清单

### 一、StartMenu.vue 跳转检查

| 按钮/元素 | 目标路由 | 跳转方式 | 状态 | 备注 |
|---------|---------|---------|------|------|
| 开始游戏按钮 | /game | router.push | ⬜ 待检查 | 需要检查是否正确跳转 |
| 加载存档按钮 | 显示弹窗 | 本地状态 | ⬜ 待检查 | 弹窗内再选择存档跳转 |
| 设置按钮 | 显示弹窗 | 本地状态 | ⬜ 待检查 | 设置弹窗 |

### 二、MainLayout.vue 底部导航检查

| 导航项 | 路由路径 | 当前激活判断 | 状态 | 备注 |
|-------|---------|-------------|------|------|
| 首页 | /game | route.path === '' | ⬜ 待检查 | 相对路径问题 |
| 阵容 | /game/team | route.path === 'team' | ⬜ 待检查 | 相对路径问题 |
| 比赛 | /game/match | route.path === 'match' | ⬜ 待检查 | 相对路径问题 |
| 转会 | /game/transfer | route.path === 'transfer' | ⬜ 待检查 | 相对路径问题 |
| 设置 | /game/settings | route.path === 'settings' | ⬜ 待检查 | 相对路径问题 |

**问题点**: 当前使用 `route.path === item.path` 判断激活状态，但 `item.path` 是相对路径（如 ''），而 `route.path` 是绝对路径（如 '/game'），导致判断失败。

### 三、Home 页面内跳转检查

| 按钮/元素 | 目标路由/操作 | 跳转方式 | 状态 | 备注 |
|---------|-------------|---------|------|------|
| 阵容管理入口 | /game/team | router-link | ⬜ 待检查 | 卡片点击跳转 |
| 比赛中心入口 | /game/match | router-link | ⬜ 待检查 | 卡片点击跳转 |
| 转会市场入口 | /game/transfer | router-link | ⬜ 待检查 | 卡片点击跳转 |
| 设置入口 | /game/settings | router-link | ⬜ 待检查 | 卡片点击跳转 |

### 四、Team 页面内跳转检查

| 按钮/元素 | 目标路由/操作 | 跳转方式 | 状态 | 备注 |
|---------|-------------|---------|------|------|
| 选手卡片 | 打开详情弹窗 | 本地状态 | ⬜ 待检查 | 弹窗显示 |
| 详情弹窗关闭 | 关闭弹窗 | 本地状态 | ⬜ 待检查 | 关闭按钮 |
| 去签约链接 | /game/transfer | router-link | ⬜ 待检查 | 空状态时的跳转 |

### 五、Match 页面内跳转检查

| 按钮/元素 | 目标路由/操作 | 跳转方式 | 状态 | 备注 |
|---------|-------------|---------|------|------|
| 比赛卡片 | 打开详情弹窗 | 本地状态 | ⬜ 待检查 | 弹窗显示 |
| 详情弹窗关闭 | 关闭弹窗 | 本地状态 | ⬜ 待检查 | 关闭按钮 |
| 去签约链接 | /game/transfer | router-link | ⬜ 待检查 | 空状态时的跳转 |

### 六、Transfer 页面内跳转检查

| 按钮/元素 | 目标路由/操作 | 跳转方式 | 状态 | 备注 |
|---------|-------------|---------|------|------|
| 选手卡片 | 打开详情弹窗 | 本地状态 | ⬜ 待检查 | 弹窗显示 |
| 详情弹窗关闭 | 关闭弹窗 | 本地状态 | ⬜ 待检查 | 关闭按钮 |

### 七、Settings 页面内跳转检查

| 按钮/元素 | 目标路由/操作 | 跳转方式 | 状态 | 备注 |
|---------|-------------|---------|------|------|
| 加载存档 | 打开存档弹窗 | 本地状态 | ⬜ 待检查 | 弹窗显示 |
| 存档弹窗关闭 | 关闭弹窗 | 本地状态 | ⬜ 待检查 | 关闭按钮 |
| 加载成功后 | /game | router.push | ⬜ 待检查 | 加载存档后跳转 |
| 重新开始 | / | router.push | ⬜ 待检查 | 返回开始菜单 |
| 退出游戏 | / | router.push | ⬜ 待检查 | 返回开始菜单 |

---

## 已知问题汇总

### 问题1: 底部导航激活状态判断错误
**位置**: MainLayout.vue
**代码**:
```vue
:class="{ active: route.path === item.path }"
```
**问题**: `route.path` 是绝对路径（如 '/game'），`item.path` 是相对路径（如 ''）
**解决方案**: 使用 `route.name` 或处理路径匹配逻辑

### 问题2: 空状态跳转链接
**位置**: Team.vue, Match.vue
**代码**:
```vue
<router-link to="/game/transfer" class="link-btn">
```
**问题**: 需要检查路径是否正确

### 问题3: 弹窗关闭逻辑
**位置**: 所有弹窗组件
**问题**: 点击遮罩层关闭弹窗时，需要确保事件正确传递

---

## 修复计划

### 步骤1: 修复底部导航激活状态
- [ ] 修改 MainLayout.vue 中激活状态的判断逻辑
- [ ] 使用 `route.name` 或 `route.path.includes(item.path)`

### 步骤2: 修复所有 router-link 路径
- [ ] 检查所有 router-link 的 to 属性
- [ ] 确保路径与路由配置匹配

### 步骤3: 修复弹窗关闭逻辑
- [ ] 检查所有弹窗的关闭事件
- [ ] 确保点击遮罩层能正确关闭

### 步骤4: 修复页面返回逻辑
- [ ] 检查所有返回按钮
- [ ] 确保返回路径正确

### 步骤5: 全面测试
- [ ] 测试所有按钮点击
- [ ] 测试页面间跳转
- [ ] 测试弹窗打开和关闭
- [ ] 测试返回功能

---

## 测试用例

### 用例1: 开始游戏流程
1. 打开 StartMenu
2. 点击"开始游戏"
3. 应跳转到 /game (Home页面)
4. 底部导航"首页"应高亮

### 用例2: 底部导航切换
1. 在 Home 页面
2. 点击"阵容"导航
3. 应跳转到 /game/team
4. "阵容"导航应高亮
5. 点击"比赛"导航
6. 应跳转到 /game/match
7. "比赛"导航应高亮

### 用例3: 空状态跳转
1. 在 Team 页面，当没有选手时
2. 点击"去签约"链接
3. 应跳转到 /game/transfer

### 用例4: 弹窗操作
1. 在 Team 页面点击选手卡片
2. 应打开选手详情弹窗
3. 点击关闭按钮或遮罩层
4. 弹窗应关闭

### 用例5: 设置页面返回
1. 在 Settings 页面
2. 点击"退出游戏"
3. 应返回 / (StartMenu)

---

## 路由配置检查

需要确认 router/index.ts 中的路由配置:

```typescript
{
  path: '/game',
  component: MainLayout,
  meta: { requiresGame: true },
  children: [
    { path: '', name: 'Home', component: () => import('@/views/home/index.vue') },
    { path: 'team', name: 'Team', component: () => import('@/views/team/index.vue') },
    { path: 'match', name: 'Match', component: () => import('@/views/match/index.vue') },
    { path: 'transfer', name: 'Transfer', component: () => import('@/views/transfer/index.vue') },
    { path: 'settings', name: 'Settings', component: () => import('@/views/settings/index.vue') },
  ],
}
```

所有子路由路径都是相对路径，完整路径为:
- Home: /game
- Team: /game/team
- Match: /game/match
- Transfer: /game/transfer
- Settings: /game/settings
