<template>
  <div 
    v-if="showPanel" 
    class="material-sidebar"
    :class="{ 'sidebar-collapsed': !showPanel }"
  >
    <div class="sidebar-header">
      <div class="header-top">
        <h3>素材库</h3>
        <el-button-group>
          <el-button 
            type="primary" 
            size="small"
            @click="handleUploadJson"
          >
            <el-icon><Upload /></el-icon>
            导入素材库
          </el-button>
        </el-button-group>
      </div>
      <el-input
        v-model="searchQuery"
        placeholder="搜索素材"
        prefix-icon="Search"
        clearable
        size="small"
      />
    </div>
    
    <div class="material-grid">
      <div 
        v-for="item in filteredMaterials" 
        :key="item.url"
        class="material-item"
        draggable="true"
        @dragstart="handleDragStart($event, item)"
      >
        <div
          class="material-image"
          @click="handleImageClick(item.url)"
        >
          <img 
            :src="item.url" 
            referrerpolicy="no-referrer"
            class="material-img"
          />
          <div v-if="!item.url" class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </div>
        <div class="material-name" :title="item.name">{{ item.name }}</div>
      </div>
    </div>
  </div>
  <input 
    type="file" 
    ref="fileInput"
    style="display: none"
    accept=".json"
    @change="handleFileSelect"
  >
</template>

<script setup>
import { ref, computed } from 'vue'
import { Picture, Upload } from '@element-plus/icons-vue'
import { ElImageViewer, ElMessage } from 'element-plus'
import { createVNode, render } from 'vue'

const props = defineProps({
  showPanel: Boolean,
  materials: {
    type: Array,
    default: () => []
  }
})

const searchQuery = ref('')

const filteredMaterials = computed(() => {
  if (!searchQuery.value) return props.materials
  const query = searchQuery.value.toLowerCase()
  return props.materials.filter(item => 
    item.name.toLowerCase().includes(query)
  )
})

const getNoReferrerImageUrl = async (url) => {
  const img = new Image();
  img.referrerPolicy = 'no-referrer'
  return new Promise((resolve) => {
    img.onload = () => {
      resolve(url)
    }
    img.src = url
  })
}

const handleDragStart = async (event, material) => {
  event.dataTransfer.setData('dragType', 'material')
  event.dataTransfer.setData('material', JSON.stringify(material))
  event.dataTransfer.effectAllowed = 'copy'
}

const handleImageClick = async (url) => {
  const noReferrerUrl = await getNoReferrerImageUrl(url)
  
  const container = document.createElement('div')
  const vnode = createVNode(ElImageViewer, {
    urlList: [url],
    teleported: true,
    onClose: () => {
      render(null, container)
      document.body.removeChild(container)
    }
  })
  
  document.body.appendChild(container)
  render(vnode, container)
}

const fileInput = ref(null)
const emit = defineEmits(['fileSelect', 'updateMaterials'])

const handleUploadJson = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const content = await file.text()
    const materials = JSON.parse(content)
    
    // 验证材料格式
    if (Array.isArray(materials) && materials.every(item => item.name && item.url)) {
      emit('updateMaterials', materials)
      ElMessage.success('素材库导入成功')
    } else {
      ElMessage.error('素材库格式不正确')
    }
  } catch (error) {
    console.error('导入素材库失败:', error)
    ElMessage.error('导入素材库失败，请检查文件格式')
  }
  
  // 清空文件输入以允许重复选择同一文件
  event.target.value = ''
}
</script>

<style scoped>
.material-image {
  width: 100%;
  height: 100px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.material-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.material-sidebar {
  padding: 16px;
}

.sidebar-header {
  margin-bottom: 16px;
}
</style> 