export interface MarkDocumentUseCasePort {
  execute(
    companyId: string,
    documentKey: string,
    verified: boolean
  ): Promise<{ documentKey: string; marked: boolean }>;
}
