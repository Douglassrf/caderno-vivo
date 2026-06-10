export class BackupService {
  createBackup(scope, payload = {}) {
    return {
      id: crypto.randomUUID(),
      scope,
      payload,
      createdAt: new Date().toISOString(),
      format: "caderno-vivo-backup-v1",
    };
  }

  validateBackup(backup) {
    return Boolean(backup?.id && backup?.format === "caderno-vivo-backup-v1");
  }

  restoreBackup(backup) {
    if (!this.validateBackup(backup)) {
      throw new Error("Backup invalido");
    }
    return backup.payload;
  }
}

export const backupService = new BackupService();
