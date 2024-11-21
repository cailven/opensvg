<template>
  <div class="click-switch-editor">
    <div class="editor-header">
      <span>点击切换组件</span>
    </div>
    
    <div class="editor-content">
      <!-- 第一张图片 -->
      <div class="image-section">
        <h4>点击前图片</h4>
        <ImageUploader
          :image-url="props.beforeImageUrl"
          @update:image="handleBeforeImageUpdate"
        />
      </div>

      <!-- 第二张图片 -->
      <div class="image-section">
        <h4>点击后图片</h4>
        <ImageUploader
          :image-url="props.afterImageUrl"
          @update:image="handleAfterImageUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEditorStore } from '../../../stores/editor'
import ImageUploader from '../../../components/ImageUploader.vue'

const props = defineProps({
  componentId: [String, Number],
  beforeImageUrl: String,
  beforeImageWidth: Number,
  beforeImageHeight: Number,
  afterImageUrl: String,
  afterImageWidth: Number,
  afterImageHeight: Number
})

const editorStore = useEditorStore()

const handleBeforeImageUpdate = ({ url, width, height }) => {
  editorStore.updateComponentProps(props.componentId, {
    beforeImageUrl: url,
    beforeImageWidth: width,
    beforeImageHeight: height
  })
}

const handleAfterImageUpdate = ({ url, width, height }) => {
  editorStore.updateComponentProps(props.componentId, {
    afterImageUrl: url,
    afterImageWidth: width,
    afterImageHeight: height
  })
}
</script>

<style scoped>
.click-switch-editor {
  padding: 16px;
}

.editor-header {
  margin-bottom: 16px;
  font-weight: bold;
}

.image-section {
  margin-bottom: 24px;
}

.image-section h4 {
  margin: 0 0 12px 0;
  color: #666;
}
</style> 