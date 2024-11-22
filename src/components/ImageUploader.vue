<template>
  <div class="image-uploader">
    <div class="input-type-switch">
      <label>
        <input 
          type="radio" 
          v-model="inputType" 
          value="upload"
        > 
        
        {{ useApi ? '上传至接口' : '本地图片' }}
        
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
    <div v-if="inputType === 'upload'" class="upload-area" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
      <input 
        type="file" 
        ref="fileInput"
        style="display: none"
        accept="image/*"
        @change="handleLocalImage"
      >
      <div v-if="!props.imageUrl" class="upload-tip">
        点击选择本地图片或拖拽素材<br>
        <small style="color: #999">
          {{ useApi ? '图片将上传至微信公众号' : '本地图片仅供预览，不会被保存' }}
        </small>
      </div>
      <img 
        v-else 
        :src="props.imageUrl" 
        class="preview-img"
        referrerpolicy="no-referrer"
      >
    </div>

    <!-- 图片链接输入 -->
    <div v-else class="url-input-area" @dragover.prevent @drop.prevent="handleDrop">
      <input 
        type="text"
        v-model="imageUrlInput"
        placeholder="请输入图片链接（支持 http/https）或拖拽素材"
        @input="handleUrlInput"
      >
      <div class="url-tips">
        建议使用国内图床，否则公众号无法抓取图片
      </div>
    </div>

    <!-- 上传进度提示 -->
    <div v-if="uploading" class="upload-progress">
      正在上传图片...
    </div>
  </div>
</template>

<script setup>
console.log("editorStore");
import { ref, watch } from 'vue'
import { useEditorStore } from '../stores/editor'
import { storeToRefs } from 'pinia'

const props = defineProps({
  imageUrl: String
})

const emit = defineEmits(['update:image'])
const editorStore = useEditorStore()
const useApi = ref(false)

// 修改监听方式
watch(
  () => ({
    type: editorStore.materialConfig?.type,
    apiUrl: editorStore.materialConfig?.apiUrl
  }),
  (newConfig) => {
    useApi.value = newConfig.type === 'api' && newConfig.apiUrl
    console.log('API配置已更新:', useApi.value, newConfig)
  },
  { immediate: true, deep: true }
)



const inputType = ref('upload')
const fileInput = ref(null)
const imageUrlInput = ref(props.imageUrl || '')
const uploading = ref(false)

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleLocalImage = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (useApi.value) {
    // 使用 API 上传
    await uploadToApi(file)
  } else {
    // 本地预览
    previewLocalImage(file)
  }
}

const uploadToApi = async (file) => {
  try {
    uploading.value = true
    
    const formData = new FormData()
    formData.append('file[]', file)
    
    const response = await fetch(editorStore.materialConfig.apiUrl, {
      method: 'POST',
      // credentials: 'include', // 允许发送跨域 cookie
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('上传失败')
    }
    
    const data = await response.json()
    
    if (data && data.code === 0&& data.data?.[0]?.upl_url) {
      const img = new Image();
      img.referrerPolicy = 'no-referrer'
      img.onload = () => {
        emit('update:image', {
          url: data.data[0].upl_url,
          width: img.width,
          height: img.height
        })
      }
      img.src = data.data[0].upl_url
    } else {
      throw new Error(data.msg || '接口返回数据格式错误')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    alert('图片上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

const previewLocalImage = async (file) => {
  const url = URL.createObjectURL(file)
  const imageData = await loadImageWithNoReferrer(url)
  if (imageData) {
    emit('update:image', imageData)
  }
}

const handleUrlInput = async () => {
  if (!imageUrlInput.value) return
  const imageData = await loadImageWithNoReferrer(imageUrlInput.value)
  if (imageData) {
    emit('update:image', imageData)
  }
}

const handleDrop = async (event) => {
  const dragType = event.dataTransfer.getData('dragType')
  
  if (dragType === 'material') {
    try {
      const material = JSON.parse(event.dataTransfer.getData('material'))
      
      if (material.url) {
        // 创建一个新的 Image 对象来获取图片尺寸
        const img = new Image();
        img.referrerPolicy = 'no-referrer'
        img.onload = () => {
          emit('update:image', {
            url: material.url,
            width: img.width,
            height: img.height
          })
        }
        img.src = material.url
        
        // 如果是 URL 输入模式，也更新输入框的值
        if (inputType.value === 'url') {
          imageUrlInput.value = material.url
        }
      }
    } catch (error) {
      console.error('处理拖拽素材失败:', error)
    }
  }
}

const loadImageWithNoReferrer = async (url) => {
  if (!url) return null
  
  try {
    const img = new Image()
    img.referrerPolicy = 'no-referrer'
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
    return {
      url,
      width: img.width,
      height: img.height
    }
  } catch (error) {
    console.error('图片加载失败:', error)
    return null
  }
}

// 添加 props.imageUrl 的监听
watch(() => props.imageUrl, async (newUrl) => {
  if (newUrl) {
    const imageData = await loadImageWithNoReferrer(newUrl)
    if (imageData) {
      emit('update:image', imageData)
    }
  }
}, { immediate: true })
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

.upload-progress {
  margin-top: 8px;
  color: #1890ff;
  font-size: 14px;
  text-align: center;
}

.upload-area.drag-over {
  border-color: #40a9ff;
  background-color: rgba(64, 169, 255, 0.05);
}
</style>
