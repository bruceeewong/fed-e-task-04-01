export default function createTaskQueue() {
  const taskQueue = [];

  return {
    push: (task) => taskQueue.push(task),
    pop: () => taskQueue.shift(),
  };
}
