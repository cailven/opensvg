<template>
  <div class="tree-editor">
    <div 
      class="drop-area"
      @dragover="handleDragOver"
      @drop="handleDrop"
    >
      <!-- 只在组件被拖入空白区域时添加新组件 -->
      <div v-if="!editorStore.components.length" class="empty-tip">
        拖拽组件到此处
      </div>
      
      <!-- 其他部分保持不变 -->
      <div v-for="comp in topLevelComponents" :key="comp.id">
        <div 
          class="tree-node"
          :class="{ 'selected': editorStore.selectedComponent === comp.id }"
          draggable="true"
          @dragstart="handleNodeDragStart($event, comp)"
          @dragover="handleNodeDragOver($event, comp)"
          @drop="handleNodeDrop($event, comp)"
          @click="editorStore.selectComponent(comp.id)"
        >
          <span class="node-name">{{ comp.name }}</span>
          <div class="node-actions">
            <button class="delete-btn" @click.stop="deleteComponent(comp.id)">
              <i class="icon-delete">×</i>
            </button>
          </div>
        </div>

        <!-- 如果是容器组件，渲染其子组件 -->
        <div v-if="comp.type === 'zeroHeight'" class="child-components">
          <div 
            v-for="child in getChildComponents(comp.id)" 
            :key="child.id"
            class="tree-node child-node"
            :class="{ 'selected': editorStore.selectedComponent === child.id }"
            draggable="true"
            @dragstart="handleNodeDragStart($event, child)"
            @click="editorStore.selectComponent(child.id)"
          >
            <span class="node-name">{{ child.name }}</span>
            <div class="node-actions">
              <button class="delete-btn" @click.stop="deleteComponent(child.id)">
                <i class="icon-delete">×</i>
              </button>
            </div>
          </div>
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
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../stores/editor'
import { componentMap } from '../stores/editor'

const editorStore = useEditorStore()

// 获取顶层组件（没有parentId的组件）
const topLevelComponents = computed(() => {
  return editorStore.components.filter(comp => !comp.parentId)
})

// 获取指定父组件的子组件
const getChildComponents = (parentId) => {
  return editorStore.components.filter(comp => comp.parentId === parentId)
}

// 删除组件
const deleteComponent = (id) => {
  if (confirm('确定要删除该组件吗？')) {
    editorStore.deleteComponent(id)
  }
}

// 组件拖拽相关
const handleNodeDragStart = (event, comp) => {
  event.dataTransfer.setData('componentId', comp.id)
}

const handleNodeDragOver = (event) => {
  event.preventDefault()
}

const handleNodeDrop = (event, targetComp) => {
  event.preventDefault()
  const componentId = event.dataTransfer.getData('componentId')
  if (componentId && componentId !== targetComp.id) {
    editorStore.moveComponent(componentId, targetComp.id)
  }
}

// 从组件列表拖入新组件
const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  event.preventDefault()
  const componentType = event.dataTransfer.getData('componentType')
  const componentId = event.dataTransfer.getData('componentId')
  
  // 处理从组件列表拖入的新组件
  if (componentType) {
    editorStore.addComponent(componentType)
  } 
  // 处理组件之间的位置调整
  else if (componentId) {
    const targetComp = editorStore.components.find(c => c.id === componentId)
    if (targetComp && targetComp.parentId) {
      // 如果是子组件，清除其父组件关系
      editorStore.updateComponentParent(componentId, null)
    }
  }
}
</script>

<style scoped>
.tree-editor {
  height: 100%;
  background: #fff;
  overflow-y: auto;
 
}

.drop-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  cursor: move;
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
  margin-top: 20px;
  padding: 20px;
  text-align: center;
  color: #999;
  border: 2px dashed #ddd;
  border-radius: 4px;
}

.node-actions {
  display: flex;
  gap: 4px;
  padding-right: 8px;
}

.delete-btn {
  padding: 2px 6px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.delete-btn:hover {
  color: #ff4d4f;
}

.child-components {
  margin-left: 20px;
  margin-top: 8px;
}

.child-node {
  border-left: 2px solid #1890ff;
}
</style> 