import { ActivityLog } from "./SupportingModels.js";

const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["todo", "in-progress", "review", "done"];

function requireText(value, fieldName) {
  if (!value?.trim()) throw new Error(`${fieldName} is required.`);
  return value.trim();
}

export class Task {
  #description;
  #assignees;
  #comments;
  #attachments;
  #activityLog;

  constructor({
    id = Task.generateId(),
    title,
    description = "",
    priority = "medium",
    status = "todo",
    dueDate = "",
    estimatedHours = 0,
    assignedUsers = [],
    comments = [],
    attachments = [],
    activityLog = [],
    createdAt = new Date().toISOString()
  }) {
    this.id = id;
    this.title = requireText(title, "Task title");
    this.#description = description.trim();
    this.priority = priority;
    this.status = status;
    this.dueDate = dueDate || "";
    this.estimatedHours = Number(estimatedHours);
    this.#assignees = [...assignedUsers];
    this.#comments = [...comments];
    this.#attachments = [...attachments];
    this.#activityLog = [...activityLog];
    this.createdAt = createdAt;
    this.validate();
  }

  static generateId() {
    const uniquePart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `task-${uniquePart}`;
  }

  static calculateSummary(tasks) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "done").length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter((task) => task.isOverdue()).length;
    const totalEstimatedHours = tasks.reduce((total, task) => total + task.estimatedHours, 0);

    return { totalTasks, completedTasks, pendingTasks, overdueTasks, totalEstimatedHours };
  }

  get description() {
    return this.#description;
  }

  set description(value) {
    this.#description = String(value ?? "").trim();
  }

  get assignees() {
    return [...this.#assignees];
  }

  get comments() {
    return [...this.#comments];
  }

  get attachments() {
    return [...this.#attachments];
  }

  get activityLog() {
    return [...this.#activityLog];
  }

  get type() {
    return "task";
  }

  getTypeLabel() {
    return "Task";
  }

  getWorkflowHint() {
    return "Keep the task updated as work progresses.";
  }

  validate() {
    if (!PRIORITIES.includes(this.priority)) throw new Error(`Priority must be one of: ${PRIORITIES.join(", ")}.`);
    if (!STATUSES.includes(this.status)) throw new Error(`Status must be one of: ${STATUSES.join(", ")}.`);
    if (!Number.isFinite(this.estimatedHours) || this.estimatedHours < 0) {
      throw new Error("Estimated hours must be zero or a positive number.");
    }
    if (this.dueDate && Number.isNaN(Date.parse(`${this.dueDate}T00:00:00`))) {
      throw new Error("Due date must be a valid date.");
    }
  }

  updateDetails(updates = {}) {
    const nextTitle = updates.title === undefined ? this.title : requireText(updates.title, "Task title");
    const nextPriority = updates.priority === undefined ? this.priority : updates.priority;
    const nextStatus = updates.status === undefined ? this.status : updates.status;
    const nextDueDate = updates.dueDate === undefined ? this.dueDate : (updates.dueDate || "");
    const nextEstimatedHours = updates.estimatedHours === undefined ? this.estimatedHours : Number(updates.estimatedHours);

    if (!PRIORITIES.includes(nextPriority)) throw new Error(`Priority must be one of: ${PRIORITIES.join(", ")}.`);
    if (!STATUSES.includes(nextStatus)) throw new Error(`Status must be one of: ${STATUSES.join(", ")}.`);
    if (!Number.isFinite(nextEstimatedHours) || nextEstimatedHours < 0) {
      throw new Error("Estimated hours must be zero or a positive number.");
    }
    if (nextDueDate && Number.isNaN(Date.parse(`${nextDueDate}T00:00:00`))) {
      throw new Error("Due date must be a valid date.");
    }

    this.title = nextTitle;
    this.description = updates.description === undefined ? this.description : updates.description;
    this.priority = nextPriority;
    this.status = nextStatus;
    this.dueDate = nextDueDate;
    this.estimatedHours = nextEstimatedHours;
  }

  assignUser(user) {
    if (!user?.id) throw new Error("A valid user is required for assignment.");
    if (this.#assignees.some((assignee) => assignee.id === user.id)) return false;
    this.#assignees.push(user);
    this.addActivity(new ActivityLog({ action: "Member assigned", details: `${user.name} was assigned to this task.`, actor: user }));
    return true;
  }

  removeAssignee(userId) {
    const index = this.#assignees.findIndex((user) => user.id === userId);
    if (index === -1) return false;
    const [removedUser] = this.#assignees.splice(index, 1);
    this.addActivity(new ActivityLog({ action: "Assignment removed", details: `${removedUser.name} was removed from this task.` }));
    return true;
  }

  addComment(comment) {
    if (!comment?.text) throw new Error("A valid comment is required.");
    this.#comments.push(comment);
  }

  addAttachment(attachment) {
    if (!attachment?.name) throw new Error("A valid attachment is required.");
    this.#attachments.push(attachment);
  }

  addActivity(activity) {
    if (!activity?.action) throw new Error("A valid activity entry is required.");
    this.#activityLog.unshift(activity);
  }

  complete(actor = null) {
    if (this.status === "done") return false;
    this.status = "done";
    this.addActivity(new ActivityLog({ action: "Task completed", actor, details: `${this.title} was marked as completed.` }));
    return true;
  }

  reopen(actor = null) {
    if (this.status !== "done") return false;
    this.status = "todo";
    this.addActivity(new ActivityLog({ action: "Task reopened", actor, details: `${this.title} was reopened.` }));
    return true;
  }

  isOverdue(referenceDate = new Date()) {
    if (!this.dueDate || this.status === "done") return false;
    const due = new Date(`${this.dueDate}T23:59:59`);
    return due < referenceDate;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.#description,
      priority: this.priority,
      status: this.status,
      dueDate: this.dueDate,
      estimatedHours: this.estimatedHours,
      assigneeIds: this.#assignees.map((user) => user.id),
      comments: this.#comments.map((comment) => comment.toJSON()),
      attachments: this.#attachments.map((attachment) => attachment.toJSON()),
      activityLog: this.#activityLog.map((activity) => activity.toJSON()),
      createdAt: this.createdAt
    };
  }
}
