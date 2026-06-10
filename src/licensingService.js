export function createLicense({ workId, licensee, type = "standard" }) {
  return { id: crypto.randomUUID(), workId, licensee, type, createdAt: new Date().toISOString() };
}
