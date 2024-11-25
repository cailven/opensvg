<template>
  <section class="img-block">
    <img 
      :src="props.imageUrl" 
      :style="imageStyle"
      referrerpolicy="no-referrer"
      @load="onImageLoad"
    >
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  componentId: {
    type: [String, Number],
    required: true
  },
  imageUrl: String,
  imageWidth: Number,
  imageHeight: Number,
  enableClick: {
    type: Boolean,
    default: true
  }
})

const actualWidth = ref(props.imageWidth)
const actualHeight = ref(props.imageHeight)

const imageStyle = computed(() => ({
  'border-width': '0px',
  'border-style': 'initial',
  'border-color': 'initial',
  'visibility': 'visible',
  'width': '100%',
  'height': 'auto',
  'pointer-events': props.enableClick ? 'visible' : 'none',
  'margin-top': '-1px'
}))

const onImageLoad = (event) => {
  actualWidth.value = event.target.naturalWidth
  actualHeight.value = event.target.naturalHeight
}
</script>

<style scoped>
.img-block {
  width: 100%;
}
</style> 