export const generateSignatureSchema = {
    body: {
        type: 'object',
        required: ['category'],
        properties: {
            category: {
                type: 'string',
                enum: [
                    'profilePic',
                    'interviewerProfilePic',
                    'hrProfilePic',
                    'companyLogo',
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
