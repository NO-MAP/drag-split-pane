<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'

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

// 尺寸单位处理
const formatUnit = (value: number | string): string => {
  return typeof value === 'number' ? `${value}px` : value
}

const iconStyle = computed<CSSProperties>(() => ({
  '--icon-size': formatUnit(props.size),
  '--icon-color': isHovering.value ? props.hoverColor : props.color,
  '--line-weight': formatUnit(props.lineWeight),
}))

const handleClick = (event: Event): void => {
  emit('click', event)
}
</script>

<template>
  <div class="close-btn" :style="iconStyle" role="button" :aria-label="ariaLabel" tabindex="0" @click.stop="handleClick"
    @mouseenter="isHovering = true" @mouseleave="isHovering = false" @keydown.enter="handleClick"></div>
</template>



<style scoped>
.close-btn {
  width: var(--icon-size);
  height: var(--icon-size);
  cursor: pointer;
  position: relative;
  transition: opacity 0.3s ease;
  border-radius: 2px;
}

.close-btn:focus-visible {
  outline: 2px solid var(--icon-color);
  outline-offset: 2px;
}

.close-btn::before,
.close-btn::after {
  content: '';
  position: absolute;
  width: 60%;
  height: var(--line-weight);
  background-color: var(--icon-color);
  left: 20%;
  top: 50%;
  transform-origin: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: calc(var(--line-weight) / 2);
}

.close-btn::before {
  transform: translateY(-50%) rotate(45deg);
}

.close-btn::after {
  transform: translateY(-50%) rotate(-45deg);
}

.close-btn:hover {
  opacity: 0.8;
  background-color: #eee;
}

.close-btn:active {
  transform: scale(0.92);
}
</style>
