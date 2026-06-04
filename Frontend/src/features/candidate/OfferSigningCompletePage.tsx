import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CandidateNavHeader from "./CandidateNavHeader";
import { candidateJobsService } from "../../services/candidateJobs.service";
import { APP_ROUTES } from "../../constants/routes";

export default function OfferSigningCompletePage() {
  const [searchParams] = useSearchParams();
  const offerMailId = searchParams.get("offerMailId")?.trim() ?? "";

  const [phase, setPhase] = useState<"loading" | "ok" | "err">("loading");

  useEffect(() => {
    if (!offerMailId) return;

    let cancelled = false;

    (async () => {
      try {
        await candidateJobsService.confirmOfferSigning(offerMailId);
        if (!cancelled) setPhase("ok");
      } catch {
        if (!cancelled) {
          setPhase("err");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [offerMailId]);

  if (!offerMailId) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-[rgb(15,15,25)] text-slate-100">
        <CandidateNavHeader title="SIGNING COMPLETE" currentPage="mails" />
        <main className="flex-1 px-6 py-10 sm:px-10 flex flex-col items-center justify-start">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h1 className="m-0 text-lg font-semibold text-amber-200">Missing offer</h1>
            <p className="mt-2 mb-6 text-sm text-slate-400 m-0">
              Return to your inbox and open the offer again.
            </p>
            <Link
              to={APP_ROUTES.CANDIDATE_MAILS}
              className="inline-flex w-full items-center justify-center rounded-xl border border-violet-500/50 bg-violet-600/20 py-3 text-sm font-semibold text-violet-200 hover:bg-violet-600/30 transition-colors"
            >
              Back to inbox
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[rgb(15,15,25)] text-slate-100">
      <CandidateNavHeader title="SIGNING COMPLETE" currentPage="mails" />
      <main className="flex-1 px-6 py-10 sm:px-10 flex flex-col items-center justify-start">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          {phase === "loading" ? (
            <p className="m-0 text-slate-300 text-sm">Confirming your signature…</p>
          ) : null}
          {phase === "ok" ? (
            <>
              <div className="text-4xl mb-3" aria-hidden>
                ✓
              </div>
              <h1 className="m-0 text-lg font-semibold text-emerald-300">Offer accepted</h1>
              <p className="mt-2 mb-6 text-sm text-slate-400 m-0">
                Your signed offer is on file. The employer will see your acceptance in their dashboard.
              </p>
              <Link
                to={APP_ROUTES.CANDIDATE_MAILS}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600/90 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                Back to inbox
              </Link>
            </>
          ) : null}
         
        </div>
      </main>
    </div>
  );
}
