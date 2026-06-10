export const PROFESSIONAL_MODE = {
  id: 'professional',
  label: 'Modo Profissional',
  visibleRoutes: ['#/caderno', '#/criar-musica', '#/minhas-obras', '#/maestro-ia', '#/profissional'],
  goal: 'Acessar criação, gestão, registro, distribuição, analytics e monetização.'
};

export function ProfessionalMode() {
  return PROFESSIONAL_MODE;
}
