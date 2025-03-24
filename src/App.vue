<script setup lang="ts">
import { reactive } from 'vue'
import { DragSplitPane } from '../lib/main'
import { PaneDirection, type PaneNode } from '../lib/types'
import { v4 as uuidv4 } from 'uuid'

const defaultPaneNode: PaneNode = reactive({
  id: uuidv4(),
  direction: PaneDirection.Horizontal,
  size: [300, 300],
  activeTab: '',
  tabs: [],
  children: [
    {
      id: uuidv4(),
      direction: PaneDirection.Horizontal,
      size: [],
      activeTab: 'activeTab1',
      tabs: [
        {
          id: 'activeTab1',
        },
        {
          id: uuidv4(),
        },
        {
          id: uuidv4(),
        },
      ],
      children: [],
    },
    {
      id: uuidv4(),
      direction: PaneDirection.Vertical,
      size: [300, 300],
      activeTab: '',
      children: [
        {
          id: uuidv4(),
          direction: PaneDirection.Horizontal,
          size: [],
          activeTab: 'activeTab2',
          children: [],
          tabs: [
            {
              id: 'activeTab2',
            },
            {
              id: uuidv4(),
            },
            {
              id: uuidv4(),
            },
          ],
        },
        {
          id: uuidv4(),
          direction: PaneDirection.Horizontal,
          size: [],
          activeTab: 'activeTab3',
          children: [],
          tabs: [
            {
              id: 'activeTab3',
            },
            {
              id: uuidv4(),
            },
            {
              id: uuidv4(),
            },
          ],
        },
      ],
      tabs: [],
    },
  ],
})
</script>

<template>
  <div class="example-wrapper">
    <div class="content1">
      <div class="content2">
        <div class="left"></div>
        <div class="right">
          <DragSplitPane :root-pane-data="defaultPaneNode" :pane-id="defaultPaneNode.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.example-wrapper {
  height: 100vh;
  width: 100vw;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 0 0 4px #000;

  .content1 {
    height: 100%;
    width: 100%;
    box-shadow: 0 0 8px #000;
    box-sizing: border-box;
    padding: 10px;
  }

  .content2 {
    height: 100%;
    width: 100%;
    flex-wrap: nowrap;
    flex-wrap: nowrap;
    display: flex;
  }

  .left {
    width: 199px;
    height: 100%;
    border: 1px solid #000333;
    background-color: white;
  }

  .right {
    width: calc(100% - 200px);
    height: 100%;
    border: 1px solid #000333;
    border-left: none;
    background-color: #c1c1c1;
  }
}
</style>
