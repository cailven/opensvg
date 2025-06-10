<template>
  <div class="app-container">
    <SystemHeader
      :api-config="apiConfig"
      :api-url="apiUrl"
      :show-material-panel="showMaterialPanel"
      @show-api-config="showApiConfig = true"
      @toggle-material-panel="toggleMaterialPanel"
      @file-select="handleFileSelect"
      @show-save-dialog="showSaveDialog = true"
    />
    
    <div class="main-content">
      <MaterialSidebar
        :show-panel="showMaterialPanel"
        :materials="materialList"
        @update-materials="handleUpdateMaterials"
        @update:show-panel="showMaterialPanel = $event"
      />

      <div class="editor-container" :class="{ 'with-sidebar': showMaterialPanel }">
        <ComponentList class="component-list" />
        <TreeEditor class="tree-editor" />
        <Preview class="preview" />
      </div>
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

  <el-dialog
    v-model="showMaterialDialog"
    title="素材库预览"
    width="80%"
    class="material-dialog"
  >
    <el-table
      :data="materialList"
      style="width: 100%"
      height="500"
      :default-sort="{ prop: 'name' }"
    >
      <el-table-column prop="name" label="文件名" sortable width="200" />
      <el-table-column label="预览" width="120">
        <template #default="{ row }">
          <el-image
            class="material-preview"
            :src="row.url"
            :preview-src-list="[row.url]"
            preview-teleported
            fit="contain"
          >
            <template #placeholder>
              <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="url" label="素材地址" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="url-cell">
            <span class="url-text">{{ row.url }}</span>
            <el-button 
              type="primary" 
              link
              @click="copyUrl(row.url)"
            >复制</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>

  <el-dialog
    v-model="showApiConfig"
    title="配置微信素材接口"
    width="500px"
  >
    <div class="api-config-form">
      <el-form :model="apiConfig" label-width="120px">
        <el-form-item label="接入方式">
          <el-radio-group v-model="apiConfig.type">
            <el-radio :value="'api'">接口地址</el-radio>
            <el-radio :value="'json'">素材库文件</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 接口地址配置 -->
        <template v-if="apiConfig.type === 'api'">
          <el-form-item label="接口地址">
            <el-input 
              v-model="apiConfig.url" 
              placeholder="请输入微信素材接口地址"
              clearable
            />
          </el-form-item>
        </template>

        <!-- 素材库文件配置 -->
        <template v-else>
          <el-form-item label="素材库文件">
            <div class="json-upload">
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                style="display: none"
                @change="handleFileChange"
              >
              <el-button 
                type="primary" 
                @click="$refs.fileInput.click()"
              >
                选择文件
              </el-button>
              <span v-if="selectedFileName" class="file-name">
                {{ selectedFileName }}
              </span>
            </div>
            <div class="file-tips">
              1、Json文件来自 https://github.com/cailven/wxuploadChromeWiget
              2、chrome安装 Referer Control 设置 https://mmbiz.qpic.cn 为 block
            </div>
          </el-form-item>
        </template>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showApiConfig = false">取消</el-button>
        <el-button type="primary" @click="saveApiConfig">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEditorStore } from './stores/editor'
import ComponentList from './components/ComponentList.vue'
import TreeEditor from './components/TreeEditor.vue'
import Preview from './components/Preview.vue'
import { Plus, Download, Upload, Setting, Connection, Delete, Picture, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SystemHeader from './components/SystemHeader.vue'
import MaterialSidebar from './components/MaterialSidebar.vue'

const editorStore = useEditorStore()
const fileInput = ref(null)
const showSaveDialog = ref(false)
const projectName = ref('')
const showApiConfig = ref(false)
const apiConfig = ref({
  type: 'api', // 默认选择接口方式
  url: '',
  jsonFile: null
})
const apiUrl = ref('')
const dropdownVisible = ref(false)
const showMaterialDialog = ref(false)
const materialList = ref(editorStore.materialConfig.materials || [])
const showMaterialPanel = ref(true)
const searchQuery = ref('')
const selectedFileName = ref('')

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
    selectedComponent: editorStore.selectedComponent,
    // 添加素材配置到项目文件中
    materialConfig: editorStore.materialConfig
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
      // 恢复项目状态,包括素材配置
      editorStore.$patch({
        components: projectData.components,
        selectedComponent: projectData.selectedComponent,
        materialConfig: projectData.materialConfig || editorStore.materialConfig
      })
    } catch (err) {
      alert('无效的项目文件!')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

// 处理新建按钮点击
const handleNew = () => {
  if (editorStore.components.length > 0) {
    if (confirm('确定新建项目吗？当前项目的更改可能会丢失。')) {
      editorStore.newProject()
    }
  } else {
    editorStore.newProject()
  }
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.name.endsWith('.json')) {
    ElMessage.error('请选择 JSON 格式的文件')
    event.target.value = '' // 清空选择
    selectedFileName.value = ''
    return
  }
  
  selectedFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const jsonData = JSON.parse(e.target.result)
      materialList.value = jsonData
      ElMessage.success('素材库文件解析成功')
    } catch (err) {
      ElMessage.error('无效的 JSON 文件格式')
      event.target.value = '' // 清空选择
      selectedFileName.value = ''
    }
  }
  reader.readAsText(file)
}

