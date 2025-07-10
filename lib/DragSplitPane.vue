<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
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
import { WindowManager } from './utils/WindowManager'
import type { Window } from './utils/Window'

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
const isLoaded = ref(false)
onMounted(() => {
  isLoaded.value = true
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

const allWindow = computed(() => {
  return WindowManager.instance.allWindows
})

const loadedPaneIds = computed(() => {
  return WindowManager.instance.loadedPaneIds.value
})

const closedWindowContentWrapperId = 'closedWindowContentWrapper'
const unLoadedPaneWindowWrapperId = 'unLoadedPaneWindowWrapper'

const returnRenderDomId = (window: Window) => {
  if (window.isClosed) {
    return `#${closedWindowContentWrapperId}`
  }
  if (!loadedPaneIds.value.includes(window.parentPane.id)) {
    return `#${unLoadedPaneWindowWrapperId}`
  }
  return `#paneContent_${window.parentPane.id}`
}

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
  <template v-if="isRoot && isLoaded">
    <Teleport v-for="window in allWindow" :to="returnRenderDomId(window)" :key="window.id">
      <div class="w-full h-full" v-show="window.parentPane.activeWindowId === window.id">
        <slot name="window-content" :window="window" />
      </div>
    </Teleport>
    <div :id="closedWindowContentWrapperId" style="position: fixed; bottom: 0; right: 0; background-color: white;">

    </div>
    <div :id="unLoadedPaneWindowWrapperId" style="position: fixed; top: 0; right: 0; background-color: white;">

    </div>
  </template>
</template>
