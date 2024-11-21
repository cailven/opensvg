<template>
  <div class="stretch-block-editor">
    <div class="editor-header">
      <span>点击伸长组件</span>
    </div>
    
    <div class="editor-content">
      <!-- 第一张图片 -->
      <div class="image-section">
        <h4>初始GIF图片</h4>
        <ImageUploader
          :image-url="props.topImageUrl"
          @update:image="handleTopImageUpdate"
        />
      </div>

      <!-- 第二张图片 -->
      <div class="image-section">
        <h4>点击后的GIF图片</h4>
        <ImageUploader
          :image-url="props.topImage2Url"
          @update:image="handleTopImage2Update"
        />
      </div>

      <!-- 动画延迟设置 -->
      <div class="delay-section">
        <h4>动画延迟时间（秒）</h4>
        <input 
          type="number" 
          :value="props.animationDelay"
          @input="handleDelayUpdate"
          step="0.1"
          min="0"
          class="delay-input"
        />
      </div>

      <!-- 伸长内容说明 -->
      <div class="content-section">
        <h4>伸长内容区域</h4>
        <div class="content-description">
          此处为内容容器，可在预览时添加需要展示的内容
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEditorStore } from '../../../stores/editor'
import ImageUploader from '../../../components/ImageUploader.vue'

const props = defineProps({
  componentId: [String, Number],
  topImageUrl: String,
  topImageWidth: Number,
  topImageHeight: Number,
  topImage2Url: String,
  topImage2Width: Number,
  topImage2Height: Number,
  animationDelay: {
    type: Number,
    default: 1
  }
})

const editorStore = useEditorStore()

const handleTopImageUpdate = ({ url, width, height }) => {
  editorStore.updateComponentProps(props.componentId, {
    topImageUrl: url,
    topImageWidth: width,
    topImageHeight: height
  })
}

const handleTopImage2Update = ({ url, width, height }) => {
  editorStore.updateComponentProps(props.componentId, {
    topImage2Url: url,
    topImage2Width: width,
    topImage2Height: height
  })
}

const handleDelayUpdate = (event) => {
  const delay = parseFloat(event.target.value)
  editorStore.updateComponentProps(props.componentId, {
    animationDelay: delay
  })
}
</script>

<style scoped>
.stretch-block-editor {
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

.delay-section {
  margin-bottom: 24px;
}

.delay-input {
  width: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.content-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.content-description {
  color: #666;
  font-size: 14px;
}
</style>