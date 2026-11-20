import { Task } from "./Task.js";

export class TestingTask extends Task {
  get type() {
    return "testing";
  }

  getTypeLabel() {
    return "Testing";
  }

  getWorkflowHint() {
    return "Cover the expected behavior, edge cases, and regression risks.";
  }
}
