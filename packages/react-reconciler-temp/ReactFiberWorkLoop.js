import { NoWork, msToExpirationTime } from './ReactFiberExpirationTime'
import { HostRoot } from 'shared/ReactWorkTags';
import beginWork from 'reactReconciler/ReactFiberBeginWork';
import Scheduler from 'scheduler';
import {
  commitMutationEffects,
  commitBeforeMutationEffects
} from './ReactFiberCommitWork';
import { createWorkInProgress } from './ReactFiber';

import {
  completeWork
} from './ReactFiberCompleteWork';
export function unbatchedUpdates(fn, a) {
  try {
    return fn()
  } finally {

  }
}
function markUpdateTimeFromFiberToRoot(fiber, expirationTime) {

  let node = fiber.return;
  let root;
  if (!node && fiber.tag === HostRoot) {
    root = fiber.stateNode;
  } else {
    while (node) {
      if (!node.return && node.tag === HostRoot) {
        root = node.stateNode;
        break;
      }
      node = node.return;
    }
  }
  return root;
}
function prepareFreshStack(root, expirationTime) {
  root.finishedWork = null;
  if (workInProgress !== null) {
  }
  workInProgress = createWorkInProgress(root.current, null)
}
function performSyncWorkOnRoot(root) {

  if (workInProgress) {
    do {
      workLoopSync();
      break;
    } while (true)
  }
  root.finishedWork = root.current.alternate;
  commitRoot(root);
  return null;
}
// 对于已经过期的任务，不需要考虑任务是否需要中断
function workLoopSync() {
  while (workInProgress) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
function performUnitOfWork(unitOfWork) {
  console.log('performUnitOfWork')
  const current = unitOfWork.alternate;

  let next = beginWork(current, unitOfWork);
  if (!next) {
    next = completeUnitOfWork(unitOfWork);
  }
  return next;
}
export function scheduleUpdateOnFiber(fiber, expirationTime) {

  console.log('scheduleUpdateOnFiber')
  const root = markUpdateTimeFromFiberToRoot(fiber, expirationTime);
  prepareFreshStack(root, expirationTime);
  performSyncWorkOnRoot(root);
}
let currentEventTime = NoWork;
// 当前正在work的fiber
let workInProgress;
export function requestCurrentTimeForUpdate() {
  if (currentEventTime !== NoWork) {
    return currentEventTime;
  }
  currentEventTime = msToExpirationTime(Scheduler.now());
  return currentEventTime;
}
function completeUnitOfWork(unitOfWork) {
  workInProgress = unitOfWork;
  do {
    const current = workInProgress.alternate;
    const returnFiber = workInProgress.return;
    // if (!(workInProgress.effectTag & Incomplete)) {
    if (true) {
      // 该fiber未抛出错误

      // 当前总会返回null
      let next = completeWork(current, workInProgress);

      if (next) {
        return next;
      }

      if (returnFiber) {
        // if (returnFiber && !(returnFiber.effectTag & Incomplete)) {
        // 将完成的fiber的 effect list append到父级fiber上
        // 这样一级级递归上去后，根节点会有一条本次update所有有effect的fiber的list
        // 在执行DOM操作时只需要遍历这条链表而不需要再递归一遍整个fiber树就能执行effect对应DOM操作
        if (!returnFiber.firstEffect) {
          returnFiber.firstEffect = workInProgress.firstEffect;
        }
        if (workInProgress.lastEffect) {
          if (returnFiber.lastEffect) {
            returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
          }
          returnFiber.lastEffect = workInProgress.lastEffect;
        }
        const effectTag = workInProgress.effectTag;
        if (effectTag) {
          // 如果当前fiber上存在effect，把他附在父fiber effect list的最后
          if (returnFiber.lastEffect) {
            // 父fiber list 已有effect
            returnFiber.lastEffect.nextEffect = workInProgress;
          } else {
            returnFiber.firstEffect = workInProgress;
          }
          returnFiber.lastEffect = workInProgress;
        }
      }

      const sibling = workInProgress.sibling;
      if (sibling) {
        // 当前父fiber下处理完workInProgress，再去处理他的兄弟节点
        return sibling;
      }
      // 兄弟节点也处理完后，向上一级继续处理
      workInProgress = returnFiber;
    }
  } while (workInProgress)

  return null;
}
function commitRoot(root) {

  // TODO 根据scheduler优先级执行
  const finishedWork = root.finishedWork;
  if (!finishedWork) {
    return null;
  }
  root.finishedWork = null;

  let firstEffect;
  if (root.effectTag) {
    // 由于根节点的effect list不含有自身的effect，所以当根节点本身存在effect时需要将其append 入 effect list
    if (finishedWork.lastEffect) {
      finishedWork.lastEffect.nextEffect = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      firstEffect = finishedWork;
    }
  } else {
    // 根节点本身没有effect
    firstEffect = finishedWork.firstEffect;
  }

  let nextEffect;
  if (firstEffect) {
    // before mutation阶段
    nextEffect = firstEffect;
    do {
      try {
        nextEffect = commitBeforeMutationEffects(nextEffect);
      } catch (e) {
        console.warn('commit before error', e);
        nextEffect = nextEffect.nextEffect;
      }
    } while (nextEffect)

    // mutation阶段
    nextEffect = firstEffect;
    do {
      try {
        nextEffect = commitMutationEffects(root, nextEffect);
      } catch (e) {
        console.warn('commit mutaion error', e);
        nextEffect = nextEffect.nextEffect;
      }
    } while (nextEffect)
  }
}