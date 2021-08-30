import { React, ReactDOM } from '../packages';

const Block = (
  <div>
    <p>I am</p>
    <p>测试</p>
  </div>
);

console.log(Block)
ReactDOM.render(Block, document.querySelector('#app'));