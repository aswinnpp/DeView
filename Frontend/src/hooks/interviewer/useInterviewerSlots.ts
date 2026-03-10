import { useCallback, useEffect, useMemo, useState } from "react";
import { extractApiError } from "../../api/axios";
import { interviewerSlotsService, type InterviewerSlotsDoc } from "../../services/interviewerSlots.service";

function toDDMMYYYYFromYYYYMMDD(s: string): string {
  const [yyyy, mm, dd] = s.split("-");
  return `${dd}-${mm}-${yyyy}`;
}

function toYYYYMMDDFromDDMMYYYY(s: string): string {
  const [dd, mm, yyyy] = s.split("-");
  return `${yyyy}-${mm}-${dd}`;
}

function toDDMMYYYYLocal(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

function isAllowedUiDate(yyyyMmDd: string): boolean {
  const today = startOfTodayLocal();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day2 = new Date(today);
  day2.setDate(day2.getDate() + 2);
  const day3 = new Date(today);
  day3.setDate(day3.getDate() + 3);
  const keyTomorrow = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(
    tomorrow.getDate(),
  ).padStart(2, "0")}`;
  const keyDay2 = `${day2.getFullYear()}-${String(day2.getMonth() + 1).padStart(2, "0")}-${String(
    day2.getDate(),
  ).padStart(2, "0")}`;
  const keyDay3 = `${day3.getFullYear()}-${String(day3.getMonth() + 1).padStart(2, "0")}-${String(
    day3.getDate(),
  ).padStart(2, "0")}`;
  return yyyyMmDd === keyTomorrow || yyyyMmDd === keyDay2 || yyyyMmDd === keyDay3;
}

export function useInterviewerSlots(selectedDateUi: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [submittedDoc, setSubmittedDoc] = useState<InterviewerSlotsDoc | null>(null);
  const slotDateApi = useMemo(() => toDDMMYYYYFromYYYYMMDD(selectedDateUi), [selectedDateUi]);

  const fetchForDate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAllowedUiDate(selectedDateUi)) {
        setSubmittedDoc(null);
        setAvailableTimes([]);
        setError("You can only book slots for the next 3 days starting tomorrow.");
        return;
      }

      const docs = await interviewerSlotsService.getMySlots({ slotDate: slotDateApi });
      const doc = docs?.[0] ?? null;
      setSubmittedDoc(doc);
      setAvailableTimes(doc?.times ?? []);
    } catch (e) {
      setError(extractApiError(e));
      setSubmittedDoc(null);
      setAvailableTimes([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDateUi, slotDateApi]);

  useEffect(() => {
    void fetchForDate();
  }, [fetchForDate]);

  const submit = useCallback(
    async (times: string[]) => {
      setIsSubmitting(true);
      setError(null);
      try {
        if (!isAllowedUiDate(selectedDateUi)) {
          throw new Error("You can only book slots for the next 3 days starting tomorrow.");
        }
        const doc = await interviewerSlotsService.upsertMySlots({
          slotDate: slotDateApi,
          times,
          booked: false,
        });
        setSubmittedDoc(doc);
        setAvailableTimes(doc.times ?? []);
        return doc;
      } catch (e) {
        const msg = extractApiError(e);
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedDateUi, slotDateApi],
  );

  const submittedSlotsGrouped = useMemo(() => {
    const map = new Map<string, string[]>();
    const list = submittedDoc?.times ?? [];
    [...list]
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .forEach((iso) => {
        const d = new Date(iso);
        const key = toDDMMYYYYLocal(d);
        const arr = map.get(key) ?? [];
        arr.push(iso);
        map.set(key, arr);
      });
    return [...map.entries()];
  }, [submittedDoc]);

  return {
    isLoading,
    isSubmitting,
    error,
    availableTimes,
    submittedDoc,
    submittedSlotsGrouped,
    refetch: fetchForDate,
    submit,
    setAvailableTimes,
    slotDateApi,
    toYYYYMMDDFromDDMMYYYY,
  };
}

