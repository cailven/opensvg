<template>
  <div class="toolbar">
    <button @click="addText">文本</button>
    <button @click="addShape">图形</button>
    <button @click="addAnimation">动画</button>
  </div>
</template>

<script setup>
import { useEditorStore } from '@/stores/editor'

const store = useEditorStore()

const addText = () => {
  store.addElement({
    type: 'text',
    content: '点击编辑文本',
    x: 100,
    y: 100,
    style: {
      fontSize: '16px',
      fill: '#000000'
    }
  })
}

const addAnimation = () => {
  if (store.selectedElement) {
    store.addAnimation(store.selectedElement.id, {
      values: "0;1;0",
      duration: "2s",
      repeat: "indefinite"
    })
  }
}
</script> 