<template>
  <div class="preview-container">
    <!-- 工具栏 -->
    <div class="preview-toolbar">
      <div class="toolbar-buttons">
        <button class="toolbar-btn" @click="showCode" title="查看代码">
          <i class="icon-code">
            <svg viewBox="0 0 1024 1024" width="16" height="16">
              <path d="M516.4 273.5l-50.8-50.8L123.4 512l342.2 289.3 50.8-50.8L241.1 512z M507.6 750.5l50.8 50.8L900.6 512 558.4 222.7l-50.8 50.8L782.9 512z" fill="currentColor"/>
            </svg>
          </i>
        </button>
       <button class="toolbar-btn" @click="refreshPreview" title="刷新">
          <i class="icon-refresh">
            <svg viewBox="0 0 1024 1024" width="16" height="16">
              <path d="M512 922.24c-226.88 0-410.24-183.36-410.24-410.24S285.12 101.76 512 101.76c151.25 0 289.28 83.2 360.32 216.32l-89.6 38.4C724.48 245.76 622.72 184.32 512 184.32c-180.48 0-327.68 147.2-327.68 327.68S331.52 839.68 512 839.68s327.68-147.2 327.68-327.68h82.56c0 226.88-183.36 410.24-410.24 410.24z" fill="currentColor"/>
            </svg>
          </i>
        </button>
       <!--   <button class="toolbar-btn" @click="showQRCode" title="手机预览">
          <i class="icon-qrcode">
            <svg viewBox="0 0 1024 1024" width="16" height="16">
              <path d="M149.76 149.76v298.24h298.24V149.76H149.76z m234.24 234.24H213.76V213.76h170.24v170.24zM149.76 576v298.24h298.24V576H149.76z m234.24 234.24H213.76v-170.24h170.24v170.24zM576 149.76v298.24h298.24V149.76H576z m234.24 234.24h-170.24V213.76h170.24v170.24zM576 576v85.76h85.76V576H576z m298.24 298.24v-85.76h-85.76v85.76h85.76zM576 746.24v128h128v-128H576z m213.76-85.76v-84.48h-85.76v84.48h85.76z" fill="currentColor"/>
            </svg>
          </i>
        </button> -->
      </div>
    </div>

    <!-- 设备预览区 -->
    <div class="device-wrapper" ref="deviceWrapper">
      <div class="device-frame" :style="{ transform: `scale(${scale})` }">
        <div class="device-notch"></div>
        <div class="device-screen">
          <div class="preview-area" :key="refreshKey">
            <component
              v-for="comp in topLevelComponents"
              :key="comp.id"
              :is="componentMap[comp.type].preview"
              :componentId="comp.id"
              v-bind="comp.props"
            />
            <div v-if="!editorStore.components.length" class="empty-tip">
              从左侧拖拽组件到此处
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 代码预览弹窗 -->
    <div v-if="showCodeDialog" class="dialog-overlay" @click="showCodeDialog = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>微信公众号代码</h3>
          <div class="dialog-actions">
            <button class="copy-btn" @click="copyCode">复制代码</button>
            <button class="close-btn" @click="showCodeDialog = false">×</button>
          </div>
        </div>
        <textarea class="code-content">
         {{ generateCode() }}
        </textarea>
        <div class="dialog-footer">
          <p class="tips">提示：复制代码后可直接粘贴到微信公众号后台编辑器中</p>
        </div>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <div v-if="showQRCodeDialog" class="dialog-overlay" @click="closePreview">
      <div class="dialog-content mobile-preview" @click.stop>
        <div class="dialog-header">
          <h3>移动端预览</h3>
          <button class="close-btn" @click="closePreview">×</button>
        </div>
        <div class="mobile-container">
          <!-- 手机壳模拟 -->
          <div class="mobile-frame">
            <iframe
              ref="previewFrame"
              class="mobile-iframe"
              :srcdoc="generatePreviewHtml()"
              frameborder="0"
            ></iframe>
          </div>
        </div>
        <div class="preview-tips">
          <p>↑ 以上为手机内容预览 ↑</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useEditorStore } from '../stores/editor'
import { componentMap } from '../stores/editor'
import { storeToRefs } from 'pinia'

const editorStore = useEditorStore()
const { components } = storeToRefs(editorStore)

const deviceWrapper = ref(null)
const scale = ref(1)
const showCodeDialog = ref(false)
const showQRCodeDialog = ref(false)
const refreshKey = ref(0)

// 设备原始尺寸
const DEVICE_HEIGHT = 800
const DEVICE_WIDTH = 375
const VERTICAL_PADDING = 80 // 上下预留空间

const updateScale = () => {
  if (!deviceWrapper.value) return
  
  const containerHeight = deviceWrapper.value.parentElement.clientHeight
  const containerWidth = deviceWrapper.value.parentElement.clientWidth
  
  // 分别计算基于高度和宽度的缩放比例
  const scaleByHeight = (containerHeight - VERTICAL_PADDING) / DEVICE_HEIGHT
  const scaleByWidth = (containerWidth - 40) / DEVICE_WIDTH
  
  // 使用较小的缩放比例以确保完全显示
  scale.value = Math.min(scaleByHeight, scaleByWidth, 1)
}

onMounted(() => {
  window.addEventListener('resize', updateScale)
  updateScale()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})

