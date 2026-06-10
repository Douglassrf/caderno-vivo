export const creativeLibrary = [
  { id: "hook-01", type: "hook", title: "Gancho emocional", content: "Comece pela dor real do compositor." },
  { id: "chorus-01", type: "structure", title: "Refrão forte", content: "Uma frase curta, repetível e memorável." },
  { id: "launch-01", type: "launch", title: "Pré-lançamento", content: "Teaser, bastidor, prova e chamada." },
];

export function listCreativeTemplates(type) {
  return type ? creativeLibrary.filter((item) => item.type === type) : creativeLibrary;
}
