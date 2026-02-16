import { FileStoragePort } from '../ports/FileStoragePort.js';
import { GenerateUploadSignatureInputDTO, GenerateUploadSignatureOutputDTO } from '../dtos/GenerateUploadSignatureDTO.js';

export class GenerateUploadSignatureUseCase {
    constructor(private readonly fileStorage: FileStoragePort) { }

    async execute(dto: GenerateUploadSignatureInputDTO): Promise<GenerateUploadSignatureOutputDTO> {
        return this.fileStorage.generateUploadSignature(dto.category, dto.userId);
    }
}
