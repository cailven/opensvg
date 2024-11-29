<template>
  <div class="system-header">
    <div class="system-logo">
      <img src="/logo.png" alt="编辑器" />
    </div>

    <div class="api-status">


      <el-tag size="small" style="margin-left: 10px">
        <el-icon>
          <Connection />
        </el-icon>
        接口地址: {{ apiUrl }}
      </el-tag>



      <div style="margin-left: 20px;">
        <el-button type="primary" size="small" @click="$emit('showApiConfig')">
          <el-icon>
            <Setting />
          </el-icon>
          配置接口
        </el-button>
        <el-button type="success" size="small" @click="toggleMaterialPanel">
          <el-icon>
            <Picture />
          </el-icon>
          {{ showMaterialPanel ? '隐藏素材库' : '显示素材库' }}
        </el-button>
      </div>
    </div>


    <div class="system-actions">
      <el-button-group>
        <el-button type="info" link @click="openTutorial" :icon="Document">
          教程
        </el-button>

        <el-button type="info" link @click="openGithub">
          <template #icon>
            <svg viewBox="0 0 16 16" width="1em" height="1em">
              <path fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </template>
          源码
        </el-button>
      </el-button-group>
      <el-button-group>
        <el-button type="primary" @click="handleNew" :icon="Plus">新建</el-button>
        <el-button type="primary" @click="handleSave" :icon="Download">保存</el-button>
        <el-button type="primary" @click="openProject" :icon="Upload">打开</el-button>
      </el-button-group>

      <el-divider direction="vertical" />

      <div class="auto-save-status">
        <el-switch v-model="autoSaveEnabled" active-text="自动保存" />
        <span v-if="editorStore.lastSaveTime" class="save-time">
          <el-tag size="small" type="info">
            {{ autoSaveStatus }}
          </el-tag>
        </span>
      </div>
      <el-divider direction="vertical" />


      <el-popover :visible="dropdownVisible" trigger="click" placement="bottom" @hide="dropdownVisible = false">
        <template #reference>
          <el-button v-if="false" @click="dropdownVisible = true" :icon="Setting">系统设置</el-button>
        </template>
        <div class="dropdown-menu">
          <el-button link @click="$emit('showApiConfig'); dropdownVisible = false">配置接口</el-button>
        </div>
      </el-popover>
      <input type="file" ref="fileInput" style="display: none" accept=".json" @change="handleFileSelect">
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../stores/editor'
import { Plus, Download, Upload, Setting, Connection, Picture, Document, Platform } from '@element-plus/icons-vue'

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

// 修改计算属性的实现
const autoSaveEnabled = computed({
  get: () => editorStore.autoSaveEnabled,
  set: () => {
    editorStore.toggleAutoSave() // 使用已有的 toggleAutoSave 方法
  }
})

const openTutorial = () => {
  window.open('https://github.com/cailven/opensvg/wiki', '_blank')
}

const openGithub = () => {
  window.open('https://github.com/cailven/opensvg', '_blank')
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