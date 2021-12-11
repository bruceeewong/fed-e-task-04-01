import { arrified, createStateNode, createTaskQueue, getTag } from "../Misc";

const taskQueue = createTaskQueue();

let subTask = null;

let pendingCommit = null;

/**
 * 从人物队列中获取任务
 */
function getFirstTask() {
  const task = taskQueue.pop();
  // 返回最外层的fiber对象
  return {
    props: task.props,
    stateNode: task.dom,
    tag: "host_root",
    effects: [],
    child: null,
  };
}

function reconcileChildren(fiber, children) {
  // children有可能是单个对象，也可能是数组，统一为数组
  const arrifiedChildren = arrified(children);

  let index = 0;
  let numberOfElements = arrifiedChildren.length;
  let element = null;
  let newFiber = null;
  let prevFiber = null;

  while (index < numberOfElements) {
    element = arrifiedChildren[index];
    newFiber = {
      type: element.type,
      props: element.props,
      tag: getTag(element),
      effects: [],
      effectTag: "placement",
      stateNode: null,
      parent: fiber,
    };

    newFiber.stateNode = createStateNode(newFiber);

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevFiber.sibling = newFiber;
    }

    prevFiber = newFiber;
    index++;
  }
}

function executeTask(fiber) {
  // 编排子节点关系
  reconcileChildren(fiber, fiber.props.children);
  if (fiber.child) {
    return fiber.child;
  }

  let currentExecutingFiber = fiber;

  while (currentExecutingFiber.parent) {
    // 合并子节点的effects至父级节点的effects中
    currentExecutingFiber.parent.effects =
      currentExecutingFiber.parent.effects.concat(
        currentExecutingFiber.effects.concat([currentExecutingFiber])
      );

    if (currentExecutingFiber.sibling) {
      // 如果有兄弟节点，返回兄弟节点给任务调度
      return currentExecutingFiber.sibling;
    }
    currentExecutingFiber = currentExecutingFiber.parent;
  }

  pendingCommit = currentExecutingFiber; // 保存最外层节点的Fiber引用
}

/**
 * 提交所有任务
 * @param fiber 最外层节点的Fiber对象
 */
function commitAllWork(fiber) {
  fiber.effects.forEach((item) => {
    if (item.effectTag === "placement") {
      item.parent.stateNode.appendChild(item.stateNode); // 将fiber对应的dom追加至根节点的dom
    }
  });
}

function workLoop(deadline) {
  if (!subTask) {
    subTask = getFirstTask();
  }
  while (subTask && deadline.timeRemaining() > 1) {
    subTask = executeTask(subTask);
  }
  if (pendingCommit) {
    commitAllWork(pendingCommit);
  }
}

function performTask(deadline) {
  workLoop(deadline);

  if (subTask || !taskQueue.isEmpty()) {
    requestIdleCallback(performTask);
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
    props: { children: element },
  });

  requestIdleCallback(performTask);
}
