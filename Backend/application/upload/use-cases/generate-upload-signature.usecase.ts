import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { IFileStorage } from '../ports/services/IFileStorage.js';
import { IGenerateUploadSignatureInputDTO, IGenerateUploadSignatureOutputDTO } from '../dtos/GenerateUploadSignatureDTO.js';
import type { IGenerateUploadSignatureUseCase } from '../ports/usecase/IGenerateUploadSignatureUseCase.js';

@injectable()
export class GenerateUploadSignatureUseCase implements IGenerateUploadSignatureUseCase {
    constructor(@inject(TYPES.FileStoragePort) private readonly _fileStorage: IFileStorage) { }

    async execute(dto: IGenerateUploadSignatureInputDTO): Promise<IGenerateUploadSignatureOutputDTO> {
        return this._fileStorage.generateUploadSignature(dto.category, dto.userId);
    }
}
