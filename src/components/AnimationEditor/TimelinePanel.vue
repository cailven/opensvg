<template>
  <div class="timeline-panel">
    <!-- 时间刻度尺 -->
    <div class="timeline-header">
      <div class="track-label-space"></div>
      <div class="timeline-ruler" ref="rulerRef">
        <div 
          v-for="i in rulerMarks" 
          :key="i" 
          class="ruler-mark"
          :style="{ left: `${i * 100}px` }"
        >
          {{ i * 100 }}ms
        </div>
      </div>
    </div>
    
    <!-- 轨道列表 -->
    <div class="tracks-container">
      <div 
        v-for="track in tracks" 
        :key="track.id" 
        class="track"
      >
        <!-- 轨道标题 -->
        <div class="track-label">
          <input 
            v-model="track.name"
            class="track-name"
            @click.stop
          >
          <select 
            v-if="track.type === 'animateTransform'"
            v-model="track.transformType"
            class="track-type"
            @click.stop
          >
            <option value="translate">位移</option>
            <option value="scale">缩放</option>
            <option value="rotate">旋转</option>
          </select>
          <select 
            v-else
            v-model="track.attributeName"
            class="track-type"
            @click.stop
          >
            <option value="opacity">透明度</option>
            <option value="visibility">可见性</option>
            <option value="fill">填充色</option>
          </select>
          <button 
            class="delete-track-btn"
            @click.stop="deleteTrack(track.id)"
            title="删除轨道"
          >
            ×
          </button>
        </div>
        
        <!-- 轨道内容区 -->
        <div 
          class="track-content"
          @click="handleTrackClick($event, track)"
        >
          <!-- 时间指示器 -->
          <div 
            class="time-indicator"
            :style="{ left: `${currentTime / track.duration * 100}%` }"
          ></div>
          
          <!-- 关键帧 -->
          <div 
            v-for="keyframe in track.keyframes"
            :key="keyframe.id"
            class="keyframe"
            :class="{ 
              selected: selectedKeyframe?.id === keyframe.id,
              fixed: keyframe.isFixed 
            }"
            :style="{ left: `${keyframe.time}%` }"
            @click.stop="selectKeyframe(keyframe)"
            @mousedown="startDragKeyframe($event, keyframe)"
            @contextmenu.prevent="showKeyframeMenu($event, keyframe)"
          ></div>
        </div>
      </div>
    </div>

    <!-- 添加右键菜单 -->
    <div 
      v-if="showContextMenu"
      class="context-menu"
      :style="contextMenuStyle"
    >
      <div 
        class="context-menu-item delete"
        @click="deleteKeyframe"
      >
        删除关键帧
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tracks: {
    type: Array,
    required: true,
    default: () => []
  },
  currentTime: {
    type: Number,
    default: 0
  },
  selectedKeyframe: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['add-keyframe', 'select-keyframe', 'update-keyframe'])

const rulerRef = ref(null)
const isDragging = ref(false)
const draggedKeyframe = ref(null)

// 添加右键菜单相关状态
const showContextMenu = ref(false)
const contextMenuStyle = ref({
  top: '0px',
  left: '0px'
})
const selectedForDelete = ref(null)

// 计算时间刻度标记
const rulerMarks = computed(() => {
  if (!props.tracks || props.tracks.length === 0) return 10
  const maxDuration = Math.max(...props.tracks.map(t => t.duration || 1000))
  return Math.ceil(maxDuration / 100)
})

// 点击轨道添加关键帧
const handleTrackClick = (event, track) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const time = (clickX / rect.width) * 100
  
  const normalizedTime = Math.max(0, Math.min(100, time))
  
  emit('add-keyframe', track.id, normalizedTime)
}

// 选择关键帧
const selectKeyframe = (keyframe) => {
  emit('select-keyframe', keyframe)
}

