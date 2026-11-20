import { Task } from "./Task.js";

const PROJECT_STATUSES = ["planning", "active", "on-hold", "completed"];

export class Project {
  #description;
  #members;
  #tasks;

  constructor({
    id = Project.generateId(),
    title,
    description = "",
    startDate = "",
    dueDate = "",
    status = "planning",
    members = [],
    tasks = []
  }) {
    if (!title?.trim()) throw new Error("Project title is required.");
    this.id = id;
    this.title = title.trim();
    this.#description = description.trim();
    this.startDate = startDate || "";
    this.dueDate = dueDate || "";
    this.status = status;
    this.#members = [...members];
    this.#tasks = [...tasks];
    this.validate();
  }

  static generateId() {
    const uniquePart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `project-${uniquePart}`;
  }

  static calculateSummary(tasks) {
    return Task.calculateSummary(tasks);
  }

  get description() {
    return this.#description;
  }

  set description(value) {
    this.#description = String(value ?? "").trim();
  }

  get members() {
    return [...this.#members];
  }

  get tasks() {
    return [...this.#tasks];
  }

  get summary() {
    return Project.calculateSummary(this.#tasks);
  }

  validate() {
    if (!PROJECT_STATUSES.includes(this.status)) {
      throw new Error(`Project status must be one of: ${PROJECT_STATUSES.join(", ")}.`);
    }
    if (this.startDate && this.dueDate && this.dueDate < this.startDate) {
      throw new Error("Project due date cannot be earlier than its start date.");
    }
  }

  updateDetails(updates = {}) {
    const nextTitle = updates.title === undefined ? this.title : updates.title.trim();
    const nextStartDate = updates.startDate === undefined ? this.startDate : (updates.startDate || "");
    const nextDueDate = updates.dueDate === undefined ? this.dueDate : (updates.dueDate || "");
    const nextStatus = updates.status === undefined ? this.status : updates.status;

    if (!nextTitle) throw new Error("Project title is required.");
    if (!PROJECT_STATUSES.includes(nextStatus)) {
      throw new Error(`Project status must be one of: ${PROJECT_STATUSES.join(", ")}.`);
    }
    if (nextStartDate && nextDueDate && nextDueDate < nextStartDate) {
      throw new Error("Project due date cannot be earlier than its start date.");
    }

    this.title = nextTitle;
    this.description = updates.description === undefined ? this.description : updates.description;
    this.startDate = nextStartDate;
    this.dueDate = nextDueDate;
    this.status = nextStatus;
  }

  addMember(user) {
    if (!user?.id) throw new Error("A valid user is required.");
    if (this.#members.some((member) => member.id === user.id)) return false;
    this.#members.push(user);
    return true;
  }

  removeMember(userId) {
    const index = this.#members.findIndex((member) => member.id === userId);
    if (index === -1) return false;
    this.#members.splice(index, 1);
    return true;
  }

  addTask(task) {
    if (!task?.id) throw new Error("A valid task is required.");
    if (this.#tasks.some((existingTask) => existingTask.id === task.id)) {
      throw new Error("This task already belongs to the project.");
    }
    this.#tasks.push(task);
  }

  getTask(taskId) {
    return this.#tasks.find((task) => task.id === taskId) ?? null;
  }

  removeTask(taskId) {
    const index = this.#tasks.findIndex((task) => task.id === taskId);
    if (index === -1) return null;
    return this.#tasks.splice(index, 1)[0];
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.#description,
      startDate: this.startDate,
      dueDate: this.dueDate,
      status: this.status,
      memberIds: this.#members.map((member) => member.id),
      tasks: this.#tasks.map((task) => task.toJSON())
    };
  }
}
