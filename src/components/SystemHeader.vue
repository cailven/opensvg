<template>
  <div class="system-header">
    <div class="system-logo">
      <img src="/logo.gif" alt="编辑器" />
    </div>
    
    <div class="api-status">
     
      
      <el-tag size="small" style="margin-left: 10px">
        <el-icon><Connection /></el-icon>
        接口地址: {{ apiUrl }}
      </el-tag>

      

      <div style="margin-left: 20px;">
        <el-button 
        type="primary" 
        size="small"
        @click="$emit('showApiConfig')"
      >
        <el-icon><Setting /></el-icon>
        配置接口
      </el-button>
        <el-button 
          type="success" 
          size="small"
          @click="toggleMaterialPanel"
        >
          <el-icon><Picture /></el-icon>
          {{ showMaterialPanel ? '隐藏素材库' : '显示素材库' }}
        </el-button>
      </div>
    </div>
    
    <div class="system-actions">
      <el-button-group>
        <el-button type="primary" @click="handleNew" :icon="Plus">新建</el-button>
        <el-button type="primary" @click="handleSave" :icon="Download">保存</el-button>
        <el-button type="primary" @click="openProject" :icon="Upload">打开</el-button>
      </el-button-group>
      <el-divider direction="vertical" />
      <div class="auto-save-status">
        <el-switch
          v-model="editorStore.autoSaveEnabled"
          @change="editorStore.toggleAutoSave()"
          active-text="自动保存"
        />
        <span v-if="editorStore.lastSaveTime" class="save-time">
          <el-tag size="small" type="info">
            {{ autoSaveStatus }}
          </el-tag>
        </span>
      </div>
      <el-divider direction="vertical" />
      <el-popover
        :visible="dropdownVisible"
        trigger="click"
        placement="bottom"
        @hide="dropdownVisible = false"
      >
        <template #reference>
          <el-button v-if="false" @click="dropdownVisible = true" :icon="Setting">系统设置</el-button>
        </template>
        <div class="dropdown-menu">
          <el-button 
            link 
            @click="$emit('showApiConfig'); dropdownVisible = false"
          >配置接口</el-button>
        </div>
      </el-popover>
      <input 
        type="file" 
        ref="fileInput"
        style="display: none"
        accept=".json"
        @change="handleFileSelect"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../stores/editor'
import { Plus, Download, Upload, Setting, Connection, Picture } from '@element-plus/icons-vue'

const props = defineProps({
  apiConfig: Object,
  apiUrl: String,
  showMaterialPanel: Boolean
})

const emit = defineEmits(['showApiConfig', 'toggleMaterialPanel', 'fileSelect'])

const editorStore = useEditorStore()
const fileInput = ref(null)
const dropdownVisible = ref(false)

// 计算自动保存状态提示
const autoSaveStatus = computed(() => {
  if (!editorStore.lastSaveTime) return ''
  const saveTime = new Date(editorStore.lastSaveTime)
  const timeStr = saveTime.toLocaleTimeString()
  return `上次保存: ${timeStr}`
})

// 处理文件选择
const handleFileSelect = (event) => {
  emit('fileSelect', event)
}

const handleNew = () => {
  if (editorStore.components.length > 0) {
    if (confirm('确定新建项目吗？当前项目的更改可能会丢失。')) {
      editorStore.newProject()
    }
  } else {
    editorStore.newProject()
  }
}

const handleSave = () => {
  emit('showSaveDialog')
}

const openProject = () => {
  fileInput.value?.click()
}

const toggleMaterialPanel = () => {
  emit('toggleMaterialPanel')
}
</script>

<style scoped>
.system-header {
  height: 60px;
  background: #fff;
  padding: 0 20px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
}


</style> 