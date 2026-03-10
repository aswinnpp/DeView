import Button from "../../components/common/Button";

export default function OfferLettersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-slate-50 m-0">Offer Letters</h1>
          <p className="text-slate-400 text-sm mt-2 mb-0">
            View and manage offer letters sent to candidates.
          </p>
        </div>
        <Button variant="secondary" className="bg-slate-800 border-slate-700 text-slate-200">
          Refresh
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div className="text-slate-300 font-semibold">No offer letters yet</div>
        <div className="text-slate-400 text-sm mt-1">
          Offer letters will appear here after you send them from the Applications workflow.
        </div>
      </div>
    </div>
  );
}

