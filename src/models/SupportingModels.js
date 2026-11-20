function createId(prefix) {
  const uniquePart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${uniquePart}`;
}

export class User {
  constructor({ id = createId("user"), name, email = "", role = "Member" }) {
    if (!name?.trim()) throw new Error("A user name is required.");
    this.id = id;
    this.name = name.trim();
    this.email = email.trim();
    this.role = role.trim() || "Member";
  }

  get initials() {
    return this.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  toJSON() {
    return { id: this.id, name: this.name, email: this.email, role: this.role };
  }
}

export class Comment {
  constructor({ id = createId("comment"), text, author = null, authorId = null, createdAt = new Date().toISOString() }) {
    if (!text?.trim()) throw new Error("A comment cannot be empty.");
    this.id = id;
    this.text = text.trim();
    this.author = author;
    this.authorId = author?.id ?? authorId;
    this.createdAt = createdAt;
  }

  toJSON() {
    return { id: this.id, text: this.text, authorId: this.author?.id ?? this.authorId, createdAt: this.createdAt };
  }
}

export class Attachment {
  constructor({ id = createId("attachment"), name, url = "", addedAt = new Date().toISOString() }) {
    if (!name?.trim()) throw new Error("An attachment name is required.");
    this.id = id;
    this.name = name.trim();
    this.url = url.trim();
    this.addedAt = addedAt;
  }

  toJSON() {
    return { id: this.id, name: this.name, url: this.url, addedAt: this.addedAt };
  }
}

export class ActivityLog {
  constructor({ id = createId("activity"), action, details = "", actor = null, actorId = null, createdAt = new Date().toISOString() }) {
    if (!action?.trim()) throw new Error("An activity action is required.");
    this.id = id;
    this.action = action.trim();
    this.details = details.trim();
    this.actor = actor;
    this.actorId = actor?.id ?? actorId;
    this.createdAt = createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      action: this.action,
      details: this.details,
      actorId: this.actor?.id ?? this.actorId,
      createdAt: this.createdAt
    };
  }
}
