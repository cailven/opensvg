<template>
  <div 
    class="material-sidebar-container"
  >
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
              @click="ClearUploadJson"
            >
            
              清空
            </el-button>

            <el-button 
              type="primary" 
              size="small"
              @click="handleUploadJson"
            >
             
              导入
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

      <div class="empty-material" v-if="filteredMaterials.length === 0">
        无素材
     



        <el-button 
              type="primary" 
              size="small"
              @click="linkToWxuploadChromeWiget"

              style="margin-top: 10px;"
            >
             
              学习如何导入
            </el-button>

      </div>
      
      <div class="material-grid" v-else>
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
    <div 
      class="sidebar-toggle"
      @click="() => {
        $emit('update:showPanel', !showPanel);
      }"
    >
      <el-icon>
        <ArrowRight v-if="showPanel" />
        <ArrowLeft v-else />
      </el-icon>
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
import { Picture, Upload, ArrowRight, ArrowLeft } from '@element-plus/icons-vue'
import { ElImageViewer, ElMessage } from 'element-plus'
import { createVNode, render } from 'vue'
import { useEditorStore } from '../stores/editor'

const props = defineProps({
  showPanel: {
    type: Boolean,
    default: false,
    watch(newVal, oldVal) {
      if (newVal !== oldVal) {
        window.dispatchEvent(new Event('resize'))
      }
    }
  },
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

const linkToWxuploadChromeWiget= async (event, material) => {
  window.open('https://github.com/cailven/wxuploadChromeWiget', '_blank')
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

const ClearUploadJson = () => {
  emit('updateMaterials', [])
}

const editorStore = useEditorStore()

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const content = await file.text()
    const materials = JSON.parse(content)
    
    // 验证材料格式
    if (Array.isArray(materials) && materials.every(item => item.name && item.url)) {
      // 更新 store 中的素材配置
      emit('updateMaterials', materials)
      
      // 更新 store 中的素材配置并触发自动保存
      editorStore.updateMaterialConfig({
        type: 'json',
        apiUrl: '',
        materials: materials
      })
      
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

<style lang="less" scoped>

.empty-material{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  
  color: #999;
}

.material-sidebar-container {
  /* width: 200px; */
  position: relative;
  height: 100%;
}

.material-sidebar {
  padding: 16px;
  height: calc(100vh - 92px);
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e0e0e0;
}

.sidebar-toggle {
  position: absolute;
  right: -24px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-left: none;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.sidebar-toggle:hover {
  background: #f5f7fa;
}

.material-item {
  width: 100px;
  height: 100px;
}

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