import { arrified, createStateNode, createTaskQueue, getTag } from "../Misc";
import { updateNodeElement } from "../DOM";

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
    alternate: task.dom.__rootFiberContainer, // 备份旧的fiber
  };
}

function reconcileChildren(fiber, children) {
  // children有可能是单个对象，也可能是数组，统一为数组
  const arrifiedChildren = arrified(children);

  let index = 0;
  let numberOfElements = arrifiedChildren.length;
  let element = null; //
  let newFiber = null; // 新的 fiber 对象
  let prevFiber = null; // 上一个兄弟 fiber 对象
  let alternate = null; // 备份节点

  if (fiber.alternate && fiber.alternate.child) {
    alternate = fiber.alternate.child; // 只有第一个子节点是child
  }

  // 如果有子节点 或 没有当前子节点但有旧节点，执行构建fiber
  while (index < numberOfElements || alternate) {
    element = arrifiedChildren[index];

    if (element && !alternate) {
      // 构建初始fiber
      newFiber = {
        type: element.type,
        props: element.props,
        tag: getTag(element),
        effects: [],
        effectTag: "placement",
        parent: fiber,
      };

      newFiber.stateNode = createStateNode(newFiber);
    } else if (element && alternate) {
      // 构建更新fiber
      newFiber = {
        type: element.type,
        props: element.props,
        tag: getTag(element),
        effects: [],
        effectTag: "update",
        parent: fiber,
        alternate, // 存备份fiber
      };

      // 判断新旧fiber类型是否相等
      if (element.type === alternate.type) {
        // 类型相同，复用dom
        newFiber.stateNode = alternate.stateNode;
      } else {
        // 类型不同，直接替换dom
        newFiber.stateNode = createStateNode(newFiber);
      }
    } else if (!element && alternate) {
      console.log("构建删除fiber", {
        element,
        alternate,
      });
      // 构建删除fiber
      alternate.effectTag = "delete";
      fiber.effects.push(alternate);
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else if (element) {
      prevFiber.sibling = newFiber;
    }

    if (alternate && alternate.sibling) {
      alternate = alternate.sibling; // 除了第一个子节点之外的子节点都是 sibling
    } else {
      alternate = null;
    }

    prevFiber = newFiber;
    index++;
  }
}

function executeTask(fiber) {
  // 构建子级fiber
  if (fiber.tag === "class_component") {
    reconcileChildren(fiber, fiber.stateNode.render());
  } else if (fiber.tag === "function_component") {
    reconcileChildren(fiber, fiber.stateNode(fiber.props));
  } else {
    reconcileChildren(fiber, fiber.props.children);
  }

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
  console.log("commitAllWork", fiber);
  // 循环 effects 数组，构建 DOM 节点树
  fiber.effects.forEach((item) => {
    if (item.effectTag === "placement") {
      let fiber = item;
      let parentFiber = item.parent;
      while (
        parentFiber.tag === "class_component" ||
        parentFiber.tag === "function_component"
      ) {
        parentFiber = parentFiber.parent; // 如是类组件，向上找到普通的节点
      }
      if (fiber.tag === "host_component") {
        parentFiber.stateNode.appendChild(fiber.stateNode); // 将fiber对应的dom追加至根节点的dom
      }
    } else if (item.effectTag === "update") {
      // 更新
      if (item.type === item.alternate.type) {
        // 节点类型相同，执行更新算法
        updateNodeElement(item.stateNode, item, item.alternate); // TODO: 只能处理元素节点，不能处理文本节点
      } else {
        // 节点类型不同，做替换的DOM操作
        item.parent.stateNode.replaceChild(
          item.stateNode, // 新节点
          item.alternate.stateNode // 旧节点
        );
      }
    } else if (item.effectTag === "delete") {
      console.log("执行删除操作", {
        parent: item.parent,
        fiber: item,
      });
      // 删除
      item.parent.stateNode.removeChild(item.stateNode);
    }
  });

  // 备份旧的 fiber 节点对象
  fiber.stateNode.__rootFiberContainer = fiber;
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
  console.log("render element", element);
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
