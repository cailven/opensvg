<template>
  <div class="vertical-scroll-block-editor">
    <div class="editor-header">
      <span>纵向滚动容器</span>
    </div>
    
    <div class="editor-content">
      <!-- 容器高度设置 -->
      <div class="height-section">
        <h4>容器高度（vw）</h4>
        <input 
          type="number" 
          :value="props.containerHeight"
          @input="handleHeightUpdate"
          step="10"
          min="50"
          class="height-input"
        />
      </div>

      <!-- 拖拽区域 -->
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
        <div
          v-for="child in children"
          :key="child.id"
          draggable="true"
          @dragstart="handleChildDragStart($event, child)"
        >
          <component
            :is="componentMap[child.type].editor"
            :componentId="child.id"
            v-bind="child.props"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../../stores/editor'
import { componentMap } from '../../../stores/editor'

const props = defineProps({
  componentId: {
    type: [String, Number],
    required: true
  },
  containerHeight: {
    type: Number,
    default: 160
  }
})

const editorStore = useEditorStore()
const isDragOver = ref(false)

const children = computed(() => {
  return editorStore.components.filter(comp => comp.parentId === props.componentId)
})

// 处理高度更新
const handleHeightUpdate = (event) => {
  const height = parseInt(event.target.value)
  editorStore.updateComponentProps(props.componentId, {
    containerHeight: height
  })
}

// 以下代码参考了 ScrollBlock 的拖拽处理逻辑
</script>

<style scoped>
.vertical-scroll-block-editor {
  width: 100%;
  /* height: 160vw; */
  vertical-align: top;
  overflow-y: auto;
  margin-top: -1px;
  pointer-events: visible;
}

.editor-header {
  height: 40px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.editor-content {
  padding: 10px;
}

.height-section {
  margin-bottom: 10px;
}

.height-input {
  width: 90%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.drop-zone {
  width: 100%;
  height: 100%;
  border: 2px dashed #ccc;
  border-radius: 5px;
  /* display: flex; */
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.drop-active {
  border-color: #007bff;
}

.empty-tip {
  color: #ccc;
  font-size: 14px;
}
</style> 