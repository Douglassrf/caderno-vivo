export class AiComposerService {
  generateBrief({ theme = "", style = "popular" } = {}) {
    return {
      theme,
      style,
      structure: ["verso", "pre-refrao", "refrao", "ponte", "refrao-final"],
      prompt: `Crie uma composicao ${style} sobre ${theme}.`,
      provider: "mock-ai-ready",
    };
  }
}

export const aiComposerService = new AiComposerService();
