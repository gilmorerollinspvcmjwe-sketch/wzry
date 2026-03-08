<template>
  <div class="more-page">
    <h2 class="page-title">更多</h2>

    <div class="menu-list">
      <div class="menu-group">
        <h3 class="group-title">俱乐部管理</h3>
        <div class="menu-items">
          <div class="menu-item" @click="goTo(RouteNames.Sponsor)">
            <span class="icon">🤝</span>
            <span class="label">赞助商</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Coach)">
            <span class="icon">👔</span>
            <span class="label">教练团队</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Venue)">
            <span class="icon">🏟️</span>
            <span class="label">主场管理</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Finance)">
            <span class="icon">💰</span>
            <span class="label">财务中心</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Community)">
            <span class="icon">👥</span>
            <span class="label">粉丝社区</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Youth)">
            <span class="icon">🌱</span>
            <span class="label">青训系统</span>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>

      <div class="menu-group">
        <h3 class="group-title">数据中心</h3>
        <div class="menu-items">
          <div class="menu-item" @click="goTo(RouteNames.League)">
            <span class="icon">🏅</span>
            <span class="label">联赛详情</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Transfer)">
            <span class="icon">🔄</span>
            <span class="label">转会市场</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Heroes)">
            <span class="icon">🎮</span>
            <span class="label">英雄图鉴</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Achievements)">
            <span class="icon">🏆</span>
            <span class="label">成就系统</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Objectives)">
            <span class="icon">🎯</span>
            <span class="label">赛季目标</span>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>

      <div class="menu-group">
        <h3 class="group-title">媒体与社交</h3>
        <div class="menu-items">
          <div class="menu-item" @click="goTo(RouteNames.Media)">
            <span class="icon">📰</span>
            <span class="label">媒体中心</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.News)">
            <span class="icon">📋</span>
            <span class="label">新闻动态</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Interview)">
            <span class="icon">🎤</span>
            <span class="label">采访管理</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Social)">
            <span class="icon">📱</span>
            <span class="label">社交媒体</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Fans)">
            <span class="icon">❤️</span>
            <span class="label">粉丝与声望</span>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>

      <div class="menu-group">
        <h3 class="group-title">战术与比赛</h3>
        <div class="menu-items">
          <div class="menu-item" @click="goTo(RouteNames.Tactics)">
            <span class="icon">📊</span>
            <span class="label">战术配置</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Events)">
            <span class="icon">📅</span>
            <span class="label">事件中心</span>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>

      <div class="menu-group">
        <h3 class="group-title">系统</h3>
        <div class="menu-items">
          <div class="menu-item" @click="goTo(RouteNames.Version)">
            <span class="icon">📱</span>
            <span class="label">版本更新</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" @click="goTo(RouteNames.Settings)">
            <span class="icon">⚙️</span>
            <span class="label">设置</span>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { RouteNames } from '@/constants/routes';

const router = useRouter();

const goTo = (name: string) => {
  router.push({ name });
};
</script>

<style scoped>
.more-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.menu-group {
  margin-bottom: 20px;
}

.group-title {
  font-size: 13px;
  color: #999;
  margin: 0 0 10px 15px;
  text-transform: uppercase;
}

.menu-items {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f9f9f9;
}

.menu-item .icon {
  font-size: 20px;
  margin-right: 12px;
}

.menu-item .label {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.menu-item .arrow {
  font-size: 20px;
  color: #ccc;
}
</style>
