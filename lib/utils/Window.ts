import { v4 as uuid } from 'uuid'

export type WindowData = ReturnType<Window['getData']>

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