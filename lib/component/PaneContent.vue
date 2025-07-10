<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef, type Ref } from 'vue'
import {
  PaneDirection,
  WindowInsertPanePosition,
  WindowInsertPosition,
} from '../types'
import { Pane } from '../utils/Pane'
import type { WindowData } from '../utils/Window';
import { WindowManager } from '../utils/WindowManager';

interface Props {
  pane: Pane
}

const props = defineProps<Props>()

const isOverDropZone = ref(false)
const splitDirection: Ref<PaneDirection> = ref(PaneDirection.Horizontal)
const insertPosition = ref(WindowInsertPanePosition.Left)
const tabContentRef = useTemplateRef('pane-content-el')

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

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isOverDropZone.value = false
  if (e.dataTransfer) {
    const dropData = e.dataTransfer?.getData('application/json')
    const dropWindowData = JSON.parse(dropData) as WindowData
    if (props.pane.activeWindowId === dropWindowData.id && insertPosition.value === WindowInsertPanePosition.Middle) {
      // 放置的就是正激活的窗口且不需要分面板
      return
    }
    const dropWindow = WindowManager.instance.findWindow(dropWindowData.id)
    if (!dropWindow) return
    if (insertPosition.value === WindowInsertPanePosition.Middle) {
      // 不需要分新面板
      if (props.pane.id === dropWindow.parentPane.id) {
        // 同面板放置
        props.pane.activeWindowId = dropWindow.id
      } else {
        dropWindow.moveToOtherPane(props.pane, WindowInsertPosition.Right, props.pane.activeWindowId)
      }
    } else {
      // 需要分新面板
      const { newPane } = props.pane.splitPane(insertPosition.value)
      dropWindow.moveToOtherPane(newPane)
    }
    WindowManager.instance.rootPane.clearEmptyPanes()
  }
}

onMounted(() => {
  // loadedPaneTab.value.push(props.pane.id)
})

onBeforeUnmount(() => {
  // console.log("paneContent unmount")
  // loadedPaneTab.value = loadedPaneTab.value.filter(id => id !== paneNode.id)
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
    insertPosition.value = WindowInsertPanePosition.Top
    splitDirection.value = PaneDirection.Vertical
  } else if (isNearBottom) {
    insertPosition.value = WindowInsertPanePosition.Bottom
    splitDirection.value = PaneDirection.Vertical
  } else if (isNearLeft) {
    insertPosition.value = WindowInsertPanePosition.Left
    splitDirection.value = PaneDirection.Horizontal
  } else if (isNearRight) {
    insertPosition.value = WindowInsertPanePosition.Right
    splitDirection.value = PaneDirection.Horizontal
  } else {
    insertPosition.value = WindowInsertPanePosition.Middle
  }

  // 处理四角的情况（同时满足水平和垂直条件时）
  if ((isNearTop || isNearBottom) && (isNearLeft || isNearRight)) {
    // 根据鼠标位置到角落的距离决定主要方向
    const verticalDist = Math.min(mouseY, height - mouseY)
    const horizontalDist = Math.min(mouseX, width - mouseX)

    if (verticalDist < horizontalDist) {
      splitDirection.value = PaneDirection.Horizontal
      insertPosition.value = isNearTop ? WindowInsertPanePosition.Top : WindowInsertPanePosition.Bottom
    } else {
      splitDirection.value = PaneDirection.Vertical
      insertPosition.value = isNearLeft ? WindowInsertPanePosition.Left : WindowInsertPanePosition.Right
    }
  }
}
</script>

<template>
  <div ref="pane-content-el" class="relative h-[calc(100%-32px)] bg-gray-600 overflow-hidden" @dragover="handleDragOver"
    @dragleave="handleDragLeave" @drop="handleDrop">
    <!-- 分屏指示器 -->
    <div v-if="isOverDropZone" class="absolute bg-purple-800 opacity-50 pointer-events-none z-100" :class="{
      'top-0 left-0 h-1/2 w-full': insertPosition === WindowInsertPanePosition.Top,
      'bottom-0 left-0 h-1/2 w-full': insertPosition === WindowInsertPanePosition.Bottom,
      'left-0 top-0 w-1/2 h-full': insertPosition === WindowInsertPanePosition.Left,
      'right-0 top-0 w-1/2 h-full': insertPosition === WindowInsertPanePosition.Right,
      'inset-0 h-full w-full': insertPosition === WindowInsertPanePosition.Middle,
    }"></div>

    <!-- 当前面板内容 -->
    <div>pane.id --- {{ pane.id }}</div>
    <div>pane.activeWindowId --- {{ pane.activeWindowId }}</div>
    <div :id="`paneContent_${pane.id}`" class="w-full h-full overflow-hidden"></div>
  </div>
</template>
