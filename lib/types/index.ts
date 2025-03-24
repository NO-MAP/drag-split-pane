import DragSplitPane from '../DragSplitPane.vue'

// 主题类型定义
export interface ColorSetting {
  // 面板相关
  paneBgColor: string
  paneColor: string
  paneBorderColor: string

  // 标签页相关
  tabBgColor: string
  tabActiveBgColor: string
  tabColor: string
  tabActiveColor: string
  tabBorderColor: string

  // 拖拽手柄
  handleBg: string
  handleHoverBg: string
  handleActiveBg: string

  // 分隔线
  separatorColor: string
  separatorActiveColor: string

  // 悬停提示
  hoverHintColor: string

  // 禁用状态
  disabledBg: string
  disabledColor: string
  disabledBorderColor: string
}

// 默认颜色配置（参考VSCode暗色主题）
export const defaultColorSetting: ColorSetting = {
  paneBgColor: '#1e1e1e',
  paneColor: '#cccccc',
  paneBorderColor: '#333333',

  tabBgColor: '#2d2d2d',
  tabActiveBgColor: '#252526',
  tabColor: '#858585',
  tabActiveColor: '#ffffff',
  tabBorderColor: '#3c3c3c',

  handleBg: '#3c3c3c',
  handleHoverBg: '#454545',
  handleActiveBg: '#007acc',

  separatorColor: '#252526',
  separatorActiveColor: '#007acc',

  hoverHintColor: '#007acc33', // 带透明度
  disabledBg: '#2d2d2d',
  disabledColor: '#5a5a5a',
  disabledBorderColor: '#3c3c3c',
}

// CSS变量映射
export const colorVariables = {
  '--dsp-pane-bg': 'paneBgColor',
  '--dsp-pane-color': 'paneColor',
  '--dsp-pane-border': 'paneBorderColor',

  '--dsp-tab-bg': 'tabBgColor',
  '--dsp-tab-active-bg': 'tabActiveBgColor',
  '--dsp-tab-color': 'tabColor',
  '--dsp-tab-active-color': 'tabActiveColor',
  '--dsp-tab-border': 'tabBorderColor',

  '--dsp-handle-bg': 'handleBg',
  '--dsp-handle-hover-bg': 'handleHoverBg',
  '--dsp-handle-active-bg': 'handleActiveBg',

  '--dsp-separator-color': 'separatorColor',
  '--dsp-separator-active': 'separatorActiveColor',

  '--dsp-hover-hint': 'hoverHintColor',

  '--dsp-disabled-bg': 'disabledBg',
  '--dsp-disabled-color': 'disabledColor',
  '--dsp-disabled-border': 'disabledBorderColor',
} as const

// 类型辅助函数
export type CSSVariableName = keyof typeof colorVariables

export enum TabInsertPosition {
  Left = 'Left',
  Right = 'Right',
}

export interface Tab {
  id: string
}

export type PaneTab = Tab & {
  paneId: string
  activeTab: string
}

export enum TabInsertPanePosition {
  Top = 'Top',
  Right = 'Right',
  Bottom = 'Bottom',
  Left = 'Left',
  Middle = 'Middle',
}

export const rootPaneNodeInjectKey = 'dspRootPaneNode'
export const paneNodeInjectKey = 'dspPaneNode'
export const loadedPaneTabInjectKey = 'dspLoadedPaneTab'
export const instanceMapInjectKey = 'dspInstanceMap'
export type DspInstanceMap = Map<string, InstanceType<typeof DragSplitPane>>

export enum PaneDirection {
  Vertical = 'Vertical', // 垂直
  Horizontal = 'Horizontal', // 水平,
}

export interface PaneNode {
  id: string
  tabs: Tab[]
  activeTab: string
  direction: PaneDirection
  children: PaneNode[]
  size: number[]
}
