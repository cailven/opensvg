<template>
  <div 
    v-if="showPanel" 
    class="material-sidebar"
    :class="{ 'sidebar-collapsed': !showPanel }"
  >
    <div class="sidebar-header">
      <h3>素材库</h3>
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
          :style="{ backgroundImage: `url(${item.url})` }"
          @click="handleImageClick(item.url)"
        >
          <div v-if="!item.url" class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </div>
        <div class="material-name" :title="item.name">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import { ElImageViewer } from 'element-plus'

const props = defineProps({
  showPanel: Boolean,
  materials: Array
})

const searchQuery = ref('')

const filteredMaterials = computed(() => {
  if (!searchQuery.value) return props.materials
  const query = searchQuery.value.toLowerCase()
  return props.materials.filter(item => 
    item.name.toLowerCase().includes(query)
  )
})

const handleDragStart = (event, material) => {
  event.dataTransfer.setData('dragType', 'material')
  event.dataTransfer.setData('material', JSON.stringify(material))
  event.dataTransfer.effectAllowed = 'copy'
}

const handleImageClick = (url) => {
//   console.log('handleImageClick', url)
//   const imageViewer = ElImageViewer({
//     urlList: [url],
//     teleported: true,
//   })
}
</script>

<style scoped>
.material-image {
  width: 100%;
  height: 100px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  border-radius: 4px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}
</style> 