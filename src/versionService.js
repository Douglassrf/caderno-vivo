export class VersionService {
  createVersion(entity) {
    return { id: crypto.randomUUID(), entity, createdAt: new Date().toISOString() };
  }

  rollback(version) {
    return version.entity;
  }
}

export const versionService = new VersionService();
