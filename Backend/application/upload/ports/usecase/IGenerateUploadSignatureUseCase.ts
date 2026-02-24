import type {
  IGenerateUploadSignatureInputDTO,
  IGenerateUploadSignatureOutputDTO,
} from "../../dtos/GenerateUploadSignatureDTO";

export interface IGenerateUploadSignatureUseCase {
  execute(
    dto: IGenerateUploadSignatureInputDTO
  ): Promise<IGenerateUploadSignatureOutputDTO>;
}
