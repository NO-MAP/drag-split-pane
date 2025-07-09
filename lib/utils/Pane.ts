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
  private _windows: Window[] = []
  activeWindowId: string = ''
  direction: PaneDirection = PaneDirection.Horizontal
  children: Pane[] = []
  size: number[] = []
  el?: HTMLElement

  public get windows() {
    return this._windows
  }

  public get aliveWindows() {
    return this._windows.filter(window => !window.isClosed)
  }

  constructor(_id?: string) {
    this.id = _id || uuid()
  }

  clone() {
    const newPane = new Pane()
    newPane.activeWindowId = this.activeWindowId
    newPane.direction = this.direction
    newPane.children = this.children
    newPane.size = this.size
    this.windows.forEach((window) => {
      newPane.insertWindow(window)
    })
    return newPane
  }

  insertWindow(
    _window: Window,
    insertPosition = WindowInsertPosition.Right,
    neighborWindowId?: string,
  ) {
    let window = _window
    if (!neighborWindowId) {
      this.activeWindowId = window.id
      this.windows.push(window)
    } else {
      const index = this.windows.findIndex((t) => t.id === neighborWindowId)
      if (index !== -1) {
        const insertIndex = insertPosition === WindowInsertPosition.Left ? index : index + 1
        this.activeWindowId = window.id
        this.windows.splice(insertIndex, 0, window)
      }
    }
    return window
  }

  closeWindow(windowId: string): undefined | Window {
    const index = this.aliveWindows.findIndex((window) => window.id === windowId)
    if (index === -1) return
    const window = this.aliveWindows[index]

    const wasActive = this.activeWindowId === windowId

    if (this.aliveWindows.length !== 0 && wasActive) {
      const newActiveIndex = index >= this.aliveWindows.length ? this.aliveWindows.length - 1 : index
      this.activeWindowId = this.aliveWindows[newActiveIndex].id
    }
    window.close()
    return window
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
    this._windows = []
  }

  getData(): PaneData {
    return {
      id: this.id,
      windows: this.windows.map((window) => window.getData()),
      activeWindowId: this.activeWindowId,
      direction: this.direction,
      children: this.children.map((pane) => pane.getData()),
      size: this.size,
    }
  }

  setElement(el: HTMLElement) {
    this.el = el
  }

  doLayoutPane() {
    if (!this.el) return
    if (this.direction === PaneDirection.Vertical) {
      // 子面板为垂直布局
      const composingHeight = this.size.reduce((p, c) => p + c, 0)
      if (!composingHeight) return
      const splitPaneElHeight = this.el.clientHeight
      const ratio = splitPaneElHeight / composingHeight
      const newSize = this.size.map((i) => i * ratio)
      const delta = splitPaneElHeight - newSize.reduce((p, c) => p + c, 0)
      newSize[newSize.length - 1] += delta
      this.size = newSize
    } else {
      // 子面板为水平布局
      const composingWidth = this.size.reduce((p, c) => p + c, 0)
      if (!composingWidth) return
      const splitPaneElWidth = this.el.clientWidth
      const ratio = splitPaneElWidth / composingWidth
      const newSize = this.size.map((i) => i * ratio)
      const delta = splitPaneElWidth - newSize.reduce((p, c) => p + c, 0)
      newSize[newSize.length - 1] += delta
      this.size = newSize
    }
  }

  removeWindow(windowId: string) {
    const index = this._windows.findIndex((window) => window.id === windowId)
    if (index !== -1) {
      const [removedWindow] = this._windows.splice(index, 1)
      return removedWindow
    }
  }
}
