<template>
  <section
    :data-v-zeroHeight="componentId"
    class="zero-height-block"
    style="text-align: center; height: 0px; line-height: 0; width: 100%; margin: -1px auto 0px; overflow: visible;"
  >
    <component
      v-for="child in children"
      :key="child.id"
      :is="componentMap[child.type].preview"
      :componentId="child.id"
      v-bind="child.props"
    />
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
[data-v-zeroHeight-content] {
  position: relative;
  z-index: 1;
  display: inline-block;
  width: 100%;
}
</style> 