<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, useTemplateRef } from 'vue'
import {
  type ColorSetting,
  type DspInstanceMap,
  type PaneNode,
  type PaneTab,
  colorVariables,
  defaultColorSetting,
  instanceMapInjectKey,
  loadedPaneTabInjectKey,
  PaneDirection,
  paneNodeInjectKey,
  rootPaneNodeInjectKey,
  type Tab,
  TabInsertPanePosition,
  TabInsertPosition,
} from './types'
import { findPaneNodeById, getAllPaneTabs } from './utils'
import ResizeLine from './component/ResizeLine.vue'
import TabHeaders from './component/TabHeaders.vue'
import TabContent from './component/TabContent.vue'
import DragSplitPane from './DragSplitPane.vue'
import { useResizeObserver } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  colorSettings?: Partial<ColorSetting>
  rootPaneData?: PaneNode
  paneId: string
}

defineOptions({
  name: 'DragSplitPane',
})

const props = withDefaults(defineProps<Props>(), {
  colorSettings: () => ({}),
})

const isRoot = !!props.rootPaneData

const mergedColors = computed(() => ({
  ...defaultColorSetting,
  ...props.colorSettings,
}))

const variablesStyle = isRoot
  ? Object.entries(colorVariables).reduce(
      (acc: Record<string, string>, [varName, propName]) => {
        acc[varName] = mergedColors.value[propName]
        return acc
      },
      {} as Record<string, string>,
    )
  : {}

const rootPaneNode = isRoot ? props.rootPaneData : inject<PaneNode>(rootPaneNodeInjectKey)!
const paneNode = findPaneNodeById(rootPaneNode, props.paneId)
provide<PaneNode>(paneNodeInjectKey, paneNode)

const loadedPaneTab = ref<string[]>([])
if (isRoot) {
  provide<PaneNode>(rootPaneNodeInjectKey, rootPaneNode)
  provide(loadedPaneTabInjectKey, loadedPaneTab.value)
}

const splitPaneElRef = useTemplateRef('split-pane-el')
const dspInstanceMap = isRoot
  ? new Map<string, InstanceType<typeof DragSplitPane>>()
  : inject<DspInstanceMap>(instanceMapInjectKey)!
if (isRoot) {
  provide<DspInstanceMap>(instanceMapInjectKey, dspInstanceMap)
}

onMounted(() => {
  dspInstanceMap.set(props.paneId, {
    closeTab,
    insertTab,
    insertPane,
    doLayoutChildrenPane,
  })
})

onBeforeUnmount(() => {
  onBeforeUnmount(() => {
    if (dspInstanceMap.has(props.paneId)) {
      dspInstanceMap.delete(props.paneId)
    } else {
      console.warn('实例已不存在', props.paneId)
    }
  })
})

const handleResize = (index: number, delta: number): void => {
  if (paneNode.direction === PaneDirection.Horizontal) {
    paneNode.size[index] -= delta
    paneNode.size[index + 1] += delta
  } else {
    paneNode.size[index] += delta
    paneNode.size[index + 1] -= delta
  }
}

const allPaneTabs = computed(() => {
  if (!isRoot) return [] as PaneTab[]
  return getAllPaneTabs(paneNode).filter((pane) => loadedPaneTab.value.includes(pane.paneId))
})

let splitPaneElResizeObserver: ReturnType<typeof useResizeObserver> | undefined = undefined

const doLayoutChildrenPane = () => {
  if (!splitPaneElRef.value) return
  if (paneNode.direction === PaneDirection.Vertical) {
    // 子面板为垂直布局
    const composingHeight = paneNode.size.reduce((p, c) => p + c, 0)
    if (!composingHeight) return
    const splitPaneElHeight = splitPaneElRef.value.clientHeight
    const ratio = splitPaneElHeight / composingHeight
    const newSize = paneNode.size.map((i) => i * ratio)
    const delta = splitPaneElHeight - newSize.reduce((p, c) => p + c, 0)
    newSize[newSize.length - 1] += delta
    paneNode.size = newSize
  } else {
    // 子面板为水平布局
    const composingWidth = paneNode.size.reduce((p, c) => p + c, 0)
    if (!composingWidth) return
    const splitPaneElWidth = splitPaneElRef.value.clientWidth
    const ratio = splitPaneElWidth / composingWidth
    const newSize = paneNode.size.map((i) => i * ratio)
    const delta = splitPaneElWidth - newSize.reduce((p, c) => p + c, 0)
    newSize[newSize.length - 1] += delta
    paneNode.size = newSize
  }
}

onMounted(() => {
  splitPaneElResizeObserver = useResizeObserver(splitPaneElRef.value, () => {
    doLayoutChildrenPane()
  })
  doLayoutChildrenPane()
})

