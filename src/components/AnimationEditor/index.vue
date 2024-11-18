<template>
  <div class="animation-editor">
    <!-- 工具栏 -->
    <div class="editor-header">
      <h3>动画编辑器</h3>
      <div class="toolbar">
        <button @click="addBasicTrack">添加基础动画</button>
        <button @click="addTransformTrack">添加变换动画</button>
        <button @click="preview">预览</button>
        <button class="confirm-btn" @click="confirmAnimations">确定</button>
        <button class="close-btn" @click="$emit('close')">关闭</button>
      </div>
    </div>

    <!-- 编辑器主体 -->
    <div class="editor-body">
      <!-- 时间轴面板 -->
      <TimelinePanel
        :tracks="tracks"
        :current-time="currentTime"
        :selected-keyframe="selectedKeyframe"
        @add-keyframe="addKeyframe"
        @select-keyframe="selectKeyframe"
        @update-keyframe="updateKeyframe"
        @delete-track="deleteTrack"
        @delete-keyframe="deleteKeyframe"
      />

      <!-- 属性面板 -->
      <PropertiesPanel
        :keyframe="selectedKeyframe"
        :tracks="tracks"
        @update:keyframe="updateKeyframe"
        @update:track="updateTrack"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TimelinePanel from './TimelinePanel.vue'
import PropertiesPanel from './PropertiesPanel.vue'

// 定义属性
const props = defineProps({
  hotspot: {
    type: Object,
    required: true
  }
})

// 定义事件
const emit = defineEmits(['close', 'update:hotspot', 'confirm'])

// 动画轨道数据
const tracks = ref([
  {
    id: 1,
    name: '基础动画 1',
    type: 'animate',
    attributeName: 'opacity',
    duration: 1000,
    calcMode: 'linear',
    keyframes: [
      { id: 1, trackId: 1, time: 0, value: '0' , isFixed: true},
      { id: 2, trackId: 1, time: 100, value: '1', isFixed: true, isEndFrame: true }
    ]
  }
])

// 当前时间
const currentTime = ref(0)

// 选中的关键帧
const selectedKeyframe = ref(null)

// 添加基础动画轨道
const addBasicTrack = () => {
  const newTrack = {
    id: Date.now(),
    name: `基础动画 ${tracks.value.length + 1}`,
    type: 'animate',
    attributeName: 'opacity',
    duration: 1000,
    calcMode: 'linear',
    keyframes: [
      { id: Date.now(), trackId: Date.now(), time: 0, value: '0', isFixed: true },
      { id: Date.now() + 1, trackId: Date.now(), time: 100, value: '1', isFixed: true, isEndFrame: true }
    ]
  }
  tracks.value.push(newTrack)
}

// 添加变换动画轨道
const addTransformTrack = () => {
  const newTrack = {
    id: Date.now(),
    name: `变换动画 ${tracks.value.length + 1}`,
    type: 'animateTransform',
    transformType: 'translate',
    duration: 1000,
    calcMode: 'linear',
    keyframes: [
      { id: Date.now(), trackId: Date.now(), time: 0, value: '0 0', isFixed: true },
      { id: Date.now() + 1, trackId: Date.now(), time: 100, value: '0 0', isFixed: true, isEndFrame: true }
    ]
  }
  tracks.value.push(newTrack)
}

// 添加关键帧
const addKeyframe = (trackId, time) => {
  const track = tracks.value.find(t => t.id === trackId)
  if (!track) return

  // 确保新增帧不会超过100%
  if (time >= 100) return

  const newKeyframe = {
    id: Date.now(),
    trackId,
    time,
    value: track.type === 'animateTransform' ? '0 0' : '0'
  }
  
  track.keyframes.push(newKeyframe)
  selectedKeyframe.value = newKeyframe
}

// 选择关键帧
const selectKeyframe = (keyframe) => {
  selectedKeyframe.value = keyframe
}

// 更新关键帧
const updateKeyframe = (keyframe) => {
  const track = tracks.value.find(t => t.id === keyframe.trackId)
  if (!track) return

  const index = track.keyframes.findIndex(k => k.id === keyframe.id)
  if (index === -1) return

  track.keyframes[index] = keyframe
  selectedKeyframe.value = keyframe
}

