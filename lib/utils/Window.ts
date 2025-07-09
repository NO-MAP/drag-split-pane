import { v4 as uuid } from 'uuid'
import type { Pane } from './Pane'

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
  }

  getData() {
    return {
      id: this.id,
      destroyTime: this.destroyTime,
      data: this.data,
    }
  }

  close() {
    this.isClosed = true
    this.destroyTimer = setTimeout(() => {
      this.destroy()
    }, this.destroyTime)
  }

  destroy() {
    this.parentPane.removeWindow(this.id)
  }

  move(pane: Pane) {
    this.parentPane.removeWindow(this.id)
    this.parentPane = pane
  }
}
