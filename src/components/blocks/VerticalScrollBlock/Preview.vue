<template>
  <section 
    class="vertical-scroll-block"
    :style="`width: 100%; height: ${props.containerHeight}vw; vertical-align: top; overflow-y: auto; margin-top: -0.33vw; pointer-events: visible`"
  >
    <section style="overflow: hidden">
      <section style="max-width: 100%; vertical-align: middle">
        <section style="vertical-align: middle">
          <component 
            v-for="child in children" 
            :key="child.id"
            :is="componentMap[child.type].preview"
            :componentId="child.id"
            v-bind="child.props"
          />
        </section>
      </section>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../../../stores/editor'
import { componentMap } from '../../../stores/editor'

const props = defineProps({
  componentId: {
    type: [String, Number],
    required: true
  },
  containerHeight: {
    type: Number,
    default: 160
  }
})

const editorStore = useEditorStore()

const children = computed(() => {
  return editorStore.components.filter(comp => comp.parentId === props.componentId)
})
</script>

<style scoped>
.vertical-scroll-block {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.vertical-scroll-block::-webkit-scrollbar {
  display: none;
}
</style> 