export class MonitoringService {
  constructor() {
    this.errors = [];
    this.health = [];
  }

  reportError(error, context = {}) {
    const record = {
      id: crypto.randomUUID(),
      message: error?.message || String(error),
      stack: error?.stack || null,
      context,
      createdAt: new Date().toISOString(),
    };
    this.errors.push(record);
    console.error("caderno-vivo:error", record);
    return record;
  }

  healthCheck(name, status = "ok", metadata = {}) {
    const record = { name, status, metadata, checkedAt: new Date().toISOString() };
    this.health.push(record);
    return record;
  }
}

export const monitoringService = new MonitoringService();
