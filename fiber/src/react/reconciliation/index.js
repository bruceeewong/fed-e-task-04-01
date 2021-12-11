import {createTaskQueue} from "../Misc";

const taskQueue = createTaskQueue();

let subTask = null;

/**
 * 从人物队列中获取任务
 */
function getFirstTask() {
  const task = taskQueue.pop();
  // 返回最外层的fiber对象
  return {
    props: task.props,
    stateNode: task.dom,
    tag: 'host_root',
    effects: [],
    child: null,
  }
}

function executeTask(fiber) {
  console.log(fiber)
  return null;
}

function workLoop(deadline) {
  if (!subTask) {
    subTask = getFirstTask()
  }

  while (subTask && deadline.timeRemaining() > 1) {
    subTask = executeTask(subTask)
  }
}

function performTask(deadline) {
  workLoop(deadline);

  if (subTask || !taskQueue.isEmpty()) {
    requestIdleCallback(performTask)
  }
}

export function render(element, dom) {
  /**
   * 1. 向任务队列中添加任务
   * 2. 指定在浏览器空闲时执行任务
   */

  /**
   * 任务就是通过 vdom 对象 构建 fiber 对象
   */
  taskQueue.push({
    dom,
    props: {children: element},
  });

  requestIdleCallback(performTask)
}
