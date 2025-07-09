<template>
  <div
    class="relative cursor-pointer transition-opacity duration-300 ease-in-out rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-80 active:scale-92 hover:bg-gray-200"
    :class="[iconSize, outlineColor]" role="button" :aria-label="ariaLabel" tabindex="0" @click.stop="handleClick"
    @mouseenter="isHovering = true" @mouseleave="isHovering = false" @keydown.enter="handleClick">
    <div
      class="absolute left-1/5 top-1/2 w-3/5 h-px rounded-full transform origin-center transition-all duration-300 ease-in-out"
      :class="[lineColor, lineWeight, { 'rotate-45': true }]"></div>
    <div
      class="absolute left-1/5 top-1/2 w-3/5 h-px rounded-full transform origin-center transition-all duration-300 ease-in-out"
      :class="[lineColor, lineWeight, { '-rotate-45': true }]"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  /** 图标尺寸（支持数字或带单位的字符串） */
  size?: number | string
  /** 默认颜色 */
  color?: string
  /** 悬停颜色 */
  hoverColor?: string
  /** 无障碍标签 */
  ariaLabel?: string
  /** 线条粗细（支持数字或带单位的字符串） */
  lineWeight?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  color: '#333',
  hoverColor: '#444',
  ariaLabel: '关闭',
  lineWeight: 1,
})

const emit = defineEmits<{
  (e: 'click', event: Event): void
}>()

const isHovering = ref(false)

// Convert size to Tailwind-like class
const iconSize = computed(() => {
  if (typeof props.size === 'number') {
    return `w-${props.size} h-${props.size}`
  }
  return `w-[${props.size}] h-[${props.size}]`
})

// Dynamic colors
const lineColor = computed(() => {
  return isHovering.value
    ? `bg-[${props.hoverColor}]`
    : `bg-[${props.color}]`
})

const outlineColor = computed(() => {
  return isHovering.value
    ? `focus-visible:outline-[${props.hoverColor}]`
    : `focus-visible:outline-[${props.color}]`
})

// Line weight - using arbitrary values since Tailwind doesn't support dynamic values
const lineWeight = computed(() => {
  return `h-[${typeof props.lineWeight === 'number' ? `${props.lineWeight}px` : props.lineWeight}]`
})

const handleClick = (event: Event): void => {
  emit('click', event)
}
</script>
