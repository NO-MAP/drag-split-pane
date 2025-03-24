<script lang="ts" setup>
import { inject, onMounted, ref, useTemplateRef, type Ref } from 'vue'
import {
  loadedPaneTabInjectKey,
  PaneDirection,
  type PaneNode,
  paneNodeInjectKey,
  rootPaneNodeInjectKey,
  type Tab,
  TabInsertPanePosition,
} from '../types'

const rootPaneNodeData = inject<PaneNode>(rootPaneNodeInjectKey)!
const paneNode = inject<PaneNode>(paneNodeInjectKey)!
const loadedPaneTab = inject<string[]>(loadedPaneTabInjectKey)!
const isOverDropZone = ref(false)
const splitDirection: Ref<PaneDirection> = ref(PaneDirection.Horizontal)
const insertPosition = ref(TabInsertPanePosition.Left)
const tabContentRef = useTemplateRef('tabContentRef')

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
    console.log('handleDrop data', dropData)
    const tab = JSON.parse(dropData) as Tab
    console.log('drop tab', tab)
  }
}

onMounted(() => {
  loadedPaneTab.push(paneNode.id)
})

const calculateDropPosition = (e: DragEvent): void => {
  if (!tabContentRef.value) return

  // 获取面板的布局信息
  const rect = tabContentRef.value.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  // 计算相对坐标
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // 定义边缘阈值（15% 区域触发边缘分割）
  const edgeThreshold = 0.2
  const isNearLeft = mouseX < width * edgeThreshold
  const isNearRight = mouseX > width * (1 - edgeThreshold)
  const isNearTop = mouseY < height * edgeThreshold
  const isNearBottom = mouseY > height * (1 - edgeThreshold)

  // 方向优先级：边缘 > 中间
  if (isNearTop) {
    insertPosition.value = TabInsertPanePosition.Top
    splitDirection.value = PaneDirection.Vertical
  } else if (isNearBottom) {
    insertPosition.value = TabInsertPanePosition.Bottom
    splitDirection.value = PaneDirection.Vertical
  } else if (isNearLeft) {
    insertPosition.value = TabInsertPanePosition.Left
    splitDirection.value = PaneDirection.Horizontal
  } else if (isNearRight) {
    insertPosition.value = TabInsertPanePosition.Right
    splitDirection.value = PaneDirection.Horizontal
  } else {
    insertPosition.value = TabInsertPanePosition.Middle
  }

  // 处理四角的情况（同时满足水平和垂直条件时）
  if ((isNearTop || isNearBottom) && (isNearLeft || isNearRight)) {
    // 根据鼠标位置到角落的距离决定主要方向
    const verticalDist = Math.min(mouseY, height - mouseY)
    const horizontalDist = Math.min(mouseX, width - mouseX)

    if (verticalDist < horizontalDist) {
      splitDirection.value = PaneDirection.Horizontal
      insertPosition.value = isNearTop ? TabInsertPanePosition.Top : TabInsertPanePosition.Bottom
    } else {
      splitDirection.value = PaneDirection.Vertical
      insertPosition.value = isNearLeft ? TabInsertPanePosition.Left : TabInsertPanePosition.Right
    }
  }
}
</script>

<template>
  <div
    ref="tabContentRef"
    class="tabs-content"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- 分屏指示器 -->
    <div
      v-if="isOverDropZone"
      class="split-indicator"
      :class="{
        top: insertPosition === TabInsertPanePosition.Top,
        bottom: insertPosition === TabInsertPanePosition.Bottom,
        left: insertPosition === TabInsertPanePosition.Left,
        right: insertPosition === TabInsertPanePosition.Right,
        middle: insertPosition === TabInsertPanePosition.Middle,
      }"
    ></div>

    <!-- 当前面板内容 -->
    <div :id="`tabContent_${paneNode.id}`" class="current-content"></div>
  </div>
</template>

<style lang="scss" scoped>
.tabs-content {
  height: calc(100% - 32px);
  background-color: #676767;
  position: relative;
  overflow: hidden;

  .split-indicator {
    position: absolute;
    background-color: #4e3761;
    opacity: 0.5;
    pointer-events: none;
    z-index: 100;

    // 四个边定位基础样式
    &.top {
      top: 0;
      left: 0;
      height: 50%;
      width: 100%;
    }

    &.bottom {
      bottom: 0;
      left: 0;
      height: 50%;
      width: 100%;
    }

    &.left {
      left: 0;
      top: 0;
      width: 50%;
      height: 100%;
    }

    &.right {
      right: 0;
      top: 0;
      width: 50%;
      height: 100%;
    }

    // 中间状态样式
    &.middle {
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }
  }

  .current-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
