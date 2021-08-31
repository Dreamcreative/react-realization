import ReactRoot from './ReactRoot';
import * as DOMRenderer from 'reactReconciler';
const ReactDOM = {
  render(element, container, callback) {
    // 第三个参数 callback未实现
    const root = container._reactRootContainer = new ReactRoot(container);
    DOMRenderer.unbatchedUpdates(() => {
      root.render(element);
    })
  },
}
export default ReactDOM
