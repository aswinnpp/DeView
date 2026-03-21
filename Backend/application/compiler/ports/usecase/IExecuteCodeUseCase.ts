export type ExecuteCodeResult = {
  output: string;
  statusId?: number;
  statusDescription?: string;
};

export interface IExecuteCodeUseCase {
  execute(params: { code: string; languageId: number; stdin?: string }): Promise<ExecuteCodeResult>;
}
