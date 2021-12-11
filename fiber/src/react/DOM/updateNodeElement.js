export default function updateNodeElement(
  newElement,
  virtualDOM,
  oldVirtualDOM = {}
) {
  // 获取节点对应的属性对象
  const newProps = virtualDOM.props || {};
  const oldProps = oldVirtualDOM.props || {};

  /**
   * 处理文本节点
   */
  if (virtualDOM.type === "text") {
    if (newProps.textContent === oldProps.textContent) return;
    // 文本节点更新
    if (virtualDOM.parent.type !== oldVirtualDOM.parent.type) {
      // 新旧文本fiber节点的父级不同
      // 此时父级dom没有子元素, 则直接在新fiber的父级dom上添加此新的文本节点
      virtualDOM.parent.stateNode.appendChild(
        document.createTextNode(newProps.textContent)
      );
    } else {
      // 否则，此时父级dom是复用之前的, 执行替换操作
      virtualDOM.parent.stateNode.replaceChild(
        document.createTextNode(newProps.textContent),
        oldVirtualDOM.stateNode
      );
    }
    return;
  }

  /**
   * 处理元素节点
   */
  Object.keys(newProps).forEach((propName) => {
    // 获取属性值
    const newPropsValue = newProps[propName];
    const oldPropsValue = oldProps[propName];
    if (newPropsValue !== oldPropsValue) {
      // 判断属性是否是否事件属性 onClick -> click
      if (propName.slice(0, 2) === "on") {
        // 事件名称
        const eventName = propName.toLowerCase().slice(2);
        // 为元素添加事件
        newElement.addEventListener(eventName, newPropsValue);
        // 删除原有的事件的事件处理函数
        if (oldPropsValue) {
          newElement.removeEventListener(eventName, oldPropsValue);
        }
      } else if (propName === "value" || propName === "checked") {
        newElement[propName] = newPropsValue;
      } else if (propName !== "children") {
        if (propName === "className") {
          newElement.setAttribute("class", newPropsValue);
        } else {
          newElement.setAttribute(propName, newPropsValue);
        }
      }
    }
  });
  // 判断属性被删除的情况
  Object.keys(oldProps).forEach((propName) => {
    const newPropsValue = newProps[propName];
    const oldPropsValue = oldProps[propName];
    if (!newPropsValue) {
      // 属性被删除了
      if (propName.slice(0, 2) === "on") {
        const eventName = propName.toLowerCase().slice(2);
        newElement.removeEventListener(eventName, oldPropsValue);
      } else if (propName !== "children") {
        if (propName === "value") {
          newElement.value = "";
        } else {
          newElement.removeAttribute(propName);
        }
      }
    }
  });
}
