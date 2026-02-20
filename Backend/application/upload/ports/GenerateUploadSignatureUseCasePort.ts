import type {
  GenerateUploadSignatureInputDTO,
  GenerateUploadSignatureOutputDTO,
} from "../dtos/GenerateUploadSignatureDTO";

export interface GenerateUploadSignatureUseCasePort {
  execute(
    dto: GenerateUploadSignatureInputDTO
  ): Promise<GenerateUploadSignatureOutputDTO>;
}
