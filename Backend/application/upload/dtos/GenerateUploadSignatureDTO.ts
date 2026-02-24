export interface IGenerateUploadSignatureInputDTO {
    category: string;
    userId: string;
}

export interface IGenerateUploadSignatureOutputDTO {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}
