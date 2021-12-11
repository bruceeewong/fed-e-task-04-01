import { createDOMElement } from "../DOM";

export default function createStateNode(fiber) {
  if (fiber.tag === "host_component") {
    // 普通节点，创建dom对象
    return createDOMElement(fiber);
  }
  return null;
}
