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
    const windowData = JSON.parse(dropData) as WindowData
    if (windowData.id === props.window.id) return
    const originPane = WindowManager.instance.findPaneByWindowId(windowData.id)
    if (!originPane) return
    const closedWindow = originPane.closeWindow(windowData.id)
    if (closedWindow) {
      props.pane.insertWindow(closedWindow, insertPosition.value, props.window.id)
    }
    WindowManager.instance.clearEmptyPane()
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
  <div ref="tab-item-ref"
    class="flex items-center flex-nowrap shrink-0 h-full px-1 border border-transparent border-r-black relative cursor-pointer select-none min-w-[100px] max-w-[200px] basis-[150px] overflow-visible"
    :class="[
      isOverDropZone && insertPosition === WindowInsertPosition.Left ? 'after:absolute after:block after:h-[calc(100%+2px)] after:w-1 after:bg-white after:top-[-2px] after:left-[-4px] after:z-[5]' : '',
      isOverDropZone && insertPosition === WindowInsertPosition.Right ? 'after:absolute after:block after:h-[calc(100%+2px)] after:w-1 after:bg-white after:top-[-2px] after:right-[-2px] after:z-[5]' : '',
      isActive ? 'bg-[#dbdbdb]' : 'bg-[#999999] hover:bg-[#b4b4b4]',
    ]" draggable="true" @dragstart.stop="handleDragStart" @dragleave.stop="handleDragLeave"
    @dragover.stop="handleDragOver" @drop.stop="handleDrop" @click.stop="pane.activeWindowId = window.id">
    <div class="h-full shrink-0 w-[calc(100%-22px)] flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
      {{ window.id }}
    </div>
    <div
      class="h-full shrink-0 w-[22px] flex items-center justify-center opacity-0 hover:opacity-100 group-[.active]:opacity-100">
      <CloseBtn @click.stop="() => {
        pane.closeWindow(window.id)
        WindowManager.instance.clearEmptyPane()
      }" />
    </div>
  </div>
</template>
