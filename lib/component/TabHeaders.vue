<script setup lang="ts">
import { inject, onMounted, useTemplateRef } from 'vue'
import TabItem from './TabItem.vue'
import { type PaneNode, paneNodeInjectKey, rootPaneNodeInjectKey, type Tab } from '../types'

const rootPaneNodeData = inject<PaneNode>(rootPaneNodeInjectKey)!
const paneNodeData = inject<PaneNode>(paneNodeInjectKey)!

const tabHeaderWrapperRef = useTemplateRef('tabHeaderWrapperRef')

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
    const tab = JSON.parse(dropData) as Tab
    console.log('drop tab', tab)
  }
}
</script>

<template>
  <div
    ref="tabHeaderWrapperRef"
    class="tab-header-wrapper"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <TabItem v-for="tab in paneNodeData.tabs" :key="tab.id" :tab="tab">
      {{ tab.id }}
    </TabItem>
  </div>
</template>

<style lang="scss" scoped>
/* 设置滚动条整体样式 */
::-webkit-scrollbar {
  width: 4px;
  /* 滚动条宽度 */
  height: 4px;
  /* 水平滚动条高度 */
}

/* 设置滚动条轨道 */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* 轨道背景色 */
}

/* 设置滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: #888;
  /* 滑块颜色 */
}

/* 设置滚动条滑块悬停状态 */
::-webkit-scrollbar-thumb:hover {
  background: #555;
  /* 滑块悬停颜色 */
}

.tab-header-wrapper {
  height: 32px;
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  overflow-y: hidden;
  overflow-x: scroll;
  background-color: #c0c0c0;

  > .tab-item:last-child {
    border-right-color: transparent;
  }
}
</style>
