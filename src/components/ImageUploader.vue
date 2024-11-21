<template>
  <div class="image-uploader">
    <div class="input-type-switch">
      <label>
        <input 
          type="radio" 
          v-model="inputType" 
          value="upload"
        > 本地图片
      </label>
      <label>
        <input 
          type="radio" 
          v-model="inputType" 
          value="url"
        > 图片链接
      </label>
    </div>

    <!-- 本地图片上传 -->
    <div v-if="inputType === 'upload'" class="upload-area" @click="triggerUpload">
      <input 
        type="file" 
        ref="fileInput"
        style="display: none"
        accept="image/*"
        @change="handleLocalImage"
      >
      <div v-if="!props.imageUrl" class="upload-tip">
        点击选择本地图片<br>
        <small style="color: #999">注意：本地图片仅供预览，不会被保存</small>
      </div>
      <img 
        v-else 
        :src="props.imageUrl" 
        class="preview-img"
      >
    </div>

    <!-- 图片链接输入 -->
    <div v-else class="url-input-area">
      <input 
        type="text"
        v-model="imageUrlInput"
        placeholder="请输入图片链接（支持 http/https）"
        @input="handleUrlInput"
      >
      <div class="url-tips">
        建议使用国内图床，否则公众号无法抓取图片
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  imageUrl: String
})

const emit = defineEmits(['update:image'])

const inputType = ref('upload')
const fileInput = ref(null)
const imageUrlInput = ref(props.imageUrl || '')

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleLocalImage = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const img = new Image()
  img.onload = () => {
    emit('update:image', {
      url: img.src,
      width: img.width,
      height: img.height
    })
  }
  
  img.src = URL.createObjectURL(file)
}

const handleUrlInput = () => {
  if (!imageUrlInput.value) return
  
  const img = new Image()
  img.onload = () => {
    emit('update:image', {
      url: imageUrlInput.value,
      width: img.width,
      height: img.height
    })
  }
  
  img.src = imageUrlInput.value
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.input-type-switch {
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
}

.upload-area {
  width: 200px;
  height: 120px;
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-align: center;
}

.upload-area:hover {
  border-color: #40a9ff;
}

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-tip {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.url-input-area {
  width: 100%;
}

.url-input-area input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.url-input-area input:focus {
  border-color: #40a9ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.url-tips {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}
</style>
