import { LocalFileStorageService } from '../../../infrastructure/storage/LocalFileStorageService.js';
import { UploadFileInputDTO, UploadFileOutputDTO } from '../dtos/UploadFileDTO.js';
import { AppError } from '../../../shared/errors/AppError.js';

export class UploadFileUseCase {
    constructor(private readonly fileStorage: LocalFileStorageService) { }

    async execute(dto: UploadFileInputDTO): Promise<UploadFileOutputDTO> {
        if (!dto.fileName || !dto.fileBuffer || dto.fileBuffer.length === 0) {
            throw AppError.badRequest('No file provided');
        }

        const storedName = await this.fileStorage.save(dto.fileName, dto.fileBuffer);
        const fileUrl = this.fileStorage.getPublicUrl(storedName);

        return {
            fileName: dto.fileName,
            fileUrl,
            uploadedAt: new Date().toISOString(),
        };
    }
}
