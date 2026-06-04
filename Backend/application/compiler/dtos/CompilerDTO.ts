/** Compiler execute + languages — input + output in one module. */

export interface IExecuteCodeInputDTO {
  code: string;
  languageId: number;
  stdin?: string;
}

export interface IExecuteCodeOutputDTO {
  output: string;
  statusId?: number;
  statusDescription?: string;
}

export type CompilerLanguage = {
  id: number;
  name: string;
};
