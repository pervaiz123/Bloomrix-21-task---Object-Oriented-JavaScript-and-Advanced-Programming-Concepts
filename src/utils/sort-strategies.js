const PRIORITY_WEIGHT = { urgent: 4, high: 3, medium: 2, low: 1 };

// Each function is a sorting strategy. The caller chooses one at runtime.
export const sortStrategies = {
  dueDate: (tasks) => tasks.sort((a, b) => (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31")),
  priority: (tasks) => tasks.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]),
  title: (tasks) => tasks.sort((a, b) => a.title.localeCompare(b.title))
};

export function sortTasks(tasks, strategyName = "dueDate") {
  const strategy = sortStrategies[strategyName] ?? sortStrategies.dueDate;
  return strategy([...tasks]);
}
