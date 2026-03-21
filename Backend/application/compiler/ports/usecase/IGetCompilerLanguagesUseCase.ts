export type CompilerLanguage = {
  id: number;
  name: string;
};

export interface IGetCompilerLanguagesUseCase {
  execute(): Promise<CompilerLanguage[]>;
}
