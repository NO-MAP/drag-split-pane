<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import {
  type ColorSetting,
  colorVariables,
  defaultColorSetting,
  PaneDirection,
} from './types'
import ResizeLine from './component/ResizeLine.vue'
import DragSplitPane from './DragSplitPane.vue'
import { useResizeObserver } from '@vueuse/core'
import type { Pane } from './utils/Pane'
import PaneHeaders from './component/PaneHeaders.vue'
import PaneContent from './component/PaneContent.vue'

interface Props {
  colorSettings?: Partial<ColorSetting>
  pane: Pane
  isRoot?: boolean
}

defineOptions({
  name: 'DragSplitPane',
})

const props = withDefaults(defineProps<Props>(), {
  colorSettings: () => ({}),
  isRoot: true
})

const mergedColors = computed(() => ({
  ...defaultColorSetting,
  ...props.colorSettings,
}))

const variablesStyle = props.isRoot
  ? Object.entries(colorVariables).reduce(
    (acc: Record<string, string>, [varName, propName]) => {
      acc[varName] = mergedColors.value[propName]
      return acc
    },
    {} as Record<string, string>,
  )
  : {}


const splitPaneElRef = useTemplateRef('split-pane-el')

onMounted(() => {

})

onBeforeUnmount(() => {

})

const handleResize = (index: number, delta: number): void => {
  if (props.pane.direction === PaneDirection.Horizontal) {
    props.pane.size[index] -= delta
    props.pane.size[index + 1] += delta
  } else {
    props.pane.size[index] += delta
    props.pane.size[index + 1] -= delta
  }
}

const allPaneTabs = computed(() => {
  return []
})

watch(() => allPaneTabs.value, (value) => {
  console.log('allPaneTabs changed', value)
}, {
  deep: true
})

let splitPaneElResizeObserver: ReturnType<typeof useResizeObserver> | undefined = undefined

onMounted(() => {
  props.pane.setElement(splitPaneElRef.value!)
  splitPaneElResizeObserver = useResizeObserver(splitPaneElRef.value, () => {
    props.pane.doLayoutPane()
  })
  props.pane.doLayoutPane()
})

onBeforeUnmount(() => {
  if (splitPaneElResizeObserver) {
    splitPaneElResizeObserver.stop()
  }
})
</script>

<template>
  <div ref="split-pane-el" class="relative w-full h-full" :style="variablesStyle" :class="{
    'root-pane': isRoot,
  }" :id="`dragSplitPane_${pane.id}`">
    <div v-if="pane.children.length > 0" class="flex h-full w-full relative" :class="[
      pane.direction === PaneDirection.Vertical ? 'flex-col' : 'flex-row'
    ]">
      <div v-for="(childPane, index) in pane.children" :key="childPane.id" class="pane-wrapper relative" :class="{
        'w-full border-b border-black last:border-b-0': pane.direction === PaneDirection.Vertical,
        'h-full border-r border-black last:border-r-0': pane.direction === PaneDirection.Horizontal,
      }" :style="{
        width: pane.direction === PaneDirection.Vertical ? '100%' : `${pane.size[index]}px`,
        height: pane.direction === PaneDirection.Horizontal ? '100%' : `${pane.size[index]}px`,
      }">
        <DragSplitPane :pane="childPane" :key="childPane.id" />
        <ResizeLine v-if="index < pane.children.length - 1"
          :direction="pane.direction === PaneDirection.Vertical ? 'vertical' : 'horizontal'"
          :position="pane.direction === PaneDirection.Vertical ? 'bottom' : 'right'"
          @resize="(delta: number) => handleResize(index, delta)" />
      </div>
    </div>
    <div v-if="pane.windows.length > 0" class="w-full h-full">
      <PaneHeaders :pane="pane" />
      <PaneContent :pane="pane" />
    </div>
  </div>
  <template v-if="isRoot">
    <div style="position: fixed; bottom: 0; left: 0; background-color: white;">
      <div v-for="tab in allPaneTabs" style="height: 200px; width: 200px; border: 1px solid #eee" :key="tab.id"
        class="tab-content">
        <p>tab.id === {{ tab.id }}</p>
        <CodeTab />
      </div>
    </div>
  </template>
</template>