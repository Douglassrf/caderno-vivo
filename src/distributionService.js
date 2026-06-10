export function scheduleDistribution({ workId, platforms = [], releaseDate }) {
  return { id: crypto.randomUUID(), workId, platforms, releaseDate, status: "scheduled_mock" };
}
