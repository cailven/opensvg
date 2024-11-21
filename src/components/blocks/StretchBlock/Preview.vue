<template>
  <section class="stretch-block">

    <section id="伸长1" style="overflow:hidden">
      <!-- 伸长内容 -->
      <section id="零高" style="height: 0; min-height: 0;">
      <section id="内容层" ref="contentRef" style="height: auto; min-height: 0;">
        <component v-for="child in children" :key="child.id" :is="componentMap[child.type].preview" v-bind="child.props"
          :componentId="child.id" @load="onImageLoad" @update:height="onHeightUpdate" />
      </section>
      </section>

      <!-- 顶部图片 -->
      <section id="topimg" ref="topImageRef" style="pointer-events: none; font-size: 0">
        <svg id="gif图1" :style="topImageStyle" :viewBox="`0 0 ${props.topImageWidth} ${props.topImageHeight}`">
          <animate id="宽度动画1" attributeName="width" fill="freeze" calcMode="spline"
            keySplines="0.42 0 0.58 1;0.42 0 0.58 1" restart="never" keyTimes="0;0.002;1" :values="`100%;${stretchPercentage}%;${stretchPercentage}%`"
            dur="1000s" :begin="`click+${props.animationDelay}.5s`"></animate>
          <animate attributeName="opacity" :begin="`click+${props.animationDelay}s`" restart="never" dur="500s"
            keyTimes="0;0.00000001;1" values="1;0;0" fill="freeze"></animate>
          <g>
            <g id="gif图2" transform="translate(1000 0)">
              <foreignObject x="0" y="0" width="100%" height="100%">
                <svg :style="topImage2Style" :viewBox="`0 0 ${props.topImage2Width} ${props.topImage2Height}`"></svg>
              </foreignObject>
            </g>
            <animateTransform attributeName="transform" type="translate" values="-1000 0" fill="freeze" begin="click"
              dur="1000s"></animateTransform>
            <rect style="pointer-events: visible" width="100%" height="100%" fill="#000000" opacity="0">
              <set attributeName="visibility" from="visible" to="hidden" begin="click"></set>
            </rect>
          </g>
        </svg>
      </section>
    </section>

  </section>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { useEditorStore } from '../../../stores/editor'
import { componentMap } from '../../../stores/editor'

const props = defineProps({
  componentId: {
    type: [String, Number],
    required: true
  },
  topImageUrl: String,
  topImageWidth: Number,
  topImageHeight: Number,
  topImage2Url: String,
  topImage2Width: Number,
  topImage2Height: Number,
  animationDelay: {
    type: Number,
    default: 1
  }
})

const editorStore = useEditorStore()

// 计算子组件
const children = computed(() => {
  return editorStore.components.filter(comp => comp.parentId === props.componentId)
})

// 计算子节点总高度
const childrenTotalHeight = ref(0)

// 监听子节点及其属性的变化
const childrenProps = computed(() => {
  return children.value.map(child => ({
    id: child.id,
    props: child.props,
    type: child.type
  }))
})

// 修改更新触发机制
const updateTrigger = ref(0)
const forceUpdate = () => {
  console.log("强制更新触发")
  updateTrigger.value = Date.now() // 使用时间戳确保值总是不同
  nextTick(() => {
    updateContentHeight()
  })
}

// 添加高度更新处理函数
const onHeightUpdate = () => {
  console.log("高度更新事件触发")
  forceUpdate()
}

// 修改图片加载处理函数
const onImageLoad = () => {
  console.log("图片加载完成事件触发")
  forceUpdate()
}

// 修改 watch 以使用 forceUpdate
watch(
  [
    () => props.topImageHeight,
    () => props.topImageWidth,
    () => props.topImage2Height,
    () => props.topImage2Width,
    childrenProps,
  ],
  () => {
    console.log("属性变化触发更新")
    forceUpdate()
  },
  { 
    deep: true,
    immediate: true 
  }
)

const contentRef = ref(null)
const topImageRef = ref(null)
const isReady = ref(false)

// 更新内容高度的方法
const updateContentHeight = () => {
  if (!contentRef.value) return
  childrenTotalHeight.value = contentRef.value.scrollHeight
  console.log("更新内容层高度:", childrenTotalHeight.value)
}

// 计算伸展百分比
const stretchPercentage = computed(() => {
  if (!isReady.value) return 100
  
  const triggerValue = updateTrigger.value
  console.log("开始计算 stretchPercentage, trigger:", triggerValue)
  
  if (!topImageRef.value) {
    console.log("未找到顶部图片节点，返回默认值 100")
    return 100
  }
  
  updateContentHeight()
  
  const topHeight = topImageRef.value.scrollHeight
  const totalHeight = childrenTotalHeight.value 
  console.log("计算百分比 - 实际总高度:", totalHeight, "顶部图片高度:", topHeight)
  return Math.ceil((totalHeight / topHeight) * 100)
})

// 在组件挂载后设置就绪状态
onMounted(() => {
  nextTick(() => {
    isReady.value = true
    console.log("组件已挂载，触发更新")
    forceUpdate()
  })
})

const topImageStyle = computed(() => ({
  transform: 'scale(1)',
  isolation: 'isolate',
  backgroundImage: `url("${props.topImageUrl}")`,
  backgroundSize: '100%',
  backgroundRepeat: 'no-repeat',
  display: 'inline',
  lineHeight: '0',
  marginTop: '-1px'
}))

const topImage2Style = computed(() => ({
  transform: 'scale(1)',
  isolation: 'isolate',
  backgroundImage: `url("${props.topImage2Url}")`,
  backgroundSize: '100%',
  backgroundRepeat: 'no-repeat',
  display: 'inline',
  lineHeight: '0',
  marginTop: '-1px'
}))
</script>

<style scoped>
.stretch-block {
  width: 100%;
}

#内容层 {
  position: relative;
  width: 100%;
  overflow: visible;
}
</style>