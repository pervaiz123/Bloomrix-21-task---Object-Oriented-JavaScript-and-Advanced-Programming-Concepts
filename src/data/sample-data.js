import { daysFromToday } from "../utils/date-utils.js";

export const sampleData = {
  users: [
    { id: "user-pervaiz", name: "Pervaiz Ahmed", email: "pervaiz@example.com", role: "Project Lead" },
    { id: "user-sara", name: "Sara Khan", email: "sara@example.com", role: "Developer" },
    { id: "user-hamza", name: "Hamza Ali", email: "hamza@example.com", role: "QA Engineer" },
    { id: "user-ayesha", name: "Ayesha Noor", email: "ayesha@example.com", role: "Technical Writer" }
  ],
  projects: [
    {
      id: "project-workspace",
      title: "Workspace Platform",
      description: "Build a clear and reliable project workspace for the internal team.",
      startDate: daysFromToday(-18),
      dueDate: daysFromToday(18),
      status: "active",
      memberIds: ["user-pervaiz", "user-sara", "user-hamza", "user-ayesha"],
      tasks: [
        {
          id: "task-dashboard-layout",
          type: "development",
          title: "Build the responsive dashboard layout",
          description: "Create the main workspace layout and make the navigation work on smaller screens.",
          priority: "high",
          status: "in-progress",
          dueDate: daysFromToday(3),
          estimatedHours: 8,
          assigneeIds: ["user-sara", "user-pervaiz"],
          comments: [{ id: "comment-layout-1", text: "The desktop layout is ready for review.", authorId: "user-sara", createdAt: new Date().toISOString() }],
          attachments: [{ id: "attachment-layout-1", name: "Dashboard wireframe.pdf", url: "", addedAt: new Date().toISOString() }],
          activityLog: [{ id: "activity-layout-1", action: "Task created", details: "Initial dashboard task added to the project.", actorId: "user-pervaiz", createdAt: new Date().toISOString() }],
          createdAt: new Date().toISOString()
        },
        {
          id: "task-task-filters",
          type: "development",
          title: "Implement task search and filters",
          description: "Support keyword search and filtering by project, status, priority, and assigned member.",
          priority: "urgent",
          status: "todo",
          dueDate: daysFromToday(5),
          estimatedHours: 6,
          assigneeIds: ["user-pervaiz"],
          comments: [], attachments: [], activityLog: [], createdAt: new Date().toISOString()
        },
        {
          id: "task-storage-tests",
          type: "testing",
          title: "Verify saved workspace data",
          description: "Check that tasks, comments, and member assignments are restored correctly after reload.",
          priority: "medium",
          status: "review",
          dueDate: daysFromToday(1),
          estimatedHours: 4,
          assigneeIds: ["user-hamza"],
          comments: [], attachments: [], activityLog: [], createdAt: new Date().toISOString()
        },
        {
          id: "task-setup-guide",
          type: "documentation",
          title: "Write the workspace setup guide",
          description: "Explain how to run the application locally and describe the main modules.",
          priority: "low",
          status: "done",
          dueDate: daysFromToday(-2),
          estimatedHours: 3,
          assigneeIds: ["user-ayesha"],
          comments: [], attachments: [], activityLog: [], createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "project-client-portal",
      title: "Client Portal Refresh",
      description: "Improve the client-facing portal and its documentation.",
      startDate: daysFromToday(-7),
      dueDate: daysFromToday(30),
      status: "planning",
      memberIds: ["user-pervaiz", "user-sara", "user-ayesha"],
      tasks: [
        {
          id: "task-portal-review",
          type: "testing",
          title: "Review the portal navigation flow",
          description: "Test the main navigation paths and record any confusing or broken journeys.",
          priority: "high",
          status: "todo",
          dueDate: daysFromToday(9),
          estimatedHours: 5,
          assigneeIds: ["user-hamza", "user-pervaiz"],
          comments: [], attachments: [], activityLog: [], createdAt: new Date().toISOString()
        },
        {
          id: "task-client-components",
          type: "development",
          title: "Prepare reusable client components",
          description: "Identify repeated UI elements and implement reusable components with consistent behavior.",
          priority: "medium",
          status: "todo",
          dueDate: daysFromToday(12),
          estimatedHours: 7,
          assigneeIds: ["user-sara"],
          comments: [], attachments: [], activityLog: [], createdAt: new Date().toISOString()
        },
        {
          id: "task-portal-notes",
          type: "documentation",
          title: "Document portal changes",
          description: "Keep a concise record of updated pages, controls, and release notes.",
          priority: "low",
          status: "done",
          dueDate: daysFromToday(-1),
          estimatedHours: 2,
          assigneeIds: ["user-ayesha"],
          comments: [], attachments: [], activityLog: [], createdAt: new Date().toISOString()
        }
      ]
    }
  ]
};
