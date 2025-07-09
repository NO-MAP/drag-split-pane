<script setup lang="ts">
import { ref, onUnmounted, computed, watch } from 'vue'

// 增强类型定义
type Direction = 'vertical' | 'horizontal'
type VerticalPosition = 'top' | 'bottom'
type HorizontalPosition = 'left' | 'right'

const props = withDefaults(
  defineProps<{
    direction?: Direction
    position?: VerticalPosition | HorizontalPosition
  }>(),
  {
    direction: 'vertical',
    position: 'bottom',
  },
)

const emit = defineEmits(['resize'])

// 优化方向类
const direction = computed(() => props.direction)
const position = computed(() => props.position)

// 拖拽逻辑
const isDragging = ref(false)
let startPosition = 0

const startResize = (e: MouseEvent): void => {
  isDragging.value = true
  startPosition = props.direction === 'vertical' ? e.clientY : e.clientX
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResize)

  // 强制设置光标样式
  document.body.style.cursor = props.direction === 'vertical' ? 'row-resize' : 'col-resize'
  document.body.style.userSelect = 'none' // 防止文本选中
}

const handleMouseMove = (e: MouseEvent): void => {
  if (!isDragging.value) return

  const currentPosition = props.direction === 'vertical' ? e.clientY : e.clientX
  const delta = currentPosition - startPosition

  // 根据方向发射不同数值
  emit(
    'resize',
    props.direction === 'vertical' ? delta : delta * (props.position === 'left' ? 1 : -1),
  )

  startPosition = currentPosition
}

const stopResize = (): void => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResize)

  // 恢复默认光标样式
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

watch(isDragging, (value) => {
  document.onselectstart = (): boolean => !value
})

onUnmounted(() => {
  document.onselectstart = null
  document.body.style.cursor = '' // 确保组件卸载时恢复光标样式
})
</script>

<template>
  <div
    class="absolute z-50 bg-transparent transition-colors duration-100"
    :class="{
      'w-full h-1 cursor-row-resize': direction === 'vertical',
      'h-full w-1 cursor-col-resize': direction === 'horizontal',
      'top-0 -translate-y-1/2': direction === 'vertical' && position === 'top',
      'bottom-0 translate-y-1/2': direction === 'vertical' && position === 'bottom',
      'left-0 -translate-x-1/2': direction === 'horizontal' && position === 'left',
      'right-0 top-0 translate-x-1/2': direction === 'horizontal' && position === 'right',
      'hover:bg-blue-500': !isDragging,
      'bg-blue-500': isDragging,
      'cursor-[inherit] select-none': isDragging
    }"
    @mousedown="startResize"
  ></div>
</template>
