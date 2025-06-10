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
      :key="treeUpdateKey"
      :props="defaultProps"
      draggable
      :default-expanded-keys="expandedKeys"
      :allow-drop="handleAllowDrop"
      @node-drag-start="handleDragStart"
      @node-drag-enter="handleDragEnter"
      @node-drag-leave="handleDragLeave" 
      @node-drag-end="handleDragEnd"
      @node-drop="handleNodeDrop"
      @node-click="handleNodeClick"
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <span 
            class="node-content"
            :class="{ 'selected': editorStore.selectedComponent === data.id }"
          >
            <span v-if="data.type === 'fade'" class="preview-thumb">
              <img 
                v-if="getImageUrl(data)" 
                :src="getImageUrl(data)" 
                :key="getImageUrl(data)"
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
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useEditorStore } from '../stores/editor'
import { componentMap } from '../stores/editor'
import { ElTree, ElButton } from 'element-plus'

const editorStore = useEditorStore()

// 修改 expandedKeys 的处理
const expandedKeys = ref([])

// 添加一个用于存储组件更新前的展开状态
const previousExpandedKeys = ref([])

// 监听选中组件的变化
watch(
  () => editorStore.selectedComponent,
  () => {
    // 当选中组件变化时，恢复之前保存的展开状态
    if (previousExpandedKeys.value.length > 0) {
      expandedKeys.value = [...previousExpandedKeys.value]
    }
  }
)

// 监听组件属性变化
watch(
  () => [...editorStore.components],
  (newVal, oldVal) => {
    // 检查是否有图片更新
    const hasImageUpdate = newVal.some((comp, index) => {
      const oldComp = oldVal[index]
      return oldComp && comp.id === oldComp.id && 
             comp.props?.imageUrl !== oldComp.props?.imageUrl
    })

    // 检查结构变化
    const hasStructureChange = newVal.length !== oldVal.length || 
      newVal.some((comp, index) => {
        const oldComp = oldVal[index]
        return !oldComp || 
               comp.id !== oldComp.id || 
               comp.parentId !== oldComp.parentId
      })

    if (hasStructureChange) {
      // 如果有结构变化，重建整个树
      treeData.value = buildTreeData()
    } else if (hasImageUpdate) {
      // 如果只有图片更新，只更新图片属性
      treeData.value.forEach(updateNodeImageUrl)
    }
  },
  { deep: true }
)

// 添加更新图片 URL 的函数
const updateNodeImageUrl = (node) => {
  const component = editorStore.components.find(c => c.id === node.id)
  if (component && component.props?.imageUrl) {
    node.props = {
      ...node.props,
      imageUrl: component.props.imageUrl
    }
  }
  if (node.children) {
    node.children.forEach(updateNodeImageUrl)
  }
}

// 修改 getImageUrl 方法
const getImageUrl = (data) => {
  // 直接从当前节点数据中获取
  return data.props?.imageUrl
}

// 处理节点展开和折叠
const handleNodeExpand = (data) => {
  if (!expandedKeys.value.includes(data.id)) {
    expandedKeys.value.push(data.id)
  }
}

const handleNodeCollapse = (data) => {
  expandedKeys.value = expandedKeys.value.filter(key => key !== data.id)
}

// 将 treeData 改为 ref
const treeData = ref([])

// 添加构建树的方法
const buildTreeData = () => {
  const topLevel = editorStore.components.filter(comp => !comp.parentId)
  
  const buildTree = (components) => {
    return components.map(comp => ({
      ...comp,
      children: componentMap[comp.type]?.isContainer
        ? buildTree(editorStore.components.filter(c => c.parentId === comp.id))
        : []
    }))
  }
  
  return buildTree(topLevel)
}

// 添加更新 key
const treeUpdateKey = ref(0)

// 初始化展开状态
onMounted(() => {
  // 初始展开所有节点
  const getAllIds = (nodes) => {
    let ids = []
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children) {
        ids = ids.concat(getAllIds(node.children))
      }
    })
    return ids
  }
  
  treeData.value = buildTreeData()
  expandedKeys.value = getAllIds(treeData.value)
})

// 修改组件属性的方法（如果有的话）
const updateComponentProps = (componentId, props) => {
  const component = editorStore.components.find(c => c.id === componentId)
  if (component) {
    component.props = { ...component.props, ...props }
    // 不触发树结构重建
  }
}

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
  // 检查拖拽释放的目标区域
  const targetArea = event.target.closest('.tree-editor-container, .editor-panel')
  if (!targetArea) return

  event.preventDefault()
  const componentType = event.dataTransfer.getData('componentType')
  const componentId = event.dataTransfer.getData('componentId')
  const dragType = event.dataTransfer.getData('dragType')
  
  // 如果是拖拽到编辑器面板区域，不处理新增节点
  if (targetArea.classList.contains('editor-panel')) {
    return
  }
  
  // 以下是原有的处理逻辑，只在拖拽到 tree-editor-container 时执行
  if (dragType === 'material') {
    try {
      const material = JSON.parse(event.dataTransfer.getData('material'))
      const newComponent = {
        type: 'fade',
        props: {
          imageUrl: material.url,
          name: material.name || '无缝图',
          imageWidth: 0,
          imageHeight: 0
        }
      }
      editorStore.addComponent('fade', newComponent.props)
    } catch (error) {
      console.error('处理拖拽数据失败:', error)
    }
  } else if (componentType) {
    const defaultProps = componentMap[componentType]?.defaultProps || {}
    editorStore.addComponent(componentType, defaultProps)
  } else if (componentId) {
    editorStore.updateComponentParent(componentId, null)
  }
}

// 重命名原来的 handleDrop 为 handleNodeDrop
const handleNodeDrop = (draggingNode, dropNode, dropType, ev) => {
  const componentId = draggingNode.data.id
  const targetId = dropNode?.data?.id
  
  // 如果要拖入非容器组件内部，阻止操作
  if (dropType === 'inner' && !componentMap[dropNode?.data?.type]?.isContainer) {
    return
  }

  // 根据不同的放置类型处理
  if (dropType === 'inner') {
    // 放入容器内部
    editorStore.updateComponentParent(componentId, targetId)
  } else {
    // before 或 after，移动到同级
    const parentId = dropNode?.data?.parentId || null
    editorStore.updateComponentParent(componentId, parentId)
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

// 添加 handleAllowDrop 方法
const handleAllowDrop = (draggingNode, dropNode, type) => {
  // 如果是要放入内部，检查目标是否为容器
  if (type === 'inner') {
    return componentMap[dropNode?.data?.type]?.isContainer
  }
  // 其他情况（before/after）都允许
  return true
}
</script>

<style scoped>
.tree-editor {
  height: calc(100vh - 60px);
  background: #fff;
  /* padding: 16px; */
  overflow-y: auto;
  display: flex;
}

.tree-editor-container{
  width: 300px;
}

.empty-tip {
  width: 100%;
  height:calc(100vh - 350px);
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
  /* margin-top: 16px; */
  padding: 16px;
  border-top: 1px solid #eee;
  background: #f0f0f0;
  /* border-radius: 8px; */
  overflow-y: auto;
  width: 100%;
  
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
  margin-right: 10px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree-node.is-drop-inner > .el-tree-node__content) {
  background-color: #e6f4ff;
  border: 1px dashed #1890ff;
}
</style> 