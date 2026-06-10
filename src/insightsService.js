export function buildInsights(events = []) {
  const byEvent = events.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {});
  return {
    byEvent,
    activationRate: byEvent.create_work ? Math.min(100, byEvent.create_work * 10) : 0,
    exportRate: byEvent.export ? Math.min(100, byEvent.export * 10) : 0,
  };
}
