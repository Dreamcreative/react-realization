import { NoEffect } from 'shared/ReactSideEffectTags';
import {
  IndeterminateComponent,
  HostText,
  HostComponent,
  ClassComponent
} from 'shared/ReactWorkTags';
function shouldConstruct(Component) {
  const prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent)
}
export class FiberNode {
  constructor(tag, pendingProps, key, mode) {
    this.tag = tag;
    this.pendingProps = pendingProps;
    this.key = key;
    this.mode = mode;
    // 指向父fiber
    this.return = null;
    // 指向子fiber
    this.child = null;
    // 兄弟fiber
    this.sibling = null;

    this.ref = null;
    /**
     * stateNode 
     * 对于FunctionComponent 指向fn()
     * ClassComponent 指向实例
     * HostComponent 指向对应DOM节点
     */
    this.stateNode = null;
    // fiber节点的副作用标签
    this.effectTag = NoEffect;
    // fiber节点过期时间
    this.expirationTime = null;
    // 前一次render的fiber 
    this.alternate = null;

    // 一下3个变量组成了当前Fiber上保存的 effect list
    this.firstEffect = null;
    this.lastEffect = null;
    this.nextEffect = null;

  }
}
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  if (!workInProgress) {
    workInProgress = new FiberNode(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    );
    workInProgress.stateNode = current.stateNode;
    workInProgress.type = current.type;
    current.alternate = workInProgress;
    workInProgress.alternate = current;
  } else {
    workInProgress.pendingProps = pendingProps;

    // 已有alternate的情况重置effect
    workInProgress.effectTag = NoWork;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
    workInProgress.nextEffect = null;
  }
  workInProgress.expirationTime = current.expirationTime;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;

  return workInProgress;
}
export function createFiberFromTypeAndProps(type, key, pendingProps) {
  let fiberTag = IndeterminateComponent;
  if (typeof type === 'function') {
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent;
    }
  } else if (typeof type === 'string') {
    fiberTag = HostComponent;
  }
  const fiber = new FiberNode(fiberTag, pendingProps, key);
  fiber.type = type;
  return fiber;
}
export function createFiberFromElement(element) {
  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;
  const fiber = createFiberFromTypeAndProps(type, key, pendingProps);
  return fiber
}
export function createFiberFromText(textContent) {
  const fiber = new FiberNode(HostText, textContent);
  return fiber;
}