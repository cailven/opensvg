<template>
  <div class="system-header">
    <div class="system-logo">
      <img src="..." alt="logo" />
    </div>
    <div class="system-actions">
      <!-- 原有的系统操作按钮 -->
    </div>
  </div>
</template>

<script setup>
// 从 App.vue 迁移相关的逻辑
</script>

<style scoped>
.system-header {
  height: 60px;
  background: #fff;
  padding: 0 20px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
}

// ... 其他相关样式
</style> 