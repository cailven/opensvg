<template>
  <div class="custom-block-editor">
    <div class="editor-header">
      <span>自定义组件</span>
    </div>
    
    <div class="editor-content">
      <!-- HTML文件上传区域 -->
      <div class="html-upload-section">
        <h4>上传HTML文件</h4>
        <input 
          type="file" 
          ref="fileInput"
          accept=".html"
          @change="handleHtmlUpload"
          style="display: none"
        >
        <button @click="triggerFileUpload" class="upload-btn">
          选择HTML文件
        </button>
      </div>

      <!-- 图片替换区域 -->
      <div v-if="imageNodes.length" class="images-section">
        <h4>替换图片</h4>
        <div v-for="(node, index) in imageNodes" :key="index" class="image-item">
          <div class="image-info">图片 {{ index + 1 }}</div>
          <ImageUploader
            :image-url="node.imageUrl"
            @update:image="(img) => handleImageUpdate(index, img)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEditorStore } from '../../../stores/editor'
import ImageUploader from '../../ImageUploader.vue'

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

const editorStore = useEditorStore()
const fileInput = ref(null)

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleHtmlUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const htmlContent = e.target.result
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    
    // 查找所有带有背景图片的SVG节点和img节点
    const svgNodes = doc.querySelectorAll('svg[style*="background-image"]')
    const imgNodes = doc.querySelectorAll('img[src]')
    
    const imageNodes = []
    
    // 处理SVG背景图片
    svgNodes.forEach(svg => {
      const style = svg.getAttribute('style')
      const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/)
      if (match) {
        imageNodes.push({
          type: 'svg',
          imageUrl: match[1],
          originalNode: svg.outerHTML
        })
      }
    })
    
    // 处理img标签
    imgNodes.forEach(img => {
      imageNodes.push({
        type: 'img',
        imageUrl: img.src,
        originalNode: img.outerHTML
      })
    })

    // 更新组件属性
    editorStore.updateComponentProps(props.componentId, {
      htmlContent: doc.body.innerHTML,
      imageNodes
    })
  }
  reader.readAsText(file)
}

const handleImageUpdate = (index, { url }) => {
  const newImageNodes = [...props.imageNodes]
  newImageNodes[index] = {
    ...newImageNodes[index],
    imageUrl: url
  }
  editorStore.updateComponentProps(props.componentId, {
    imageNodes: newImageNodes
  })
}
</script>

<style scoped>
.custom-block-editor {
  width: 100%;
}

.editor-header {
  height: 40px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.editor-content {
  padding: 16px;
}

.html-upload-section {
  margin-bottom: 20px;
}

.upload-btn {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-btn:hover {
  background-color: #40a9ff;
}

.images-section {
  margin-top: 20px;
}

.image-item {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.image-info {
  margin-bottom: 8px;
  font-weight: bold;
}
</style> 