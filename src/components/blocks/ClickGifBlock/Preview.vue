<template>
  <section class="click-gif-block">
    <svg style="pointer-events: none" :viewBox="`0 0 ${props.imageWidth} ${props.imageHeight}`">
      <g v-html="generateNestedStructure()"></g>
    </svg>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  componentId: {
    type: [String, Number],
    required: true
  },
  images: {
    type: Array,
    default: () => []
  },
  imageWidth: {
    type: Number,
    required: true
  },
  imageHeight: {
    type: Number,
    required: true
  }
})

const getImageStyle = (url) => {
  const escapedUrl = url.replace(/"/g, '&quot;')
  return `display: inline-block; width: 100%; background-position: 0% 0%; background-repeat: no-repeat; background-size: 100%; background-image: url(&quot;${escapedUrl}&quot;); margin-top: -1px`
}

const generateNestedStructure = () => {
  const generateLevel = (index) => {
    if (index >= props.images.length) return ''
    
    const currentX = index * 1000
    const image = props.images[index]
    
    let template = `
      <foreignObject x="${currentX}" y="0" width="100%" height="100%">
        <svg style="${getImageStyle(image.url)}" 
             viewBox="0 0 ${props.imageWidth} ${props.imageHeight}">
        </svg>
      </foreignObject>
    `
    
    if (index < props.images.length - 1) {
      template += `
        <g>
          ${generateLevel(index + 1)}
          <rect x="${currentX}" y="0" width="100%" height="100%" 
                opacity="0" style="pointer-events: auto">
            <set attributeName="visibility" from="visible" to="hidden" begin="click"/>
          </rect>
          <animateTransform attributeName="transform" type="translate" 
                          values="-1000 0" fill="freeze" begin="click" dur="1000s"/>
        </g>
      `
    }
    
    return template
  }

  return generateLevel(0)
}
</script> 