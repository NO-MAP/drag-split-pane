import { v4 as uuid } from 'uuid'
import { PaneDirection, WindowInsertPanePosition, type PaneData } from '../types'
import { Window } from './Window'

export class Pane {
  id: string
  private _windows: Window[] = []
  activeWindowId: string = ''
  direction: PaneDirection = PaneDirection.Horizontal
  children: Pane[] = []
  size: number[] = []
  el?: HTMLElement
  parentPane?: Pane

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

  public activeNextWindow(windowId: string) {
    const currentIndex = this.aliveWindows.findIndex(w => w.id === windowId);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % this.aliveWindows.length;
    this.activeWindowId = this.aliveWindows[nextIndex].id;
  }

  splitPane(insertPosition: WindowInsertPanePosition) {
    if (insertPosition === WindowInsertPanePosition.Middle) {
      throw new Error('WindowInsertPanePosition.Middle do not need split')
    }
    const newPane = new Pane()
    newPane.parentPane = this
    const originalPane = new Pane()
    originalPane.parentPane = this
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
    console.log('doLayoutPane')
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
    this.children.forEach(pane => {
      pane.doLayoutPane()
    })
  }

  clearEmptyPanes(): boolean {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
      const isEmpty = child.clearEmptyPanes();

      if (isEmpty) {
        // 在移除子面板前，转移其所有窗口到当前面板
        child.windows.forEach(window => {
          window.parentPane = this; // 更新父面板引用
          this._windows.push(window); // 添加到当前面板
        });
        child._windows = []; // 清原子面板的窗口列表

        // 移除空子面板并调整布局
        const removedSize = this.size.splice(i, 1)[0];
        this.children.splice(i, 1);

        // 重新分配尺寸
        if (this.children.length > 0) {
          const totalSize = this.size.reduce((sum, s) => sum + s, 0) + removedSize;
          this.size = this.children.map(() => totalSize / this.children.length);
        }
      }
    }

    // 合并逻辑：当只有一个子面板且当前面板无窗口时
    if (this.children.length === 1 && this.aliveWindows.length === 0) {
      const onlyChild = this.children[0];
      const parentTotalSize = this.size[0];

      // 转移子面板的窗口到当前面板
      onlyChild.windows.forEach(window => {
        window.parentPane = this;
        this._windows.push(window);
      });
      onlyChild._windows = [];

      // 继承子面板的结构
      this.direction = onlyChild.direction;
      this.children = onlyChild.children;
      this.size = onlyChild.children.length > 0
        ? [...onlyChild.size]
        : [parentTotalSize];
      this.activeWindowId = onlyChild.activeWindowId;

      // 重置子面板并递归清理
      onlyChild.children = [];
      return this.clearEmptyPanes();
    }

    // 最终检查：无存活窗口且无子面板则为空
    return this.aliveWindows.length === 0 && this.children.length === 0;
  }
}
