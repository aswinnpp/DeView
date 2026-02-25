export interface IGenerateUploadSignatureInputDTO {
    category: string;
    userId: string;
}

export interface IGenerateUploadSignatureOutputDTO {
    uploadUrl: string;
    fileUrl: string;
}
