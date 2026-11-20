import { User } from "./models/SupportingModels.js";
import { Project } from "./models/Project.js";
import { TaskFactory } from "./services/TaskFactory.js";
import { TaskService } from "./services/TaskService.js";
import { ProjectService } from "./services/ProjectService.js";
import { StorageService } from "./services/StorageService.js";
import { AppController } from "./ui/AppController.js";
import { sampleData } from "./data/sample-data.js";

function buildWorkspaceData(storageService) {
  const savedData = storageService.load();
  const sourceData = savedData?.users?.length && savedData?.projects?.length ? savedData : sampleData;
  const users = sourceData.users.map((record) => new User(record));
  const usersById = new Map(users.map((user) => [user.id, user]));

  const projects = sourceData.projects.map((record) => {
    const members = (record.memberIds ?? []).map((id) => usersById.get(id)).filter(Boolean);
    const tasks = (record.tasks ?? []).map((taskRecord) => TaskFactory.create(taskRecord, usersById));
    return new Project({ ...record, members, tasks });
  });

  return { users, usersById, projects };
}

function initializeApplication() {
  const storageService = new StorageService();
  const { users, usersById, projects } = buildWorkspaceData(storageService);
  const taskService = new TaskService(projects, usersById);
  const projectService = new ProjectService(projects, usersById);

  storageService.save(users, projects);

  new AppController({
    root: document.querySelector("#app"),
    modalRoot: document.querySelector("#modal-root"),
    toastRegion: document.querySelector("#toast-region"),
    users,
    projects,
    taskService,
    projectService,
    storageService
  });
}

initializeApplication();
