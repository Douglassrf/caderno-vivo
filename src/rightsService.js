export function registerRights({ workId, ownerId, evidence = [] }) {
  return { id: crypto.randomUUID(), workId, ownerId, evidence, status: "registered_mock", createdAt: new Date().toISOString() };
}
