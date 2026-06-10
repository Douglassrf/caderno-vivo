import { writeFileSync } from 'node:fs';
import { evaluateCommercialLaunch } from '../src/commercialLaunchService.js';

const gates = {
  IDOR_TEST_PASSED: process.env.IDOR_TEST_PASSED,
  PRODUCT_SECURITY_TEST_PASSED: process.env.PRODUCT_SECURITY_TEST_PASSED,
  DEPLOY_READY: process.env.DEPLOY_READY,
  PAYMENT_WEBHOOK_VALIDATED: process.env.PAYMENT_WEBHOOK_VALIDATED,
  ENTITLEMENTS_VALIDATED: process.env.ENTITLEMENTS_VALIDATED,
  EXPORT_PROTECTION_VALIDATED: process.env.EXPORT_PROTECTION_VALIDATED,
  TERMS_PRIVACY_READY: process.env.TERMS_PRIVACY_READY,
  SUPPORT_READY: process.env.SUPPORT_READY,
  ROLLBACK_READY: process.env.ROLLBACK_READY
};

const report = evaluateCommercialLaunch(gates);
writeFileSync('COMMERCIAL_LAUNCH_REPORT.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (report.status !== 'LAUNCH_READY') {
  process.exitCode = 1;
}
