<template>
  <div class="click-gif-editor">
    <div class="editor-header">
      <span>连续点击播放GIF组件</span>
    </div>
    
    <div class="editor-content">
      <div v-for="(image, index) in images" :key="index" class="image-section">
        <h4>第 {{ index + 1 }} 帧图片</h4>
        <ImageUploader
          :image-url="image.url"
          @update:image="(data) => handleImageUpdate(index, data)"
        />
        <button @click="removeImage(index)" class="remove-btn">删除此帧</button>
      </div>
      
      <button @click="addNewImage" class="add-btn">添加新帧</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEditorStore } from '../../../stores/editor'
import ImageUploader from '../../../components/ImageUploader.vue'

const props = defineProps({
  componentId: [String, Number],
  images: {
    type: Array,
    default: () => []
  }
})

const editorStore = useEditorStore()

const handleImageUpdate = (index, imageData) => {
  const newImages = [...props.images]
  newImages[index] = imageData
  editorStore.updateComponentProps(props.componentId, {
    images: newImages,
    imageWidth: imageData.width,
    imageHeight: imageData.height
  })
}

const addNewImage = () => {
  const newImages = [...props.images, { url: '' }]
  editorStore.updateComponentProps(props.componentId, {
    images: newImages
  })
}

const removeImage = (index) => {
  const newImages = props.images.filter((_, i) => i !== index)
  editorStore.updateComponentProps(props.componentId, {
    images: newImages
  })
}
</script>

<style scoped>
.click-gif-editor {
  padding: 16px;
}

.image-section {
  margin-bottom: 24px;
}

.add-btn, .remove-btn {
  margin-top: 8px;
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.add-btn:hover, .remove-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.remove-btn {
  margin-left: 8px;
  color: #ff4d4f;
}
</style> 