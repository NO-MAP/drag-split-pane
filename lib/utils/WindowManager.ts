import { ref } from "vue"
import { Pane, type PaneData } from "./Pane"
import { Window } from './Window'

export class WindowManager {
  private static _instance?: WindowManager = undefined
  private _rootPaneRef = ref(new Pane())
  readyDestroyWindows: Window[] = []

  public static get instance() {
    if (this._instance === undefined) {
      this._instance = new WindowManager()
    }
    return this._instance
  }

  public get rootPane() {
    return this._rootPaneRef.value as Pane
  }

  setRootPane(paneData: PaneData) {
    // 收集并销毁旧窗格树中的所有窗口
    const collectWindows = (pane: Pane): Window[] => {
      const windows = [...pane.windows]
      for (const child of pane.children) {
        windows.push(...collectWindows(child))
      }
      return windows
    }

    const oldWindows = collectWindows(this.rootPane)
    this.readyDestroyWindows.push(...oldWindows)

    // 重建窗格树
    const reconstructPane = (data: PaneData): Pane => {
      const pane = new Pane(data.id)
      pane.activeWindowId = data.activeWindowId
      pane.direction = data.direction
      pane.size = [...data.size]

      // 重建窗口
      data.windows.map(windowData => {
        pane.insertWindow(new Window(windowData.windowData, windowData.id))
      })
      // 递归重建子窗格
      pane.children = data.children.map(childData =>
        reconstructPane(childData))

      return pane
    }
    this._rootPaneRef.value = reconstructPane(paneData)
  }

  findPane(paneId: string): Pane | undefined {
    const queue: Pane[] = [this.rootPane]
    while (queue.length > 0) {
      const currentPane = queue.shift()!

      if (currentPane.id === paneId) {
        return currentPane
      }

      queue.push(...currentPane.children)
    }
    return undefined
  }

  findPaneByWindowId(windowId: string): Pane | undefined {
    const queue: Pane[] = [this.rootPane]
    while (queue.length > 0) {
      const currentPane = queue.shift()!
      const windowIds = currentPane.windows.map(window => window.id)

      if (windowIds.includes(windowId)) {
        return currentPane
      }

      queue.push(...currentPane.children)
    }
    return undefined
  }

  clearEmptyPane(_pane?: Pane) {
    let pane = _pane || this.rootPane
    let i = 0
    while (i < pane.children.length) {
      const child = pane.children[i]
      const shouldRemoveChild = this.clearEmptyPane(child)
      if (shouldRemoveChild) {
        const totalSize = pane.size.reduce((a, b) => a + b, 0)
        const removedSize = pane.size.splice(i, 1)[0]
        pane.children.splice(i, 1)

        if (pane.children.length > 0) {
          const remainingTotal = totalSize - removedSize
          pane.size = pane.children.map(() => remainingTotal / pane.children.length)
        }
      } else {
        i++
      }
    }

    // 合并单子节点，无论子节点是否有children
    if (pane.children.length === 1) {
      const onlyChild = pane.children[0]
      const parentTotalSize = pane.size[0] // 父节点当前总尺寸

      // 提升子节点的属性到父节点
      pane.activeWindowId = onlyChild.activeWindowId
      pane.direction = onlyChild.direction // 继承子节点的方向
      pane.children = [...onlyChild.children]
      pane.size = onlyChild.children.length > 0 ? [...onlyChild.size] : [parentTotalSize] // 保持尺寸
      pane.id = onlyChild.id
      onlyChild.windows.map(window => {
        pane.insertWindow(window)
      })

      // 提升后，可能需要进一步清理新的子节点
      // 递归处理当前节点，因为子节点可能仍有可合并的情况
      this.clearEmptyPane(pane)
    }
    return pane.windows.length === 0 && pane.children.length === 0
  }

}