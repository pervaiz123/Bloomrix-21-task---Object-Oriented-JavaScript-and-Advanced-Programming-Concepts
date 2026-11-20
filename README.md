# Assignment 21 — Object-Oriented JavaScript and Advanced Programming Concepts

A responsive project and task management application built with **Vanilla JavaScript, HTML, and CSS**. It uses native ES modules and has no framework or third-party JavaScript dependencies.

## Run the application

1. Open Command Prompt in this project folder.
2. Start a local server:

   ```cmd
   py -m http.server 5500
   ```

3. Open `http://localhost:5500` in your browser.
4. Open `http://localhost:5500/concepts.html` to run the separate advanced-concepts practice files. Open DevTools → Console to inspect its grouped examples.

The application uses `localStorage` to keep changes in this browser. Use the browser's site data controls to clear saved data and restore the original sample workspace.

## Project structure

```text
assignment-21/
├── index.html
├── concepts.html
├── package.json
├── README.md
├── assets/
│   └── css/
│       └── styles.css
├── concepts/
│   ├── 01-constructors-and-prototypes.js
│   ├── 02-classes-inheritance-encapsulation.js
│   ├── 03-this-and-function-binding.js
│   ├── 04-composition-cloning-descriptors.js
│   ├── 05-design-patterns-and-structure.js
│   └── run-all.js
└── src/
    ├── app.js
    ├── data/
    │   └── sample-data.js
    ├── models/
    │   ├── SupportingModels.js
    │   ├── Task.js
    │   ├── DevelopmentTask.js
    │   ├── TestingTask.js
    │   └── DocumentationTask.js
    ├── patterns/
    │   └── EventBus.js
    ├── services/
    │   ├── ProjectService.js
    │   ├── StorageService.js
    │   ├── TaskFactory.js
    │   └── TaskService.js
    ├── ui/
    │   ├── AppController.js
    │   └── renderers.js
    └── utils/
        ├── date-utils.js
        └── sort-strategies.js
```

## Class structure and design decisions

- `Project` owns its project data and composes member and task objects. Its task collection is private and exposed through a copy, so outside code cannot directly change the internal array.
- `Task` contains common task behavior and private data for description, assignees, comments, attachments, and activity history. `DevelopmentTask`, `TestingTask`, and `DocumentationTask` extend it and override the type label and workflow hint.
- `User`, `Comment`, `Attachment`, and `ActivityLog` are reusable composition objects. Tasks refer to user objects, not only display-name strings.
- Static methods generate IDs and calculate task summaries. Getters and setters provide controlled access to private data.
- `TaskFactory` creates the right task subclass from a type value. `EventBus` is one shared instance; the UI subscribes to its change notifications. This demonstrates Factory, Singleton, and Observer patterns.
- `sort-strategies.js` provides interchangeable sorting functions and demonstrates the Strategy pattern. ES modules keep each responsibility in its own module.
- `TaskService` contains task business rules; `ProjectService` manages projects; `StorageService` manages browser persistence. `AppController` handles DOM events and coordinates the UI. Rendering functions are kept in `renderers.js`.
- The task duplicate operation first serializes the task to plain data, uses `structuredClone()` to create an independent deep copy, and then builds a new task through the factory. The original task remains unchanged.

## Included application behavior

Create projects and tasks; edit, delete, assign, complete, reopen, and duplicate tasks; assign multiple users; add comments; view attachments and recent activity; see project summary counts; and search/filter by task text, project, status, priority, and assigned user. Task sorting is available by due date, priority, and title.

## Concepts practice file

The separate files in `concepts/` contain console demonstrations of constructor functions, `new`, constructor properties, prototypes, prototype-chain lookup, `Object.create()`, `Object.getPrototypeOf()`, `Object.setPrototypeOf()`, classes and class expressions, `extends`, `super()`, overriding, private fields, getters/setters, static methods, `this`, `call()`, `apply()`, `bind()`, composition, references, shallow/deep copies, `structuredClone()`, property descriptors, `Object.freeze()`, `Object.seal()`, `Object.preventExtensions()`, Singleton, Factory, Module, Observer, Strategy, and separation of concerns.
