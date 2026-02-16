import { CandidateProfileRepository } from "../../../domain/candidate/repositories/CandidateProfileRepository";
import { FileStoragePort } from "../../upload/ports/FileStoragePort";
import { AppError } from "../../../shared/errors/AppError";

/** Accept PDF (any variant) or Word; also accept by .pdf extension if mimetype missing. */
function isAllowedResume(mimetype: string | undefined, fileName: string): boolean {
    const lower = (mimetype ?? "").toLowerCase();
    const isPdf = lower.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");
    const isWord =
        lower === "application/msword" ||
        lower === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return isPdf || isWord;
}

export interface UploadResumeDTO {
    userId: string;
    fileName: string;
    fileBuffer: Buffer;
    mimetype?: string;
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
            throw AppError.badRequest("No file uploaded");
        }

        if (!isAllowedResume(dto.mimetype, dto.fileName)) {
            throw AppError.badRequest("Resume must be a PDF or Word document");
        }

        const profile = await this.repo.findByUserId(dto.userId);
        if (!profile) {
            throw AppError.notFound("Candidate profile not found create a profile first");
        }

        let storedName: string;
        try {
            storedName = await this.fileStorage.save(dto.fileName, dto.fileBuffer);
        } catch (err) {
            console.error("Resume upload (storage) failed:", err);
            throw AppError.internal(
                "Resume upload failed. Please check your connection and try again."
            );
        }
        const resumeUrl = this.fileStorage.getPublicUrl(storedName);

        profile.attachResume(resumeUrl);
        await this.repo.save(profile);

        return { resumeUrl };
    }
}
