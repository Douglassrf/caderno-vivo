export const retentionCadence = [3, 7, 15, 30];

export function nextRetentionAction(daysInactive) {
  if (daysInactive >= 30) return "offer_prime_bonus";
  if (daysInactive >= 15) return "send_case_study";
  if (daysInactive >= 7) return "send_creative_prompt";
  if (daysInactive >= 3) return "send_light_reminder";
  return "none";
}
