<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { DragSplitPane } from '../lib/main'
import { PaneDirection, type PaneData } from '../lib/types'
import CodeTab from './component/CodeTab.vue'
import { WindowManager } from '../lib/utils/WindowManager'

const defaultPaneData: PaneData = {
  id: 'pane-0',
  direction: PaneDirection.Horizontal,
  size: [1274],
  activeWindowId: 'activeTab1',
  windows: [
    { id: 'activeTab1', data: undefined, destroyTime: 6 * 10 * 1000 },
    { id: 'activeTab2', data: undefined, destroyTime: 6 * 10 * 1000 },
    { id: 'activeTab3', data: undefined, destroyTime: 6 * 10 * 1000 },
    { id: 'activeTab4', data: undefined, destroyTime: 6 * 10 * 1000 },
    { id: 'activeTab5', data: undefined, destroyTime: 6 * 10 * 1000 },
    { id: 'activeTab6', data: undefined, destroyTime: 6 * 10 * 1000 },
  ],
  children: [],
}
WindowManager.instance.setRootPane(defaultPaneData)

const testBtn = () => {
  console.log(rootPane.value)
}

onMounted(() => {
})

const rootPane = computed(() => {
  return WindowManager.instance.rootPane
})
</script>

<template>
  <div class="h-screen w-screen p-5 box-border shadow-[0_0_4px_#000]">
    <div class="h-full w-full shadow-[0_0_8px_#000] box-border p-2.5">
      <div class="h-full w-full flex flex-nowrap">
        <div class="w-[199px] h-full border border-[#000333] bg-white">
          <button @click="testBtn" class="m-2 p-2 bg-gray-200 rounded">test</button>
          <div id="unLoadedSpace"></div>
        </div>
        <div class="flex-grow h-full border border-[#000333] border-l-0 bg-[#c1c1c1]">
          <DragSplitPane :pane="rootPane">
            <template #window-content="{ window }">
              <CodeTab :key="window.id" />
            </template>
          </DragSplitPane>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
