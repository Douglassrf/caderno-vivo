export function suggestProgression(key = "C") {
  return {
    key,
    progressions: [`${key} - G - Am - F`, `${key} - Am - F - G`],
    provider: "mock-ai-ready",
  };
}
