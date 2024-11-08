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
      <div class="editor-subheader">
        <span>点击热区</span>
        <button class="add-hotspot-btn" @click="startDrawing">添加热区</button>
      </div>
      
      <div 
        class="hotspot-canvas"
        ref="canvasRef"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
      >
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

      <!-- 热区属性编辑 -->
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '../../../stores/editor'

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
</style> 