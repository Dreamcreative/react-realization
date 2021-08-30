import { FiberNode } from 'reactReconciler/ReactFiber';
import { initializeUpdateQueue, createUpdate, enqueueUpdate } from 'reactReconciler/ReactUpdateQueue';
import * as DOMRenderer from 'reactReconciler';
export default class ReactRoot {
  constructor(container) {
    this.current = new FiberNode(3);
    // 初始化 rootFiber的 的更新队列 update queue
    initializeUpdateQueue(this.current);
    // RootFiber 指向 FiberRoot
    this.current.stateNode = this;
    // 应用挂载的根DOM节点信息
    this.containerInfo = container;
    // root下已经render完毕的fiber
    this.finishedWork = null;
  }
  render(element) {

    const current = this.current;
    const expirationTime = DOMRenderer.requestCurrentTimeForUpdate();
    const update = createUpdate(expirationTime);
    update.payload = { element };
    enqueueUpdate(current, update);
    return DOMRenderer.scheduleUpdateOnFiber(current, expirationTime)
  }
}