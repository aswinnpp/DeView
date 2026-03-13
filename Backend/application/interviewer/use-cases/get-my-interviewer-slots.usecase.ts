import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { IInterviewerSlotsRepository } from "../ports/repository/IInterviewerSlotsRepository.js";
import type { IGetMyInterviewerSlotsUseCase } from "../ports/usecase/IGetMyInterviewerSlotsUseCase.js";
import { isAllowedBookingDate ,DATE_RE } from "../../shared/utils/parseDate.js";





@injectable()
export class GetMyInterviewerSlotsUseCase implements IGetMyInterviewerSlotsUseCase {
  constructor(
    @inject(TYPES.InterviewerSlotsRepositoryPort)
    private readonly _repo: IInterviewerSlotsRepository,
  ) {}

  async execute(input: {
    interviewerId: string;
    companyId: string;
    slotDate?: string;
  }) {
    if (!input.interviewerId) throw AppError.badRequest("interviewerId is required");
    if (!input.companyId) throw AppError.badRequest("companyId is required");
    if (input.slotDate && !DATE_RE.test(input.slotDate)) {
      throw AppError.badRequest("slotDate must be in DD-MM-YYYY format");
    }
    if (input.slotDate && !isAllowedBookingDate(input.slotDate)) {
      throw AppError.badRequest("slotDate is only allowed for the next 3 days starting tomorrow");
    }

    return this._repo.listByInterviewer({
      interviewerId: input.interviewerId,
      companyId: input.companyId,
      slotDate: input.slotDate,
    });
  }
}

