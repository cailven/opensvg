<template>
  <div class="properties-panel">
    <template v-if="keyframe && track">
      <div class="panel-section">
        <h3>关键帧属性</h3>
        
        <!-- 时间设置 -->
        <div class="property-item">
          <label>时间：</label>
          <div class="input-with-unit">
            <input 
              type="number" 
              v-model.number="localKeyframe.time"
              step="1"
              min="0"
              max="100"
              :disabled="localKeyframe.isFixed"
              @change="updateKeyframe"
            >
            <span class="unit">%</span>
          </div>
        </div>

        <!-- 基础动画值设置 -->
        <template v-if="track?.type === 'animate'">
          <div class="property-item">
            <label>值：</label>
            <template v-if="track.attributeName === 'opacity'">
              <input 
                type="number" 
                v-model.number="localKeyframe.value"
                step="0.1"
                min="0"
                max="1"
                @change="updateKeyframe"
              >
            </template>
            <template v-else-if="track.attributeName === 'visibility'">
              <select 
                v-model="localKeyframe.value"
                @change="updateKeyframe"
              >
                <option value="visible">显示</option>
                <option value="hidden">隐藏</option>
              </select>
            </template>
            <template v-else-if="track.attributeName === 'fill'">
              <input 
                type="color" 
                v-model="localKeyframe.value"
                @change="updateKeyframe"
              >
            </template>
          </div>
        </template>

        <!-- 变换动画值设置 -->
        <template v-else-if="track?.type === 'animateTransform'">
          <template v-if="track.transformType === 'translate'">
            <div class="property-item">
              <label>X：</label>
              <input 
                type="number" 
                v-model.number="transformValues[0]"
                :disabled="localKeyframe.isFixed"
                @change="updateTransformValue"
              >
            </div>
            <div class="property-item">
              <label>Y：</label>
              <input 
                type="number" 
                v-model.number="transformValues[1]"
                :disabled="localKeyframe.isFixed"
                @change="updateTransformValue"
              >
            </div>
          </template>
          
          <template v-else-if="track.transformType === 'scale'">
            <div class="property-item">
              <label>缩放比例：</label>
              <input 
                type="number" 
                v-model.number="transformValues[0]"
                step="0.1"
                :disabled="localKeyframe.isFixed"
                @change="updateTransformValue"
              >
            </div>
          </template>
          
          <template v-else-if="track.transformType === 'rotate'">
            <div class="property-item">
              <label>角度：</label>
              <div class="input-with-unit">
                <input 
                  type="number" 
                  v-model.number="transformValues[0]"
                  :disabled="localKeyframe.isFixed"
                  @change="updateTransformValue"
                >
                <span class="unit">°</span>
              </div>
            </div>
          </template>
        </template>

        <!-- 缓动设置 -->
        <div class="property-item">
          <label>缓动：</label>
          <select 
            v-model="localKeyframe.easing"
            :disabled="localKeyframe.isFixed"
            @change="updateKeyframe"
          >
            <option value="linear">线性</option>
            <option value="ease">缓动</option>
            <option value="ease-in">缓入</option>
            <option value="ease-out">缓出</option>
            <option value="ease-in-out">缓入缓出</option>
          </select>
        </div>
      </div>

      <!-- 轨道属性 -->
      <div class="panel-section">
        <h3>轨道属性</h3>
        <div class="property-item">
          <label>持续时间：</label>
          <div class="input-with-unit">
            <input 
              type="number" 
              :value="track?.duration || 1000"
              @input="updateTrackDuration"
              step="100"
              min="100"
            >
            <span class="unit">ms</span>
          </div>
        </div>
        
        <div class="property-item">
          <label>插值方式：</label>
          <select 
            :value="track?.calcMode || 'linear'"
            @change="updateTrackCalcMode"
          >
            <option value="linear">线性</option>
            <option value="discrete">离散</option>
            <option value="paced">均速</option>
          </select>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  keyframe: {
    type: Object,
    default: null
  },
  tracks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:keyframe', 'update:track'])

// 本地关键帧数据
const localKeyframe = ref(null)

// 获取当前轨道
const track = computed(() => {
  if (!props.keyframe || !props.tracks) return null
  return props.tracks.find(t => t.id === props.keyframe?.trackId)
})

// 解析变换值
const transformValues = computed({
  get() {
    if (!track.value || !localKeyframe.value || track.value.type !== 'animateTransform') {
      return [0, 0]
    }
    const values = localKeyframe.value.value?.split(' ').map(Number) || [0, 0]
    return values.length === 2 ? values : [0, 0]
  },
  set(newValues) {
    if (!track.value || !localKeyframe.value || track.value.type !== 'animateTransform') return
    localKeyframe.value.value = newValues.join(' ')
  }
})

// 更新关键帧
const updateKeyframe = () => {
  if (!localKeyframe.value) return
  emit('update:keyframe', { ...localKeyframe.value })
}

// 更新变换值
const updateTransformValue = () => {
  if (!localKeyframe.value) return
  localKeyframe.value.value = transformValues.value.join(' ')
  updateKeyframe()
}

// 更新轨道
const updateTrack = () => {
  if (!track.value) return
  emit('update:track', { ...track.value })
}

// 添加新的更新方法
const updateTrackDuration = (event) => {
  if (!track.value) return
  const duration = Number(event.target.value)
  if (isNaN(duration)) return
  
  track.value.duration = duration
  updateTrack()
}

const updateTrackCalcMode = (event) => {
  if (!track.value) return
  track.value.calcMode = event.target.value
  updateTrack()
}

// 监听输入属性变化
watch(() => props.keyframe, (newKeyframe) => {
  localKeyframe.value = newKeyframe ? { ...newKeyframe } : null
}, { immediate: true, deep: true })
</script>

<style scoped>
.properties-panel {
  width: 280px;
  padding: 16px;
  background: #fff;
  border-left: 1px solid #eee;
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 24px;
}

.panel-section h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #000;
  font-weight: 500;
}

.property-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.property-item label {
  width: 80px;
  font-size: 12px;
  color: #666;
}

.property-item input,
.property-item select {
  flex: 1;
  height: 24px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  font-size: 12px;
}

.property-item input[type="color"] {
  padding: 0;
  width: 24px;
  height: 24px;
}

.input-with-unit {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-with-unit input {
  flex: 1;
}

.unit {
  font-size: 12px;
  color: #999;
}

.property-item input:hover,
.property-item select:hover {
  border-color: #40a9ff;
}

.property-item input:focus,
.property-item select:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}
</style>
