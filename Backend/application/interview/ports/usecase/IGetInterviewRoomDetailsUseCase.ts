export interface IGetInterviewRoomDetailsUseCase {
  execute(input: {
    interviewId: string;
    userId: string;
    role: string;
    companyId?: string;
  }): Promise<unknown>;
}

