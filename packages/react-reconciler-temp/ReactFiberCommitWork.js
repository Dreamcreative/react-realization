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