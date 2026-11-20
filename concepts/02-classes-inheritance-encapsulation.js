console.group("02 · Classes, inheritance, encapsulation, and static members");

class WorkItem {
  constructor(title) {
    this.title = title;
  }

  getSummary() {
    return `Work item: ${this.title}`;
  }
}

class ReviewItem extends WorkItem {
  constructor(title, reviewer) {
    super(title);
    this.reviewer = reviewer;
  }

  getSummary() {
    return `${super.getSummary()} — reviewed by ${this.reviewer}.`;
  }
}

const firstItem = new ReviewItem("Check the dashboard", "Hamza");
const secondItem = new ReviewItem("Verify the release", "Sara");
console.log("Multiple instances:", firstItem.getSummary(), secondItem.getSummary());
console.log("Prototype-based class inheritance:", Object.getPrototypeOf(ReviewItem.prototype) === WorkItem.prototype);

const Utility = class {
  static label() {
    return "Utility class expression";
  }
};
console.log("Class expression and static method:", Utility.label());

class TimeEstimate {
  #hours = 0;

  constructor(hours) {
    this.hours = hours;
  }

  #validateHours(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) throw new Error("Hours must be zero or greater.");
    return number;
  }

  get hours() {
    return this.#hours;
  }

  set hours(value) {
    this.#hours = this.#validateHours(value);
  }

  static unit() {
    return "hours";
  }
}

const estimate = new TimeEstimate(4);
estimate.hours = 6;
console.log("Private field through getter/setter:", estimate.hours, TimeEstimate.unit());
console.log("Polymorphism / overridden method:", firstItem.getSummary());

class AbstractReport {
  generate() {
    throw new Error("A concrete report must implement generate().");
  }
}
class ProjectReport extends AbstractReport {
  generate() {
    return "Project summary report generated.";
  }
}
console.log("Abstraction through a shared contract:", new ProjectReport().generate());
console.groupEnd();
