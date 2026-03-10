import React, { useMemo, useState } from "react";
import Button from "@/components/common/Button";
import SlotCard from "../../components/slots/SlotCard";
import { useInterviewerSlots } from "../../hooks/interviewer/useInterviewerSlots";

const STEP_MINUTES = 60;

function toDateInputValue(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalDateKey(iso: string): string {
  const d = new Date(iso);
  return toDateInputValue(d);
}

function toDDMMYYYYFromYYYYMMDD(s: string): string {
  const [yyyy, mm, dd] = s.split("-");
  if (!yyyy || !mm || !dd) return s;
  return `${dd}-${mm}-${yyyy}`;
}

function toDDMMYYYYLocalFromIso(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function buildSlotsForDate(dateKey: string, stepMinutes: number): string[] {
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  const base = new Date(y, (m ?? 1) - 1, d ?? 1, 9, 0, 0, 0);
  const slots: string[] = [];
  for (let i = 0; i < 10; i++) {
    const slot = new Date(base);
    slot.setMinutes(slot.getMinutes() + i * stepMinutes);
    slots.push(slot.toISOString());
  }
  return slots;
}

const SlotBookingPage: React.FC = () => {
  // local edits (before submit)
  const [selected, setSelected] = useState<string[]>([]);
  const today = useMemo(() => new Date(), []);
  const tomorrowUi = useMemo(() => {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return toDateInputValue(t);
  }, [today]);
  const day3Ui = useMemo(() => {
    const t = new Date(today);
    t.setDate(t.getDate() + 3);
    return toDateInputValue(t);
  }, [today]);

  const [selectedDate, setSelectedDate] = useState<string>(() => tomorrowUi);
  const { isLoading, isSubmitting, error, submittedDoc, submittedSlotsGrouped, submit, availableTimes } =
    useInterviewerSlots(selectedDate);

  const slots = useMemo(() => buildSlotsForDate(selectedDate, STEP_MINUTES), [selectedDate]);
  const effectiveSelected = selected.length ? selected : (availableTimes ?? []);


  const toggle = (slotIso: string) => {
    const base = effectiveSelected;
    const baseSet = new Set(base);
    const next = baseSet.has(slotIso) ? base.filter((s) => s !== slotIso) : [...base, slotIso];
    setSelected(next);
  };

  const clear = () => setSelected([]);
  const visibleSlots = useMemo(
    () => slots.filter((s) => getLocalDateKey(s) === selectedDate),
    [slots, selectedDate],
  );
  const selectAll = () => {
    const visibleSet = new Set(visibleSlots);
    const kept = selected.filter((s) => !visibleSet.has(s));
    setSelected([...kept, ...visibleSlots]);
  };

  const formatRange = (slotIso: string) => {
    const start = new Date(slotIso);
    const end = new Date(start.getTime() + STEP_MINUTES * 60 * 1000);
    const startLabel = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const endLabel = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${startLabel} – ${endLabel}`;
  };

  const totalMinutes = effectiveSelected.length * STEP_MINUTES;

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-4">Book your availability</h1>
      <p className="text-slate-400 text-sm mb-6">
        Select the time slots when you are available for interviews.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-stretch min-h-[calc(100vh-300px)]">
        {/* Left: available slots */}
        <div className="md:w-1/2 md:flex-1">
          <div className="rounded-[10px] p-3 bg-[rgba(2,6,23,0.45)] border border-white/[0.04] h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:justify-between sm:items-center">
              <h3 className="font-extrabold text-white text-[15px] m-0">Available slots</h3>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-slate-400">Date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={tomorrowUi}
                    max={day3Ui}
                    className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  />
                </label>
                <div className="text-xs text-slate-400 sm:ml-1">
                  Selected: <span className="text-slate-200">{toDDMMYYYYFromYYYYMMDD(selectedDate)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  aria-label="Select all slots"
                  title="Select all"
                >
                  Select all
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  aria-label="Clear selection"
                  title="Clear selection"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Grid */}
            <div
              className="grid grid-cols-2 gap-2.5 overflow-auto pr-1.5 flex-1"
              role="list"
              aria-label="Available time slots"
            >
              {isLoading && (
                <div className="col-span-full py-3 text-center text-gray-400">Loading...</div>
              )}
              {visibleSlots.length === 0 && (
                <div className="col-span-full py-3 text-center text-gray-400">
                  No slots available for {toDDMMYYYYFromYYYYMMDD(selectedDate)}
                </div>
              )}
              {!isLoading &&
                visibleSlots.map((slotIso) => (
                  <SlotCard
                    key={slotIso}
                    slotIso={slotIso}
                    label={formatRange(slotIso)}
                    dateLabel={toDDMMYYYYLocalFromIso(slotIso)}
                    isSelected={effectiveSelected.includes(slotIso)}
                    onToggle={() => toggle(slotIso)}
                    stepMinutes={STEP_MINUTES}
                  />
                ))}
            </div>

            {/* Footer */}
            <div className="mt-2.5 flex justify-between items-center">
              <div className="flex gap-3 items-center font-bold text-white">
                <span>{effectiveSelected.length} selected</span>
                <span className="text-gray-400 font-semibold text-[13px]">{totalMinutes} minutes total</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={effectiveSelected.length === 0 || isSubmitting}
                onClick={async () => {
                  await submit(effectiveSelected);
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: submitted slots (after submit) */}
        <div className="md:w-1/2 md:flex-1">
          <div className="rounded-[10px] p-3 bg-[rgba(2,6,23,0.45)] border border-white/[0.04] h-full flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="m-0 text-white font-semibold">Submitted slots</h3>
              {submittedDoc?.slotDate && (
                <span className="text-xs text-slate-400">
                  Interview booked date: <span className="text-slate-200">{submittedDoc.slotDate}</span>
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto pr-1.5">
              {!submittedDoc || (submittedDoc.times?.length ?? 0) === 0 ? (
                <div className="mt-2 text-sm text-slate-400">No slots submitted yet.</div>
              ) : (
                <div className="mt-2 space-y-3">
                  {submittedSlotsGrouped.map(([dateKey, isos]) => (
                    <div key={dateKey} className="rounded-lg border border-white/[0.06] bg-slate-900/30">
                      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-200">Booked date: {dateKey}</div>
                        <div className="text-xs text-slate-400">{isos.length} slot(s)</div>
                      </div>
                      <ul className="p-3 space-y-2">
                        {isos.map((iso) => (
                          <li key={iso} className="flex items-center justify-between gap-3">
                            <div className="text-sm text-white">{formatRange(iso)}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotBookingPage;
