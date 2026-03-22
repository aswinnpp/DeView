import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, extractApiError } from "../../api/axios";
import { API_ROUTES, APP_ROUTES } from "../../constants/routes";
import Button from "../../components/common/Button";

export default function OfferDocuSignConsentPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<{ url: string }>(
          API_ROUTES.PUBLIC.DOCUSIGN_CONSENT_URL
        );
        const url = data?.url;
        if (!url || cancelled) {
          if (!cancelled) {
            setStatus("error");
            setMessage("Consent URL was not returned. Check backend DocuSign env vars.");
          }
          return;
        }
        window.location.assign(url);
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setMessage(extractApiError(e));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e] px-4">
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-10 text-center max-w-md w-full">
          <p className="text-slate-300 m-0">Redirecting to DocuSign…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e] px-4">
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-10 text-center max-w-md w-full">
        <h1 className="text-lg font-semibold text-red-200 m-0 mb-2">
          Could not start DocuSign
        </h1>
        <p className="text-sm text-slate-400 m-0 mb-6">{message}</p>
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            className="w-full py-3 rounded-xl text-sm font-semibold"
            type="button"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
          <Link
            to={APP_ROUTES.OFFER_DOCUSIGN_SUCCESS}
            className="text-sm text-violet-300 hover:text-violet-200 font-medium"
          >
            Open success page (after consent)
          </Link>
        </div>
      </div>
    </div>
  );
}
