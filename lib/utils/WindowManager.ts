import { ref } from "vue"
import { Pane, type PaneData } from "./Pane"
import { Window } from './Window'
import { getAllWindows } from "."

export class WindowManager {
  private static _instance?: WindowManager = undefined
  private _rootPaneRef = ref(new Pane())

  public static get instance() {
    if (this._instance === undefined) {
      this._instance = new WindowManager()
    }
    return this._instance
  }

  public get rootPane() {
    return this._rootPaneRef.value as Pane
  }

  public get allWindows() {
    return getAllWindows(this.rootPane)
  }

  findWindow(windowId: string) {
    return this.allWindows.find(window => window.id === windowId)
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

    // 重建窗格树
    const reconstructPane = (data: PaneData): Pane => {
      const pane = new Pane(data.id)
      pane.activeWindowId = data.activeWindowId
      pane.direction = data.direction
      pane.size = [...data.size]

      // 重建窗口
      data.windows.forEach(windowData => {
        new Window({
          id: windowData.id,
          parentPane: pane,
          data: windowData.data
        })
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
    const queue: Pane[] = [this.rootPane];

    while (queue.length > 0) {
      const currentPane = queue.shift()!;
      if (currentPane.windows.some(window => window.id === windowId)) {
        return currentPane;
      }
      queue.push(...currentPane.children);
    }
    return undefined; // 未找到
  }
}
