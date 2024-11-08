<template>
  <div class="editor-container">
    <!-- 左侧组件列表 -->
    <ComponentList class="component-list" />
    <!-- 中间组件树编辑区 -->
    <TreeEditor class="tree-editor" />
    <!-- 右侧预览区域 -->
    <Preview class="preview" />
  </div>
</template>

<script setup>
import ComponentList from './components/ComponentList.vue'
import TreeEditor from './components/TreeEditor.vue'
import Preview from './components/Preview.vue'
</script>

<style scoped>
.editor-container {
  display: grid;
  grid-template-columns: 200px 300px 1fr;
  gap: 20px;
  height: 100vh;
  padding: 20px;
}

.component-list {
  border-right: 1px solid #eee;
}

.tree-editor {
  border-right: 1px solid #eee;
}

.preview {
  background: #f5f5f5;
}
</style> 