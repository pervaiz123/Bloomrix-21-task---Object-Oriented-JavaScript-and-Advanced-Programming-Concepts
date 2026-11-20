class EventBus {
  #listeners = new Map();

  subscribe(eventName, callback) {
    if (typeof callback !== "function") throw new TypeError("Event listener must be a function.");
    const listeners = this.#listeners.get(eventName) ?? new Set();
    listeners.add(callback);
    this.#listeners.set(eventName, listeners);

    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) this.#listeners.delete(eventName);
    };
  }

  publish(eventName, payload = null) {
    const listeners = this.#listeners.get(eventName);
    if (!listeners) return;
    [...listeners].forEach((callback) => callback(payload));
  }
}

// One shared instance is exported: this is the Singleton pattern.
// Subscribers are observers that react when application data changes.
export const eventBus = new EventBus();
