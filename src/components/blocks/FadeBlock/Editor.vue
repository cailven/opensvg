<template>
  <div class="fade-block-editor">
    <div class="editor-header">
      <span>无缝图组件</span>
    </div>
    
    <!-- 替换原有的图片上传区域为 ImageUploader 组件 -->
    <div class="editor-content">
      <ImageUploader
        :image-url="props.imageUrl"
        @update:image="handleImageUpdate"
      />
    </div>

    <!-- 热区编辑区域 -->
    <div v-if="props.imageUrl" class="hotspot-editor">
      <div class="editor-subheader" @click="toggleHotspotEditor">
        <div class="header-left">
          <i :class="['collapse-icon', isHotspotEditorOpen ? 'open' : '']">▶</i>
          <span>绘制热区</span>
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
    <div class="animation-editor-section" v-if="false">
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
import ImageUploader from '../../ImageUploader.vue'  // 导入 ImageUploader 组件

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

// 添加新的图片更新处理方法
const handleImageUpdate = ({ url, width, height }) => {
  editorStore.updateComponentProps(props.componentId, {
    imageUrl: url,
    imageWidth: width,
    imageHeight: height,
    hotspots: [] // 重置热区
  })
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