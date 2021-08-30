import { Placement, Deletion, Update, PlacementAndUpdate } from "shared/ReactSideEffectTags";
import { HostComponent, HostRoot, HostText } from "shared/ReactWorkTags";

import {
  insertInContainerBefore,
  appendChildToContainer
} from 'reactDOM/ReactHostConfig';
export function commitBeforeMutationEffects(nextEffect) {
  while (nextEffect) {
    return nextEffect = null;
  }
}
function getHostParentFiber(fiber) {
  let parent = fiber.return;
  while (parent) {
    if (isHostParent(parent)) {
      return parent;
    }
    parent = parent.return;
  }
}

function isHostParent(parent) {
  return (
    parent.tag === HostRoot ||
    parent.tag === HostComponent
  )
}
export function commitMutationEffects(root, nextEffect) {
  while (nextEffect) {
    const effectTag = nextEffect.effectTag;
    const primaryEffectTag = effectTag & (Placement | Deletion | Update);
    switch (primaryEffectTag) {
      case Placement:
        commitPlacement(nextEffect);
        nextEffect.effectTag &= ~Placement;
        break;
      case Update: break;
      case Deletion: break;
      case PlacementAndUpdate: break;
    }
    nextEffect = nextEffect.nextEffect;
  }
  return null;
}
function getHostSibling(fiber) {
  let node = fiber;

  // 嵌套的循环的原因是 fiber节点可能没有对应DOM节点，相应的fiber树层级和DOM树也不一定匹配
  siblings: while (true) {
    while (!node.sibling) {
      // 考虑 fiber.return 是 FunctionComponent，fiber.return.sibling 是 HostCompoennt
      // 则 fiber.stateNode 和 fiber.return.sibling.stateNode在DOM树上是兄弟关系
      if (!node.return || isHostParent(node.return)) {
        return null;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;

    // 当前节点不是Host节点，目标节点不能直接插在当前节点之前
    while (node.tag !== HostComponent && node.tag !== HostText) {
      if (node.effectTag & Placement) {
        continue siblings;
      }
      // 节点不是Host节点，但是他的子节点如果是Host节点，则目标DOM和子节点DOM是兄弟节点
      // 目标DOM应该插入在子节点DOM前面
      // 如果节点没有子节点，则继续寻找兄弟节点
      if (!node.child) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }
    // 到这一步时一定是一个Host节点，判断下该节点是否也是需要插入的节点
    if (!(node.effectTag & Placement)) {
      return node.stateNode;
    }
  }
}

function commitPlacement(finishedWork) {
  const parentFiber = getHostParentFiber(finishedWork);
  const parentStateNode = parentFiber.stateNode;
  let parent;
  let isContainer = false;
  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentStateNode;
      break;
    case HostRoot:
      parent = parentStateNode.containerInfo;
      isContainer = true;
      break;
  }
  const before = getHostSibling(finishedWork);
  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
    console.log('里程碑！！')
  } else {

  }
}
function insertOrAppendPlacementNodeIntoContainer(fiber, before, parent) {
  const { tag } = fiber;
  if (tag === HostComponent || tag === HostText) {
    const stateNode = fiber.stateNode;
    if (before) {
      insertInContainerBefore(parent, stateNode, before);
    } else {
      appendChildToContainer(parent, stateNode)
    }
  } else {
    const child = fiber.child;
    insertOrAppendPlacementNodeIntoContainer(child, before, parent);
    const sibling = child.sibling;
    while (sibling) {
      insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
      sibling = sibling.sibling;
    }
  }
}