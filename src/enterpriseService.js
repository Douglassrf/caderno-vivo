export const enterpriseFeatures = ["teams", "audit_logs", "sso_ready", "advanced_permissions", "priority_support"];

export function hasEnterpriseFeature(feature) {
  return enterpriseFeatures.includes(feature);
}
