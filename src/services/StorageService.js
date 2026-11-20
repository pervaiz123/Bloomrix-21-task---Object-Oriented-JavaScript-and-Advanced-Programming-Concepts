const STORAGE_KEY = "bloomrix-project-workspace-v1";

export class StorageService {
  load() {
    try {
      const storedValue = localStorage.getItem(STORAGE_KEY);
      return storedValue ? JSON.parse(storedValue) : null;
    } catch (error) {
      console.warn("Saved workspace data could not be read. Sample data will be loaded.", error);
      return null;
    }
  }

  save(users, projects) {
    try {
      const payload = {
        users: users.map((user) => user.toJSON()),
        projects: projects.map((project) => project.toJSON())
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Workspace data could not be saved.", error);
    }
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
