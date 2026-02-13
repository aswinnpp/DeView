export interface UploadFileInputDTO {
    fileName: string;
    fileBuffer: Buffer;
}

export interface UploadFileOutputDTO {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
}
