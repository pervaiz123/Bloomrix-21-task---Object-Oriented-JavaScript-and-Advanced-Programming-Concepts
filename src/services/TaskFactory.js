import { Task } from "../models/Task.js";
import { DevelopmentTask } from "../models/DevelopmentTask.js";
import { TestingTask } from "../models/TestingTask.js";
import { DocumentationTask } from "../models/DocumentationTask.js";
import { ActivityLog, Attachment, Comment } from "../models/SupportingModels.js";

const TASK_TYPES = {
  task: Task,
  development: DevelopmentTask,
  testing: TestingTask,
  documentation: DocumentationTask
};

export class TaskFactory {
  static create(data, usersById) {
    const TaskClass = TASK_TYPES[data.type] ?? Task;
    const assigneeIds = data.assigneeIds ?? data.assignees ?? [];
    const assignedUsers = assigneeIds
      .map((assignee) => typeof assignee === "string" ? usersById.get(assignee) : usersById.get(assignee.id))
      .filter(Boolean);

    const comments = (data.comments ?? []).map((comment) => new Comment({
      ...comment,
      author: usersById.get(comment.authorId) ?? null
    }));
    const activityLog = (data.activityLog ?? []).map((activity) => new ActivityLog({
      ...activity,
      actor: usersById.get(activity.actorId) ?? null
    }));
    const attachments = (data.attachments ?? []).map((attachment) => new Attachment(attachment));

    return new TaskClass({ ...data, assignedUsers, comments, activityLog, attachments });
  }
}
