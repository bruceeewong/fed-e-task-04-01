export function createReactInstance(fiber) {
  if (fiber.tag === "class_component") {
    return new fiber.type(fiber.props); // 类组件实例
  }
  return fiber.type; // 函数式组件
}
