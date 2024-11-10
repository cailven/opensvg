<template>
  <div class="fade-block-editor">
    <div class="editor-header">
      <span>无缝图组件</span>
    </div>
    
    <!-- 图片上传区域 -->
    <div class="editor-content">
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
          推荐图床：
          <a href="https://sm.ms" target="_blank">SM.MS</a>
          <a href="https://imgbb.com" target="_blank">ImgBB</a>
        </div>
      </div>
    </div>

    <!-- 热区编辑区域 -->
    <div v-if="props.imageUrl" class="hotspot-editor">
      <div class="editor-subheader" @click="toggleHotspotEditor">
        <div class="header-left">
          <i :class="['collapse-icon', isHotspotEditorOpen ? 'open' : '']">▶</i>
          <span>点击热区</span>
        </div>
        <!-- <button class="add-hotspot-btn" @click.stop="startDrawing">添加热区</button> -->
      </div>
      
      <!-- 使用 v-show 来控制折叠内容 -->
      <div v-show="isHotspotEditorOpen" class="hotspot-content">
        <div 
          class="hotspot-canvas"
          ref="canvasRef"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
        >
          <!-- 保持原有的 SVG 内容不变 -->
          <svg 
            :style="svgStyle"
            :viewBox="`0 0 ${props.imageWidth} ${props.imageHeight}`"
          >
            <!-- 背景图 -->
            <image 
              :href="props.imageUrl" 
              width="100%" 
              height="100%"
            />
            
            <!-- 已有热区 -->
            <rect
              v-for="(hotspot, index) in hotspots"
              :key="index"
              :x="hotspot.x"
              :y="hotspot.y"
              :width="hotspot.width"
              :height="hotspot.height"
              fill="rgba(24, 144, 255, 0.3)"
              stroke="#1890ff"
              stroke-width="1"
              @click="selectHotspot(index)"
            />
            
            <!-- 正在绘制的热区 -->
            <rect
              v-if="isDrawing"
              :x="drawingRect.x"
              :y="drawingRect.y"
              :width="drawingRect.width"
              :height="drawingRect.height"
              fill="rgba(24, 144, 255, 0.3)"
              stroke="#1890ff"
              stroke-width="1"
            />
          </svg>
        </div>

        <!-- 热区属性编辑部分保持不变 -->
        <div v-if="selectedHotspot !== null" class="hotspot-properties">
          <div class="property-item">
            <label>热区类型：</label>
            <select v-model="hotspots[selectedHotspot].type">
              <option value="link">链接跳转</option>
              <option value="animate">动画触发</option>
            </select>
          </div>
          
          <template v-if="hotspots[selectedHotspot].type === 'link'">
            <div class="property-item">
              <label>链接地址：</label>
              <input 
                type="text" 
                v-model="hotspots[selectedHotspot].link"
                placeholder="请输入点击跳转链接"
              >
            </div>
          </template>
          
          <template v-else>
            <div class="property-item">
              <label>动画ID：</label>
              <input 
                type="text" 
                v-model="hotspots[selectedHotspot].animateId"
                placeholder="动画组ID"
              >
            </div>
            <div class="property-item">
              <label>触发事件：</label>
              <input 
                type="text" 
                v-model="hotspots[selectedHotspot].triggerEvent"
                placeholder="如：click"
              >
            </div>
            <div class="property-item">
              <label>动画代码：</label>
              <textarea
                v-model="hotspots[selectedHotspot].animateCode"
                placeholder="输入完整的animate相关代码"
                rows="4"
              ></textarea>
            </div>
          </template>
          
          <button class="delete-btn" @click="deleteHotspot(selectedHotspot)">删除热区</button>
        </div>
      </div>
    </div>

    <!-- 动画编辑区域 -->
    <div class="animation-editor-section">
      <div class="editor-subheader" @click="toggleAnimationEditor">
        <div class="header-left">
          <i :class="['collapse-icon', isAnimationEditorOpen ? 'open' : '']">▶</i>
          <span>动画编辑</span>
        </div>
        <button class="add-animation-btn" @click.stop="openAnimationEditor">添加动画</button>
      </div>
      
      <div v-show="isAnimationEditorOpen" class="animation-content">
        <!-- 动画列表 -->
        <div v-if="animations.length > 0" class="animation-list">
          <div v-for="(animation, index) in animations" :key="index" class="animation-item">
            <div class="animation-info">
              <span>{{ animation.type === 'animate' ? '基础动画' : '变换动画' }}</span>
              <span>{{ animation.attributeName }}</span>
            </div>
            <div class="animation-actions">
              <button @click="editAnimation(index)">编辑</button>
              <button @click="deleteAnimation(index)" class="delete-btn">删除</button>
            </div>
          </div>
        </div>
        <div v-else class="no-animations">
          暂无动画，点击"添加动画"按钮创建
        </div>
      </div>

      <!-- 动画编辑器弹窗 -->
      <div v-if="showAnimationEditor" class="modal-overlay">
        <div class="modal-content">
          <AnimationEditor
            :hotspot="currentHotspot"
            @close="closeAnimationEditor"
            @confirm="handleAnimationConfirm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../../stores/editor'
