export class MentorService {
  suggest({ theme = "", goal = "composicao" } = {}) {
    return {
      theme,
      goal,
      suggestions: [
        "Defina a emocao principal da obra.",
        "Crie uma frase central que resuma a mensagem.",
        "Separe verso, pre-refrao e refrao antes de lapidar.",
      ],
      mode: "mock-ready-for-ai-provider",
    };
  }
}

export const mentorService = new MentorService();
