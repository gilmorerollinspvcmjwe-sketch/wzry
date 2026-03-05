<template>
  <div class="todo-list-card">
    <div class="todo-header">
      <h3 class="todo-title">待处理事项</h3>
      <span v-if="todos.length > 0" class="todo-badge">{{ todos.length }}</span>
    </div>

    <div v-if="todos.length === 0" class="todo-empty">
      <p>🎉 暂无待处理事项</p>
    </div>

    <div v-else class="todo-items">
      <div
        v-for="(todo, index) in todos"
        :key="index"
        class="todo-item"
        :class="todo.priority"
        @click="handleTodoClick(todo)"
      >
        <div class="todo-dot" :class="todo.priority"></div>
        <div class="todo-content">
          <p class="todo-message">{{ todo.message }}</p>
          <span class="todo-type">{{ getTypeLabel(todo.type) }}</span>
        </div>
        <div class="todo-action">
          <span class="arrow">›</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

export interface Todo {
  id: string;
  type: 'sponsor' | 'player_contract' | 'transfer' | 'facility' | 'injury' | 'finance';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action?: string;
  data?: any;
}

const props = defineProps<{
  todos: Todo[];
}>();

const emit = defineEmits<{
  action: [todo: Todo];
}>();

const router = useRouter();

const getTypeLabel = (type: Todo['type']) => {
  const labels: Record<Todo['type'], string> = {
    sponsor: '赞助商',
    player_contract: '选手合同',
    transfer: '转会',
    facility: '设施',
    injury: '伤病',
    finance: '财务',
  };
  return labels[type];
};

const handleTodoClick = (todo: Todo) => {
  emit('action', todo);

  // 根据类型跳转到对应页面
  switch (todo.type) {
    case 'sponsor':
      router.push('/game/sponsor');
      break;
    case 'player_contract':
    case 'transfer':
      router.push('/game/team');
      break;
    case 'facility':
      router.push('/game/settings');
      break;
    case 'injury':
      router.push('/game/team');
      break;
    case 'finance':
      // 财务问题在当前页面处理或跳转
      break;
  }
};
</script>

<style scoped>
.todo-list-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.todo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.todo-title {
  font-size: 16px;
  color: #333;
  margin: 0;
}

.todo-badge {
  background: #dc3545;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
}

.todo-empty {
  text-align: center;
  padding: 20px;
  color: #999;
}

.todo-empty p {
  margin: 0;
  font-size: 14px;
}

.todo-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.todo-item:active {
  background: #f0f0f0;
}

.todo-item.high {
  border-left-color: #dc3545;
  background: #fff5f5;
}

.todo-item.medium {
  border-left-color: #ffc107;
  background: #fffbf0;
}

.todo-item.low {
  border-left-color: #007bff;
  background: #f0f8ff;
}

.todo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.todo-dot.high {
  background: #dc3545;
}

.todo-dot.medium {
  background: #ffc107;
}

.todo-dot.low {
  background: #007bff;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-message {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.todo-type {
  font-size: 11px;
  color: #999;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.todo-action {
  color: #999;
  font-size: 20px;
}

.arrow {
  line-height: 1;
}
</style>