import type { Pane } from './Pane'
import type { Window } from './Window'

export const deepClone = <T>(data: T) => JSON.parse(JSON.stringify(data)) as T

export const getAllWindows = (pane: Pane): Window[] => {
  // 当前 Pane 的所有窗口
  const currentWindows = [...pane.windows];

  // 递归获取子 Pane 的窗口
  const childWindows = pane.children.flatMap(child => getAllWindows(child));

  // 合并结果
  return [...currentWindows, ...childWindows];
}