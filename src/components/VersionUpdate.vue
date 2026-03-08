<template>
  <div v-if="visible" class="version-update-modal" @click="handleBackdropClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>🎮 版本更新通知</h3>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <div class="version-info">
          <span class="version-number">v{{ version?.version }}</span>
          <span class="release-date">{{ formatDate(version?.releaseDate) }}</span>
        </div>

        <div v-if="highlights.length > 0" class="highlights">
          <h4>📋 更新要点</h4>
          <ul>
            <li v-for="(highlight, index) in highlights" :key="index">
              {{ highlight }}
            </li>
          </ul>
        </div>

        <div class="characteristics" v-if="version?.characteristics">
          <h4>🎯 版本特点</h4>
          <div class="char-item">
            <span class="label">节奏：</span>
            <span class="value">{{ getPaceName(version.characteristics.pace) }}</span>
          </div>
          <div class="char-item">
            <span class="label">主流：</span>
            <span class="value">{{ getMetaName(version.characteristics.meta) }}</span>
          </div>
          <div class="char-item">
            <span class="label">强势位置：</span>
            <span class="value">{{ getRoleNames(version.characteristics.dominantRoles) }}</span>
          </div>
        </div>

        <div class="changes-section">
          <div v-if="buffs.length > 0" class="change-group buffs">
            <h4>📈 英雄加强 ({{ buffs.length }})</h4>
            <div class="change-list">
              <div v-for="change in buffs.slice(0, 3)" :key="change.heroId" class="change-item">
                <span class="hero-name">{{ change.heroName }}</span>
                <span class="tier-change" v-if="change.tierChange.from !== change.tierChange.to">
                  T{{ change.tierChange.from }} → T{{ change.tierChange.to }}
                </span>
              </div>
              <div v-if="buffs.length > 3" class="more-count">
                +{{ buffs.length - 3 }} 更多
              </div>
            </div>
          </div>

          <div v-if="nerfs.length > 0" class="change-group nerfs">
            <h4>📉 英雄削弱 ({{ nerfs.length }})</h4>
            <div class="change-list">
              <div v-for="change in nerfs.slice(0, 3)" :key="change.heroId" class="change-item">
                <span class="hero-name">{{ change.heroName }}</span>
                <span class="tier-change" v-if="change.tierChange.from !== change.tierChange.to">
                  T{{ change.tierChange.from }} → T{{ change.tierChange.to }}
                </span>
              </div>
              <div v-if="nerfs.length > 3" class="more-count">
                +{{ nerfs.length - 3 }} 更多
              </div>
            </div>
          </div>

          <div v-if="reworks.length > 0" class="change-group reworks">
            <h4>🔄 英雄重做 ({{ reworks.length }})</h4>
            <div class="change-list">
              <div v-for="change in reworks" :key="change.heroId" class="change-item">
                <span class="hero-name">{{ change.heroName }}</span>
              </div>
            </div>
          </div>

          <div v-if="newHeroes.length > 0" class="change-group new-heroes">
            <h4>✨ 新英雄 ({{ newHeroes.length }})</h4>
            <div class="change-list">
              <div v-for="change in newHeroes" :key="change.heroId" class="change-item">
                <span class="hero-name">{{ change.heroName }}</span>
                <span class="new-badge">NEW</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="version?.mechanicChanges?.length > 0" class="mechanics-section">
          <h4>⚙️ 机制调整</h4>
          <div v-for="mechanic in version.mechanicChanges" :key="mechanic.name" class="mechanic-item">
            <span class="mechanic-name">{{ mechanic.name }}</span>
            <span class="mechanic-desc">{{ mechanic.description }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="detail-btn" @click="viewDetails">查看详情</button>
        <button class="confirm-btn" @click="confirm">确认更新</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GameVersion } from '@/types/version';
import { PACE_NAMES, META_TYPE_NAMES, DOMINANT_ROLE_NAMES } from '@/types/version';
import { getVersionHighlights } from '@/core/services/versionService';

const props = defineProps<{
  visible: boolean;
  version: GameVersion | null;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
  viewDetails: [];
}>();

const highlights = computed(() => {
  if (!props.version) return [];
  return getVersionHighlights(props.version);
});

const buffs = computed(() => {
  return props.version?.heroChanges?.filter(h => h.changeType === 'buff') || [];
});

const nerfs = computed(() => {
  return props.version?.heroChanges?.filter(h => h.changeType === 'nerf') || [];
});

const reworks = computed(() => {
  return props.version?.heroChanges?.filter(h => h.changeType === 'rework') || [];
});

const newHeroes = computed(() => {
  return props.version?.heroChanges?.filter(h => h.changeType === 'new') || [];
});

function formatDate(date?: Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
}

function getPaceName(pace: 'fast' | 'normal' | 'slow'): string {
  return PACE_NAMES[pace] || pace;
}

function getMetaName(meta: string): string {
  return META_TYPE_NAMES[meta as keyof typeof META_TYPE_NAMES] || meta;
}

function getRoleNames(roles: string[]): string {
  return roles.map(r => DOMINANT_ROLE_NAMES[r as keyof typeof DOMINANT_ROLE_NAMES] || r).join('、');
}

function close(): void {
  emit('close');
}

function handleBackdropClick(): void {
  close();
}

function confirm(): void {
  emit('confirm');
}

function viewDetails(): void {
  emit('viewDetails');
}
</script>

<style scoped>
.version-update-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #3a3a5c;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a5c;
  background: rgba(255, 255, 255, 0.05);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #888;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #fff;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.version-number {
  font-size: 24px;
  font-weight: bold;
  color: #4fc3f7;
}

.release-date {
  font-size: 14px;
  color: #888;
}

.highlights {
  background: rgba(79, 195, 247, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.highlights h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #4fc3f7;
}

.highlights ul {
  margin: 0;
  padding-left: 18px;
}

.highlights li {
  font-size: 13px;
  color: #ccc;
  margin: 4px 0;
}

.characteristics {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.characteristics h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #fff;
}

.char-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  margin: 6px 0;
}

.char-item .label {
  color: #888;
}

.char-item .value {
  color: #fff;
}

.changes-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.change-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.change-group h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
}

.change-group.buffs h4 {
  color: #52c41a;
}

.change-group.nerfs h4 {
  color: #ff4d4f;
}

.change-group.reworks h4 {
  color: #722ed1;
}

.change-group.new-heroes h4 {
  color: #1890ff;
}

.change-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 4px 0;
}

.hero-name {
  color: #fff;
}

.tier-change {
  color: #888;
  font-size: 11px;
}

.more-count {
  font-size: 11px;
  color: #888;
  text-align: center;
  margin-top: 4px;
}

.new-badge {
  background: #1890ff;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.mechanics-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.mechanics-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #faad14;
}

.mechanic-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 8px 0;
}

.mechanic-name {
  font-size: 13px;
  color: #fff;
}

.mechanic-desc {
  font-size: 12px;
  color: #888;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #3a3a5c;
}

.detail-btn {
  flex: 1;
  padding: 12px;
  background: transparent;
  color: #4fc3f7;
  border: 1px solid #4fc3f7;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn:hover {
  background: rgba(79, 195, 247, 0.1);
}

.confirm-btn {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3);
}
</style>