// 开始拖拽关键帧
const startDragKeyframe = (event, keyframe) => {
  if (keyframe.isFixed || keyframe.isEndFrame) return
  
  isDragging.value = true
  draggedKeyframe.value = keyframe
  
  const trackContent = event.currentTarget.parentElement
  const initialRect = trackContent.getBoundingClientRect()
  
  const handleMouseMove = (e) => {
    if (!isDragging.value || !draggedKeyframe.value) return
    
    const track = props.tracks.find(t => t.id === keyframe.trackId)
    if (!track) return
    
    const moveX = e.clientX - initialRect.left
    const time = Math.max(0, Math.min(100, (moveX / initialRect.width) * 100))
    
    emit('update-keyframe', {
      ...draggedKeyframe.value,
      time
    })
  }
  
  const handleMouseUp = () => {
    isDragging.value = false
    draggedKeyframe.value = null
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }
  
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  
  event.preventDefault()
  event.stopPropagation()
}

// 添加删除轨道方法
const deleteTrack = (trackId) => {
  if (confirm('确定要删除这个动画轨道吗？')) {
    const trackIndex = props.tracks.findIndex(t => t.id === trackId)
    if (trackIndex !== -1) {
      if (props.selectedKeyframe?.trackId === trackId) {
        emit('select-keyframe', null)
      }
      emit('delete-track', trackId)
    }
  }
}

// 显示右键菜单
const showKeyframeMenu = (event, keyframe) => {
  event.preventDefault()
  showContextMenu.value = true
  selectedForDelete.value = keyframe
  
  const x = Math.min(event.clientX, window.innerWidth - 100)
  const y = Math.min(event.clientY, window.innerHeight - 50)
  
  contextMenuStyle.value = {
    top: `${y}px`,
    left: `${x}px`
  }
  
  const closeMenu = () => {
    showContextMenu.value = false
    selectedForDelete.value = null
    window.removeEventListener('click', closeMenu)
  }
  window.addEventListener('click', closeMenu)
}

// 删除关键帧
const deleteKeyframe = () => {
  if (!selectedForDelete.value || selectedForDelete.value.isFixed || selectedForDelete.value.isEndFrame) return
  
  const track = props.tracks.find(t => t.id === selectedForDelete.value.trackId)
  if (!track) return
  
  const keyframeIndex = track.keyframes.findIndex(k => k.id === selectedForDelete.value.id)
  if (keyframeIndex === -1) return
  
  if (track.keyframes.length <= 2) {
    alert('动画轨道至少需要保留两个关键帧！')
    return
  }
  
  emit('delete-keyframe', selectedForDelete.value)
  
  if (props.selectedKeyframe?.id === selectedForDelete.value.id) {
    emit('select-keyframe', null)
  }
  
  showContextMenu.value = false
  selectedForDelete.value = null
}
</script>

<style scoped>
.timeline-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #eee;
}

.timeline-header {
  display: flex;
  border-bottom: 1px solid #eee;
}

.track-label-space {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid #eee;
}

.timeline-ruler {
  flex: 1;
  height: 30px;
  position: relative;
  overflow: hidden;
}

.ruler-mark {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: 12px;
  color: #999;
  padding-top: 2px;
  border-left: 1px solid #eee;
}

.tracks-container {
  flex: 1;
  overflow-y: auto;
}

.track {
  display: flex;
  height: 40px;
  border-bottom: 1px solid #eee;
}

.track-label {
  width: 280px;
  flex-shrink: 0;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fafafa;
  border-right: 1px solid #eee;
}

.track-name {
  flex: 1;
  border: 1px solid transparent;
  padding: 2px 4px;
  font-size: 12px;
  background: transparent;
}

.track-name:hover {
  border-color: #d9d9d9;
}

.track-type {
  width: 80px;
  font-size: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}

.track-content {
  flex: 1;
  position: relative;
  background: #fff;
}

.time-indicator {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: #f5222d;
  pointer-events: none;
}

.keyframe {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #1890ff;
  border: 2px solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 1;
}

.keyframe:hover {
  background: #40a9ff;
}

.keyframe.selected {
  background: #f5222d;
  border-color: #fff;
}

.keyframe.fixed {
  border: 2px solid #ff4d4f;
  cursor: not-allowed;
}

.delete-track-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.delete-track-btn:hover {
  color: #ff4d4f;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 4px 0;
}

.context-menu-item {
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
}

.context-menu-item:hover {
  background: #f5f5f5;
}

.context-menu-item.delete {
  color: #ff4d4f;
}

.context-menu-item.delete:hover {
  background: #fff1f0;
}
</style>
