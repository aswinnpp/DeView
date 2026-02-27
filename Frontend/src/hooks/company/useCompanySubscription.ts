import { useCallback, useEffect, useMemo, useState } from "react";
import type { SubscriptionPlan } from "../../services/adminSubscription.service";
import { companySubscriptionService } from "../../services/companySubscription.service";
import { extractApiError } from "../../api/axios";
import type { ICompanyProfileData } from "./useCompanyProfile";

type PaymentResult = {
  open: boolean;
  status: "success" | "failed";
  title: string;
  message?: string;
};

export function useCompanySubscription(opts?: {
  companyData?: ICompanyProfileData | null;
  fetchProfile?: (opts?: { page?: number; limit?: number }) => Promise<void>;
  onPaymentSucceeded?: () => void | Promise<void>;
}) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult>({
    open: false,
    status: "success",
    title: "",
  });

  const activePlans = useMemo(() => plans.filter((p) => p.isActive), [plans]);

  const SUBSCRIPTIONS_LIMIT = 3;
  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const [subscriptionActionLoadingId, setSubscriptionActionLoadingId] =
    useState<string | null>(null);
  const [subscriptionActionError, setSubscriptionActionError] =
    useState<string | null>(null);

  const formatDate = useCallback((value?: string | null) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  }, []);

  const activePlanId = opts?.companyData?.activeSubscription?.planId ?? null;

  const subscriptionRowsPage = opts?.companyData?.subscriptions?.items ?? [];
  const subscriptionsTotal = opts?.companyData?.subscriptions?.total ?? 0;
  const subscriptionsLimit =
    opts?.companyData?.subscriptions?.limit ?? SUBSCRIPTIONS_LIMIT;
  const subscriptionsTotalPages = Math.max(
    1,
    Math.ceil(subscriptionsTotal / subscriptionsLimit),
  );
  const canPrevSubscriptionsPage = subscriptionsPage > 1;
  const canNextSubscriptionsPage = subscriptionsPage < subscriptionsTotalPages;

  // initial + page changes fetch profile (backend pagination)
  useEffect(() => {
    if (!opts?.fetchProfile) return;
    void opts.fetchProfile({
      page: subscriptionsPage,
      limit: SUBSCRIPTIONS_LIMIT,
      silent: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts?.fetchProfile, subscriptionsPage]);

  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      setPlansError(null);
      const { data } = await companySubscriptionService.listActive();
      setPlans(data.data ?? []);
    } catch (err) {
      setPlansError(extractApiError(err));
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const openPlansModal = useCallback(() => setShowSubscriptionModal(true), []);
  const closePlansModal = useCallback(() => setShowSubscriptionModal(false), []);

  const startPaymentForPlan = useCallback(async (plan: SubscriptionPlan) => {
    try {
      setIsStartingPayment(true);
      setSelectedPlan(plan);

      const response = await companySubscriptionService.createPaymentIntent(plan.id);
      const secret = response.data.clientSecret;

      setClientSecret(secret);
      setIsCheckoutOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : extractApiError(err);
      setPaymentResult({
        open: true,
        status: "failed",
        title: "Failed to start payment",
        message,
      });
    } finally {
      setIsStartingPayment(false);
    }
  }, []);

  const activatePendingNow = useCallback(
    async (pendingId: string) => {
      try {
        setSubscriptionActionError(null);
        setSubscriptionActionLoadingId(pendingId);
        await companySubscriptionService.activatePendingNow(pendingId);
        if (opts?.fetchProfile) {
          await opts.fetchProfile({
            page: subscriptionsPage,
            limit: SUBSCRIPTIONS_LIMIT,
            silent: true,
          });
        }
      } catch (err) {
        setSubscriptionActionError(extractApiError(err));
      } finally {
        setSubscriptionActionLoadingId(null);
      }
    },
    [opts, subscriptionsPage],
  );

  const prevSubscriptionsPage = useCallback(() => {
    setSubscriptionsPage((p) => Math.max(1, p - 1));
  }, []);

  const nextSubscriptionsPage = useCallback(() => {
    setSubscriptionsPage((p) => Math.min(subscriptionsTotalPages, p + 1));
  }, [subscriptionsTotalPages]);

  return {
    // plan list + modal
    plans: activePlans,
    plansLoading,
    plansError,
    showSubscriptionModal,
    setShowSubscriptionModal,
    openPlansModal,
    closePlansModal,

    // payment flow
    selectedPlan,
    clientSecret,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isStartingPayment,
    paymentResult,
    setPaymentResult,
    startPaymentForPlan,
    refetchPlans: fetchPlans,

    // subscription table (backend pagination)
    formatDate,
    activePlanId,
    subscriptionRowsPage,
    subscriptionsPage,
    subscriptionsTotal,
    subscriptionsLimit,
    subscriptionsTotalPages,
    canPrevSubscriptionsPage,
    canNextSubscriptionsPage,
    prevSubscriptionsPage,
    nextSubscriptionsPage,
    subscriptionActionLoadingId,
    subscriptionActionError,
    activatePendingNow,
  };
}