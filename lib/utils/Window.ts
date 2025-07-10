import { v4 as uuid } from 'uuid'
import type { Pane } from './Pane'
import { WindowInsertPosition } from '../types'

export type WindowData = ReturnType<Window['getData']>

export interface InitWindowData {
  id?: string
  parentPane: Pane
  data: any
  destroyTime?: number
}

export class Window {
  id: string
  parentPane: Pane
  destroyTime = 6 * 1000
  destroyTimer?: number
  isClosed = false
  data: any

  constructor(initData: InitWindowData) {
    this.data = initData.data
    this.id = initData.id || uuid()
    this.parentPane = initData.parentPane
    this.parentPane.windows.push(this)
    if (initData.destroyTime) {
      this.destroyTime = initData.destroyTime
    }
  }

  getData() {
    return {
      id: this.id,
      destroyTime: this.destroyTime,
      data: this.data,
    }
  }

  close() {
    if (this.parentPane.activeWindowId === this.id) {
      this.parentPane.activeNextWindow(this.id)
    }
    this.isClosed = true
    this.destroyTimer = setTimeout(() => {
      this.destroy()
    }, this.destroyTime)
  }

  destroy() {
    const index = this.parentPane.windows.findIndex((window) => window.id === this.id)
    if (index === -1) return
    const [removedWindow] = this.parentPane.windows.splice(index, 1)
    return removedWindow
  }

  moveToOtherPane(targetPane: Pane, insertPosition = WindowInsertPosition.Right, neighborWindowId?: string) {
    if (!this.isClosed) {
      if (this.parentPane.activeWindowId === this.id) {
        this.parentPane.activeNextWindow(this.id)
      }
      targetPane.activeWindowId = this.id
    }
    if (!neighborWindowId) {
      const currentIndex = this.parentPane.windows.findIndex(window => window.id === this.id)
      if (currentIndex !== -1) {
        this.parentPane.windows.splice(currentIndex, 1)
        targetPane.windows.push(this)
      }
    } else {
      if (neighborWindowId === this.id) {
        console.warn("Cannot move window relative to itself")
        return
      }
      const neighborWindowIndex = targetPane.windows.findIndex(window => (window.id === neighborWindowId && !window.isClosed))
      if (neighborWindowIndex !== -1) {
        const insertIndex = insertPosition === WindowInsertPosition.Left ? neighborWindowIndex : neighborWindowIndex + 1
        const currentIndex = this.parentPane.windows.findIndex(window => window.id === this.id)
        if (currentIndex !== -1) {
          this.parentPane.windows.splice(currentIndex, 1)
          targetPane.windows.splice(insertIndex, 0, this)
        }
      }
    }
    this.parentPane = targetPane
  }
}
