import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { FileStoragePort } from '../ports/FileStoragePort.js';
import { GenerateUploadSignatureInputDTO, GenerateUploadSignatureOutputDTO } from '../dtos/GenerateUploadSignatureDTO.js';

@injectable()
export class GenerateUploadSignatureUseCase {
    constructor(@inject(TYPES.FileStoragePort) private readonly fileStorage: FileStoragePort) { }

    async execute(dto: GenerateUploadSignatureInputDTO): Promise<GenerateUploadSignatureOutputDTO> {
        return this.fileStorage.generateUploadSignature(dto.category, dto.userId);
    }
}
