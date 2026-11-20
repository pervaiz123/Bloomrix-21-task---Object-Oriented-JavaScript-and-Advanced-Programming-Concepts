console.group("05 · Design patterns and separation of concerns");

const WorkspaceConfig = (() => {
  const settings = { pageSize: 10 };
  return {
    getSettings() {
      return settings;
    },
  };
})();
console.log(
  "Singleton returns the same object:",
  WorkspaceConfig.getSettings() === WorkspaceConfig.getSettings(),
);
function createNotice(type, message) {
  return { type, message, createdAt: new Date().toISOString() };
}
console.log("Factory result:", createNotice("success", "Task saved"));
const taskCounter = (() => {
  let count = 0;
  return {
    increment() {
      count += 1;
      return count;
    },
    getCount() {
      return count;
    },
  };
})();
taskCounter.increment();
taskCounter.increment();
console.log("Module private state:", taskCounter.getCount());

// Observer: observers receive a notification when the subject changes.
class SimpleSubject {
  #observers = new Set();

  subscribe(observer) {
    this.#observers.add(observer);
    return () => this.#observers.delete(observer);
  }

  notify(value) {
    this.#observers.forEach((observer) => observer(value));
  }
}
const taskSubject = new SimpleSubject();
taskSubject.subscribe((value) => console.log("Observer received:", value));
taskSubject.notify("Task status changed");

// Strategy: select one interchangeable algorithm at runtime.
const sortingStrategies = {
  ascending: (items) => [...items].sort((a, b) => a.localeCompare(b)),
  descending: (items) => [...items].sort((a, b) => b.localeCompare(a)),
};
const titles = ["Testing", "Development", "Documentation"];
console.log("Strategy result:", sortingStrategies.ascending(titles));

console.log("Separation of concerns:");
console.log("Model: stores and validates task and project data.");
console.log(
  "Service: applies business rules and coordinates model operations.",
);
console.log("UI: handles DOM events and renders current state.");
console.log("ES modules keep these responsibilities in separate files.");
console.groupEnd();
