<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="not-found">
    <div class="content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-description">抱歉，您访问的页面不存在</p>
      <button class="back-btn" @click="goHome">
        返回首页
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.content {
  text-align: center;
  color: white;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.error-title {
  font-size: 32px;
  margin: 20px 0 10px;
}

.error-description {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 30px;
}

.back-btn {
  padding: 15px 40px;
  background: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.back-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (min-width: 768px) {
  .not-found {
    max-width: 480px;
    margin: 0 auto;
  }
}
</style>
