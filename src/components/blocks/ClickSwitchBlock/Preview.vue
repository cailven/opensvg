<template>
  <section
    style="display: block;width: 100%;line-height: 0;margin-top: -1px"
  >
    <section style="height: 0px;overflow: visible">
      <svg
        :viewBox="`0 0 ${props.beforeImageWidth} ${props.beforeImageHeight}`"
        :style="beforeImageStyle"
        width="100%"
      ></svg>
    </section>
    <section style="line-height: 0">
      <svg
        :viewBox="`0 0 ${props.afterImageWidth} ${props.afterImageHeight}`"
        opacity="0"
        :style="afterImageStyle"
        width="100%"
      >
        <animate
          attributeName="opacity"
          values="0;1;1"
          begin="click"
          dur="1000s"
          fill="freeze"
          keyTimes="0;0.0000000000001;1"
          calcMode="discrete"
        ></animate>
      </svg>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  beforeImageUrl: String,
  beforeImageWidth: Number,
  beforeImageHeight: Number,
  afterImageUrl: String,
  afterImageWidth: Number,
  afterImageHeight: Number
})

const beforeImageStyle = computed(() => ({
  display: 'block',
  transform: 'scale(1)',
  backgroundImage: `url("${props.beforeImageUrl}")`,
  backgroundSize: '100%',
  backgroundRepeat: 'no-repeat'
}))

const afterImageStyle = computed(() => ({
  display: 'block',
  transform: 'scale(1)',
  backgroundImage: `url("${props.afterImageUrl}")`,
  backgroundSize: '100%',
  backgroundRepeat: 'no-repeat',
  pointerEvents: 'visiblePainted'
}))
</script> 