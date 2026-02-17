/** Document types required for company approval (KYC). */
export const DOCUMENT_TYPES = [
  { key: 'certificateOfIncorporation', label: 'Certificate of Incorporation', description: 'Legal document proving business registration (CIN)', required: true },
  { key: 'gstCertificate', label: 'GST Certificate', description: 'Goods and Services Tax registration certificate', required: true },
  { key: 'panCard', label: 'Company PAN Card', description: 'Permanent Account Number card for the business', required: true },
  { key: 'addressProof', label: 'Address Proof', description: 'Utility bill, lease agreement, or property documents', required: true },
  { key: 'authorizedSignatoryId', label: 'Authorized Signatory ID', description: 'Aadhar Card, Passport, or Voter ID of the authorized person', required: true },
  { key: 'bankDocument', label: 'Bank Verification Document', description: 'Cancelled cheque or bank statement (last 3 months)', required: false },
] as const;
