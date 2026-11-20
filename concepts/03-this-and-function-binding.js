console.group("03 · this, call(), apply(), bind(), and event handlers");

const taskContext = {
  title: "Prepare release notes",
  showTitle() {
    return this.title;
  }
};
console.log("this inside an object method:", taskContext.showTitle());

function describeRegularFunctionContext() {
  return this === undefined ? "undefined in a strict-mode standalone call" : this.title;
}
console.log("this in a regular function call:", describeRegularFunctionContext());

function ConstructorExample(title) {
  this.title = title;
}
const constructorInstance = new ConstructorExample("Constructor sets this");
console.log("this inside a constructor function:", constructorInstance.title);

class ClassExample {
  constructor(title) {
    this.title = title;
  }
  getTitle() {
    return this.title;
  }
}
console.log("this inside a class instance method:", new ClassExample("Class instance sets this").getTitle());

function showCurrentTitle() {
  return this?.title ?? "No this context was provided";
}
const anotherContext = { title: "Review pull request" };
console.log("call() sets this immediately:", showCurrentTitle.call(anotherContext));
console.log("apply() sets this and receives an argument array:", showCurrentTitle.apply(anotherContext, []));
const unboundMethod = taskContext.showTitle;
try {
  unboundMethod();
} catch (error) {
  console.log("A detached method loses its original this:", error.name);
}
const boundMethod = taskContext.showTitle.bind(taskContext);
console.log("Binding fixes the detached-method problem:", boundMethod());
const boundTitle = showCurrentTitle.bind(anotherContext);
console.log("bind() returns a function with fixed this:", boundTitle());

const demoButton = document.createElement("button");
demoButton.textContent = "Binding demonstration";
demoButton.addEventListener("click", function () {
  console.log("this in a regular DOM event handler is the element:", this === demoButton);
});
demoButton.addEventListener("click", () => {
  console.log("An arrow handler keeps its lexical this; it does not receive the button as this.");
});
demoButton.click();
console.log("In the application, AppController binds its event handlers so the controller remains this.");
console.groupEnd();
