console.group("01 · Constructors and prototypes");

function TeamMember(name, role) {
  this.name = name;
  this.role = role;
}

TeamMember.prototype.introduce = function () {
  return `${this.name} works as ${this.role}.`;
};

const member = new TeamMember("Sara Khan", "Developer");
console.log("Properties:", member.name, member.role);
console.log("Constructor property:", member.constructor === TeamMember);
console.log("Prototype relationship:", Object.getPrototypeOf(member) === TeamMember.prototype);
console.log("Method found through prototype chain:", member.introduce());

const sharedProfile = {
  describe() {
    return `${this.name} is part of the workspace.`;
  }
};
const profile = Object.create(sharedProfile);
profile.name = "Hamza Ali";
console.log("Object.create() inheritance:", profile.describe());
console.log("Object.getPrototypeOf():", Object.getPrototypeOf(profile) === sharedProfile);

const secondProfile = { name: "Ayesha Noor" };
Object.setPrototypeOf(secondProfile, sharedProfile);
console.log("Object.setPrototypeOf():", secondProfile.describe());
console.groupEnd();
