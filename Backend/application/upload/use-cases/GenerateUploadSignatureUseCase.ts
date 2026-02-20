import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { FileStoragePort } from '../ports/services/FileStoragePort.js';
import { GenerateUploadSignatureInputDTO, GenerateUploadSignatureOutputDTO } from '../dtos/GenerateUploadSignatureDTO.js';
import type { GenerateUploadSignatureUseCasePort } from '../ports/usecase/GenerateUploadSignatureUseCasePort.js';

@injectable()
export class GenerateUploadSignatureUseCase implements GenerateUploadSignatureUseCasePort {
    constructor(@inject(TYPES.FileStoragePort) private readonly fileStorage: FileStoragePort) { }

    async execute(dto: GenerateUploadSignatureInputDTO): Promise<GenerateUploadSignatureOutputDTO> {
        return this.fileStorage.generateUploadSignature(dto.category, dto.userId);
    }
}
