<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { InitService } from '@/core/services/initService';
import type { Difficulty } from '@/types';

const router = useRouter();

const clubName = ref('我的俱乐部');
const difficulty = ref<Difficulty>('normal');
const showNewGame = ref(false);

// 使用 computed 使 hasSave 保持响应式
const hasSave = computed(() => InitService.hasSave());

// 开始新游戏
const startNewGame = () => {
  console.log('点击开始游戏');
  console.log('俱乐部名称:', clubName.value);
  console.log('难度:', difficulty.value);
  
  if (!clubName.value.trim()) {
    alert('请输入俱乐部名称');
    return;
  }
  
  try {
    console.log('调用 InitService.newGame...');
    const result = InitService.newGame(clubName.value, difficulty.value);
    console.log('初始化结果:', result);
    console.log('准备跳转到 /game');
    router.push('/game');
  } catch (error) {
    console.error('启动游戏失败:', error);
    alert('启动游戏失败：' + (error instanceof Error ? error.message : '未知错误'));
  }
};

// 继续游戏
const continueGame = () => {
  const latestSave = InitService.getLatestSave();
  if (latestSave) {
    try {
      InitService.continueGame(latestSave);
      router.push('/game');
    } catch (error) {
      console.error('读取存档失败:', error);
      alert('读取存档失败，请重试');
    }
  }
};
</script>

<template>
  <div class="start-menu">
    <div class="logo-section">
      <h1 class="game-title">KPL 模拟器</h1>
      <p class="game-subtitle">KPL Club Simulator</p>
    </div>
    
    <div class="menu-content" v-if="!showNewGame">
      <button class="menu-btn" @click="showNewGame = true">
        <span class="btn-icon">🎮</span>
        <span>新游戏</span>
      </button>
      
      <button 
        class="menu-btn" 
        @click="continueGame"
        :disabled="!hasSave"
      >
        <span class="btn-icon">💾</span>
        <span>继续游戏</span>
      </button>
      
      <div class="version-info">
        v0.1.0 - Alpha 版本
      </div>
    </div>
    
    <!-- 新游戏表单 -->
    <div class="new-game-form" v-else>
      <h2 class="form-title">创建俱乐部</h2>
      
      <div class="form-group">
        <label>俱乐部名称</label>
        <input 
          type="text" 
          v-model="clubName"
          placeholder="输入俱乐部名称"
          maxlength="20"
        />
      </div>
      
      <div class="form-group">
        <label>难度选择</label>
        <div class="difficulty-options">
          <label class="difficulty-option">
            <input type="radio" v-model="difficulty" value="easy" />
            <span>简单</span>
          </label>
          <label class="difficulty-option">
            <input type="radio" v-model="difficulty" value="normal" />
            <span>普通</span>
          </label>
          <label class="difficulty-option">
            <input type="radio" v-model="difficulty" value="hard" />
            <span>困难</span>
          </label>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn-cancel" @click="showNewGame = false">
          返回
        </button>
        <button class="btn-confirm" @click="startNewGame">
          开始游戏
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.start-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.logo-section {
  text-align: center;
  margin-bottom: 50px;
}

.game-title {
  font-size: 48px;
  font-weight: bold;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.game-subtitle {
  font-size: 18px;
  color: rgba(255,255,255,0.9);
  margin-top: 10px;
}

.menu-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 300px;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px 40px;
  background: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.menu-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.menu-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 24px;
}

.version-info {
  text-align: center;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  margin-top: 30px;
}

.new-game-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.form-title {
  font-size: 24px;
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.difficulty-options {
  display: flex;
  gap: 15px;
}

.difficulty-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.difficulty-option:hover {
  background: #e9ecef;
}

.difficulty-option input[type="radio"] {
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-confirm {
  background: #667eea;
  color: white;
}

.btn-confirm:hover {
  background: #5568d3;
}

@media (min-width: 768px) {
  .start-menu {
    max-width: 480px;
    margin: 0 auto;
  }
}
</style>