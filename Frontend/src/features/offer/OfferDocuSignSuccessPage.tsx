import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../context/store";
import { APP_ROUTES } from "../../constants/routes";

export default function OfferDocuSignSuccessPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const user = useSelector((s: RootState) => s.auth.user);
  const role = (user?.role ?? "").toLowerCase();

  const offerLettersPath =
    role === "company"
      ? APP_ROUTES.OFFER_LETTERS("company")
      : role === "hr"
        ? APP_ROUTES.OFFER_LETTERS("hr")
        : null;

  const primaryBtn =
    "inline-flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors";
  const secondaryBtn =
    "inline-flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800/80 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e] px-4">
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-10 text-center max-w-md w-full">
        <div className="text-5xl mb-4" aria-hidden>
          ✓
        </div>
        <h1 className="text-xl font-semibold text-slate-50 m-0 mb-2">
          DocuSign connected
        </h1>
        <p className="text-sm text-slate-400 m-0 mb-6 leading-relaxed">
          {code
            ? "Authorization was returned to this app. Your integration can now request access tokens with JWT (until consent is revoked)."
            : "You reached the offer success URL. If you just finished DocuSign consent, your server can request JWT access tokens next."}
        </p>
        <div className="flex flex-col gap-3">
          {offerLettersPath ? (
            <Link to={offerLettersPath} className={primaryBtn}>
              Back to offer letters
            </Link>
          ) : null}
          <Link to={APP_ROUTES.ROOT} className={secondaryBtn}>
            Home
          </Link>
          {!user ? (
            <Link
              to={APP_ROUTES.LOGIN}
              className="text-sm text-violet-300 hover:text-violet-200 font-medium"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
