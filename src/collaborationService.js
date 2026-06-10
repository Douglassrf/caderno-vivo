export class CollaborationService {
  invite({ workId, email, role = "viewer" }) {
    return {
      id: crypto.randomUUID(),
      workId,
      email,
      role,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }
}

export const collaborationService = new CollaborationService();