import AnimationEditor from '../../AnimationEditor/index.vue'

const props = defineProps({
  componentId: [String, Number],
  imageUrl: String,
  imageWidth: Number,
  imageHeight: Number,
  hotspots: {
    type: Array,
    default: () => []
  }
})

const editorStore = useEditorStore()
const fileInput = ref(null)
const inputType = ref('upload')
const imageUrlInput = ref(props.imageUrl || '')

// 热区相关
const canvasRef = ref(null)
const isDrawing = ref(false)
const selectedHotspot = ref(null)
const drawingRect = ref({ x: 0, y: 0, width: 0, height: 0 })
const startPoint = ref({ x: 0, y: 0 })
const hotspots = ref(props.hotspots || [])

// 动画编辑相关的响应式变量统一定义在这里
const isHotspotEditorOpen = ref(false)
const isAnimationEditorOpen = ref(false)
const showAnimationEditor = ref(false)
const animations = ref([])
const currentHotspot = ref(null)
const editingAnimationIndex = ref(null)

// 原有的图片上传方法
const triggerUpload = () => {
  fileInput.value?.click()
}

const handleLocalImage = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const img = new Image()
  img.onload = () => {
    editorStore.updateComponentProps(props.componentId, {
      imageUrl: img.src,
      imageWidth: img.width,
      imageHeight: img.height,
      hotspots: [] // 重置热区
    })
  }
  
  img.src = URL.createObjectURL(file)
}

const handleUrlInput = () => {
  if (!imageUrlInput.value) return
  
  const img = new Image()
  img.onload = () => {
    editorStore.updateComponentProps(props.componentId, {
      imageUrl: imageUrlInput.value,
      imageWidth: img.width,
      imageHeight: img.height,
      hotspots: [] // 重置热区
    })
  }
  
  img.onerror = () => {
    console.error('图片链接无效')
  }
  
  img.src = imageUrlInput.value
}

// SVG 样式
const svgStyle = computed(() => ({
  width: '100%',
  height: 'auto',
  border: '1px solid #ddd'
}))

// 开始绘制
const startDrawing = () => {
  selectedHotspot.value = null
}

// 获取相对坐标
const getRelativeCoordinates = (event) => {
  const svg = canvasRef.value
  const rect = svg.getBoundingClientRect()
  const scaleX = props.imageWidth / rect.width
  const scaleY = props.imageHeight / rect.height
  
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  }
}

// 鼠标按下
const onMouseDown = (event) => {
  if (!isDrawing.value) {
    isDrawing.value = true
    const point = getRelativeCoordinates(event)
    startPoint.value = point
    drawingRect.value = {
      x: point.x,
      y: point.y,
      width: 0,
      height: 0
    }
  }
}

// 鼠标移动
const onMouseMove = (event) => {
  if (isDrawing.value) {
    const point = getRelativeCoordinates(event)
    const width = point.x - startPoint.value.x
    const height = point.y - startPoint.value.y
    
    drawingRect.value = {
      x: width < 0 ? point.x : startPoint.value.x,
      y: height < 0 ? point.y : startPoint.value.y,
      width: Math.abs(width),
      height: Math.abs(height)
    }
  }
}

