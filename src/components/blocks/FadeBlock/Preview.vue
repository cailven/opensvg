<template>
  <section
    class="fade-block"
    :style="sectionStyle"
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
      
      <!-- 热区 -->
      <a 
        v-for="(hotspot, index) in props.hotspots"
        :key="index"
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
    'margin-top': '-1px'
  }
})
</script>

<style scoped>
.fade-block {
  width: 100%;
}
</style> 