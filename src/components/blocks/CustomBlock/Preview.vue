<template>
  <section class="custom-block">
    <div v-if="processedHtml" v-html="processedHtml"></div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  componentId: {
    type: [String, Number],
    required: true
  },
  htmlContent: {
    type: String,
    default: ''
  },
  imageNodes: {
    type: Array,
    default: () => []
  }
})

// 处理HTML内容，替换图片
const processedHtml = computed(() => {
  if (!props.htmlContent || !props.imageNodes.length) return props.htmlContent
  
  let html = props.htmlContent
  props.imageNodes.forEach(node => {
    const { type, imageUrl, originalNode } = node
    if (type === 'svg') {
      // 替换SVG背景图
      const newNode = originalNode.replace(
        /background-image:\s*url\(['"]?[^'"]+['"]?\)/,
        `background-image: url('${imageUrl}')`
      )
      html = html.replace(originalNode, newNode)
    } else if (type === 'img') {
      // 替换img src
      const newNode = originalNode.replace(
        /src=['"]([^'"]+)['"]/,
        `src="${imageUrl}"`
      )
      html = html.replace(originalNode, newNode)
    }
  })
  
  return html
})
</script>

<style scoped>
.custom-block {
  width: 100%;
}
</style> 