export class WorkspaceService {
  createWorkspace({ userId, name }) {
    return { id: crypto.randomUUID(), userId, name, projects: [], createdAt: new Date().toISOString() };
  }
}

export const workspaceService = new WorkspaceService();
