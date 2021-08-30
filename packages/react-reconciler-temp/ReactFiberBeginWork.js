import { cloneUpdateQueue, processUpdateQueue } from './ReactUpdateQueue'
import {
  FunctionComponent,
  ClassComponent,
  HostRoot,
  HostComponent,
  HostText
} from 'shared/ReactWorkTags';
import { reconcileChildFibers, mountChildFibers } from './ReactChildFiber';

import { shouldSetTextContent } from 'reactDOM/ReactHostConfig';
let didReceiveUpdate = false

function reconcileChildren(current, workInProgress, nextChildren) {
  if (current) {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    )
  } else {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  }
}
function renderWithHooks(current, workInProgress, Component, props) {

}
function updateFunctionComponent(current, workInProgress, Component, nextProps) {
  let nextChildren = renderWithHooks(current, workInProgress, Component, nextProps);
  if (current && !didReceiveUpdate) {

  }
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}
function UpdateHostRoot(current, workInProgress) {

  const nextProps = workInProgress.pendingProps
  const prevState = current.memoizedProps
  const prevChildren = prevState ? prevState.element : null
  cloneUpdateQueue(current, workInProgress)
  processUpdateQueue(workInProgress, nextProps)
  const nextState = workInProgress.memoizedState
  const nextChildren = nextState.element
  if (prevChildren === nextChildren) {
    return console.log('prevChildren === nextChildren it is a bailout')
  }
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}
function updateHostText(current, workInProgress) {

}
function updateHostComponent(current, workInProgress) {

  const type = workInProgress.type;
  const prevProps = current ? current.memoizedProps : null;
  const nextProps = workInProgress.pendingProps;
  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    nextChildren = null;
  }

  reconcileChildren(
    current,
    workInProgress,
    nextChildren
  )
  return workInProgress.child;
}
export default function beginWork(current, workInProgress) {
  console.log('beginWork')
  if (current) {
    const oldProps = current.memoizedProps
    const newProps = workInProgress.pendingProps
    if (oldProps !== newProps) {
      didReceiveUpdate = true
    }
  }
  switch (workInProgress.tag) {
    case HostRoot:
      return UpdateHostRoot(current, workInProgress)
    case FunctionComponent:
      const Component = workInProgress.type
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        workInProgress.pendingProps
      )
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      return UpdateHostText(current, workInProgress)
    default:
      break
  }
}