// 更新轨道
const updateTrack = (updatedTrack) => {
  const index = tracks.value.findIndex(t => t.id === updatedTrack.id)
  if (index === -1) return
  
  tracks.value[index] = updatedTrack
}

// 预览动画
const preview = () => {
  // 重置当前时间
  currentTime.value = 0
  
  // 创建预览动画
  const previewDuration = Math.max(...tracks.value.map(t => t.duration))
  const startTime = performance.now()
  
  const animate = () => {
    const elapsed = performance.now() - startTime
    if (elapsed >= previewDuration) {
      currentTime.value = 0
      return
    }
    
    currentTime.value = elapsed
    requestAnimationFrame(animate)
  }
  
  requestAnimationFrame(animate)
}

// 修改 confirmAnimations 方法
const confirmAnimations = () => {
  // 检查轨道是否为空
  if (!tracks.value || tracks.value.length === 0) {
    alert('请先添加动画轨道！')
    return
  }

  // 将动画数据转换为 SVG 动画标签数据
  const animations = tracks.value
    .filter(track => track.keyframes && track.keyframes.length >= 2)
    .map(track => ({
      type: track.type, // 'animate' 或 'animateTransform'
      attributeName: track.type === 'animate' ? track.attributeName : 'transform',
      transformType: track.type === 'animateTransform' ? track.transformType : undefined,
      duration: track.duration,
      calcMode: track.calcMode,
      values: track.keyframes.map(k => k.value).join(';'),
      keyTimes: track.keyframes.map(k => k.time / 100).join(';')
    }))

  // 发出事件，将动画数据传递给父组件
  emit('confirm', animations)
  emit('close')
}

// 暴露方法给父组件
// defineExpose({
//   getAnimationCode
// })

// 添加删除轨道的处理方法
const deleteTrack = (trackId) => {
  const index = tracks.value.findIndex(t => t.id === trackId)
  if (index !== -1) {
    tracks.value.splice(index, 1)
    // 如果删除的轨道包含当前选中的关键帧，清除选中状态
    if (selectedKeyframe.value?.trackId === trackId) {
      selectedKeyframe.value = null
    }
  }
}

// 添加删除关键帧的处理方法
const deleteKeyframe = (keyframe) => {
  const track = tracks.value.find(t => t.id === keyframe.trackId)
  if (!track) return
  
  const keyframeIndex = track.keyframes.findIndex(k => k.id === keyframe.id)
  if (keyframeIndex !== -1) {
    track.keyframes.splice(keyframeIndex, 1)
    
    // 如果删除的是当前选中的关键帧，清除选中状态
    if (selectedKeyframe.value?.id === keyframe.id) {
      selectedKeyframe.value = null
    }
  }
}

// 在处理关键帧数据时添加排序逻辑
const getAnimationAttributes = (track) => {
  // 按时间顺序对关键帧进行排序
  const sortedKeyframes = [...track.keyframes].sort((a, b) => a.time - b.time)
  
  // 生成排序后的关键帧时间和值
  const keyTimes = sortedKeyframes.map(kf => (kf.time / 100).toFixed(4)).join(';')
  const values = sortedKeyframes.map(kf => kf.value).join(';')
  
  return {
    keyTimes,
    values,
    // ... other attributes
  }
}
</script>

<style scoped>
.animation-editor {
  display: flex;
  flex-direction: column;
  height: 80%;
  width: 80%;
  background: #fff;
  border-radius: 8px;
}

.editor-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.toolbar button {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  cursor: pointer;
}

.toolbar button:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.close-btn {
  margin-left: 16px;
  border-color: #ff4d4f !important;
  color: #ff4d4f;
}

.close-btn:hover {
  border-color: #ff7875 !important;
  color: #ff7875 !important;
}

/* 添加预览相关样式 */
.preview-overlay {
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

.preview-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.confirm-btn {
  background: #1890ff !important;
  color: white !important;
  border-color: #1890ff !important;
}

.confirm-btn:hover {
  background: #40a9ff !important;
  border-color: #40a9ff !important;
}
</style>
