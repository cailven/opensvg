<template>
  <section
    class="fade-block"
    :style="sectionStyle"
  >
    <svg 
      :style="svgStyle"
      :viewBox="`0 0 ${props.imageWidth} ${props.imageHeight}`"
    >
      <!-- 背景图片 -->
      <image 
        :href="props.imageUrl" 
        width="100%" 
        height="100%"
      />
      
      <!-- 热区 -->
      <g v-for="(hotspot, index) in props.hotspots" :key="index">
        <!-- 链接热区 -->
        <a 
          v-if="hotspot.type === 'link'"
          :href="hotspot.link"
          target="_blank"
        >
          <rect
            :x="hotspot.x"
            :y="hotspot.y"
            :width="hotspot.width"
            :height="hotspot.height"
            fill="transparent"
            style="cursor: pointer"
          />
        </a>
        
        <!-- 动画热区 -->
        <g 
          v-else
          :id="hotspot.animateId"
          @click="triggerAnimation(hotspot)"
        >
          <rect
            :x="hotspot.x"
            :y="hotspot.y"
            :width="hotspot.width"
            :height="hotspot.height"
            fill="transparent"
            style="cursor: pointer"
          />
          
        
        </g>
      </g>
        <!-- 动画元素 -->
        <template v-for="(animation, animIndex) in props.animations" :key="animIndex">
            <animate
              v-if="animation.type === 'animate'"
              :attributeName="animation.attributeName"
              :values="animation.values"
              :keyTimes="animation.keyTimes"
              :dur="`${animation.duration}ms`"
              :calcMode="animation.calcMode"
              begin="click"
              fill="freeze"
            />
            <animateTransform
              v-else
              attributeName="transform"
              :type="animation.transformType"
              :values="animation.values"
              :keyTimes="animation.keyTimes"
              :dur="`${animation.duration}ms`"
              :calcMode="animation.calcMode"
              begin="click"
              fill="freeze"
            />
          </template>
    </svg>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  imageUrl: String,
  imageWidth: Number,
  imageHeight: Number,
  hotspots: {
    type: Array,
    default: () => []
  },
  animations: {
    type: Array,
    default: () => []
  }
})

const sectionStyle = computed(() => ({
  '-webkit-touch-callout': 'none',
  'user-select': 'text',
  'overflow': 'hidden',
  'text-align': 'center',
  'line-height': '0'
}))

const svgStyle = computed(() => {
  const url = props.imageUrl ? `url("${props.imageUrl}")` : ''
  return {
    'background-image': url,
    'background-size': '100%',
    'background-repeat': 'no-repeat',
    'display': 'block',
    'line-height': '0',
    'transform': 'scale(1)',
    'margin-top': '-1px',
  }
})

// 添加动画触发方法
const triggerAnimation = (hotspot) => {
  if (hotspot.type !== 'animate') return
  
  const targetElement = document.getElementById(hotspot.animateId)
  if (!targetElement) return
  
  // 获取所有动画元素
  const animateElements = targetElement.querySelectorAll('animate, animateTransform')
  
  // 触发所有动画
  animateElements.forEach(element => {
    // 重置动画
    element.beginElement()
  })
}
</script>

<style scoped>
.fade-block {
  width: 100%;
}

/* 添加动画相关样式 */
.animate-target {
  transition: all 0.3s ease;
}
</style> 