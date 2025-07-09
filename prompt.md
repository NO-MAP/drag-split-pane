```typescript
import { v4 as uuid } from 'uuid'
import { PaneDirection, WindowInsertPanePosition, WindowInsertPosition } from '../types'
import { Window } from './Window'
import { WindowManager } from './WindowManager'

export interface PaneData {
  id: string
  windows: ReturnType<Window['getData']>[]
  activeWindowId: string
  direction: PaneDirection
  children: PaneData[]
  size: number[]
}

export class Pane {
  id: string
  windows: Window[] = []
  activeWindowId: string = ''
  direction: PaneDirection = PaneDirection.Horizontal
  children: Pane[] = []
  size: number[] = []

  constructor() {
    this.id = uuid()
  }

  clone() {
    const newPane = new Pane()
    newPane.windows = this.windows
    newPane.activeWindowId = this.activeWindowId
    newPane.direction = this.direction
    newPane.children = this.children
    newPane.size = this.size
    return newPane
  }

  splitPane() {

  }

  insertWindow(_window: Window, neighborWindowId: string, insertPosition: WindowInsertPosition) {
    let window = _window
    const rdsWindowIndex = WindowManager.instance.readyDestroyWindows.findIndex(rdsWindow => rdsWindow.id === _window.id)
    if (rdsWindowIndex !== -1) {
      [window] = WindowManager.instance.readyDestroyWindows.splice(rdsWindowIndex, 1)
    }
    const index = this.windows.findIndex((t) => t.id === neighborWindowId)
    if (index !== -1) {
      const insertIndex = insertPosition === WindowInsertPosition.Left ? index : index + 1
      this.activeWindowId = window.id
      this.windows.splice(insertIndex, 0, window)
      return true
    }
    return false
  }

  closeWindow(windowId: string): boolean {
    const index = this.windows.findIndex(window => window.id === windowId)
    if (index === -1) return false
    const wasActive = this.activeWindowId === windowId

    const [deletedWindow] = this.windows.splice(index, 1)
    WindowManager.instance.readyDestroyWindows.push(deletedWindow)
    if (this.windows.length !== 0 && wasActive) {
      const newActiveIndex = index >= this.windows.length ? this.windows.length - 1 : index
      this.activeWindowId = this.windows[newActiveIndex].id
    }
    return true
  }

  insertPane(insertPane: Pane, insertPosition: WindowInsertPanePosition) {
    const originalPane = this.clone()
    this.children = [WindowInsertPanePosition.Bottom, WindowInsertPanePosition.Right].includes(
      insertPosition,
    )
      ? [originalPane, insertPane]
      : [insertPane, originalPane]
    this.direction = [WindowInsertPanePosition.Left, WindowInsertPanePosition.Right].includes(
      insertPosition,
    )
      ? PaneDirection.Horizontal
      : PaneDirection.Vertical
    this.size = [100, 100]
    this.activeWindowId = ''
    this.windows = []
  }

  getData(): PaneData {
    return {
      id: this.id,
      windows: this.windows.map(window => window.getData()),
      activeWindowId: this.activeWindowId,
      direction: this.direction,
      children: this.children.map(pane => pane.getData()),
      size: this.size
    }
  }
}
```


```typescript
import { v4 as uuid } from 'uuid'

export class Window {
  id: string
  windowData: any
  constructor(data: any, _id?: string) {
    this.windowData = data
    this.id = _id || uuid()
  }

  getData() {
    return {
      id: this.id,
      windowData: this.windowData
    }
  }
}
```

```typescript
import { Pane, type PaneData } from "./Pane"
import { Window } from './Window'

export class WindowManager {
  private static _instance?: WindowManager = undefined
  private static _rootPane: Pane = new Pane()
  readyDestroyWindows: Window[] = []

  public static get instance() {
    if (this._instance === undefined) {
      this._instance = new WindowManager()
    }
    return this._instance
  }

  public setRootPane(paneData: PaneData) {
    
  }
}
```

请为我完善 `setRootPane` 的逻辑