export interface IMarkDocumentUseCase {
  execute(
    companyId: string,
    documentKey: string,
    verified: boolean
  ): Promise<{ documentKey: string; marked: boolean }>;
}
