import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { IInterviewerSlotsRepository } from "../ports/repository/IInterviewerSlotsRepository.js";
import type { IGetMyInterviewerSlotsUseCase } from "../ports/usecase/IGetMyInterviewerSlotsUseCase.js";

const DATE_RE = /^\d{2}-\d{2}-\d{4}$/;

function parseDDMMYYYY(s: string): Date | null {
  const [ddStr, mmStr, yyyyStr] = s.split("-");
  const dd = Number(ddStr);
  const mm = Number(mmStr);
  const yyyy = Number(yyyyStr);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
  // validate roll-over
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

function isAllowedBookingDate(slotDate: string): boolean {
  const d = parseDDMMYYYY(slotDate);
  if (!d) return false;
  const today = startOfTodayLocal();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day2 = new Date(today);
  day2.setDate(day2.getDate() + 2);
  const day3 = new Date(today);
  day3.setDate(day3.getDate() + 3);
  return (
    d.getTime() === tomorrow.getTime() ||
    d.getTime() === day2.getTime() ||
    d.getTime() === day3.getTime()
  );
}

@injectable()
export class GetMyInterviewerSlotsUseCase implements IGetMyInterviewerSlotsUseCase {
  constructor(
    @inject(TYPES.InterviewerSlotsRepositoryPort)
    private readonly repo: IInterviewerSlotsRepository,
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

    return this.repo.listByInterviewer({
      interviewerId: input.interviewerId,
      companyId: input.companyId,
      slotDate: input.slotDate,
    });
  }
}

