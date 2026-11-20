import { eventBus } from "../patterns/EventBus.js";
import { sortTasks } from "../utils/sort-strategies.js";
import {
  renderProjectList,
  renderProjectForm,
  renderSummary,
  renderTaskDetails,
  renderTaskForm,
  renderTaskList,
  escapeHTML
} from "./renderers.js";

export class AppController {
  constructor({ root, modalRoot, toastRegion, users, projects, taskService, projectService, storageService }) {
    this.root = root;
    this.modalRoot = modalRoot;
    this.toastRegion = toastRegion;
    this.users = users;
    this.projects = projects;
    this.taskService = taskService;
    this.projectService = projectService;
    this.storageService = storageService;
    this.activeUser = users[0] ?? null;
    this.selectedTaskId = taskService.getAll()[0]?.id ?? null;
    this.toastTimer = null;

    // addEventListener calls handlers with the event target as `this`.
    // bind() keeps `this` connected to this AppController instance.
    this.handleClick = this.handleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleControlChange = this.handleControlChange.bind(this);
    this.handleModalClick = this.handleModalClick.bind(this);

    this.root.addEventListener("click", this.handleClick);
    this.root.addEventListener("submit", this.handleSubmit);
    this.root.addEventListener("input", this.handleControlChange);
    this.root.addEventListener("change", this.handleControlChange);
    this.modalRoot.addEventListener("click", this.handleModalClick);
    this.modalRoot.addEventListener("submit", this.handleSubmit);

    this.unsubscribe = eventBus.subscribe("data:changed", () => {
      this.storageService.save(this.users, this.projectService.getAll());
      this.render();
    });

    this.render();
  }

  setupFilterOptions() {
    const projectSelect = this.root.querySelector("#filter-project");
    const currentProjectId = projectSelect.value || "all";
    projectSelect.innerHTML = `<option value="all">All projects</option>` + this.projectService.getAll()
      .map((project) => `<option value="${escapeHTML(project.id)}">${escapeHTML(project.title)}</option>`)
      .join("");
    projectSelect.value = this.projectService.getById(currentProjectId) ? currentProjectId : "all";

    const userSelect = this.root.querySelector("#filter-user");
    const currentUserId = userSelect.value || "all";
    userSelect.innerHTML = `<option value="all">All members</option>` + this.users
      .map((user) => `<option value="${escapeHTML(user.id)}">${escapeHTML(user.name)}</option>`)
      .join("");
    userSelect.value = this.users.some((user) => user.id === currentUserId) ? currentUserId : "all";
  }

