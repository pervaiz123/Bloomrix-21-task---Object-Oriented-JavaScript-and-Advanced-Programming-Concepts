console.group("04 · Composition, references, cloning, and property descriptors");

const auditInfo = { createdBy: "Pervaiz", createdAt: "2026-11-20" };
const taskRecord = { title: "Check task references", audit: auditInfo };
const shallowCopy = { ...taskRecord };
shallowCopy.audit.createdBy = "Sara";
console.log("A shallow copy shares nested references:", taskRecord.audit.createdBy);

const originalRecord = { title: "Deep copy example", labels: ["javascript", "oop"] };
const deepCopy = structuredClone(originalRecord);
deepCopy.labels.push("practice");
console.log("Original remains unchanged after deep copy:", originalRecord.labels);
console.log("Independent deep copy:", deepCopy.labels);

const assignedUser = { name: "Sara Khan", role: "Developer" };
const composedTask = {
  title: "Build dashboard",
  assignedUser,
  comments: [{ text: "Ready for review" }]
};
console.log("Composition combines related objects:", composedTask.assignedUser.name, composedTask.comments[0].text);

const descriptorExample = { title: "Initial title" };
Object.defineProperty(descriptorExample, "code", {
  value: "TASK-21",
  writable: false,
  enumerable: true,
  configurable: false
});
console.log("Object.defineProperty descriptor:", Object.getOwnPropertyDescriptor(descriptorExample, "code"));

const frozenObject = Object.freeze({ state: "frozen" });
const sealedObject = Object.seal({ state: "sealed" });
const fixedShapeObject = Object.preventExtensions({ state: "fixed shape" });
console.log("Object.freeze():", Object.isFrozen(frozenObject));
console.log("Object.seal():", Object.isSealed(sealedObject));
console.log("Object.preventExtensions():", Object.isExtensible(fixedShapeObject));
console.groupEnd();
