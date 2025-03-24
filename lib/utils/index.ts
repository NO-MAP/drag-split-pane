import type { PaneNode, PaneTab } from '../types'

export function findPaneNodeById(root: PaneNode, targetId: string): PaneNode {
  const stack: PaneNode[] = [root]

  while (stack.length > 0) {
    const currentNode = stack.pop()!
    if (currentNode.id === targetId) {
      return currentNode
    }
    // 将子节点压入栈中（注意顺序）
    stack.push(...currentNode.children.reverse())
  }
  throw new Error(`find paneNode failed::${targetId}`)
}

export const getAllPaneTabs = (paneNode: PaneNode): PaneTab[] => {
  // 将当前节点的每个 Tab 转换为 PaneTab 对象
  const currentTabs: PaneTab[] = paneNode.tabs.map((tab) => ({
    ...tab, // 保留原始 Tab 属性（type/id/filePath 或 type/id/url）
    paneId: paneNode.id, // 附加 paneId
    activeTab: paneNode.activeTab, // 附加当前节点的 activeTab 状态
  }))

  // 递归处理子节点，合并结果
  return [...currentTabs, ...paneNode.children.flatMap((child) => getAllPaneTabs(child))]
}
