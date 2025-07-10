import { v4 as uuid } from 'uuid'
import { PaneDirection, WindowInsertPanePosition } from '../types'
import { Window } from './Window'

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

  setWindows(windows: Window[]) {
    windows.forEach(window => {
      window.parentPane = this
    })
    this._windows = windows
  }

  activePreWindow(windowId: string) {
    const currentIndex = this.aliveWindows.findIndex(w => w.id === windowId);
    if (currentIndex === -1) return;

    const prevIndex = currentIndex > 0
      ? currentIndex - 1
      : this.aliveWindows.length - 1;

    this.activeWindowId = this.aliveWindows[prevIndex].id;
  }

  splitPane(insertPosition: WindowInsertPanePosition) {
    if (insertPosition === WindowInsertPanePosition.Middle) {
      throw new Error('WindowInsertPanePosition.Middle do not need split')
    }
    const newPane = new Pane()
    const originalPane = new Pane()
    originalPane.activeWindowId = this.activeWindowId
    originalPane.direction = this.direction
    originalPane.children = this.children
    originalPane.size = this.size
    originalPane.setWindows(this._windows)
    this._windows = []
    this.children = [WindowInsertPanePosition.Bottom, WindowInsertPanePosition.Right].includes(
      insertPosition,
    )
      ? [originalPane, newPane]
      : [newPane, originalPane]
    this.direction = [WindowInsertPanePosition.Left, WindowInsertPanePosition.Right].includes(
      insertPosition,
    )
      ? PaneDirection.Horizontal
      : PaneDirection.Vertical
    this.size = [100, 100]
    this.activeWindowId = ''
    this._windows = []
    this.doLayoutPane()
    return {
      newPane,
      originalPane
    }
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

  clearEmptyPanes(): boolean {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
      const isEmpty = child.clearEmptyPanes();

      if (isEmpty) {
        // 移除空子 Pane 并释放资源
        const removedSize = this.size.splice(i, 1)[0];
        this.children.splice(i, 1);

        // 重新分配尺寸给剩余子 Pane
        if (this.children.length > 0) {
          const totalSize = this.size.reduce((sum, s) => sum + s, 0) + removedSize;
          this.size = this.children.map(() => totalSize / this.children.length);
        }
      }
    }
    if (this.children.length === 1 && this.aliveWindows.length === 0) {
      const onlyChild = this.children[0];
      const parentTotalSize = this.size[0];

      onlyChild.windows.forEach(window => {
        window.parentPane = this;
        this._windows.push(window);
      });
      this.direction = onlyChild.direction;
      this.children = onlyChild.children;
      this.size = onlyChild.children.length > 0
        ? [...onlyChild.size]
        : [parentTotalSize];
      this.activeWindowId = onlyChild.activeWindowId;
      onlyChild.children = [];
      onlyChild._windows = [];
      return this.clearEmptyPanes();
    }
    return this.aliveWindows.length === 0 && this.children.length === 0;
  }
}
