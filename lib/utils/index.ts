import type { PaneNode, PaneTab } from '../types'

export function findPaneNodeById(root: PaneNode, targetId: string): PaneNode {
  const stack: PaneNode[] = [root]

  while (stack.length > 0) {
    const currentNode = stack.pop()!
    if (currentNode.id === targetId) {
      return currentNode
    }
    // 将子节点压入栈中（注意顺序）
    stack.push(...[...currentNode.children].reverse())
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

export function findParentPane(root: PaneNode, targetId: string): PaneNode | null {
  // 如果当前节点的子节点中包含目标ID，直接返回当前节点（父节点）
  for (const child of root.children) {
    if (child.id === targetId) {
      return root
    }
  }

  // 递归遍历子节点，尝试在子树中找到目标ID的父节点
  for (const child of root.children) {
    const parent = findParentPane(child, targetId)
    if (parent) {
      return parent
    }
  }

  // 未找到父节点
  return null
}

export const clearEmptyPane = (paneNode: PaneNode): boolean => {
  let i = 0;
  while (i < paneNode.children.length) {
    const child = paneNode.children[i];
    const shouldRemoveChild = clearEmptyPane(child);
    if (shouldRemoveChild) {
      const totalSize = paneNode.size.reduce((a, b) => a + b, 0);
      const removedSize = paneNode.size.splice(i, 1)[0];
      paneNode.children.splice(i, 1);

      if (paneNode.children.length > 0) {
        const remainingTotal = totalSize - removedSize;
        paneNode.size = paneNode.children.map(() => remainingTotal / paneNode.children.length);
      }
    } else {
      i++;
    }
  }

  // 合并单子节点，无论子节点是否有children
  if (paneNode.children.length === 1) {
    const onlyChild = paneNode.children[0];
    const parentTotalSize = paneNode.size[0]; // 父节点当前总尺寸

    // 提升子节点的属性到父节点
    paneNode.tabs = [...onlyChild.tabs];
    paneNode.activeTab = onlyChild.activeTab;
    paneNode.direction = onlyChild.direction; // 继承子节点的方向
    paneNode.children = [...onlyChild.children];
    paneNode.size = onlyChild.children.length > 0
      ? [...onlyChild.size]
      : [parentTotalSize]; // 保持尺寸
    paneNode.id = onlyChild.id;

    // 提升后，可能需要进一步清理新的子节点
    // 递归处理当前节点，因为子节点可能仍有可合并的情况
    clearEmptyPane(paneNode);
  }

  return paneNode.tabs.length === 0 && paneNode.children.length === 0;
};
