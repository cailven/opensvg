<template>
  <div class="properties-panel">
    <div v-if="selectedElement" class="properties-content">
      <!-- 通用属性 -->
      <div class="property-group">
        <h3>基础属性</h3>
        <div class="property-item">
          <label>位置 X:</label>
          <input 
            type="number" 
            v-model.number="selectedElement.x" 
            @input="updateElement"
          >
        </div>
        <div class="property-item">
          <label>位置 Y:</label>
          <input 
            type="number" 
            v-model.number="selectedElement.y" 
            @input="updateElement"
          >
        </div>
      </div>

      <!-- 文本特有属性 -->
      <div v-if="selectedElement.type === 'text'" class="property-group">
        <h3>文本属性</h3>
        <div class="property-item">
          <label>内容:</label>
          <input 
            type="text" 
            v-model="selectedElement.content" 
            @input="updateElement"
          >
        </div>
        <div class="property-item">
          <label>字体大小:</label>
          <input 
            type="number" 
            v-model.number="selectedElement.style.fontSize" 
            @input="updateElement"
          >
        </div>
        <div class="property-item">
          <label>颜色:</label>
          <input 
            type="color" 
            v-model="selectedElement.style.fill" 
            @input="updateElement"
          >
        </div>
      </div>

      <!-- 动画属性 -->
      <div class="property-group">
        <h3>动画</h3>
        <div class="property-item">
          <label>类型:</label>
          <select v-model="animationType" @change="updateAnimation">
            <option value="">无动画</option>
            <option value="fade">淡入淡出</option>
            <option value="scale">缩放</option>
          </select>
        </div>
        <div class="property-item" v-if="animationType">
          <label>持续时间:</label>
          <input 
            type="number" 
            v-model.number="animationDuration" 
            @input="updateAnimation"
          >
        </div>
      </div>
    </div>
    <div v-else class="no-selection">
      请选择一个元素进行编辑
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { storeToRefs } from 'pinia'

const store = useEditorStore()
const { selectedElement } = storeToRefs(store)

const animationType = ref('')
const animationDuration = ref(2)

// 更新元素属性
const updateElement = () => {
  if (selectedElement.value) {
    store.updateElement(selectedElement.value.id, selectedElement.value)
  }
}

// 更新动画
const updateAnimation = () => {
  if (!selectedElement.value) return

  if (!animationType.value) {
    // 移除动画
    store.updateElement(selectedElement.value.id, {
      ...selectedElement.value,
      animation: null
    })
    return
  }

  const animations = {
    fade: {
      values: "0;1;0",
      duration: `${animationDuration.value}s`,
      repeat: "indefinite"
    },
    scale: {
      values: "1;1.2;1",
      duration: `${animationDuration.value}s`,
      repeat: "indefinite"
    }
  }

  store.addAnimation(selectedElement.value.id, animations[animationType.value])
}
</script>

<style scoped>
.properties-panel {
  padding: 16px;
  border-left: 1px solid #eee;
  height: 100%;
  overflow-y: auto;
}

.property-group {
  margin-bottom: 20px;
}

.property-group h3 {
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}

.property-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.property-item label {
  width: 80px;
  font-size: 12px;
}

.property-item input,
.property-item select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.no-selection {
  color: #999;
  text-align: center;
  padding: 20px;
}
</style> 