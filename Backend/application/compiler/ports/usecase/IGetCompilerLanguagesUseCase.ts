import type { CompilerLanguage } from '../../dtos/CompilerDTO.js';

export interface IGetCompilerLanguagesUseCase {
  execute(): Promise<CompilerLanguage[]>;
}
