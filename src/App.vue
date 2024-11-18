<template>
  <div class="app-container">
    <div class="system-header">
      <div class="auto-save-status">
        <label class="auto-save-switch">
          <input 
            type="checkbox" 
            :checked="editorStore.autoSaveEnabled"
            @change="editorStore.toggleAutoSave()"
          >
          <span class="switch-slider"></span>
          自动保存
        </label>
        <span v-if="editorStore.lastSaveTime" class="save-time">
          {{ autoSaveStatus }}
        </span>
      </div>
      <div class="system-actions">
        <button class="action-btn" @click="handleNew">新建项目</button>
        <button class="action-btn" @click="handleSave">保存项目</button>
        <button class="action-btn" @click="openProject">打开项目</button>
        <input 
          type="file" 
          ref="fileInput"
          style="display: none"
          accept=".json"
          @change="handleFileSelect"
        >
        <span>未登录</span>
        <a href="#">设置图床</a>
        <a href="#">系统配置</a>
      </div>
    </div>
    <div class="editor-container">
      <ComponentList class="component-list" />
      <TreeEditor class="tree-editor" />
      <Preview class="preview" />
    </div>
  </div>

  <div v-if="showSaveDialog" class="dialog-overlay" @click="showSaveDialog = false">
    <div class="dialog-content" @click.stop>
      <h3>保存项目</h3>
      <div class="dialog-body">
        <div class="form-item">
          <label>项目名称:</label>
          <input 
            type="text" 
            v-model="projectName"
            placeholder="请输入项目名称"
          >
        </div>
      </div>
      <div class="dialog-footer">
        <button class="cancel-btn" @click="showSaveDialog = false">取消</button>
        <button class="confirm-btn" @click="saveProject">确认保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from './stores/editor'
import ComponentList from './components/ComponentList.vue'
import TreeEditor from './components/TreeEditor.vue'
import Preview from './components/Preview.vue'

const editorStore = useEditorStore()
const fileInput = ref(null)
const showSaveDialog = ref(false)
const projectName = ref('')

// 计算自动保存状态提示
const autoSaveStatus = computed(() => {
  if (!editorStore.lastSaveTime) return ''
  const saveTime = new Date(editorStore.lastSaveTime)
  const timeStr = saveTime.toLocaleTimeString()
  return `上次保存: ${timeStr}`
})

// 处理保存按钮点击
const handleSave = () => {
  showSaveDialog.value = true
  // 设置默认项目名称
  projectName.value = `项目-${new Date().toLocaleDateString()}`
}

// 保存项目
const saveProject = () => {
  if (!projectName.value.trim()) {
    alert('请输入项目名称!')
    return
  }

  const projectData = {
    name: projectName.value,
    createTime: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    components: editorStore.components,
    selectedComponent: editorStore.selectedComponent
  }
  
  const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${projectName.value}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  showSaveDialog.value = false
}

// 打开项目按钮点击
const openProject = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const projectData = JSON.parse(e.target.result)
      // 恢复项目状态
      editorStore.$patch({
        components: projectData.components,
        selectedComponent: projectData.selectedComponent
      })
    } catch (err) {
      alert('无效的项目文件!')
    }
  }
  reader.readAsText(file)
  // 清除 input 值,允许重复选择同一文件
  event.target.value = ''
}

// 处理新建按钮点击
const handleNew = () => {
  if (editorStore.components.length > 0) {
    if (confirm('确定要新建项目吗？当前项目的更改可能会丢失。')) {
      editorStore.newProject()
    }
  } else {
    editorStore.newProject()
  }
}
</script>

<style>
html,body {
  margin: 0;
  height: 100%;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;

}

/* 新增顶部系统栏样式 */
.system-header {
  height: 80px;
  background: #f0f2f5;
  padding: 0 20px;
  border-bottom: 1px solid #e4e4e4;
}

.system-actions {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: flex-end;
}

.system-actions a {
  color: #666;
  text-decoration: none;
  font-size: 13px;
}

/* 原header样式调整名称并减少高度 */
.editor-header {
  height: 46px;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 调整内容区域，确保整体高度不超出视窗 */
.editor-container {
  flex: 1;
  display: grid;
  grid-template-columns: 200px 700px 1fr;
  gap: 20px;
  padding: 0px;
  min-height: 0; /* 防止内容溢出 */
}

.component-list {
  border-right: 1px solid #eee;
}

.tree-editor {
  border-right: 1px solid #eee;
}

.preview {
  background: #f5f5f5;
}

.action-btn {
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 12px;
  font-size: 13px;
}

.action-btn:hover {
  background: #40a9ff;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.dialog-content h3 {
  margin: 0 0 20px;
  font-size: 18px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
}

.form-item input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn {
  padding: 6px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn:hover {
  background: #40a9ff;
}

.auto-save-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auto-save-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.auto-save-switch input {
  display: none;
}

.switch-slider {
  position: relative;
  width: 40px;
  height: 20px;
  background: #ddd;
  border-radius: 20px;
  transition: 0.3s;
}

.switch-slider:before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: 0.3s;
}

.auto-save-switch input:checked + .switch-slider {
  background: #1890ff;
}

.auto-save-switch input:checked + .switch-slider:before {
  transform: translateX(20px);
}

.save-time {
  color: #666;
  font-size: 12px;
}
</style> 