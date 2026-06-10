export class AnalyticsService {
  constructor({ sink = console.log } = {}) {
    this.sink = sink;
    this.events = [];
  }

  track(event, payload = {}) {
    const record = {
      id: crypto.randomUUID(),
      event,
      payload,
      createdAt: new Date().toISOString(),
    };
    this.events.push(record);
    this.sink("caderno-vivo:analytics", record);
    return record;
  }

  funnel() {
    return this.events.reduce((acc, item) => {
      acc[item.event] = (acc[item.event] || 0) + 1;
      return acc;
    }, {});
  }
}

export const analyticsService = new AnalyticsService();
