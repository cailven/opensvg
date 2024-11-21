import { defineStore } from 'pinia'
import FadeBlockPreview from '../components/blocks/FadeBlock/Preview.vue'
import FadeBlockEditor from '../components/blocks/FadeBlock/Editor.vue'
import ZeroHeightBlockPreview from '../components/blocks/ZeroHeightBlock/Preview.vue'
import ZeroHeightBlockEditor from '../components/blocks/ZeroHeightBlock/Editor.vue'
import ClickSwitchBlockPreview from '../components/blocks/ClickSwitchBlock/Preview.vue'
import ClickSwitchBlockEditor from '../components/blocks/ClickSwitchBlock/Editor.vue'
import StretchBlockPreview from '../components/blocks/StretchBlock/Preview.vue'
import StretchBlockEditor from '../components/blocks/StretchBlock/Editor.vue'




const AUTO_SAVE_KEY = 'editor_auto_save'
const SAVE_DELAY = 1000 // 1秒延迟

// 导出组件映射表供其他组件使用
export const componentMap = {
  fade: {
    name:"无缝图",
    preview: FadeBlockPreview,
    editor: FadeBlockEditor,
    isContainer: false,
    defaultProps: {
      imageUrl: '',
      imageWidth: 0,
      imageHeight: 0
    }
  },
  zeroHeight: {
    name:"零高度容器",
    preview: ZeroHeightBlockPreview,
    editor: ZeroHeightBlockEditor,
    isContainer: true,
    defaultProps: {}
  },
  clickSwitch: {
    name: "点击切换",
    preview: ClickSwitchBlockPreview,
    editor: ClickSwitchBlockEditor,
    isContainer: false,
    defaultProps: {
      beforeImageUrl: '',
      beforeImageWidth: 0,
      beforeImageHeight: 0,
      afterImageUrl: '',
      afterImageWidth: 0,
      afterImageHeight: 0
    }
  },
  stretch: {
    name: '点击伸长',
    editor: StretchBlockEditor,
    preview: StretchBlockPreview,
    isContainer: true,
    defaultProps: {
      topImageUrl: '',
      topImageWidth: 0,
      topImageHeight: 0,
      stretchImageUrl: '',
      stretchImageWidth: 0,
      stretchImageHeight: 0
    }
  }
}

export const useEditorStore = defineStore('editor', {
  state: () => ({
    components: [],
    selectedComponent: null,
    lastSaveTime: null,
    autoSaveTimer: null,
    autoSaveEnabled: true // 添加自动保存开关
  }),

  getters: {
    // 添加获取当前选中组件的 getter
    currentComponent: (state) => {
      return state.components.find(c => c.id === state.selectedComponent)
    }
  },

  actions: {
    // 加载自动保存的数据
    loadAutoSave() {
      try {
        const savedData = localStorage.getItem(AUTO_SAVE_KEY)
        if (savedData) {
          const { components, selectedComponent, saveTime } = JSON.parse(savedData)
          this.components = components
          this.selectedComponent = selectedComponent
          this.lastSaveTime = saveTime
        }
      } catch (err) {
        console.error('加载自动保存数据失败:', err)
      }
    },

    // 切换自动保存状态
    toggleAutoSave() {
      this.autoSaveEnabled = !this.autoSaveEnabled
      if (!this.autoSaveEnabled) {
        this.clearAutoSave()
      }
    },

    // 新建项目
    newProject() {
      this.components = []
      this.selectedComponent = null
      this.lastSaveTime = null
      if (this.autoSaveEnabled) {
        this.clearAutoSave()
      }
    },

    // 清除自动保存的数据
    clearAutoSave() {
      localStorage.removeItem(AUTO_SAVE_KEY)
      this.lastSaveTime = null
    },

    // 添加选中组件的方法
    selectComponent(id) {
      this.selectedComponent = id
      this.autoSave()
    },

    addComponent(type, parentId = null) {
      const newComponent = {
        id: Date.now(),
        type,
        parentId,
        // name: `${type}-${Date.now()}`,
        name: componentMap[type].name, 
        props: { ...componentMap[type].defaultProps }
      }
      
      this.components.push(newComponent)
      this.selectedComponent = newComponent.id
      this.autoSave()
    },

    updateComponentProps(id, newProps) {
      const index = this.components.findIndex(c => c.id === id)
      if (index > -1) {
        const component = this.components[index]
        this.components[index] = {
          ...component,
          props: { ...component.props, ...newProps }
        }
        this.autoSave()
      }
    },

    // 自动保存当前状态
    autoSave() {
      if (!this.autoSaveEnabled) return
      
      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer)
      }

      this.autoSaveTimer = setTimeout(() => {
        try {
          const saveData = {
            components: this.components,
            selectedComponent: this.selectedComponent,
            saveTime: new Date().toISOString()
          }
          localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData))
          this.lastSaveTime = saveData.saveTime
        } catch (err) {
          console.error('自动保存失败:', err)
        }
      }, SAVE_DELAY)
    },

    // 删除组件
    deleteComponent(id) {
      // 如果容器组件，同时删除其子组件
      const deleteIds = [id]
      const component = this.components.find(c => c.id === id)
      if (component && component.type === 'zeroHeight') {
        const children = this.components.filter(c => c.parentId === id)
        deleteIds.push(...children.map(c => c.id))
      }
      
      this.components = this.components.filter(c => !deleteIds.includes(c.id))
      if (this.selectedComponent === id) {
        this.selectedComponent = null
      }
      this.autoSave()
    },

    // 移动组件位置
    moveComponent(sourceId, targetId) {
      const sourceIndex = this.components.findIndex(c => c.id === sourceId)
      const targetIndex = this.components.findIndex(c => c.id === targetId)
      
      if (sourceIndex > -1 && targetIndex > -1) {
        const [movedComponent] = this.components.splice(sourceIndex, 1)
        const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
        this.components.splice(adjustedTargetIndex, 0, movedComponent)
        this.autoSave()
      }
    },

    updateComponentParent(componentId, newParentId) {
      const component = this.components.find(c => c.id === componentId)
      if (component) {
        component.parentId = newParentId
        this.autoSave()
      }
    },

    moveComponentToPosition(componentId, targetIndex, newParentId = null) {
      const comp = this.components.find(c => c.id === componentId)
      if (!comp) return

      // 移除原位置的组件
      const currentIndex = this.components.findIndex(c => c.id === componentId)
      this.components.splice(currentIndex, 1)
      
      // 更新父组件关系
      comp.parentId = newParentId
      
      // 插入到新位置
      this.components.splice(targetIndex, 0, comp)
      
      this.autoSave()
    }
  }
}) 