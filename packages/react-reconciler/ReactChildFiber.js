// 协调子fiber的过程
import {
  createFiberFromElement,
  createFiberFromText
} from './ReactFiber';
import { Placement } from 'shared/ReactSideEffectTags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';

// 为了在2个方法中复用一批共用方法
// shouldTrackSideEffects标示是否标记fiber的effectTag
// 对于首次渲染，不需要标记effectTag，因为completeWork时会appendAllChildren，最后一次渲染整棵树
// 对于单次更新，需要标记更新fiber的effectTag
function ChildReconciler(shouldTrackSideEffects) {
  // 当 shouldTrackSideEffects 为false时 表示初次mount,只需要在 根节点上打上 effect标记，其他节点不需要打effect标记
  // 当 shouldTrackSideEffects 为true时，表示更新，会在每个需要update的节点上打上 effect 标记
  function createChild(returnFiber, newChild) {
    if (typeof newChild === 'number' || typeof newChild === 'string') {
      const created = createFiberFromText(newChild);
      created.return = returnFiber;
      return created;
    }
    if (typeof newChild === 'object' && newChild !== null) {
      if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
        const created = createFiberFromElement(newChild);
        created.return = returnFiber;
        return created;
      }
    }
    return null;
  }

  // 协调子fiber 创建fiber
  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    // key diff 算法待补充
    // 为元素创建 fiber
    const created = createFiberFromElement(element);
    // 添加当前fiber的父级 fiber
    created.return = returnFiber;
    return created;
  }
  // 文本节点
  function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent) {
    // 省略更新过程
    // 为文本节点创建fiber节点
    const created = createFiberFromText(textContent);
    // return 表示文本节点的父节点
    created.return = returnFiber;
    return created;
  }

  // 标志当前fiber需要在commit阶段插入DOM
  function placeSingleChild(fiber) {
    // shouldTrackSideEffects 为true表示 更新
    // alternate 不存在，表示新增的节点
    // alternate 存在，表示需要更新的节点
    if (shouldTrackSideEffects && !fiber.alternate) {
      // 为fiber节点打上 更新 effect标记
      fiber.effectTag = Placement;
    }
    return fiber;
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChild) {
    // TODO array diff
    let prev;
    let first;
    for (let i = 0; i < newChild.length; i++) {
      const child = newChild[i];
      // 创建子节点的fiber节点
      const newFiber = createChild(returnFiber, child);
      if (!newFiber) {
        continue;
      }
      // 为新的fiber节点打上 effect标记
      placeSingleChild(newFiber);
      if (prev) {
        prev.sibling = newFiber;
      }
      if (!first) {
        first = newFiber;
      }
      prev = newFiber;
    }
    return first;
  }

  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    // React.createElement类型 或者 子节点是String、Number对应的Array类型
    const isObject = typeof newChild === 'object' && newChild !== null;
    if (isObject) {
      // 根据 react 不同元素类型，执行不同逻辑
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          // 当前节点为元素节点
          return placeSingleChild(reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild
          ))
      }
      // 在 beginWork update各类Component时并未处理HostText，这里处理单个HostText
      if (typeof newChild === 'number' || typeof newChild === 'string') {
        return placeSingleChild(reconcileSingleTextNode(
          returnFiber,
          currentFirstChild,
          newChild
        ))
      }
      // 在 beginWork update各类Component时并未处理HostText，这里处理多个HostText
      if (Array.isArray(newChild)) {
        // 当有多个子节点时
        return reconcileChildrenArray(
          returnFiber,
          currentFirstChild,
          newChild
        )
      }
    }
    // console.log('未实现的协调分支逻辑');
  }
  return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);

