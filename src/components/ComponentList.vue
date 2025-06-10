<template>
  <div class="component-list">
    <!-- 容器组件 -->
    <el-card class="component-category" shadow="never">
      <template #header>
        <div class="category-header">
          <el-icon><Box /></el-icon>
          <span>容器组件</span>
        </div>
      </template>
      
      <el-space direction="vertical" fill>
        <el-card
          v-for="(config, type) in containerComponents"
          :key="type"
          class="component-item container-item"
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

    <!-- 普通组件 -->
    <el-card class="component-category" shadow="never">
      <template #header>
        <div class="category-header">
          <el-icon><Grid /></el-icon>
          <span>普通组件</span>
        </div>
      </template>
      
      <el-space direction="vertical" fill>
        <el-card
          v-for="(config, type) in normalComponents"
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
import { computed } from 'vue'
import { Picture, Crop, Switch, ArrowRight, Grid, Box } from '@element-plus/icons-vue'
import { componentMap } from '../stores/editor'

// 图标映射表
const iconMap = {
  fade: Picture,
  zeroHeight: Crop,
  clickSwitch: Switch,
  stretch: ArrowRight,
  scroll: Box,
  'vertical-scroll': Box
}

// 获取对应的图标组件
const getIconComponent = (type) => {
  return iconMap[type] || Grid
}

// 区分容器和普通组件
const containerComponents = computed(() => {
  const containers = {}
  for (const [type, config] of Object.entries(componentMap)) {
    if (config.isContainer) {
      containers[type] = config
    }
  }
  return containers
})

const normalComponents = computed(() => {
  const normal = {}
  for (const [type, config] of Object.entries(componentMap)) {
    if (!config.isContainer) {
      normal[type] = config
    }
  }
  return normal
})

const handleDragStart = (event, type) => {
  event.dataTransfer.setData('componentType', type)
}
</script>

<style  scoped>
.component-list {
  padding: 8px;
  width: 180px;
  height: calc(100vh - 110px);
  overflow-y: auto;
  font-size: 10px;
}

.component-category {
  margin-bottom: 12px;
}

.component-category:last-child {
  margin-bottom: 0;
}

.component-category :deep(.el-card__header) {
  padding: 8px 12px;
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

.container-item {
  border: 1px dashed var(--el-color-primary-light-5);
  background-color: var(--el-color-primary-light-9);
}

.component-item:hover {
  border-color: var(--el-color-primary);
}

.item-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
}

:deep(.el-space__item:last-child .component-item) {
  margin-bottom: 0;
}

.el-icon {
  font-size: 14px;
  color: #909399;
}
</style> 