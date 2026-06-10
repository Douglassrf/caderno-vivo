const REQUIRED_GATES = [
  'IDOR_TEST_PASSED',
  'PRODUCT_SECURITY_TEST_PASSED',
  'DEPLOY_READY',
  'PAYMENT_WEBHOOK_VALIDATED',
  'ENTITLEMENTS_VALIDATED',
  'EXPORT_PROTECTION_VALIDATED',
  'TERMS_PRIVACY_READY',
  'SUPPORT_READY',
  'ROLLBACK_READY'
];

export function evaluateCommercialLaunch(gates = {}) {
  const results = REQUIRED_GATES.map((gate) => ({
    gate,
    passed: gates[gate] === true || gates[gate] === 'true'
  }));

  const missing = results.filter((item) => !item.passed).map((item) => item.gate);

  return {
    status: missing.length === 0 ? 'LAUNCH_READY' : 'LAUNCH_BLOCKED',
    requiredGates: REQUIRED_GATES,
    missing,
    results,
    message: missing.length === 0
      ? 'Lançamento comercial controlado liberado.'
      : 'Lançamento bloqueado até aprovação dos gates obrigatórios.'
  };
}

export function buildLaunchMemory(previousStatus = {}) {
  return {
    project: 'Caderno Vivo',
    phase: 'commercial_launch_controlled',
    previousStatus,
    nextRequiredAction: 'Validar gates em ambiente real antes de venda.',
    permanentRule: 'A memória da missão anterior alimenta a missão seguinte.'
  };
}
