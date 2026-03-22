import { useEffect, useState } from "react";

type Props = {
  loadPdf: () => Promise<Blob>;
  title?: string;
};

export function SignedOfferPdfPanel({
  loadPdf,
  title = "Signed offer (DocuSign)",
}: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let created: string | null = null;

    (async () => {
      setLoading(true);
      setError(null);
      setObjectUrl(null);
      try {
        const blob = await loadPdf();
        if (!alive) return;
        created = URL.createObjectURL(blob);
        setObjectUrl(created);
      } catch {
        if (alive) setError("Could not load the signed PDF.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [loadPdf]);

  if (loading) {
    return <p className="text-slate-400 text-sm m-0">Loading signed PDF…</p>;
  }
  if (error) {
    return <p className="text-red-300 text-sm m-0">{error}</p>;
  }
  if (!objectUrl) return null;

  const openPdf = () => {
    window.open(objectUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-xl border border-slate-600/60 bg-slate-950/40 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-slate-700/80">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide min-w-0 truncate">
          {title}
        </div>
        <button
          type="button"
          onClick={openPdf}
          className="shrink-0 rounded-lg border border-slate-500/50 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:border-slate-400/60"
        >
          View
        </button>
      </div>
      <div className="px-4 py-4 text-center text-sm text-slate-500">
        Click <span className="text-slate-400 font-medium">View</span> to open the signed PDF in a new tab.
      </div>
    </div>
  );
}
