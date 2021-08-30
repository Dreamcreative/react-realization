const UpdateState = 0;
export function initializeUpdateQueue(fiber) {
  fiber.updateQueue = {
    baseState: fiber.memoizedState,
    baseQueue: null,
    shared: {
      pending: null,
    },
    effects: null
  }
}
export function createUpdate(expirationTime) {
  return {
    expirationTime,
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null,
    nextEffect: null
  }
}
export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  if (!updateQueue) {
    return;
  }
  const sharedQueue = updateQueue.shared;
  const pending = updateQueue.pending;
  if (!pending) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  sharedQueue.pending = update;
}
// 为 workInProgress 复制一份 updateQueue
export function cloneUpdateQueue(current, workInProgress) {
  const currentQueue = current.updateQueue;
  const workInProgressQueue = workInProgress.updateQueue;
  if (currentQueue === workInProgressQueue) {
    workInProgress.updateQueue = {
      baseState: currentQueue.baseState,
      baseQueue: currentQueue.baseQueue,
      shared: currentQueue.shared,
      effects: currentQueue.effects
    }
  }
}
function getStateFromUpdate(workInProgress, queue, update, prevState, nextProps) {
  switch (update.tag) {
    case UpdateState:
      const payload = update.payload;
      if (!payload) return prevState;
      return Object.assign({}, prevState, payload);
    default: break;
  }
}
// 通过遍历update链表，根据fiber.tag不同，通过不同的路径计算新的state
export function processUpdateQueue(workInProgress, nextProps) {
  const queue = workInProgress.updateQueue;
  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;
  let pendingQueue = queue.shared.pending;
  if (pendingQueue) {
    queue.shared.pendingQueue = null;
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = pendingQueue.next;
    lastPendingUpdate.next = null;
    if (!lastBaseUpdate) {
      firstBaseUpdate = firstPendingUpdate
    } else {
      lastBaseUpdate.next = firstPendingUpdate;
    }
    lastBaseUpdate = lastPendingUpdate;
    const current = workInProgress.alternate;
    if (current) {
      const currentQueue = current.updateQueue;
      const currentLastBaseUpdate = currentQueue.lastBaseUpdate;
      if (lastBaseUpdate !== currentLastBaseUpdate) {
        if (!currentLastBaseUpdate) {
          currentQueue.firstBaseUpdate = firstPendingUpdate;
        } else {
          currentLastBaseUpdate.next = firstPendingUpdate;
        }
        current.lastBaseUpdate = lastPendingUpdate;
      }
    }
  }
  if (firstBaseUpdate) {
    let newState = queue.baseState;
    let update = firstBaseUpdate;
    do {
      newState = getStateFromUpdate(workInProgress, queue, update, newState, nextProps);
      update = update.next;
      if (!update) {
        break;
      }
    } while (true)
    queue.baseState = newState;
    queue.firstBaseUpdate = null;
    queue.lastBaseUpdate = null;
    workInProgress.memoizedState = newState;
  }
}