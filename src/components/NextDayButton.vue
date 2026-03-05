<template>
  <div class="next-day-container">
    <button
      class="next-day-ball"
      :class="{ 'is-pressing': isPressing }"
      @mousedown="startPress"
      @mouseup="endPress"
      @mouseleave="cancelPress"
      @touchstart="startPress"
      @touchend="endPress"
      @touchcancel="cancelPress"
    >
      <div class="ball-inner">
        <span class="ball-text">下一天</span>
      </div>
      <div class="ball-shadow"></div>
    </button>
    <p class="next-day-hint">点击推进下一天</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  click: [];
}>();

const isPressing = ref(false);
const pressTimer = ref<number | null>(null);

const startPress = () => {
  isPressing.value = true;
};

const endPress = () => {
  isPressing.value = false;
  emit('click');
};

const cancelPress = () => {
  isPressing.value = false;
};
</script>

<style scoped>
.next-day-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
}

.next-day-ball {
  position: relative;
  width: 80px;
  height: 80px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.ball-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, #4facfe 0%, #00f2fe 50%, #0099ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 20px rgba(79, 172, 254, 0.4),
    inset 0 -4px 10px rgba(0, 0, 0, 0.2),
    inset 0 4px 10px rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
  position: relative;
  z-index: 2;
}

.ball-text {
  font-size: 14px;
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.ball-shadow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 12px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  filter: blur(4px);
  transition: all 0.2s ease;
  z-index: 1;
}

.next-day-ball.is-pressing .ball-inner {
  transform: scale(0.95) translateY(4px);
  box-shadow:
    0 4px 10px rgba(79, 172, 254, 0.3),
    inset 0 -2px 8px rgba(0, 0, 0, 0.2),
    inset 0 2px 8px rgba(255, 255, 255, 0.2);
}

.next-day-ball.is-pressing .ball-shadow {
  width: 50px;
  height: 8px;
  opacity: 0.5;
}

.next-day-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.next-day-ball:not(.is-pressing) .ball-inner {
  animation: pulse 2s ease-in-out infinite;
}
</style>
