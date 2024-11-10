<template>
  <div class="component-list">
    <div
      class="component-item"
      draggable="true"
      @dragstart="handleDragStart($event, 'fade')"
    >
      无缝图
    </div>
    <div
      class="component-item"
      draggable="true"
      @dragstart="handleDragStart($event, 'zeroHeight')"
    >
      零高容器
    </div>
  </div>
</template>

<script setup>
const handleDragStart = (event, type) => {
  event.dataTransfer.setData('componentType', type)
}
</script>

<style scoped>
.component-list {
  padding: 10px;
}

.component-item {
  padding: 10px;
  margin-bottom: 8px;
  background: #f0f2f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: move;
  text-align: center;
}

.component-item:hover {
  background: #e6e8eb;
}
</style> 