// 鼠标松开
const onMouseUp = () => {
  if (isDrawing.value) {
    isDrawing.value = false
    if (drawingRect.value.width > 5 && drawingRect.value.height > 5) {
      hotspots.value.push({
        ...drawingRect.value,
        type: 'link',           // 默认为链接类型
        link: '',               // 链接地址
        animateId: '',          // 动画组ID
        triggerEvent: 'click',  // 触发事件
        animateCode: ''         // 完整的动画代码
      })
      updateHotspots()
    }
    drawingRect.value = { x: 0, y: 0, width: 0, height: 0 }
  }
}

// 选择热区
const selectHotspot = (index) => {
  selectedHotspot.value = index
}

// 删除热区
const deleteHotspot = (index) => {
  hotspots.value.splice(index, 1)
  selectedHotspot.value = null
  updateHotspots()
}

// 更新热区数据
const updateHotspots = () => {
  editorStore.updateComponentProps(props.componentId, {
    hotspots: [...hotspots.value]
  })
}

// 在 setup 中添加
const toggleHotspotEditor = () => {
  isHotspotEditorOpen.value = !isHotspotEditorOpen.value
}

// 在 setup 中添加
const toggleAnimationEditor = () => {
  isAnimationEditorOpen.value = !isAnimationEditorOpen.value
}

// 在 setup 中添加
const openAnimationEditor = () => {
  showAnimationEditor.value = true
}

// 在 setup 中添加
const closeAnimationEditor = () => {
  showAnimationEditor.value = false
  editingAnimationIndex.value = null
  currentHotspot.value = null
}

// 在 setup 中添加
const editAnimation = (index) => {
  editingAnimationIndex.value = index
  currentHotspot.value = { ...animations.value[index] }  // 复制一份动画数据
  showAnimationEditor.value = true  // 打开编辑器
}

// 在 setup 中添加
const deleteAnimation = (index) => {
  animations.value.splice(index, 1)
  updateAnimations()
}

// 在 setup 中添加
const handleAnimationConfirm = (newAnimations) => {
  if (editingAnimationIndex.value !== null) {
    // 编辑现有动画
    animations.value.splice(editingAnimationIndex.value, 1, ...newAnimations)
  } else {
    // 添加新动画
    animations.value.push(...newAnimations)
  }
  updateAnimations()
  closeAnimationEditor()
}

const updateAnimations = () => {
  editorStore.updateComponentProps(props.componentId, {
    animations: [...animations.value]
  })
}
</script>

<style scoped>
/* 合并原有样式和新增的热区样式 */
.fade-block-editor {
  padding: 16px;
}

.editor-header {
  margin-bottom: 16px;
  font-weight: bold;
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
  margin-bottom: 8px;
}

.url-input-area input:focus {
  border-color: #40a9ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.url-tips {
  font-size: 12px;
  color: #999;
}

.url-tips a {
  color: #1890ff;
  margin-left: 8px;
  text-decoration: none;
}

.url-tips a:hover {
  text-decoration: underline;
}

.hotspot-editor {
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.editor-subheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  user-select: none;
}

.add-hotspot-btn {
  padding: 4px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.hotspot-canvas {
  width: 100%;
  position: relative;
  cursor: crosshair;
}

.hotspot-properties {
  margin-top: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.property-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.property-item label {
  width: 70px;
  flex-shrink: 0;
}

.property-item input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.delete-btn {
  padding: 4px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #ff7875;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-icon {
  display: inline-block;
  transition: transform 0.3s;
  font-size: 12px;
}

.collapse-icon.open {
  transform: rotate(90deg);
}

.hotspot-content {
  margin-top: 12px;
}

.animation-editor-section {
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.animation-content {
  margin-top: 12px;
}

.animation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.animation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.animation-info {
  display: flex;
  gap: 12px;
}

.animation-actions {
  display: flex;
  gap: 8px;
}

.no-animations {
  color: #999;
  text-align: center;
  padding: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 80%;
  height: 80%;
  overflow: hidden;
}

.add-animation-btn {
  padding: 4px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-animation-btn:hover {
  background: #40a9ff;
}
</style> 