<template>
  <div class="component-list">
    <div
      class="component-item"
      draggable="true"
      @dragstart="handleDragStart($event, 'fade')"
    >
      无缝图组件
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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: move;
}

.component-item:hover {
  background: #f5f5f5;
}
</style> 