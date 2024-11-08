<template>
  <section
    class="fade-block"
    :style="sectionStyle"
  >
    <svg 
      :style="svgStyle"
      :viewBox="`0 0 ${imageWidth} ${imageHeight}`"
    ></svg>
    
    <!-- 图片上传区域 -->
    <div v-if="!imageUrl" class="upload-area" @click="triggerUpload">
      <input 
        type="file" 
        ref="fileInput"
        style="display: none"
        accept="image/*"
        @change="handleImageUpload"
      >
      <span>点击上传图片</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const imageUrl = ref('')
const imageWidth = ref(0)
const imageHeight = ref(0)
const fileInput = ref(null)

// 计算样式
const sectionStyle = computed(() => ({
  '-webkit-touch-callout': 'none',
  'user-select': 'text',
  'overflow': 'hidden',
  'text-align': 'center',
  'line-height': '0'
}))

const svgStyle = computed(() => ({
  'background-image': `url("${imageUrl.value}")`,
  'background-size': '100%',
  'background-repeat': 'no-repeat',
  'display': 'block',
  'line-height': '0',
  'transform': 'scale(1)',
  'margin-top': '-1px'
}))

// 触发文件选择
const triggerUpload = () => {
  fileInput.value.click()
}

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        imageWidth.value = img.width
        imageHeight.value = img.height
        imageUrl.value = e.target.result
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.fade-block {
  position: relative;
  min-height: 100px;
}

.upload-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 2px dashed #ddd;
  cursor: pointer;
}

.upload-area:hover {
  background: #f0f0f0;
}
</style> 