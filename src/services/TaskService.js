import { Comment } from "../models/SupportingModels.js";
import { TaskFactory } from "./TaskFactory.js";
import { eventBus } from "../patterns/EventBus.js";

export class TaskService {
  constructor(projects, usersById) {
    this.projects = projects;
    this.usersById = usersById;
  }

  getAll(projectId = "all") {
    return this.projects
      .filter((project) => projectId === "all" || project.id === projectId)
      .flatMap((project) => project.tasks);
  }

  findTask(taskId) {
    for (const project of this.projects) {
      const task = project.getTask(taskId);
      if (task) return { task, project };
    }
    return null;
  }

  createTask(projectId, data) {
    const project = this.projects.find((item) => item.id === projectId);
    if (!project) throw new Error("Select a valid project for this task.");
    const task = TaskFactory.create(data, this.usersById);
    project.addTask(task);
    eventBus.publish("data:changed", { type: "task-created", taskId: task.id, projectId });
    return task;
  }

  updateTask(taskId, updates) {
    const result = this.findTask(taskId);
    if (!result) throw new Error("Task not found.");

    const { assigneeIds, ...details } = updates;
    result.task.updateDetails(details);

    if (assigneeIds) {
      const nextIds = new Set(assigneeIds);
      result.task.assignees
        .filter((user) => !nextIds.has(user.id))
        .forEach((user) => result.task.removeAssignee(user.id));
      assigneeIds.forEach((id) => {
        const user = this.usersById.get(id);
        if (user) result.task.assignUser(user);
      });
    }

    eventBus.publish("data:changed", { type: "task-updated", taskId });
    return result.task;
  }

  moveTask(taskId, targetProjectId) {
    const result = this.findTask(taskId);
    const targetProject = this.projects.find((project) => project.id === targetProjectId);
    if (!result || !targetProject) throw new Error("The task or target project could not be found.");
    if (result.project.id === targetProject.id) return result.task;

    result.project.removeTask(taskId);
    targetProject.addTask(result.task);
    eventBus.publish("data:changed", { type: "task-moved", taskId, projectId: targetProjectId });
    return result.task;
  }

  deleteTask(taskId) {
    const result = this.findTask(taskId);
    if (!result) throw new Error("Task not found.");
    result.project.removeTask(taskId);
    eventBus.publish("data:changed", { type: "task-deleted", taskId, projectId: result.project.id });
    return result.task;
  }

  assignUser(taskId, userId) {
    const result = this.findTask(taskId);
    const user = this.usersById.get(userId);
    if (!result || !user) throw new Error("The task or user could not be found.");
    const changed = result.task.assignUser(user);
    if (changed) eventBus.publish("data:changed", { type: "task-assigned", taskId, userId });
    return changed;
  }

  removeAssignee(taskId, userId) {
    const result = this.findTask(taskId);
    if (!result) throw new Error("Task not found.");
    const changed = result.task.removeAssignee(userId);
    if (changed) eventBus.publish("data:changed", { type: "assignee-removed", taskId, userId });
    return changed;
  }

  completeTask(taskId, actor = null) {
    const result = this.findTask(taskId);
    if (!result) throw new Error("Task not found.");
    const changed = result.task.complete(actor);
    if (changed) eventBus.publish("data:changed", { type: "task-completed", taskId });
    return changed;
  }

  reopenTask(taskId, actor = null) {
    const result = this.findTask(taskId);
    if (!result) throw new Error("Task not found.");
    const changed = result.task.reopen(actor);
    if (changed) eventBus.publish("data:changed", { type: "task-reopened", taskId });
    return changed;
  }

  duplicateTask(taskId) {
    const result = this.findTask(taskId);
    if (!result) throw new Error("Task not found.");

    // Clone plain serialized data so nested arrays/objects do not share references.
    const copiedData = structuredClone(result.task.toJSON());
    delete copiedData.id;
    copiedData.title = `${copiedData.title} (Copy)`;
    copiedData.status = "todo";
    copiedData.createdAt = new Date().toISOString();
    copiedData.comments = [];
    copiedData.activityLog = [];

    const duplicate = TaskFactory.create(copiedData, this.usersById);
    result.project.addTask(duplicate);
    eventBus.publish("data:changed", { type: "task-duplicated", taskId: duplicate.id });
    return duplicate;
  }

  addComment(taskId, text, author) {
    const result = this.findTask(taskId);
    if (!result) throw new Error("Task not found.");
    const comment = new Comment({ text, author });
    result.task.addComment(comment);
    eventBus.publish("data:changed", { type: "comment-added", taskId });
    return comment;
  }
}
