<template>
  <section 
    class="scroll-block"
    style="scroll-snap-type: x mandatory; margin-top: -0.33vw; display: flex; overflow-x: auto; overflow-y: hidden; pointer-events: painted"
  >
    <section 
      v-for="child in children" 
      :key="child.id"
      style="min-width: 100%; scroll-snap-align: center; flex: none; flex-direction: column"
    >
      <component 
        :is="componentMap[child.type].preview"
        :componentId="child.id"
        v-bind="child.props"
      />
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
  }
})

const editorStore = useEditorStore()

const children = computed(() => {
  return editorStore.components.filter(comp => comp.parentId === props.componentId)
})
</script>

<style scoped>
.scroll-block {
  width: 100%;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.scroll-block::-webkit-scrollbar {
  display: none;
}
</style>