  render() {
    this.setupFilterOptions();

    const projectId = this.root.querySelector("#filter-project").value;
    const status = this.root.querySelector("#filter-status").value;
    const priority = this.root.querySelector("#filter-priority").value;
    const userId = this.root.querySelector("#filter-user").value;
    const searchTerm = this.root.querySelector("#search-input").value.trim().toLowerCase();
    const sortBy = this.root.querySelector("#sort-tasks").value;

    const projectTasks = this.taskService.getAll(projectId);
    const visibleTasks = sortTasks(projectTasks.filter((task) => {
      const matchesStatus = status === "all" || task.status === status;
      const matchesPriority = priority === "all" || task.priority === priority;
      const matchesUser = userId === "all" || task.assignees.some((user) => user.id === userId);
      const searchableText = `${task.title} ${task.description} ${task.getTypeLabel()}`.toLowerCase();
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      return matchesStatus && matchesPriority && matchesUser && matchesSearch;
    }), sortBy);

    if (!visibleTasks.some((task) => task.id === this.selectedTaskId)) {
      this.selectedTaskId = visibleTasks[0]?.id ?? null;
    }

    this.root.querySelector("#project-list").innerHTML = renderProjectList(
      this.projectService.getAll(),
      projectId,
      this.taskService.getAll().length
    );
    this.root.querySelector("#summary-grid").innerHTML = renderSummary(this.projectService.getAll()
      .filter((project) => projectId === "all" || project.id === projectId)
      .reduce((totals, project) => {
        const item = project.summary;
        return {
          totalTasks: totals.totalTasks + item.totalTasks,
          completedTasks: totals.completedTasks + item.completedTasks,
          pendingTasks: totals.pendingTasks + item.pendingTasks,
          overdueTasks: totals.overdueTasks + item.overdueTasks,
          totalEstimatedHours: totals.totalEstimatedHours + item.totalEstimatedHours
        };
      }, { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0, totalEstimatedHours: 0 }));

    const project = this.projectService.getById(projectId);
    this.root.querySelector("#task-list-heading").textContent = project ? project.title : "All tasks";
    this.root.querySelector("#task-count-label").textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"} shown`;
    this.root.querySelector("#task-list").innerHTML = renderTaskList(visibleTasks, this.selectedTaskId);

    const selected = this.selectedTaskId ? this.taskService.findTask(this.selectedTaskId) : null;
    this.root.querySelector("#task-details").innerHTML = renderTaskDetails(selected?.task ?? null, selected?.project ?? null);
    this.root.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, {
      weekday: "short", day: "numeric", month: "short", year: "numeric"
    }).format(new Date());
  }

  handleClick(event) {
    const control = event.target.closest("[data-action]");
    if (!control) return;

    const { action, id } = control.dataset;
    try {
      switch (action) {
        case "create-project":
          this.openProjectForm();
          break;
        case "create-task":
          this.openTaskForm();
          break;
        case "select-project":
          this.root.querySelector("#filter-project").value = id;
          this.selectedTaskId = null;
          this.render();
          break;
        case "select-task":
          this.selectedTaskId = id;
          this.render();
          break;
        case "edit-task": {
          const result = this.taskService.findTask(this.selectedTaskId);
          if (result) this.openTaskForm(result.task, result.project.id);
          break;
        }
        case "complete-task":
          this.taskService.completeTask(this.selectedTaskId, this.activeUser);
          this.showToast("Task marked as completed.");
          break;
        case "reopen-task":
          this.taskService.reopenTask(this.selectedTaskId, this.activeUser);
          this.showToast("Task reopened.");
          break;
        case "duplicate-task": {
          const duplicate = this.taskService.duplicateTask(this.selectedTaskId);
          this.selectedTaskId = duplicate.id;
          this.render();
          this.showToast("A separate copy of the task was created.");
          break;
        }
        case "delete-task":
          if (window.confirm("Delete this task? This action cannot be undone.")) {
            this.taskService.deleteTask(this.selectedTaskId);
            this.selectedTaskId = null;
            this.showToast("Task deleted.");
          }
          break;
        case "remove-assignee":
          this.taskService.removeAssignee(this.selectedTaskId, id);
          this.showToast("Member removed from task.");
          break;
        case "close-modal":
          this.closeModal();
          break;
        default:
          break;
      }
    } catch (error) {
      this.showToast(error.message, "error");
    }
  }

  handleControlChange(event) {
    if (event.target.id === "filter-project") this.selectedTaskId = null;
    this.render();
  }

  handleModalClick(event) {
    if (event.target.classList.contains("modal-backdrop")) this.closeModal();
    if (event.target.closest('[data-action="close-modal"]')) this.closeModal();
  }

  handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (form.id === "task-form") {
      event.preventDefault();
      this.submitTaskForm(form);
    } else if (form.id === "project-form") {
      event.preventDefault();
      this.submitProjectForm(form);
    } else if (form.id === "comment-form") {
      event.preventDefault();
      this.submitCommentForm(form);
    }
  }

  submitTaskForm(form) {
    try {
      const formData = new FormData(form);
      const assigneeIds = [...form.elements.assigneeIds.selectedOptions].map((option) => option.value);
      const projectId = formData.get("projectId");
      const taskId = form.dataset.taskId;
      const data = {
        title: formData.get("title"),
        description: formData.get("description"),
        priority: formData.get("priority"),
        status: formData.get("status"),
        dueDate: formData.get("dueDate"),
        estimatedHours: Number(formData.get("estimatedHours")),
        assigneeIds
      };

      if (taskId) {
        this.taskService.updateTask(taskId, data);
        this.taskService.moveTask(taskId, projectId);
        this.selectedTaskId = taskId;
        this.showToast("Task changes saved.");
      } else {
        const task = this.taskService.createTask(projectId, { ...data, type: formData.get("type") });
        this.selectedTaskId = task.id;
        this.showToast("Task created successfully.");
      }

      this.root.querySelector("#filter-project").value = projectId;
      this.closeModal();
      this.render();
    } catch (error) {
      this.showToast(error.message, "error");
    }
  }

  submitProjectForm(form) {
    try {
      const formData = new FormData(form);
      const memberIds = [...form.elements.memberIds.selectedOptions].map((option) => option.value);
      const project = this.projectService.createProject({
        title: formData.get("title"),
        description: formData.get("description"),
        startDate: formData.get("startDate"),
        dueDate: formData.get("dueDate"),
        status: formData.get("status"),
        memberIds
      });
      this.root.querySelector("#filter-project").value = project.id;
      this.selectedTaskId = null;
      this.closeModal();
      this.render();
      this.showToast("Project created successfully.");
    } catch (error) {
      this.showToast(error.message, "error");
    }
  }

  submitCommentForm(form) {
    try {
      const formData = new FormData(form);
      this.taskService.addComment(this.selectedTaskId, formData.get("text"), this.activeUser);
      form.reset();
      this.showToast("Comment added.");
    } catch (error) {
      this.showToast(error.message, "error");
    }
  }

  openTaskForm(task = null, projectId = null) {
    const defaultProjectId = projectId ?? (
      this.root.querySelector("#filter-project").value !== "all"
        ? this.root.querySelector("#filter-project").value
        : this.projectService.getAll()[0]?.id
    );
    this.modalRoot.innerHTML = renderTaskForm({
      task,
      projectId: defaultProjectId,
      projects: this.projectService.getAll(),
      users: this.users
    });
    this.modalRoot.querySelector('input[name="title"]')?.focus();
  }

  openProjectForm() {
    this.modalRoot.innerHTML = renderProjectForm(this.users);
    this.modalRoot.querySelector('input[name="title"]')?.focus();
  }

  closeModal() {
    this.modalRoot.innerHTML = "";
  }

  showToast(message, type = "success") {
    this.toastRegion.textContent = message;
    this.toastRegion.className = `toast-region is-visible toast-${type}`;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toastRegion.className = "toast-region";
    }, 2800);
  }

  destroy() {
    this.unsubscribe?.();
    this.root.removeEventListener("click", this.handleClick);
    this.root.removeEventListener("submit", this.handleSubmit);
    this.root.removeEventListener("input", this.handleControlChange);
    this.root.removeEventListener("change", this.handleControlChange);
    this.modalRoot.removeEventListener("click", this.handleModalClick);
    this.modalRoot.removeEventListener("submit", this.handleSubmit);
  }
}
