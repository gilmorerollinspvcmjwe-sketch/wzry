<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useGameStore } from '@/stores/game';
import { useMatchStore } from '@/stores/match';
import type { Difficulty } from '@/types';

const router = useRouter();
const clubStore = useClubStore();
const gameStore = useGameStore();
const matchStore = useMatchStore();

const showSaveModal = ref(false);
const showLoadModal = ref(false);
const showConfirmModal = ref(false);
const confirmAction = ref<'new' | 'quit' | null>(null);
const saveSlots = ref<string[]>([]);

// 当前难度
const currentDifficulty = computed(() => gameStore.settings.difficulty);

// 自动保存设置
const autoSave = computed({
  get: () => gameStore.settings.autoSave,
  set: (value) => {
    gameStore.settings.autoSave = value;
  }
});

// 游戏速度
const gameSpeed = computed({
  get: () => gameStore.gameSpeed,
  set: (value) => {
    gameStore.gameSpeed = value;
  }
});

// 存档列表
const getSaveSlots = () => {
  const saves: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('save_')) {
      saves.push(key);
    }
  }
  return saves.sort();
};

// 保存游戏
const saveGame = () => {
  gameStore.saveGame();
  alert(`游戏已保存`);
  showSaveModal.value = false;
};

// 加载存档列表
const loadSaveList = () => {
  saveSlots.value = getSaveSlots();
  showLoadModal.value = true;
};

// 加载游戏
const loadGame = (saveId: string) => {
  try {
    gameStore.loadGame(saveId);
    alert('存档加载成功');
    showLoadModal.value = false;
    router.push('/game');
  } catch (error) {
    alert('加载存档失败');
  }
};

// 删除存档
const deleteSave = (saveId: string) => {
  if (window.confirm('确定要删除这个存档吗？')) {
    localStorage.removeItem(saveId);
    saveSlots.value = getSaveSlots();
  }
};

// 设置难度
const setDifficulty = (difficulty: Difficulty) => {
  gameStore.settings.difficulty = difficulty;
  alert(`难度已设置为: ${difficulty === 'easy' ? '简单' : difficulty === 'normal' ? '普通' : '困难'}`);
};

// 确认操作
const confirm = (action: 'new' | 'quit') => {
  confirmAction.value = action;
  showConfirmModal.value = true;
};

// 执行确认的操作
const executeConfirm = () => {
  if (confirmAction.value === 'new') {
    // 清除所有数据
    localStorage.clear();
    router.push('/');
  } else if (confirmAction.value === 'quit') {
    router.push('/');
  }
  showConfirmModal.value = false;
};

