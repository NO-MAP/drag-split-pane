<script lang="ts" setup>
import { computed, ref, useTemplateRef } from 'vue'
import {
  WindowInsertPosition,
} from '../types'
import CloseBtn from './CloseBtn.vue'
import type { Window, WindowData } from '../utils/Window'
import type { Pane } from '../utils/Pane'
import { WindowManager } from '../utils/WindowManager'

interface Props {
  window: Window,
  pane: Pane
}

const props = defineProps<Props>()

const isActive = computed(() => props.window.id === props.pane.activeWindowId)

const isOverDropZone = ref(false)
const insertPosition = ref<WindowInsertPosition>(WindowInsertPosition.Left)
const tabItemRef = useTemplateRef('tab-item-ref')

const handleDragStart = (e: DragEvent): void => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('application/json', JSON.stringify(props.window.getData()))
  }
}

// 处理拖放事件
const handleDragOver = (e: DragEvent): void => {
  isOverDropZone.value = true
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  calculateDropPosition(e)
}

const handleDragLeave = (): void => {
  isOverDropZone.value = false
}

const handleDrop = (e: DragEvent): void => {
  e.preventDefault()
  isOverDropZone.value = false
  if (e.dataTransfer) {
    const dropData = e.dataTransfer?.getData('application/json')
    const dropWindowData = JSON.parse(dropData) as WindowData
    if (dropWindowData.id === props.window.id) return
    const dropWindow = WindowManager.instance.findWindow(dropWindowData.id)
    if (!dropWindow) return
    if (props.pane.windows.find((window) => window.id === dropWindowData.id)) {
      // 原面板内位置变化
      props.pane.activeWindowId = dropWindowData.id
      const windowIndex = props.pane.windows.findIndex((window) => window.id === dropWindowData.id)
      const [splicedWindow] = props.pane.windows.splice(windowIndex, 1)
      const targetIndex = props.pane.windows.findIndex((window) => window.id === props.window.id)
      const insertIndex = insertPosition.value === WindowInsertPosition.Left ? targetIndex : targetIndex + 1
      props.pane.windows.splice(insertIndex, 0, splicedWindow)
    } else {
      // 跨面板变化
      dropWindow.moveToOtherPane(props.pane, insertPosition.value, props.window.id)
    }
    WindowManager.instance.rootPane.clearEmptyPanes()
  }
}

// 动态计算放置位置
const calculateDropPosition = (e: DragEvent): void => {
  if (!tabItemRef.value) return
  const rect = tabItemRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  if (x < rect.width / 2) {
    insertPosition.value = WindowInsertPosition.Left
  } else {
    insertPosition.value = WindowInsertPosition.Right
  }
}
</script>

<template>
  <div ref="tab-item-ref" class="tab-item" :class="[
    isOverDropZone && insertPosition === WindowInsertPosition.Left ? 'drop-left' : '',
    isOverDropZone && insertPosition === WindowInsertPosition.Right ? 'drop-right' : '',
    isActive ? 'active' : '',
  ]" draggable="true" @dragstart.stop="handleDragStart" @dragleave.stop="handleDragLeave"
    @dragover.stop="handleDragOver" @drop.stop="handleDrop" @click.stop="
      () => {
        pane.activeWindowId = window.id
      }
    ">
    <div class="content">
      {{ window.id }}
    </div>
    <div class="operation">
      <CloseBtn @click.stop="
        () => {
          window.close()
          WindowManager.instance.rootPane.clearEmptyPanes()
        }
      " />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-item {
  background-color: #999999;
  flex-shrink: 0;
  padding: 0 4px;
  height: 100%;
  flex-basis: 150px;
  min-width: 100px;
  max-width: 200px;
  overflow: visible;
  border: 1px solid transparent;
  border-right-color: #000;
  user-select: none;
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  cursor: pointer;

  &:hover {
    background-color: #b4b4b4;

    .operation {
      opacity: 1;
    }
  }

  &.active {
    background-color: #dbdbdb;

    .operation {
      opacity: 1;
    }
  }

  &.drop-left {
    &::after {
      position: absolute;
      display: block;
      height: calc(100% + 2px);
      width: 4px;
      background-color: white;
      top: -2px;
      left: -4px;
      z-index: 5;
      content: '';
    }
  }

  &.drop-right {
    &::after {
      position: absolute;
      display: block;
      height: calc(100% + 2px);
      width: 4px;
      background-color: white;
      top: -2px;
      right: -2px;
      z-index: 5;
      content: '';
    }
  }

  .content {
    height: 100%;
    flex-shrink: 0;
    width: calc(100% - 22px);
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .operation {
    height: 100%;
    flex-shrink: 0;
    width: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
  }
}
</style>