const showCode = () => {
  showCodeDialog.value = true
}

const refreshPreview = () => {
  refreshKey.value++
}

// 生成微信公众号格式的代码
const generateCode = () => {
  const previewArea = document.querySelector('.preview-area')
  if (!previewArea) return ''

  const clonedArea = previewArea.cloneNode(true)
  
  const cleanup = (element) => {
    // 移除 Vue 相关属性
    const attrs = element.attributes
    if (attrs) {
      Array.from(attrs).forEach(attr => {
        if (attr.name.startsWith('data-v-')) {
          element.removeAttribute(attr.name)
        }
      })
    }
    
    // 移除空的 class 属性
    if (element.getAttribute('class') === '') {
      element.removeAttribute('class')
    }
    
    // 特殊处理 svg 元素
    if (element.tagName.toLowerCase() === 'svg') {
      const originalStyle = element.getAttribute('style')
      element.setAttribute('style', `${originalStyle}; margin-top: -1px`)
      element.removeAttribute('class')
    }
    
    // 移除注释节点
    Array.from(element.childNodes).forEach(node => {
      if (node.nodeType === 8) { // 8 是注释节点的类型
        element.removeChild(node)
      }
    })
    
    // 递归处理子元素
    Array.from(element.children).forEach(cleanup)
  }
  
  cleanup(clonedArea)
  
  // 格式化 HTML
  const formatHtml = (html) => {
    return html
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n')
  }

  return formatHtml(clonedArea.innerHTML)
}

// 复制代码到剪贴板
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generateCode())
    // 可以添加一个复制成功的提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const generatePreviewHtml = () => {
  // 获取预览区域的内容
  const previewContent = document.querySelector('.preview-area')?.innerHTML || ''
  
  // 清理 Vue 相关注释和空白行
  const cleanContent = previewContent
    .replace(/<!--[^>]*-->/g, '') // 移除所有 HTML 注释
    .replace(/^\s*[\r\n]/gm, '') // 移除空行
    .trim()

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>移动端预览</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .preview-container {
            width: 100%;
            margin: 0 auto;
          }
          svg {
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          ${cleanContent}
        </div>
      </body>
    </html>
  `
}

const showQRCode = () => {
  showQRCodeDialog.value = true
}

const closePreview = () => {
  showQRCodeDialog.value = false
}

// 只获取顶层组件（没有parentId的组件）
const topLevelComponents = computed(() => {
  return editorStore.components.filter(comp => !comp.parentId)
})
</script>

<style scoped>
.preview-container {
  position: relative;
  height: 100%;
  background: #f0f2f5;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center; /* 改回居中对齐 */
}

.device-wrapper {
  height: 100%;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-frame {
  width: 375px;
  height: 800px;
  background: #fff;
  border-radius: 44px;
  position: relative;
  border: 14px solid #1a1a1a;
  box-shadow: 0 0 0 2px #c8cacb;
  transform-origin: center center; /* 改回中心点缩放 */
  transition: transform 0.3s ease;
}

.device-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 28px;
  background: #1a1a1a;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  z-index: 2;
}

.device-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 32px;
  overflow: hidden;
  background: #fff;
}

.preview-area {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0px 0 20px;
}

/* 设备按钮 */
.device-frame::before {
  content: '';
  position: absolute;
  right: -16px;
  top: 80px;
  width: 3px;
  height: 26px;
  background: #c8cacb;
  border-radius: 2px;
}

.device-frame::after {
  content: '';
  position: absolute;
  left: -16px;
  top: 80px;
  width: 3px;
  height: 46px;
  background: #c8cacb;
  border-radius: 2px;
  box-shadow: 0 60px 0 0 #c8cacb;
}

/* 优化滚动条样式 */
.preview-area::-webkit-scrollbar {
  width: 4px;
}

.preview-area::-webkit-scrollbar-track {
  background: transparent;
}

.preview-area::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.preview-toolbar {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

.toolbar-buttons {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.3s;
}

.toolbar-btn:hover {
  background: #f5f5f5;
  color: #1890ff;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: #fff;
  border-radius: 8px;
  min-width: 900px;
  max-width: 80%;
  max-height: 80vh;
  overflow: auto;
}

.dialog-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.copy-btn {
  padding: 4px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.copy-btn:hover {
  background: #40a9ff;
}

.code-content {
  width: 95%;
  height: 700px;
  padding: 16px;
  background: #f5f5f5;
  margin: 16px;
  border-radius: 4px;
  overflow-y: auto;
  margin: 0;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}

.dialog-footer {
  padding: 0 16px 16px;
}

.tips {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.preview-tips {
  padding: 24px;
  text-align: center;
  color: #666;
}

.preview-tips p {
  margin: 8px 0;
  line-height: 1.5;
}

.mobile-preview {
  width: 375px;
  max-width: 90vw;
}

.mobile-container {
  padding: 20px;
  background: #f5f5f5;
}

.mobile-frame {
  width: 100%;
  height: 600px;
  max-height: 70vh;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

.preview-tips {
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.preview-tips p {
  margin: 0;
}

.dialog-content {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.dialog-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 4px;
  line-height: 1;
}

.close-btn:hover {
  color: #666;
}

.empty-tip {
  text-align: center;
  color: #666;
  font-size: 14px;
}
</style> 