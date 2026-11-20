import { formatDate, formatDateTime } from "../utils/date-utils.js";

export function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function statusLabel(status) {
  return ({ todo: "To do", "in-progress": "In progress", review: "In review", done: "Completed" })[status] ?? status;
}

function priorityLabel(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function avatarMarkup(user, extraClass = "") {
  if (!user) return "";
  return `<span class="avatar avatar-inline ${extraClass}" title="${escapeHTML(user.name)}">${escapeHTML(user.initials)}</span>`;
}

export function renderProjectList(projects, activeProjectId, allTaskCount) {
  const allItem = `
    <button class="project-link ${activeProjectId === "all" ? "is-active" : ""}" type="button" data-action="select-project" data-id="all">
      <span class="project-link-icon">▦</span><span>All projects</span><span class="project-count">${allTaskCount}</span>
    </button>`;

  const projectItems = projects.map((project) => `
    <button class="project-link ${activeProjectId === project.id ? "is-active" : ""}" type="button" data-action="select-project" data-id="${escapeHTML(project.id)}">
      <span class="project-color-dot"></span><span class="project-link-title">${escapeHTML(project.title)}</span><span class="project-count">${project.tasks.length}</span>
    </button>`).join("");

  return allItem + projectItems;
}

export function renderSummary(summary) {
  const cards = [
    { label: "Total tasks", value: summary.totalTasks, note: "In this project view", icon: "▤", style: "summary-blue" },
    { label: "Completed", value: summary.completedTasks, note: "Successfully finished", icon: "✓", style: "summary-green" },
    { label: "Pending", value: summary.pendingTasks, note: "Still to be completed", icon: "◷", style: "summary-purple" },
    { label: "Overdue", value: summary.overdueTasks, note: "Past due date", icon: "!", style: "summary-orange" },
    { label: "Estimated hours", value: `${summary.totalEstimatedHours}h`, note: "Total planned effort", icon: "◴", style: "summary-slate" }
  ];

  return cards.map((card) => `
    <article class="summary-card ${card.style}">
      <div class="summary-card-top"><span>${card.label}</span><span class="summary-icon">${card.icon}</span></div>
      <strong>${card.value}</strong>
      <small>${card.note}</small>
    </article>`).join("");
}

export function renderTaskList(tasks, selectedTaskId) {
  if (tasks.length === 0) {
    return `<div class="empty-state"><span class="empty-state-icon">⌕</span><strong>No tasks found</strong><p>Try changing the search term or filters, or create a new task.</p></div>`;
  }

  return tasks.map((task) => {
    const assigneeMarkup = task.assignees.slice(0, 3).map((user) => avatarMarkup(user)).join("");
    const extraAssignees = task.assignees.length > 3 ? `<span class="avatar avatar-inline avatar-extra">+${task.assignees.length - 3}</span>` : "";
    const overdue = task.isOverdue() ? `<span class="overdue-label">Overdue</span>` : "";

    return `
      <button class="task-card ${selectedTaskId === task.id ? "is-selected" : ""}" type="button" data-action="select-task" data-id="${escapeHTML(task.id)}">
        <span class="task-card-main">
          <span class="task-card-title-row"><strong>${escapeHTML(task.title)}</strong><span class="priority-dot priority-${task.priority}" title="${priorityLabel(task.priority)} priority"></span></span>
          <span class="task-card-description">${escapeHTML(task.description || task.getWorkflowHint())}</span>
          <span class="task-card-meta">
            <span class="status-pill status-${task.status}">${statusLabel(task.status)}</span>
            <span class="task-type-label">${task.getTypeLabel()}</span>
            <span class="task-due">◷ ${formatDate(task.dueDate)}</span>
            ${overdue}
          </span>
        </span>
        <span class="task-card-assignees">${assigneeMarkup}${extraAssignees || (task.assignees.length === 0 ? `<span class="unassigned-label">Unassigned</span>` : "")}</span>
      </button>`;
  }).join("");
}

export function renderTaskDetails(task, project) {
  if (!task) {
    return `<div class="details-empty"><span class="details-empty-icon">◇</span><h2>Task details</h2><p>Select a task from the list to view its details, assigned members, comments, and activity.</p></div>`;
  }

  const assignees = task.assignees.length
    ? task.assignees.map((user) => `<div class="member-row">${avatarMarkup(user)}<span><strong>${escapeHTML(user.name)}</strong><small>${escapeHTML(user.role)}</small></span><button class="remove-member-button" type="button" data-action="remove-assignee" data-id="${escapeHTML(user.id)}" aria-label="Remove ${escapeHTML(user.name)}">×</button></div>`).join("")
    : `<p class="muted small-text">No members assigned.</p>`;

  const comments = task.comments.length
    ? task.comments.map((comment) => `<article class="comment-item"><div class="comment-avatar">${escapeHTML(comment.author?.initials ?? "U")}</div><div><div class="comment-meta"><strong>${escapeHTML(comment.author?.name ?? "Workspace member")}</strong><time>${formatDateTime(comment.createdAt)}</time></div><p>${escapeHTML(comment.text)}</p></div></article>`).join("")
    : `<p class="muted small-text">No comments yet.</p>`;

  const attachments = task.attachments.length
    ? task.attachments.map((attachment) => `<div class="attachment-row"><span class="attachment-icon">↗</span><span>${escapeHTML(attachment.name)}</span></div>`).join("")
    : `<p class="muted small-text">No attachments.</p>`;

  const activity = task.activityLog.length
    ? task.activityLog.slice(0, 5).map((item) => `<div class="activity-item"><span class="activity-dot"></span><div><strong>${escapeHTML(item.action)}</strong><p>${escapeHTML(item.details)}</p><time>${formatDateTime(item.createdAt)}</time></div></div>`).join("")
    : `<p class="muted small-text">No activity recorded yet.</p>`;

  const completionAction = task.status === "done"
    ? `<button class="secondary-button" type="button" data-action="reopen-task">Reopen task</button>`
    : `<button class="primary-button compact-button" type="button" data-action="complete-task">Mark complete</button>`;

  return `
    <div class="details-heading">
      <div><p class="eyebrow">TASK DETAILS</p><span class="status-pill status-${task.status}">${statusLabel(task.status)}</span></div>
      <button class="icon-button subtle-icon-button" type="button" data-action="edit-task" aria-label="Edit task" title="Edit task">✎</button>
    </div>
    <h2 class="details-title">${escapeHTML(task.title)}</h2>
    <p class="details-description">${escapeHTML(task.description || "No description provided.")}</p>
    <p class="project-context"><span class="project-color-dot"></span>${escapeHTML(project?.title ?? "Unknown project")} <span>·</span> ${task.getTypeLabel()}</p>

    <div class="detail-actions">${completionAction}<button class="secondary-button" type="button" data-action="duplicate-task">Duplicate</button><button class="danger-icon-button" type="button" data-action="delete-task" title="Delete task" aria-label="Delete task">⌫</button></div>

    <div class="detail-facts">
      <div><span>Priority</span><strong><i class="priority-dot priority-${task.priority}"></i>${priorityLabel(task.priority)}</strong></div>
      <div><span>Due date</span><strong>${formatDate(task.dueDate)}</strong></div>
      <div><span>Estimated effort</span><strong>${task.estimatedHours} hours</strong></div>
      <div><span>Overdue</span><strong>${task.isOverdue() ? "Yes" : "No"}</strong></div>
    </div>

    <section class="detail-section">
      <div class="detail-section-heading"><h3>Assigned members</h3><span>${task.assignees.length}</span></div>
      <div class="member-list">${assignees}</div>
    </section>

    <section class="detail-section">
      <div class="detail-section-heading"><h3>Attachments</h3><span>${task.attachments.length}</span></div>
      <div class="attachment-list">${attachments}</div>
    </section>

    <section class="detail-section">
      <div class="detail-section-heading"><h3>Comments</h3><span>${task.comments.length}</span></div>
      <div class="comment-list">${comments}</div>
      <form class="comment-form" id="comment-form">
        <label class="sr-only" for="comment-text">Add a comment</label>
        <input id="comment-text" name="text" type="text" maxlength="500" placeholder="Write a comment..." required>
        <button class="icon-button comment-submit" type="submit" aria-label="Send comment">➤</button>
      </form>
    </section>

    <section class="detail-section activity-section">
      <div class="detail-section-heading"><h3>Recent activity</h3><span>${task.activityLog.length}</span></div>
      <div class="activity-list">${activity}</div>
    </section>`;
}

export function renderTaskForm({ task = null, projectId = null, projects, users }) {
  const currentProjectId = projectId ?? task?.projectId ?? projects[0]?.id ?? "";
  const projectOptions = projects.map((project) => `<option value="${escapeHTML(project.id)}" ${project.id === currentProjectId ? "selected" : ""}>${escapeHTML(project.title)}</option>`).join("");
  const selectedAssigneeIds = new Set(task?.assignees.map((user) => user.id) ?? []);
  const userOptions = users.map((user) => `<option value="${escapeHTML(user.id)}" ${selectedAssigneeIds.has(user.id) ? "selected" : ""}>${escapeHTML(user.name)} — ${escapeHTML(user.role)}</option>`).join("");
  const selectedType = task?.type ?? "development";
  const selectedPriority = task?.priority ?? "medium";
  const selectedStatus = task?.status ?? "todo";

  return `
    <div class="modal-backdrop">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div class="modal-heading"><div><p class="eyebrow">TASK MANAGEMENT</p><h2 id="task-modal-title">${task ? "Edit task" : "Create a task"}</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close dialog">×</button></div>
        <form id="task-form" data-task-id="${task ? escapeHTML(task.id) : ""}">
          <div class="form-grid">
            <label class="form-field full-width">Task title<input name="title" type="text" maxlength="100" value="${escapeHTML(task?.title ?? "")}" placeholder="e.g. Build the settings page" required></label>
            <label class="form-field full-width">Description<textarea name="description" rows="3" maxlength="1000" placeholder="What needs to be done?">${escapeHTML(task?.description ?? "")}</textarea></label>
            <label class="form-field">Task type<select name="type" ${task ? "disabled" : ""}><option value="development" ${selectedType === "development" ? "selected" : ""}>Development</option><option value="testing" ${selectedType === "testing" ? "selected" : ""}>Testing</option><option value="documentation" ${selectedType === "documentation" ? "selected" : ""}>Documentation</option></select></label>
            <label class="form-field">Project<select name="projectId" required>${projectOptions}</select></label>
            <label class="form-field">Priority<select name="priority"><option value="low" ${selectedPriority === "low" ? "selected" : ""}>Low</option><option value="medium" ${selectedPriority === "medium" ? "selected" : ""}>Medium</option><option value="high" ${selectedPriority === "high" ? "selected" : ""}>High</option><option value="urgent" ${selectedPriority === "urgent" ? "selected" : ""}>Urgent</option></select></label>
            <label class="form-field">Status<select name="status"><option value="todo" ${selectedStatus === "todo" ? "selected" : ""}>To do</option><option value="in-progress" ${selectedStatus === "in-progress" ? "selected" : ""}>In progress</option><option value="review" ${selectedStatus === "review" ? "selected" : ""}>In review</option><option value="done" ${selectedStatus === "done" ? "selected" : ""}>Completed</option></select></label>
            <label class="form-field">Due date<input name="dueDate" type="date" value="${escapeHTML(task?.dueDate ?? "")}"></label>
            <label class="form-field">Estimated hours<input name="estimatedHours" type="number" min="0" max="10000" step="0.5" value="${task?.estimatedHours ?? 0}"></label>
            <label class="form-field full-width">Assigned members<select name="assigneeIds" multiple size="4">${userOptions}</select><small>Use Ctrl (Windows) or Command (Mac) to select more than one member.</small></label>
          </div>
          <div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">${task ? "Save changes" : "Create task"}</button></div>
        </form>
      </section>
    </div>`;
}

export function renderProjectForm(users) {
  const userOptions = users.map((user) => `<option value="${escapeHTML(user.id)}" selected>${escapeHTML(user.name)} — ${escapeHTML(user.role)}</option>`).join("");
  return `
    <div class="modal-backdrop">
      <section class="modal-card modal-card-narrow" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
        <div class="modal-heading"><div><p class="eyebrow">WORKSPACE SETUP</p><h2 id="project-modal-title">Create a project</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close dialog">×</button></div>
        <form id="project-form">
          <div class="form-grid">
            <label class="form-field full-width">Project title<input name="title" type="text" maxlength="100" placeholder="e.g. Website redesign" required></label>
            <label class="form-field full-width">Description<textarea name="description" rows="3" maxlength="1000" placeholder="What is this project about?"></textarea></label>
            <label class="form-field">Start date<input name="startDate" type="date"></label>
            <label class="form-field">Due date<input name="dueDate" type="date"></label>
            <label class="form-field">Status<select name="status"><option value="planning">Planning</option><option value="active">Active</option><option value="on-hold">On hold</option><option value="completed">Completed</option></select></label>
            <label class="form-field">Project members<select name="memberIds" multiple size="4">${userOptions}</select><small>All current members are selected by default.</small></label>
          </div>
          <div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">Create project</button></div>
        </form>
      </section>
    </div>`;
}
