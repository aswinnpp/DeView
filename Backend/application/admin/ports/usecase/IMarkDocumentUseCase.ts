import type {
  IMarkCompanyDocumentInputDTO,
  IMarkCompanyDocumentOutputDTO,
} from '../../dtos/AdminCompanyMutationsDTO.js';

export interface IMarkDocumentUseCase {
  execute(input: IMarkCompanyDocumentInputDTO): Promise<IMarkCompanyDocumentOutputDTO>;
}
