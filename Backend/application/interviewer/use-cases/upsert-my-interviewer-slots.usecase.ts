import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { IInterviewerSlotsRepository } from "../ports/repository/IInterviewerSlotsRepository.js";
import type { IUpsertMyInterviewerSlotsUseCase } from "../ports/usecase/IUpsertMyInterviewerSlotsUseCase.js";

const DATE_RE = /^\d{2}-\d{2}-\d{4}$/;

function parseDDMMYYYY(s: string): Date | null {
  const [ddStr, mmStr, yyyyStr] = s.split("-");
  const dd = Number(ddStr);
  const mm = Number(mmStr);
  const yyyy = Number(yyyyStr);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
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

function isValidIsoDateTime(s: string): boolean {
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && d.toISOString() === s;
}

function toLocalDateKeyDDMMYYYY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

@injectable()
export class UpsertMyInterviewerSlotsUseCase implements IUpsertMyInterviewerSlotsUseCase {
  constructor(
    @inject(TYPES.InterviewerSlotsRepositoryPort)
    private readonly repo: IInterviewerSlotsRepository,
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
        throw AppError.badRequest("All times must match slotDate");
      }
    }

    return this.repo.upsertForInterviewerDate({
      interviewerId: input.interviewerId,
      companyId: input.companyId,
      slotDate: input.slotDate,
      times: uniqueTimes,
      booked: input.booked ?? false,
    });
  }
}

