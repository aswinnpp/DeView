/** POST /generate-signature — body: category (required, enum). userId from auth. */
export const generateSignatureSchema = {
    body: {
        type: 'object',
        required: ['category'],
        properties: {
            category: {
                type: 'string',
                enum: [
                    'resume',
                    'certificateOfIncorporation',
                    'gstCertificate',
                    'panCard',
                    'addressProof',
                    'authorizedSignatoryId',
                    'bankDocument',
                ],
            },
        },
    },
};
