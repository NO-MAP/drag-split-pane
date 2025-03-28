<script setup lang="ts">
import { reactive } from 'vue'
import { DragSplitPane } from '../lib/main'
import { PaneDirection, type PaneNode } from '../lib/types'

const defaultPaneNode: PaneNode = reactive({
  "id": "pane-0",
  "direction": PaneDirection.Horizontal,
  "size": [
    1274
  ],
  "activeTab": "activeTab1",
  "tabs": [
    {
      "id": "activeTab1"
    },
    {
      "id": "45e6fa6a-20b8-49c9-92a0-67eb9d060fee"
    },
    {
      "id": "514e6346-08a6-4b95-b513-e6f9589051fc"
    }
  ],
  "children": []
})

const testBtn = () => {
  console.log(JSON.parse(JSON.stringify(defaultPaneNode)))
}
</script>

<template>
  <div class="example-wrapper">
    <div class="content1">
      <div class="content2">
        <div class="left">
          <button @click="() => testBtn()">test</button>
        </div>
        <div class="right">
          <DragSplitPane :root-pane-data="defaultPaneNode" :pane-id="defaultPaneNode.id" :key="defaultPaneNode.id" />
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
