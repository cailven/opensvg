<template>
  <div class="zero-height-editor">
    <div class="editor-header">
      <span>零高容器</span>
    </div>
    
    <div class="editor-content">
      <div 
        class="drop-zone"
        :class="{ 'drop-active': isDragOver }"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div v-if="!children.length" class="empty-tip">
          可拖拽其他组件到此处
        </div>
        <component
          v-for="child in children"
          :key="child.id"
          :is="componentMap[child.type].editor"
          :componentId="child.id"
          v-bind="child.props"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { computed } from 'vue'
import { useEditorStore } from '../../../stores/editor'
import { componentMap } from '../../../stores/editor'

const props = defineProps({
  componentId: {
    type: [String, Number],
    required: true
  }
})

const editorStore = useEditorStore()

const children = computed(() => {
  return editorStore.components.filter(comp => comp.parentId === props.componentId)
})

const isDragOver = ref(false)

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false
  
  const componentType = event.dataTransfer.getData('componentType')
  const componentId = event.dataTransfer.getData('componentId')
  
  if (componentType) {
    editorStore.addComponent(componentType, props.componentId)
  } else if (componentId) {
    editorStore.updateComponentParent(componentId, props.componentId)
  }
}
</script>

<style scoped>
.zero-height-editor {
  padding: 12px;
}

.editor-header {
  margin-bottom: 16px;
  font-weight: bold;
}

.drop-zone {
  min-height: 120px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 20px;
  transition: all 0.3s;
  background: #fafafa;
}

.drop-zone.drop-active {
  border-color: #1890ff;
  background: #e6f7ff;
}

.empty-tip {
  color: #999;
  text-align: center;
  padding: 20px;
}
</style> 