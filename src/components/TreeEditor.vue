<template>
  <div 
    class="tree-editor"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >

  <div class="tree-editor-container">
    <div v-if="!editorStore.components.length" class="empty-tip">
      拖拽组件到此处
    </div>
    <el-tree
      v-else
      :data="treeData"
      :props="defaultProps"
      draggable
      @node-drag-start="handleDragStart"
      @node-drag-enter="handleDragEnter"
      @node-drag-leave="handleDragLeave" 
      @node-drag-end="handleDragEnd"
      @node-drop="handleNodeDrop"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <span 
            class="node-content"
            :class="{ 'selected': editorStore.selectedComponent === data.id }"
          >
            <span v-if="data.type === 'fade'" class="preview-thumb">
              <img 
                v-if="data.props?.imageUrl" 
                :src="data.props.imageUrl" 
                alt="预览"
              />
              <span v-else class="no-image">无图片</span>
            </span>
            <span class="node-label">{{ data.name }}</span>
          </span>
          <span class="node-actions">
            <el-button
              type="danger"
              link
              size="small"
              @click.stop="handleDelete(data)"
            >
              删除
            </el-button>
          </span>
        </div>
      </template>
    </el-tree>

  </div>
    

    <!-- 编辑器面板 -->
    <div v-if="editorStore.selectedComponent && currentComponent" class="editor-panel">
      <component
        :is="componentMap[currentComponent.type]?.editor"
        :componentId="editorStore.selectedComponent"
        v-bind="currentComponent.props"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../stores/editor'
import { componentMap } from '../stores/editor'
import { ElTree, ElButton } from 'element-plus'

const editorStore = useEditorStore()

// 转换数据为树形结构
const treeData = computed(() => {
  const topLevel = editorStore.components.filter(comp => !comp.parentId)
  
  const buildTree = (components) => {
    return components.map(comp => ({
      ...comp,
      children: comp.type === 'zeroHeight' 
        ? buildTree(editorStore.components.filter(c => c.parentId === comp.id))
        : []
    }))
  }
  
  return buildTree(topLevel)
})

const defaultProps = {
  children: 'children',
  label: 'name'
}

// 获取当前选中组件
const currentComponent = computed(() => {
  return editorStore.components.find(c => c.id === editorStore.selectedComponent)
})

// 处理节点点击
const handleNodeClick = (data) => {
  editorStore.selectComponent(data.id)
}

// 删除组件
const handleDelete = (data) => {
  if (confirm('确定要删除该组件吗？')) {
    // 如果删除的是当前选中的组件，先清除选中状态
    if (editorStore.selectedComponent === data.id) {
      editorStore.selectComponent(null)
    }
    editorStore.deleteComponent(data.id)
  }
}

// 拖拽相关处理
const handleDragStart = (node, ev) => {
  ev.dataTransfer.setData('componentId', node.data.id)
}

const handleDragEnter = (draggingNode, dropNode, ev) => {
  ev.preventDefault()
}

const handleDragLeave = (draggingNode, dropNode, ev) => {
  ev.preventDefault()
}

const handleDragEnd = (draggingNode, dropNode, dropType, ev) => {
  ev.preventDefault()
}

// 处理整个编辑区的拖拽
const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  event.preventDefault()
  const componentType = event.dataTransfer.getData('componentType')
  const componentId = event.dataTransfer.getData('componentId')
  
  if (componentType) {
    editorStore.addComponent(componentType)
  } else if (componentId) {
    // 从容器中拖出时，将 parentId 设为 null
    editorStore.updateComponentParent(componentId, null)
  }
}

// 重命名原来的 handleDrop 为 handleNodeDrop
const handleNodeDrop = (draggingNode, dropNode, dropType, ev) => {
  const componentId = draggingNode.data.id
  const targetId = dropNode?.data?.id // 添加可选链，因为拖到根节点时 dropNode 可能为 null
  
  
 // 如果是拖到容器内部
 if (dropType === 'inner' && dropNode?.data?.type === 'zeroHeight') {
    editorStore.updateComponentParent(componentId, targetId)
  } 
  // 如果是拖到根节点（dropNode 为 null）或其他位置
  else if (!dropNode || dropType !== 'inner') {
    editorStore.updateComponentParent(componentId, null)
  }
  // 其他情况按照正常排序处理
  else {
    editorStore.moveComponent(componentId, targetId)
  }
}

// 添加空白区域的拖拽处理
const handleEmptyAreaDragOver = (event) => {
  event.preventDefault()
}

const handleEmptyAreaDrop = (event) => {
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
  background: #fff;
  padding: 16px;
  overflow-y: auto;
  display: flex;
}

.tree-editor-container{
  width: 300px;
}

.empty-tip {
  margin: 20px;
  padding: 40px;
  text-align: center;
  color: #999;
  border: 2px dashed #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-tree) {
  min-height: 300px;
  padding: 20px 0;
  background: transparent;
}

:deep(.el-tree-node__content) {
  min-height: 44px;
  margin: 4px 0;
  padding: 0 8px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  transition: all 0.3s;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
  border-color: #d9d9d9;
}

:deep(.el-tree-node.is-drop-inner > .el-tree-node__content) {
  background-color: #e6f4ff;
  border: 1px dashed #1890ff;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-content.selected {
  color: #1890ff;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.custom-tree-node:hover .node-actions {
  opacity: 1;
}

.editor-panel {
  margin-top: 16px;
  padding: 16px;
  border-top: 1px solid #eee;
  background: #fafafa;
  border-radius: 8px;
}

.preview-thumb {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 12px;
  color: #999;
}

.node-label {
  flex: 1;
}

:deep(.el-tree-node__content) {
  padding: 4px 8px;
  border-radius: 4px;
  margin: 2px 0;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree-node.is-drop-inner > .el-tree-node__content) {
  background-color: #e6f4ff;
  border: 1px dashed #1890ff;
}
</style> 