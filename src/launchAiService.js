export function createLaunchPlan({ title = "Obra", days = 14 } = {}) {
  return {
    title,
    days,
    steps: ["teaser", "bastidor", "pre-save", "lancamento", "pos-lancamento"],
    provider: "mock-ai-ready",
  };
}
