export const academyLessons = [
  { id: "onboarding-01", title: "Primeira obra", category: "onboarding" },
  { id: "dossie-01", title: "Como proteger seu dossie", category: "autoria" },
  { id: "launch-01", title: "Como lancar uma musica", category: "lancamento" },
];

export function listLessons(category) {
  return category ? academyLessons.filter((lesson) => lesson.category === category) : academyLessons;
}
