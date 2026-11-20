import { Task } from "./Task.js";

export class DevelopmentTask extends Task {
  get type() {
    return "development";
  }

  getTypeLabel() {
    return "Development";
  }

  getWorkflowHint() {
    return "Implement the change, keep the code reviewable, and verify the result.";
  }
}
