<script lang="ts" setup>
import { computed, inject, type PropType, ref, useTemplateRef } from 'vue'
import {
  type DspInstanceMap,
  instanceMapInjectKey,
  type PaneNode,
  paneNodeInjectKey,
  rootPaneNodeInjectKey,
  type Tab,
  TabInsertPosition,
} from '../types'
import CloseBtn from './CloseBtn.vue'
import { clearEmptyPane, getAllPaneTabs } from '../utils'

const props = defineProps({
  tab: {
    type: Object as PropType<Tab>,
    required: true,
  },
})

const emit = defineEmits<{
  closeTab: [tabId: string]
}>()

const paneNode = inject<PaneNode>(paneNodeInjectKey)!
const rootPaneNode = inject<PaneNode>(rootPaneNodeInjectKey)!
const dspInstanceMap = inject<DspInstanceMap>(instanceMapInjectKey)!
const isActive = computed(() => props.tab.id === paneNode.activeTab)

const isOverDropZone = ref(false)
const insertPosition = ref<TabInsertPosition>(TabInsertPosition.Left)
const tabItemRef = useTemplateRef('tabItemRef')

const handleDragStart = (e: DragEvent): void => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('application/json', JSON.stringify(props.tab))
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
    const tab = JSON.parse(dropData) as Tab
    if (tab.id === props.tab.id) return
    // 先删除之前
    const originPane = getAllPaneTabs(rootPaneNode).find((paneTab) => paneTab.id === tab.id)
    if (!originPane) return
    const originPaneInstance = dspInstanceMap.get(originPane.paneId)
    if (originPaneInstance) {
      originPaneInstance.closeTab(tab.id)
    }
    const targetPaneInstance = dspInstanceMap.get(paneNode.id)
    if (targetPaneInstance) {
      targetPaneInstance.insertTab(tab, props.tab.id, insertPosition.value)
    }
    clearEmptyPane(rootPaneNode)
  }
}

// 动态计算放置位置
const calculateDropPosition = (e: DragEvent): void => {
  if (!tabItemRef.value) return
  const rect = tabItemRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  if (x < rect.width / 2) {
    insertPosition.value = TabInsertPosition.Left
  } else {
    insertPosition.value = TabInsertPosition.Right
  }
}
</script>

<template>
  <div
    ref="tabItemRef"
    class="tab-item"
    :class="[
      isOverDropZone && insertPosition === TabInsertPosition.Left ? 'drop-left' : '',
      isOverDropZone && insertPosition === TabInsertPosition.Right ? 'drop-right' : '',
      isActive ? 'active' : '',
    ]"
    draggable="true"
    @dragstart.stop="handleDragStart"
    @dragleave.stop="handleDragLeave"
    @dragover.stop="handleDragOver"
    @drop.stop="handleDrop"
    @click.stop="
      () => {
        paneNode.activeTab = tab.id
      }
    "
  >
    <div class="content">
      {{ tab.id }}
    </div>
    <div class="operation">
      <CloseBtn
        @click.stop="
          () => {
            emit('closeTab', tab.id)
          }
        "
      />
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
