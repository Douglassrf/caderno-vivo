export function suggestProduction(style = "pop") {
  return {
    style,
    bpm: style === "worship" ? 72 : 96,
    arrangement: ["intro", "verso", "refrao", "verso", "ponte", "refrao final"],
    provider: "mock-ai-ready",
  };
}