// 保存配置
const saveApiConfig = () => {
  const config = {
    type: apiConfig.value.type
  }
  
  if (apiConfig.value.type === 'api') {
    // if (!apiConfig.value.url) {
    //   ElMessage.warning('请输入接口地址')
    //   return
    // }
    config.apiUrl = apiConfig.value.url
    config.materials = []
    // 更新显示的接口地址
    apiUrl.value = apiConfig.value.url
  } else {
    if (!selectedFileName.value) {
      ElMessage.warning('请选择素材库文件')
      return
    }
    config.apiUrl = ''
    config.materials = materialList.value
    // 更新显示的接口地址
    apiUrl.value = '使用素材库文件'
  }
  
  // 使用 store 保存配置
  editorStore.updateMaterialConfig(config)
  showApiConfig.value = false
  ElMessage.success('配置已更新')
}

// 重置文件选择
const resetFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  selectedFileName.value = ''
}

// 监听弹窗关闭
watch(showApiConfig, (newVal) => {
  if (!newVal) {
    resetFileInput()
  }
})

// 复制URL到剪贴板
const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 组件挂载时读取配置
onMounted(() => {
  // 从 store 中读取配置
  const config = editorStore.materialConfig
  if (config.type === 'api') {
    apiUrl.value = config.apiUrl || ''
    apiConfig.value.url = config.apiUrl || ''
    apiConfig.value.type = 'api'
  } else if (config.type === 'json') {
    apiUrl.value = '使用素材库文件'
    apiConfig.value.type = 'json'
    materialList.value = config.materials || []
  }
})

// 切换素材面板显示/隐藏
const toggleMaterialPanel = () => {
  showMaterialPanel.value = !showMaterialPanel.value
}

// 过滤素材列表
const filteredMaterials = computed(() => {
  if (!searchQuery.value) return materialList.value
  const query = searchQuery.value.toLowerCase()
  return materialList.value.filter(item => 
    item.name.toLowerCase().includes(query)
  )
})

// 处理拖拽开始
const handleDragStart = (event, material) => {
  event.dataTransfer.setData('application/json', JSON.stringify(material))
  event.dataTransfer.effectAllowed = 'copy'
}

// 修改 handleUpdateMaterials 方法
const handleUpdateMaterials = (newMaterials) => {
  materialList.value = newMaterials
  // 更新 store 中的素材配置
  editorStore.updateMaterialConfig({
    type: 'json',
    apiUrl: '',
    materials: newMaterials
  })
  ElMessage.success('素材库更新成功')
}

// 监听 store 中的素材配置变化
watch(
  () => editorStore.materialConfig,
  (newConfig) => {
    if (newConfig.type === 'json') {
      materialList.value = newConfig.materials
    }
  },
  { deep: true, immediate: true }
)
</script>

<style lang="less">
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

.system-actions {
  display: flex;
  align-items: center;
  gap: 16px;
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



.editor-container {
  flex: 1;
  display: grid;
  grid-template-columns: 250px 700px 1fr;
  gap: 0px;
  // padding: 20px;

  transition: margin-left 0.3s;
}

.component-list {
  // border-right: 1px solid #eee;
}

.tree-editor {
  // border-right: 1px solid #eee;
}

.preview {
  background: #f5f5f5;
}

.action-btn,
.auto-save-switch,
.switch-slider {
  display: none;
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
  gap: 16px;
}

.save-time {
  color: #909399;
}

/* 添加 logo 样式 */
.system-logo {
  display: flex;
  align-items: center;
}

.system-logo img {
  height: 36px;
  margin-right: 20px;
}

.api-status {
  margin-left: 20px;
  display: flex;
  align-items: center;
}

.api-status .el-tag {
  display: flex;
  align-items: center;
  gap: 5px;
}

.api-config-form {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dropdown-menu {
  min-width: 120px;
  padding: 5px 0;
}

.dropdown-menu .el-button {
  width: 100%;
  justify-content: flex-start;
  padding: 8px 16px;
}

.material-dialog .el-dialog__body {
  padding: 20px;
}

.material-preview {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.material-preview:hover {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.image-placeholder .el-icon {
  font-size: 24px;
  color: #909399;
}

.url-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.url-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 图片查看器样式优化 */
:deep(.el-image-viewer__wrapper) {
  background-color: rgba(0, 0, 0, 0.8);
}

:deep(.el-image-viewer__img) {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 拖拽相关样式 */
.material-preview[draggable="true"] {
  cursor: move;
}

.material-preview[draggable="true"]:active {
  opacity: 0.7;
}

.api-config-form {
  padding: 20px;
}

.json-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-name {
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.main-content {
  margin-top: 60px;
  flex: 1;
  display: flex;
  min-height: 0;
  background-color: #d8d8d8;
}

.material-sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #dcdfe6;
}

.sidebar-header h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
}

.material-grid {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.material-item {
  position: relative;
  cursor: move;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
  transition: transform 0.2s;
}

.material-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.material-item .el-image {
  width: 100%;
  height: 100px;
  display: block;
}

.material-name {
  padding: 8px;
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(255, 255, 255, 0.9);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}



.editor-container.with-sidebar {
  margin-left: 0;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.image-placeholder .el-icon {
  font-size: 24px;
  color: #909399;
}

/* 优化拖拽时的视觉效果 */
.material-item[draggable="true"]:active {
  opacity: 0.7;
}

/* 滚动条美化 */
.material-grid::-webkit-scrollbar {
  width: 6px;
}

.material-grid::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.material-grid::-webkit-scrollbar-track {
  background: #f5f7fa;
}
</style> 