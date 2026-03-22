import { env } from '../infrastructure/config/env.js';
import { DocuSignJwtAuthService } from '../infrastructure/docusign/DocuSignJwtAuthService.js';

const svc = DocuSignJwtAuthService.fromEnv(env);
if (!svc) {
  console.error(
    'Missing DocuSign JWT env: set DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, and DOCUSIGN_PRIVATE_KEY in Backend/.env'
  );
  process.exit(1);
}

console.log('If you have not granted consent yet, open:\n', svc.getConsentUrl(), '\n');

try {
  const tok = await svc.requestAccessToken();
  console.log('token_type:', tok.token_type);
  console.log('expires_in (seconds):', tok.expires_in);
  console.log('access_token:', tok.access_token);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
