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
  <div class="resize-handle" :class="[direction, position]" @mousedown="startResize"></div>
</template>

<style scoped lang="scss">
.resize-handle {
  position: absolute;
  z-index: 50;
  background-color: transparent;
  transition-property: background-color;
  transition-duration: 100ms;

  // 通用方向样式
  &.vertical {
    width: 100%;
    height: 4px; // Tailwind h-1 ≈ 0.25rem = 4px
    cursor: row-resize;

    &:hover,
    &.dragging {
      background-color: #3b82f6; // Tailwind blue-500
    }

    // 垂直方向位置
    &.top {
      top: -1px; // Tailwind -top-px
      transform: translateY(-50%);
    }

    &.bottom {
      bottom: -1px; // Tailwind -bottom-px
      transform: translateY(50%);
    }
  }

  &.horizontal {
    height: 100%;
    width: 4px; // Tailwind w-1
    cursor: col-resize;

    &:hover,
    &.dragging {
      background-color: #3b82f6;
    }

    // 水平方向位置
    &.left {
      left: -1px;
      transform: translateX(-50%);
    }

    &.right {
      right: -1px;
      top: 0;
      transform: translateX(50%);
    }
  }

  // 拖拽时强制显示光标
  &.dragging {
    cursor: inherit !important;
    user-select: none;
  }
}
</style>
