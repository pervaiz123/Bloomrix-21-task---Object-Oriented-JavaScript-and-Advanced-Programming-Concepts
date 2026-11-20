import { Task } from "./Task.js";

export class DocumentationTask extends Task {
  get type() {
    return "documentation";
  }

  getTypeLabel() {
    return "Documentation";
  }

  getWorkflowHint() {
    return "Keep the instructions accurate, structured, and easy to follow.";
  }
}
