export interface GenerateUploadSignatureInputDTO {
    category: string;
    userId: string;
}

export interface GenerateUploadSignatureOutputDTO {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}
