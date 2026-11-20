import { Project } from "../models/Project.js";
import { eventBus } from "../patterns/EventBus.js";

export class ProjectService {
  constructor(projects, usersById) {
    this.projects = projects;
    this.usersById = usersById;
  }

  getAll() {
    return [...this.projects];
  }

  getById(projectId) {
    return this.projects.find((project) => project.id === projectId) ?? null;
  }

  createProject(data) {
    const members = (data.memberIds ?? []).map((id) => this.usersById.get(id)).filter(Boolean);
    const project = new Project({ ...data, members });
    this.projects.push(project);
    eventBus.publish("data:changed", { type: "project-created", projectId: project.id });
    return project;
  }

  updateProject(projectId, updates) {
    const project = this.getById(projectId);
    if (!project) throw new Error("Project not found.");
    const { memberIds, ...details } = updates;
    project.updateDetails(details);

    if (memberIds) {
      const nextIds = new Set(memberIds);
      project.members.filter((member) => !nextIds.has(member.id)).forEach((member) => project.removeMember(member.id));
      memberIds.forEach((id) => {
        const member = this.usersById.get(id);
        if (member) project.addMember(member);
      });
    }

    eventBus.publish("data:changed", { type: "project-updated", projectId });
    return project;
  }

  deleteProject(projectId) {
    if (this.projects.length <= 1) throw new Error("At least one project must remain in the workspace.");
    const index = this.projects.findIndex((project) => project.id === projectId);
    if (index === -1) throw new Error("Project not found.");
    const [deletedProject] = this.projects.splice(index, 1);
    eventBus.publish("data:changed", { type: "project-deleted", projectId });
    return deletedProject;
  }
}
