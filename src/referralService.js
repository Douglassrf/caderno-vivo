export function generateReferralCode(userId) {
  return `CV-${String(userId || "USER").slice(0, 8).toUpperCase()}`;
}

export function calculateReferralReward({ paid = false } = {}) {
  return paid ? { credits: 1, bonusDays: 7 } : { credits: 0, bonusDays: 0 };
}