onBeforeUnmount(() => {
  if (splitPaneElResizeObserver) {
    splitPaneElResizeObserver.stop()
  }
})

const closeTab = (tabId: string) => {
  const index = paneNode.tabs.findIndex((tab) => tab.id === tabId)
  if (index === -1) return false

  const wasActive = paneNode.activeTab === tabId // 检查关闭的是否为当前激活的标签

  paneNode.tabs.splice(index, 1)

  if (paneNode.tabs.length !== 0 && wasActive) {
    // 仅当关闭的是激活标签时调整激活状态
    // 计算新的激活索引：若原索引超出当前范围则取最后一个，否则保持原位置
    const newActiveIndex = index >= paneNode.tabs.length ? paneNode.tabs.length - 1 : index
    paneNode.activeTab = paneNode.tabs[newActiveIndex].id
  }
  return true
}

const insertTab = (tab: Tab, neighborTabId: string, insertPosition: TabInsertPosition) => {
  const tabIndex = paneNode.tabs.findIndex((t) => t.id === neighborTabId)
  if (tabIndex !== -1) {
    // 计算插入位置
    const insertIndex = insertPosition === TabInsertPosition.Left ? tabIndex : tabIndex + 1
    // 插入新Tab
    paneNode.activeTab = tab.id
    paneNode.tabs.splice(insertIndex, 0, tab)
    return true
  }
  return false
}

const insertPane = (newPane: PaneNode, tabInsertPanePosition: TabInsertPanePosition) => {
  const originalPane = { ...paneNode }
  paneNode.id = uuidv4()
  paneNode.children = [TabInsertPanePosition.Bottom, TabInsertPanePosition.Right].includes(
    tabInsertPanePosition,
  )
    ? [originalPane, newPane]
    : [newPane, originalPane]
  paneNode.direction = [TabInsertPanePosition.Left, TabInsertPanePosition.Right].includes(
    tabInsertPanePosition,
  )
    ? PaneDirection.Horizontal
    : PaneDirection.Vertical
  paneNode.size = [100, 100]
  paneNode.activeTab = ''
  paneNode.tabs = []
  return true
}

defineExpose({
  closeTab,
  insertTab,
  insertPane,
  doLayoutChildrenPane,
})
</script>

<template>
  <div
    ref="split-pane-el"
    class="drag-split-pane"
    :style="variablesStyle"
    :class="{
      'root-pane': isRoot,
    }"
    :id="`dragSplitPane_${paneNode.id}`"
  >
    <div
      v-if="paneNode.children.length > 0"
      class="children-pane"
      :class="[paneNode.direction === PaneDirection.Vertical ? 't-m-b' : 'l-m-r']"
    >
      <div
        v-for="(pane, index) in paneNode.children"
        :key="pane.id"
        class="pane-wrapper"
        :style="{
          width:
            paneNode.direction === PaneDirection.Vertical ? '100%' : `${paneNode.size[index]}px`,
          height:
            paneNode.direction === PaneDirection.Horizontal ? '100%' : `${paneNode.size[index]}px`,
        }"
      >
        <DragSplitPane :pane-id="pane.id" :key="pane.id" />
        <ResizeLine
          v-if="index < paneNode.children.length - 1"
          :direction="paneNode.direction === PaneDirection.Vertical ? 'vertical' : 'horizontal'"
          :position="paneNode.direction === PaneDirection.Vertical ? 'bottom' : 'right'"
          @resize="(delta: number) => handleResize(index, delta)"
        />
      </div>
    </div>
    <div v-if="paneNode.tabs.length > 0" class="tabs">
      <TabHeaders />
      <TabContent />
    </div>
  </div>
  <KeepAlive v-if="isRoot">
    <Teleport v-for="tab in allPaneTabs" :key="tab.id" :to="`#tabContent_${tab.paneId}`">
      <div v-show="tab.id === tab.activeTab" class="tab-content">
        <slot name="tab-content" :tab="tab" />
      </div>
    </Teleport>
  </KeepAlive>
</template>

<style lang="scss" scoped>
.tab-content {
  height: 100%;
  width: 100%;
}

.drag-split-pane {
  height: 100%;
  width: 100%;
  position: relative;

  .children-pane {
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;

    &.t-m-b {
      flex-direction: column;

      > .pane-wrapper {
        position: relative;
        width: 100%;
        border-bottom: 1px solid rgb(0, 0, 0);
      }

      > :last-child {
        border-bottom: none;
      }
    }

    &.l-m-r {
      flex-direction: row;

      > .pane-wrapper {
        position: relative;
        height: 100%;
        border-right: 1px solid rgb(0, 0, 0);
      }

      > :last-child {
        border-right: none;
      }
    }
  }

  .tabs {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
