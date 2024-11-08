<template>
  <div class="editor">
    <!-- 其他编辑器内容 -->
    <div class="editor-canvas"
      @dragover="handleDragOver"
      @drop="handleDrop"
    >
      <template v-if="editorStore.components.length">
        <component 
          v-for="comp in editorStore.components"
          :key="comp.id"
          :is="componentMap[comp.type]"
        />
      </template>
      <div v-else class="empty-tip">
        拖拽组件到这里
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEditorStore } from '../stores/editor'
import { componentMap } from '../stores/editor'

const editorStore = useEditorStore()

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  event.preventDefault()
  const componentType = event.dataTransfer.getData('componentType')
  console.log('drop', componentType)
  if (componentType) {
    editorStore.addComponent(componentType)
  }
}
</script>

<style scoped>
.editor-canvas {
  min-height: 500px;
  border: 1px solid #ddd;
  padding: 20px;
  background: #f5f5f5;
}

.empty-tip {
  color: #999;
  text-align: center;
  padding: 20px;
}
</style> 