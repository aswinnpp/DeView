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
  const [customStartTime, setCustomStartTime] = useState<string>("10:30");
  const [customEndTime, setCustomEndTime] = useState<string>("11:30");
  const [customSlotError, setCustomSlotError] = useState<string | null>(null);
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
  const gridSlotsSet = useMemo(() => new Set(slots), [slots]);
  const customSelected = useMemo(
    () => selected.filter((iso) => !gridSlotsSet.has(iso)),
    [selected, gridSlotsSet]
  );


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

  const addCustomSlot = () => {
    setCustomSlotError(null);
    try {
      if (!selectedDate) throw new Error("Select a date first.");
      if (!customStartTime || !customEndTime) {
        throw new Error("Start time and end time are required.");
      }

      const [sh, sm] = customStartTime.split(":").map((n) => parseInt(n, 10));
      const [eh, em] = customEndTime.split(":").map((n) => parseInt(n, 10));
      if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) {
        throw new Error("Invalid time format.");
      }

      const [yStr, mStr, dStr] = selectedDate.split("-");
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const d = parseInt(dStr, 10);
      if ([y, m, d].some((n) => Number.isNaN(n))) throw new Error("Invalid selected date.");

      const start = new Date(y, m - 1, d, sh, sm, 0, 0);
      const end = new Date(y, m - 1, d, eh, em, 0, 0);
      const durationMin = Math.round((end.getTime() - start.getTime()) / (60 * 1000));
      if (durationMin !== STEP_MINUTES) {
        throw new Error(`Custom slot duration must be exactly ${STEP_MINUTES} minutes.`);
      }
      if (!(end.getTime() > start.getTime())) {
        throw new Error("End time must be after start time.");
      }

      const startIso = start.toISOString();
      toggle(startIso);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not add custom slot.";
      setCustomSlotError(msg);
    }
  };

  return (
    <div className="px-3 sm:px-0">
      <h1 className="text-xl font-bold text-white mb-4">Book your availability</h1>
      <p className="text-slate-400 text-sm mb-6">
        Select the time slots when you are available for interviews.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-stretch min-h-0 md:min-h-[calc(100vh-300px)]">
        {/* Left: available slots */}
        <div className="md:w-1/2 md:flex-1">
          <div className="rounded-[10px] p-3 bg-[rgba(2,6,23,0.45)] border border-white/[0.04] h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:justify-between sm:items-center">
              <h3 className="font-extrabold text-white text-[15px] m-0">Available slots</h3>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-300">
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
                  className="w-full sm:w-auto"
                >
                  Select all
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  aria-label="Clear selection"
                  title="Clear selection"
                  className="w-full sm:w-auto"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-auto pr-1.5 flex-1"
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

            {/* Custom slot (non-grid) */}
            <div className="mt-3 rounded-lg border border-white/[0.06] bg-slate-900/20 p-3">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold text-white">Custom slot</div>
                <div className="flex flex-wrap gap-2 items-end">
                  <label className="text-xs text-slate-300 flex flex-col gap-1">
                    Start
                    <input
                      type="time"
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    />
                  </label>
                  <label className="text-xs text-slate-300 flex flex-col gap-1">
                    End
                    <input
                      type="time"
                      value={customEndTime}
                      onChange={(e) => setCustomEndTime(e.target.value)}
                      className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    />
                  </label>
                  <Button variant="primary" size="sm" onClick={addCustomSlot} className="w-full sm:w-auto">
                    Add
                  </Button>
                </div>
                {customSlotError ? (
                  <div className="text-xs text-rose-200">{customSlotError}</div>
                ) : null}
              </div>

              {customSelected.length > 0 ? (
                <div className="mt-3">
                  <div className="text-xs text-slate-400 mb-2">Selected custom slots</div>
                  <div className="flex flex-wrap gap-2">
                    {customSelected.map((iso) => (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => toggle(iso)}
                        className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-100 hover:bg-amber-500/20 cursor-pointer"
                        title="Remove custom slot"
                      >
                        {formatRange(iso)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="mt-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-wrap gap-3 items-center font-bold text-white">
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
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: submitted slots (after submit) */}
        <div className="md:w-1/2 md:flex-1">
          <div className="rounded-[10px] p-3 bg-[rgba(2,6,23,0.45)] border border-white/[0.04] h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
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
