<template>
<svg 
      :style="svgStyle"
      :viewBox="`0 0 ${actualWidth} ${actualHeight}`"
    >
      <g v-for="(hotspot, index) in props.hotspots" :key="index">
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
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'

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

const svgStyle = computed(() => {
  const url = props.imageUrl ? `url("${props.imageUrl}")` : ''
  return {
    'background-image': url,
    'background-size': '100%',
    'margin-top': '-0.33vw;',
  }
})

const actualWidth = ref(props.imageWidth)
const actualHeight = ref(props.imageHeight)

const loadImage = (url) => {
  if (!url) return
  
  const img = new Image()
  img.referrerPolicy = 'no-referrer'
  img.src = url
  img.onload = () => {
    actualWidth.value = img.naturalWidth
    actualHeight.value = img.naturalHeight
  }
}

// 监听 imageUrl 的变化
watch(() => props.imageUrl, (newUrl) => {
  loadImage(newUrl)
}, { immediate: true })

// 可以保留 onMounted 作为额外保障
onMounted(() => {
  loadImage(props.imageUrl)
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