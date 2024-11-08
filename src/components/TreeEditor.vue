<template>
  <div class="tree-editor">
    <div 
      class="drop-area"
      @dragover="handleDragOver"
      @drop="handleDrop"
    >
      <!-- 组件树结构 -->
      <div v-for="comp in editorStore.components" :key="comp.id">
        <div 
          class="tree-node"
          :class="{ 'selected': editorStore.selectedComponent === comp.id }"
          @click="editorStore.selectComponent(comp.id)"
        >
          <span class="node-name">{{ comp.name }}</span>
        </div>
        
        <!-- 选中时显示编辑器 -->
        <div v-if="editorStore.selectedComponent === comp.id" class="editor-panel">
          <component 
            :is="componentMap[comp.type].editor"
            :componentId="comp.id"
            v-bind="comp.props"
          />
        </div>
      </div>

      <div v-if="!editorStore.components.length" class="empty-tip">
        拖拽组件到此处
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
  if (componentType) {
    editorStore.addComponent(componentType)
  }
}
</script>

<style scoped>
.tree-editor {
  height: 100%;
  padding: 16px;
  background: #fff;
  border-radius: 4px;
}

.drop-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tree-node {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.tree-node.selected {
  border-color: #1890ff;
}

.node-name {
  padding: 8px 12px;
  background: #f5f5f5;
}

.editor-panel {
  padding: 12px;
}

.empty-tip {
  padding: 24px;
  text-align: center;
  color: #999;
  border: 2px dashed #ddd;
  border-radius: 4px;
}
</style> 