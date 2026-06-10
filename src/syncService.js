export class SyncService {
  queue(change) {
    return { id: crypto.randomUUID(), change, status: "queued", createdAt: new Date().toISOString() };
  }

  markSynced(item) {
    return { ...item, status: "synced", syncedAt: new Date().toISOString() };
  }
}

export const syncService = new SyncService();
