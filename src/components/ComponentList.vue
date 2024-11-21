<template>
  <div class="component-list">
    <el-card class="component-category" shadow="never">
      <template #header>
        <div class="category-header">
          <el-icon><Grid /></el-icon>
          <span>可用组件</span>
        </div>
      </template>
      
      <el-space direction="vertical" fill>
        <el-card
          v-for="(config, type) in componentMap"
          :key="type"
          class="component-item"
          shadow="hover"
          draggable="true"
          @dragstart="handleDragStart($event, type)"
        >
          <div class="item-content">
            <el-icon>
              <component :is="getIconComponent(type)" />
            </el-icon>
            <span>{{ config.name }}</span>
          </div>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { Picture, Crop, Switch, ArrowRight, Grid } from '@element-plus/icons-vue'
import { componentMap } from '../stores/editor'

// 图标映射表
const iconMap = {
  fade: Picture,
  zeroHeight: Crop,
  clickSwitch: Switch,
  stretch: ArrowRight
}

// 获取对应的图标组件
const getIconComponent = (type) => {
  return iconMap[type] || Grid // 如果没有对应的图标，使用默认图标
}

const handleDragStart = (event, type) => {
  event.dataTransfer.setData('componentType', type)
}
</script>

<style scoped>
.component-list {
  padding: 10px;
  width: 200px;
}

.component-category :deep(.el-card__header) {
  padding: 10px 15px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #606266;
}

.component-item {
  cursor: move;
  margin-bottom: 0 !important;
}

.component-item:hover {
  border-color: var(--el-color-primary);
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}

:deep(.el-space__item:last-child .component-item) {
  margin-bottom: 0;
}

.el-icon {
  font-size: 16px;
  color: #909399;
}
</style> 