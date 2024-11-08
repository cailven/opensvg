import { defineStore } from 'pinia'
import FadeBlockPreview from '../components/blocks/FadeBlock/Preview.vue'
import FadeBlockEditor from '../components/blocks/FadeBlock/Editor.vue'

// 导出组件映射表供其他组件使用
export const componentMap = {
  fade: {
    preview: FadeBlockPreview,
    editor: FadeBlockEditor,
    defaultProps: {
      imageUrl: '',
      imageWidth: 0,
      imageHeight: 0
    }
  }
}

export const useEditorStore = defineStore('editor', {
  state: () => ({
    components: [],
    selectedComponent: null
  }),

  getters: {
    // 添加获取当前选中组件的 getter
    currentComponent: (state) => {
      return state.components.find(c => c.id === state.selectedComponent)
    }
  },

  actions: {
    // 添加选中组件的方法
    selectComponent(id) {
      this.selectedComponent = id
    },

    addComponent(type) {
      if (!componentMap[type]) {
        console.error(`未找到类型为 ${type} 的组件`)
        return
      }

      const newComponent = {
        id: Date.now(),
        type,
        name: `${type}-${Date.now()}`,
        props: { ...componentMap[type].defaultProps }
      }
      
      this.components = [...this.components, newComponent]
      this.selectedComponent = newComponent.id
    },

    updateComponentProps(id, newProps) {
      const index = this.components.findIndex(c => c.id === id)
      if (index > -1) {
        const component = this.components[index]
        this.components[index] = {
          ...component,
          props: { ...component.props, ...newProps }
        }
      }
    }
  }
}) 