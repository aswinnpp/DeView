import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { IInterviewerSlotsRepository } from "../ports/repository/IInterviewerSlotsRepository.js";
import type { IUpsertMyInterviewerSlotsUseCase } from "../ports/usecase/IUpsertMyInterviewerSlotsUseCase.js";
import { isAllowedBookingDate ,DATE_RE ,isValidIsoDateTime ,toLocalDateKeyDDMMYYYY } from "../../shared/utils/parseDate.js";






@injectable()
export class UpsertMyInterviewerSlotsUseCase implements IUpsertMyInterviewerSlotsUseCase {
  constructor(
    @inject(TYPES.InterviewerSlotsRepositoryPort)
    private readonly _repo: IInterviewerSlotsRepository,
  ) {}

  async execute(input: {
    interviewerId: string;
    companyId: string;
    slotDate: string;
    times: string[];
    booked?: boolean;
  }) {
    if (!input.interviewerId) throw AppError.badRequest("interviewerId is required");
    if (!input.companyId) throw AppError.badRequest("companyId is required");
    if (!input.slotDate || !DATE_RE.test(input.slotDate)) {
      throw AppError.badRequest("slotDate must be in DD-MM-YYYY format");
    }
    if (!isAllowedBookingDate(input.slotDate)) {
      throw AppError.badRequest("slotDate is only allowed for the next 3 days starting tomorrow");
    }
    if (!Array.isArray(input.times) || input.times.length === 0) {
      throw AppError.badRequest("times must be a non-empty array");
    }

    const uniqueTimes = Array.from(new Set(input.times));
    if (uniqueTimes.length !== input.times.length) {
      throw AppError.badRequest("times contains duplicates");
    }

    const now = Date.now();
    for (const t of uniqueTimes) {
      if (!isValidIsoDateTime(t)) {
        throw AppError.badRequest("times must contain ISO datetime strings (toISOString)");
      }
      const dt = new Date(t);
      if (dt.getTime() < now) {
        throw AppError.badRequest("Cannot save past time slots");
      }
      const localKey = toLocalDateKeyDDMMYYYY(dt);
      if (localKey !== input.slotDate) {
        throw AppError.badRequest("already selected dates includes");
      }
    }

    return this._repo.upsertForInterviewerDate({
      interviewerId: input.interviewerId,
      companyId: input.companyId,
      slotDate: input.slotDate,
      times: uniqueTimes,
      booked: input.booked ?? false,
    });
  }
}

