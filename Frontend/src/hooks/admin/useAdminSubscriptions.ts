import { useCallback, useEffect, useState } from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  adminSubscriptionService,
  type GetSubscriptionsParams,
  type SubscriptionPlan,
} from "../../services/adminSubscription.service";
import { extractApiError } from "../../api/axios";

const subscriptionSchema = z.object({
  name: z.string().trim().min(1, "Plan name is required"),
  price: z.coerce.number().nonnegative("Price must be a non-negative number"),
  duration: z.enum(["Monthly", "Quarterly", "Annual"]),
  isActive: z.boolean().default(true),
  interviewLimit: z.coerce.number().int().nonnegative("Interview limit must be >= 0"),
  interviewUnlimited: z.boolean(),
  jobPostLimit: z.coerce.number().int().nonnegative("Job post limit must be >= 0"),
  jobUnlimited: z.boolean(),
  hasAI: z.boolean(),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

const DEFAULT_SUBSCRIPTION_FORM_VALUES: SubscriptionFormValues = {
  name: "",
  price: 0,
  duration: "Monthly",
  interviewLimit: 0,
  interviewUnlimited: false,
  jobPostLimit: 0,
  jobUnlimited: false,
  hasAI: false,
  isActive: true,
};

export function useAdminSubscriptions(onSuccess?: () => void) {
  // List state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(2);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [status, setStatus] = useState<GetSubscriptionsParams["status"]>();
  const [duration, setDuration] = useState<GetSubscriptionsParams["duration"]>();

  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchPlans = useCallback(
    async (params: GetSubscriptionsParams) => {
      setListError(null);
      setInitialLoading(true);
      try {
        const { data } = await adminSubscriptionService.list({
          ...params,
          limit: params.limit ?? limit,
        });
        setPlans(data?.data ?? []);
        setTotal(data?.total ?? 0);
      } catch (err) {
        setListError(extractApiError(err));
      } finally {
        setInitialLoading(false);
      }
    },
    [limit]
  );

  const loadPage = useCallback(
    (p: number, overrides?: Partial<GetSubscriptionsParams>) => {
      const opts: GetSubscriptionsParams = {
        search: overrides?.search ?? (searchQuery || undefined),
        status: overrides?.status ?? status,
        duration: overrides?.duration ?? duration,
        sortOrder: overrides?.sortOrder ?? sortOrder,
        page: p,
        limit,
      };

      void fetchPlans(opts);
      setPage(p);
    },
    [duration, fetchPlans, limit, searchQuery, sortOrder, status]
  );

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial fetch only
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      loadPage(1, { search: query || undefined });
    },
    [loadPage]
  );

  const handleSortOrder = useCallback(
    (order: "asc" | "desc") => {
      setSortOrder(order);
      loadPage(1, { sortOrder: order });
    },
    [loadPage]
  );

  const setStatusFilter = useCallback(
    (value?: GetSubscriptionsParams["status"]) => {
      setStatus(value);
      loadPage(1, { status: value });
    },
    [loadPage]
  );

  const setDurationFilter = useCallback(
    (value?: GetSubscriptionsParams["duration"]) => {
      setDuration(value);
      loadPage(1, { duration: value });
    },
    [loadPage]
  );

  const goToPage = useCallback(
    (p: number) => {
      const totalPages = Math.ceil(total / limit) || 1;
      if (p < 1 || p > totalPages) return;
      loadPage(p);
    },
    [limit, loadPage, total]
  );

  const reload = useCallback(() => {
    loadPage(page);
  }, [loadPage, page]);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema) as Resolver<SubscriptionFormValues>,
    defaultValues: DEFAULT_SUBSCRIPTION_FORM_VALUES,
  });

  const onSubmit: SubmitHandler<SubscriptionFormValues> = async (values) => {
    setCreateError(null);
    setCreateLoading(true);
    try {
      if (editingId) {
        await adminSubscriptionService.update(editingId, values);
        setPlans((prev) =>
          prev.map((plan) =>
            plan.id === editingId ? { ...plan, ...values } : plan
          )
        );
      } else {
        await adminSubscriptionService.create(values);
        reload();
      }
      form.reset(DEFAULT_SUBSCRIPTION_FORM_VALUES);
      setEditingId(null);
      onSuccess?.();
    } catch (err) {
      setCreateError(extractApiError(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleSubscriptionStatus = useCallback(
    async (id: string) => {
      setActionLoading(true);
      try {
        const { data } = await adminSubscriptionService.toggleActive(id);
        const nextIsActive = data?.isActive;
        if (typeof nextIsActive === "boolean") {
          setPlans((prev) =>
            prev.map((plan) =>
              plan.id === id ? { ...plan, isActive: nextIsActive } : plan
            )
          );
        } else {
          // Fallback: refetch current page if response shape is unexpected
          reload();
        }
      } catch (err) {
        setListError(extractApiError(err));
      } finally {
        setActionLoading(false);
      }
    },
    [reload]
  );

  const startCreate = useCallback(() => {
    setEditingId(null);
    form.reset(DEFAULT_SUBSCRIPTION_FORM_VALUES);
    setCreateError(null);
  }, [form]);

  const startEdit = useCallback(
    (plan: SubscriptionPlan) => {
      setEditingId(plan.id);
      form.reset({
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
        interviewLimit: plan.interviewLimit,
        interviewUnlimited: plan.interviewUnlimited,
        jobPostLimit: plan.jobPostLimit,
        jobUnlimited: plan.jobUnlimited,
        hasAI: plan.hasAI,
        isActive: plan.isActive,
      });
      setCreateError(null);
    },
    [form]
  );

  const error = createError ?? listError;
  const isLoading = createLoading || initialLoading || actionLoading;
  const totalPages = Math.ceil(total / limit) || 1;
  const isEditing = editingId !== null;

  return {
    form,
    onSubmit,
    // combined list + create state
    plans,
    total,
    page,
    totalPages,
    sortOrder,
    status,
    duration,
    isLoading,
    error,
    handleSearch,
    handleSortOrder,
    setStatusFilter,
    setDurationFilter,
    goToPage,
    actionLoading,
    toggleSubscriptionStatus,
    startCreate,
    startEdit,
    isEditing,
  };
}

export default useAdminSubscriptions;

