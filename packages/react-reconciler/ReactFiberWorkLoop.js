// 工作循环相关内容

import {
  NoWork,
  msToExpirationTime
} from './ReactFiberExpirationTime';
import {
  completeWork
} from './ReactFiberCompleteWork';
import {
  HostRoot,
  HostComponent
} from 'shared/ReactWorkTags';
import {
  Incomplete
} from 'shared/ReactSideEffectTags';
import {
  createWorkInProgress
} from './ReactFiber';
import {
  createInstance
} from 'reactDOM/ReactHostConfig';
import {
  commitMutationEffects,
  commitBeforeMutationEffects
} from './ReactFiberCommitWork';
import beginWork from './ReactFiberBeginWork';
import Scheduler from 'scheduler';

let initialTimeMs = Scheduler.now();
// let isUnbatchingUpdates = false;
// 是否是批量update ex：同一个事件中触发多次update只会commit一次
// let isBatchingUpdates = false;

// 当前render的过期时间
// 该过期时间并不仅仅是某一个update的过期时间，
// 在同一个事件中触发的多次updaet应该共用同一个过期时间
// 在一小段时间（10ms）内触发的update也应该共用同一个过期时间
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

export function getCurrentTime() {
  return msToExpirationTime(Scheduler.now());
}

export function computeExpirationForFiber(currentTime, fiber) {

}

export function scheduleUpdateOnFiber(fiber, expirationTime) {

  const root = markUpdateTimeFromFiberToRoot(fiber, expirationTime);
  prepareFreshStack(root, expirationTime);
  performSyncWorkOnRoot(root);
}

function prepareFreshStack(root, expirationTime) {
  root.finishedWork = null;
  if (workInProgress !== null) {

  }
  workInProgress = createWorkInProgress(root.current, null);
}

export function unbatchedUpdates(fn, a) {
  try {
    return fn(a);
  } finally {

  }
}

function completeUnitOfWork(unitOfWork) {
  workInProgress = unitOfWork;
  do {
    const current = workInProgress.alternate;
    const returnFiber = workInProgress.return;
    if (true) {
      let next = completeWork(current, workInProgress);

      if (next) {
        return next;
      }

      if (returnFiber) {
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
          if (returnFiber.lastEffect) {
            returnFiber.lastEffect.nextEffect = workInProgress;
          } else {
            returnFiber.firstEffect = workInProgress;
          }
          returnFiber.lastEffect = workInProgress;
        }
      }

      const sibling = workInProgress.sibling;
      if (sibling) {
        return sibling;
      }
      workInProgress = returnFiber;
    }
  } while (workInProgress)

  return null;
}


function commitRoot(root) {
  const finishedWork = root.finishedWork;
  if (!finishedWork) {
    return null;
  }
  root.finishedWork = null;

  let firstEffect;
  if (root.effectTag) {
    if (finishedWork.lastEffect) {
      finishedWork.lastEffect.nextEffect = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      firstEffect = finishedWork;
    }
  } else {
    firstEffect = finishedWork.firstEffect;
  }

  let nextEffect;
  if (firstEffect) {
    nextEffect = firstEffect;
    do {
      try {
        nextEffect = commitBeforeMutationEffects(nextEffect);
      } catch (e) {
        nextEffect = nextEffect.nextEffect;
      }
    } while (nextEffect)

    nextEffect = firstEffect;
    do {
      try {
        nextEffect = commitMutationEffects(root, nextEffect);
      } catch (e) {
        nextEffect = nextEffect.nextEffect;
      }
    } while (nextEffect)
  }
}
// 执行工作单元
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;

  let next = beginWork(current, unitOfWork);
  if (!next) {
    next = completeUnitOfWork(unitOfWork);
  }
  return next;
}
// 同步任务入口
function performSyncWorkOnRoot(root) {
  // 如果 workInProgress存在 开始同步更新
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

function workLoopSync() {
  while (workInProgress) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

function workLoopConcurrent() {
  while (workInProgress && !Scheduler.shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}