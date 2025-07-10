<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import TabItem from './TabItem.vue'
import type { Pane } from '../utils/Pane'
import type { WindowData } from '../utils/Window'
import { WindowManager } from '../utils/WindowManager'

interface Props {
  pane: Pane
}

const props = defineProps<Props>()
const tabHeaderWrapperRef = useTemplateRef('tab-header-wrapper-el')

onMounted(() => {
  if (tabHeaderWrapperRef.value) {
    tabHeaderWrapperRef.value.addEventListener('wheel', (event) => {
      if (tabHeaderWrapperRef.value) {
        event.preventDefault()
        tabHeaderWrapperRef.value.scrollLeft += event.deltaY
      }
    })
  }
})

const handleDragOver = (e: DragEvent): void => {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

const handleDrop = (e: DragEvent): void => {
  e.preventDefault()
  if (e.dataTransfer) {
    const dropData = e.dataTransfer?.getData('application/json')
    const dropWindowData = JSON.parse(dropData) as WindowData
    if (
      props.pane.windows.length > 0 &&
      dropWindowData.id === props.pane.windows[props.pane.windows.length - 1].id
    ) {
      return
    }
    if (props.pane.windows.find((window) => window.id === dropWindowData.id)) {
      // 原面板内位置变化
      props.pane.activeWindowId = dropWindowData.id
      const windowIndex = props.pane.windows.findIndex((window) => window.id === dropWindowData.id)
      const [splicedWindow] = props.pane.windows.splice(windowIndex, 1)
      props.pane.windows.push(splicedWindow)
    } else {
      // 跨面板变化
      const dropWindow = WindowManager.instance.findWindow(dropWindowData.id)
      if (!dropWindow) return
      dropWindow.moveToOtherPane(props.pane)
      WindowManager.instance.rootPane.clearEmptyPanes()
    }
  }
}
</script>

<template>
  <div ref="tab-header-wrapper-el" class="h-8 w-full flex flex-nowrap overflow-y-hidden overflow-x-scroll bg-gray-400"
    @dragover="handleDragOver" @drop="handleDrop">
    <TabItem v-for="window in pane.aliveWindows" :key="window.id" :window="window" :pane="pane">
      {{ window.id }}
    </TabItem>
  </div>
</template>

<style scoped>
/* 设置滚动条整体样式 */
::-webkit-scrollbar {
  width: 4px;
  /* 滚动条宽度 */
  height: 4px;
  /* 水平滚动条高度 */
}

/* 设置滚动条轨道 */
::-webkit-scrollbar-track {
  background: #d3d3d3;
  /* 轨道背景色 */
}

/* 设置滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: #303030;
  /* 滑块颜色 */
}

/* 设置滚动条滑块悬停状态 */
::-webkit-scrollbar-thumb:hover {
  background: #555;
  /* 滑块悬停颜色 */
}
</style>
