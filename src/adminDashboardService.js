export class AdminDashboardService {
  summarize({ users = [], subscriptions = [], events = [] } = {}) {
    const activeSubscriptions = subscriptions.filter((s) => s.active !== false);
    const revenue = activeSubscriptions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      users: users.length,
      activeSubscriptions: activeSubscriptions.length,
      revenue,
      events: events.length,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const adminDashboardService = new AdminDashboardService();
