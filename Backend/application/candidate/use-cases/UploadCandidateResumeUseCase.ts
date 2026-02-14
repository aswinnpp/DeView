import { CandidateProfileRepository } from "../../../domain/candidate/repositories/CandidateProfileRepository";
import { FileStoragePort } from "../../upload/ports/FileStoragePort";
import { AppError } from "../../../shared/errors/AppError";

export interface UploadResumeDTO {
    userId: string;
    fileName: string;
    fileBuffer: Buffer;
}

export class UploadCandidateResumeUseCase {
    constructor(
        private repo: CandidateProfileRepository,
        private fileStorage: FileStoragePort
    ) { }

    async execute(dto: UploadResumeDTO): Promise<{ resumeUrl: string }> {
        if (!dto.userId) {
            throw AppError.badRequest("UserId is required");
        }

        if (!dto.fileName || !dto.fileBuffer || dto.fileBuffer.length === 0) {
            throw AppError.badRequest("No resume file provided");
        }

        const profile = await this.repo.findByUserId(dto.userId);

        if (!profile) {
            throw AppError.notFound("Candidate profile not found — create a profile first");
        }

        // Save the file via the storage port
        const storedName = await this.fileStorage.save(dto.fileName, dto.fileBuffer);
        const resumeUrl = this.fileStorage.getPublicUrl(storedName);

        // Attach the URL to the profile entity
        profile.attachResume(resumeUrl);
        await this.repo.save(profile);

        return { resumeUrl };
    }
}
