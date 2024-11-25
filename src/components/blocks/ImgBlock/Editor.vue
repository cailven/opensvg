<template>
  <div class="img-block-editor">
    <div class="editor-header">
      <span>图片组件</span>
    </div>
    
    <div class="editor-content">
      <ImageUploader
        :image-url="props.imageUrl"
        @update:image="handleImageUpdate"
      />
      
      <div class="click-setting">
        <h4>点击设置</h4>
        <label>
          <input 
            type="checkbox" 
            :checked="props.enableClick"
            @change="handleClickToggle"
          >
          允许点击（长按可扫码）
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEditorStore } from '../../../stores/editor'
import ImageUploader from '../../ImageUploader.vue'

const props = defineProps({
  componentId: {
    type: [String, Number],
    required: true
  },
  imageUrl: String,
  imageWidth: Number,
  imageHeight: Number,
  enableClick: {
    type: Boolean,
    default: true
  }
})

const editorStore = useEditorStore()

const handleImageUpdate = ({ url, width, height }) => {
  editorStore.updateComponentProps(props.componentId, {
    imageUrl: url,
    imageWidth: width,
    imageHeight: height
  })
}

const handleClickToggle = (event) => {
  editorStore.updateComponentProps(props.componentId, {
    enableClick: event.target.checked
  })
}
</script>

<style scoped>
.img-block-editor {
  width: 100%;
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

.click-setting {
  margin-top: 16px;
}

.click-setting h4 {
  margin: 0 0 8px;
}

.click-setting label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
</style> 