// 格式化存档时间
const formatSaveTime = (saveId: string) => {
  const timestamp = parseInt(saveId.replace('save_', ''));
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 获取游戏统计
const gameStats = computed(() => {
  // 处理日期可能是字符串的情况
  const currentDate = gameStore.currentDate instanceof Date 
    ? gameStore.currentDate 
    : new Date(gameStore.currentDate);
  
  return {
    clubName: clubStore.currentClub?.name || '-',
    season: gameStore.currentSeason,
    date: `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`,
    rosterCount: clubStore.currentClub?.roster.length || 0,
    matchesPlayed: matchStore.matchHistory.length,
    winRate: matchStore.winRate,
    funds: clubStore.currentClub?.funds || 0,
  };
});
</script>

<template>
  <div class="settings-page">
    <h2 class="page-title">游戏设置</h2>
    
    <!-- 游戏信息 -->
    <div class="info-card">
      <h3>当前游戏</h3>
      <div class="info-list">
        <div class="info-item">
          <span class="label">俱乐部</span>
          <span class="value">{{ gameStats.clubName }}</span>
        </div>
        <div class="info-item">
          <span class="label">赛季</span>
          <span class="value">第 {{ gameStats.season }} 赛季</span>
        </div>
        <div class="info-item">
          <span class="label">日期</span>
          <span class="value">{{ gameStats.date }}</span>
        </div>
        <div class="info-item">
          <span class="label">阵容</span>
          <span class="value">{{ gameStats.rosterCount }} 人</span>
        </div>
        <div class="info-item">
          <span class="label">战绩</span>
          <span class="value">{{ gameStats.matchesPlayed }} 场 {{ gameStats.winRate }}% 胜率</span>
        </div>
        <div class="info-item">
          <span class="label">资金</span>
          <span class="value highlight">{{ gameStats.funds }}万</span>
        </div>
      </div>
    </div>
    
    <!-- 游戏设置 -->
    <div class="settings-card">
      <h3>游戏设置</h3>
      
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-name">游戏难度</span>
          <span class="setting-desc">影响比赛难度和AI强度</span>
        </div>
        <div class="difficulty-buttons">
          <button 
            class="diff-btn"
            :class="{ active: currentDifficulty === 'easy' }"
            @click="setDifficulty('easy')"
          >
            简单
          </button>
          <button 
            class="diff-btn"
            :class="{ active: currentDifficulty === 'normal' }"
            @click="setDifficulty('normal')"
          >
            普通
          </button>
          <button 
            class="diff-btn"
            :class="{ active: currentDifficulty === 'hard' }"
            @click="setDifficulty('hard')"
          >
            困难
          </button>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-name">自动保存</span>
          <span class="setting-desc">每周自动保存游戏进度</span>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="autoSave">
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-name">游戏速度</span>
          <span class="setting-desc">调整时间推进速度</span>
        </div>
        <div class="speed-control">
          <input 
            type="range" 
            v-model.number="gameSpeed" 
            min="1" 
            max="3" 
            step="1"
          >
          <span class="speed-label">{{ gameSpeed }}x</span>
        </div>
      </div>
    </div>
    
    <!-- 存档管理 -->
    <div class="settings-card">
      <h3>存档管理</h3>
      
      <div class="action-list">
        <button class="action-item" @click="saveGame">
          <span class="action-icon">💾</span>
          <div class="action-info">
            <span class="action-name">保存游戏</span>
            <span class="action-desc">立即保存当前进度</span>
          </div>
        </button>
        
        <button class="action-item" @click="loadSaveList">
          <span class="action-icon">📂</span>
          <div class="action-info">
            <span class="action-name">加载存档</span>
            <span class="action-desc">读取已保存的游戏</span>
          </div>
        </button>
      </div>
    </div>
    
    <!-- 游戏操作 -->
    <div class="settings-card">
      <h3>游戏操作</h3>
      
      <div class="action-list">
        <button class="action-item warning" @click="confirm('new')">
          <span class="action-icon">🔄</span>
          <div class="action-info">
            <span class="action-name">重新开始</span>
            <span class="action-desc">清空所有数据，开始新游戏</span>
          </div>
        </button>
        
        <button class="action-item danger" @click="confirm('quit')">
          <span class="action-icon">🚪</span>
          <div class="action-info">
            <span class="action-name">退出游戏</span>
            <span class="action-desc">返回主菜单</span>
          </div>
        </button>
      </div>
    </div>
    
    <!-- 关于 -->
    <div class="about-section">
      <p class="version">KPL 模拟器 v0.1.0</p>
      <p class="copyright">© 2024 KPL Simulator</p>
    </div>
    
    <!-- 存档列表弹窗 -->
    <div v-if="showLoadModal" class="modal-overlay" @click="showLoadModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>选择存档</h3>
          <button class="close-btn" @click="showLoadModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="saveSlots.length === 0" class="empty-state">
            <p>暂无存档</p>
          </div>
          
          <div v-else class="save-list">
            <div 
              v-for="saveId in saveSlots" 
              :key="saveId"
              class="save-item"
            >
              <div class="save-info" @click="loadGame(saveId)">
                <span class="save-time">{{ formatSaveTime(saveId) }}</span>
              </div>
              <button class="delete-btn" @click.stop="deleteSave(saveId)">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 确认弹窗 -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h3>确认操作</h3>
        </div>
        
        <div class="modal-body">
          <p class="confirm-text">
            <span v-if="confirmAction === 'new'">确定要重新开始吗？所有数据将被清空！</span>
            <span v-else-if="confirmAction === 'quit'">确定要退出到主菜单吗？</span>
          </p>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="showConfirmModal = false">
            取消
          </button>
          <button 
            class="confirm-btn"
            :class="{ danger: confirmAction === 'new' }"
            @click="executeConfirm"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

/* 卡片样式 */
.info-card,
.settings-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-card h3,
.settings-card h3 {
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 信息列表 */
.info-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 12px;
  color: #999;
}

.info-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.info-item .value.highlight {
  color: #28a745;
  font-weight: bold;
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.setting-desc {
  font-size: 12px;
  color: #999;
}

/* 难度按钮 */
.difficulty-buttons {
  display: flex;
  gap: 8px;
}

.diff-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.diff-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* 开关 */
.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #007bff;
}

input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* 速度控制 */
.speed-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.speed-control input[type="range"] {
  width: 80px;
}

.speed-label {
  font-size: 14px;
  color: #007bff;
  font-weight: bold;
  min-width: 25px;
}

/* 操作列表 */
.action-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
}

.action-item:active {
  background: #f9f9f9;
}

.action-item.warning {
  border-color: #ffc107;
}

.action-item.danger {
  border-color: #dc3545;
}

.action-icon {
  font-size: 24px;
}

.action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.action-desc {
  font-size: 12px;
  color: #999;
}

/* 关于 */
.about-section {
  text-align: center;
  padding: 20px;
  color: #999;
}

.version {
  font-size: 14px;
  margin-bottom: 5px;
}

.copyright {
  font-size: 12px;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.confirm-modal {
  max-width: 320px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.save-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.save-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.save-info {
  flex: 1;
  cursor: pointer;
}

.save-time {
  font-size: 14px;
  color: #333;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
}

.confirm-text {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.modal-footer button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #007bff;
  color: white;
}

.confirm-btn.danger {
  background: #dc3545;
}
</style>
