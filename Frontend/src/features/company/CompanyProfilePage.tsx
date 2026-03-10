import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../stripe";
import type { SubscriptionPlan } from "../../services/adminSubscription.service";
import type { ICompanySubscriptionView } from "../../hooks/company/useCompanyProfile";
import { useCompanyProfile, useCompanySubscription } from "../../hooks/company";
import { Button, Input, Table, Pagination } from "../../components/common";

type PaymentResult = {
    open: boolean;
    status: "success" | "failed";
    title: string;
    message?: string;
};
const CompanyPaymentCheckout: React.FC<{
    clientSecret: string;
    selectedPlan: SubscriptionPlan | null;
    onClose: () => void;
    onSuccess: (message: string) => Promise<void> | void;
  }> = ({ clientSecret, selectedPlan, onClose, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isConfirming, setIsConfirming] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
    const handleConfirm = async () => {
      if (!stripe || !elements) return;

      setIsConfirming(true);
      setErrorMessage(null);

      // Required for PaymentElement when using deferred/payment methods (e.g. UPI, wallets)
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "Unable to submit payment details");
        setIsConfirming(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: "if_required",
      });
  
      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setIsConfirming(false);
        return;
      }
  
      const status = paymentIntent?.status;

      // For UPI and some wallets Stripe can return "processing" first; treat it as accepted
      if (status === "succeeded" || status === "processing") {
        await onSuccess(
          status === "processing"
            ? "Payment is processing. Your plan will be activated shortly."
            : "Your plan will be activated shortly.",
        );
        onClose();
        setIsConfirming(false);
        return;
      }

      setErrorMessage(
        `Payment not completed${
          status ? ` (status: ${status})` : ""
        }`,
      );
      setIsConfirming(false);
    };
  
    // Custom dark appearance for Stripe PaymentElement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentElementOptions: any = {
      layout: "tabs",
      appearance: {
        theme: "night",
        variables: {
          colorPrimary: "#22c55e",
          colorBackground: "#020617",
          colorText: "#e5e7eb",
          colorTextSecondary: "#9ca3af",
          colorDanger: "#f97373",
          borderRadius: "12px",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
        },
      },
    };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl max-w-2xl w-full shadow-2xl shadow-black/70 border border-slate-700/80 overflow-hidden">
        <div className="px-8 pt-7 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              {/* icon */}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-50">Complete payment</h3>
              <p className="text-slate-400 text-sm mt-0.5">
                Choose a payment method (Card / UPI)
              </p>
            </div>
          </div>
          {selectedPlan && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-900/80 px-4 py-3 border border-slate-700/80">
              <span className="text-slate-300 text-sm font-medium">{selectedPlan.name}</span>
              <span className="text-emerald-400 font-bold">₹{selectedPlan.price}</span>
            </div>
          )}
        </div>
  
      <div className="px-8 py-6 bg-slate-950/60">
          {errorMessage && (
            <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-300 text-sm">
              <span>{errorMessage}</span>
            </div>
          )}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 mb-4 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/25 transition-all">
            <PaymentElement options={paymentElementOptions} />
          </div>
          <p className="mt-3 text-slate-500 text-xs">
            Your payment details are secured by Stripe and never stored on our servers.
          </p>
        </div>
  
      <div className="px-8 pb-6 pt-3 flex gap-3 justify-end border-t border-slate-800/80 bg-slate-950/80">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="bg-slate-800/80 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:text-slate-100 hover:border-slate-500 py-2.5 px-5 rounded-xl text-sm font-semibold transition"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none py-2.5 px-6 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30 hover:opacity-95 disabled:opacity-50 disabled:shadow-none transition"
          >
            {isConfirming ? "Processing…" : "Pay now"}
          </Button>
        </div>
      </div>
    );
  };

const CompanyProfilePage = () => {
    const {
        companyData,
        formData,
        setFormData,
        isEditing,
        setIsEditing,
        isLoading,
        error,
        isSaving,
        updateProfile,
        handleLogout,
        fetchProfile,
    } = useCompanyProfile();

    const {
        plans: subscription,
        selectedPlan,
        isStartingPayment,
        startPaymentForPlan: handleChoosePlan,
        clientSecret,
        // subscription table
        subscriptionRowsPage,
        subscriptionsPage,
        subscriptionsTotalPages,
        prevSubscriptionsPage,
        nextSubscriptionsPage,
        subscriptionActionLoadingId,
        activatePendingNow,
        formatDate,
        activePlanId,
    } = useCompanySubscription({
        onPaymentSucceeded: async () => {
            // Webhook runs async; retry profile fetch so pending subscription appears in table
            for (let i = 0; i < 4; i++) {
                await fetchProfile({ page: 1, limit: 8, silent: i > 0 });
                if (i < 3) await new Promise((r) => setTimeout(r, 1000));
            }
        },
        companyData,
        fetchProfile,
    });

    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [paymentResult, setPaymentResult] = useState<PaymentResult>({
        open: false,
        status: "success",
        title: "",
    });
    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
        } catch (err) {
            alert(err || 'Failed to update profile');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (companyData) {
            setFormData(companyData);
        }
    };

    const [confirmActivateId, setConfirmActivateId] = useState<string | null>(null);
    const confirmActivateSub =
        subscriptionRowsPage.find((s) => s.id === confirmActivateId) ?? null;

    // handleChoosePlan + handleConfirmPayment moved to useCompanySubscription

    if (isLoading) {
        return (
            <div className="p-8 text-center text-slate-400">
                Loading company profile...
            </div>
        );
    }

    if (error || !companyData) {
        return (
            <div className="p-8 text-center text-red-500">
                {error || 'Company profile not found'}
            </div>
        );
    }

    const inputClassName = "w-full py-2.5 px-3 bg-slate-900 border border-slate-600 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
    const labelClassName = "block mb-2 text-slate-400 text-[13px] font-semibold";
    const wrapperClassName = "";

    const totalSubscriptionRows = companyData.subscriptions?.total ?? 0;

    const subscriptionColumns: {
        header: string;
        render: (sub: ICompanySubscriptionView) => React.ReactNode;
    }[] = [
        {
            header: "Plan",
            render: (sub) => (
                <span className="text-slate-100 font-semibold">{sub.planName}</span>
            ),
        },
        {
            header: "Price",
            render: (sub) => (
                <span className="text-emerald-300 font-semibold">₹{sub.price}</span>
            ),
        },
        {
            header: "Duration",
            render: (sub) => (
                <span className="text-slate-200">{sub.duration}</span>
            ),
        },
        {
            header: "Start",
            render: (sub) => (
                <span className="text-slate-300">{formatDate(sub.startAt)}</span>
            ),
        },
        {
            header: "Expiry",
            render: (sub) => (
                <span className="text-slate-300">{formatDate(sub.endsAt)}</span>
            ),
        },
        {
            header: "Status",
            render: (sub) =>
                sub.status === "Active" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-200 border border-emerald-500/20">
                        Active
                    </span>
                ) : sub.status === "Pending" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-200 border border-amber-500/20">
                        Pending
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-200 border border-red-500/20">
                        Expired
                    </span>
                ),
        },
        {
            header: "Action",
            render: (sub) =>
                sub.status === "Active" ? (
                    <span className="text-slate-400 text-xs">Current plan</span>
                ) : sub.status === "Pending" ? (
                    <Button
                        type="button"
                        disabled={subscriptionActionLoadingId === sub.id}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none px-3 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-60"
                        onClick={() => {
                            setConfirmActivateId(sub.id);
                        }}
                    >
                        {subscriptionActionLoadingId === sub.id ? "Activating..." : "Activate Now"}
                    </Button>
                ) : (
                    <span className="text-slate-400">—</span>
                ),
        },
    ];

    return (
        <div className="text-slate-200 font-['Inter',sans-serif] pb-[60px] max-md:pb-12 p-0">
            {/* Header */}
            <header className="mb-6 max-md:mb-4">
                <div className="flex flex-wrap justify-between items-end gap-4 max-md:flex-col max-md:items-start">
                    <div className="min-w-0 flex-1">
                       
                    </div>
                    <div className="flex gap-3 max-md:w-full max-md:flex-col">
                        {!isEditing && (
                            <>
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none py-3 px-6 max-md:w-full max-md:py-2.5 max-md:text-sm rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleLogout}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white border-none py-3 px-6 max-md:w-full max-md:py-2.5 max-md:text-sm rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5"
                                >
                                    Logout
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Profile Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl max-md:rounded-xl p-8 max-md:p-5">
                {/* Company Header with Avatar */}
                <div className="flex items-start gap-6 max-md:gap-4 mb-8 max-md:mb-6 max-md:flex-col">
                    {/* Avatar */}
                    <div className="w-[120px] h-[120px] max-md:w-20 max-md:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-5xl max-md:text-4xl font-bold text-white shrink-0 shadow-[0_8px_24px_rgba(99,102,241,0.3)]">
                        {companyData.companyName.charAt(0)}
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="m-0 mb-2 max-md:mb-1.5 text-[28px] max-md:text-xl font-bold text-slate-50 truncate">
                            {companyData.companyName}
                        </h3>
                        <p className="m-0 mb-4 max-md:mb-3 text-slate-400 text-sm max-md:text-xs break-all">
                            {companyData.contactEmail}
                        </p>

                        {/* Status Badges */}
                        <div className="flex gap-3 items-center flex-wrap">
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-slate-500 font-semibold uppercase">PLAN</span>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowSubscriptionModal(true)}
                                        className="py-1 px-3 rounded-md text-[13px] font-semibold bg-blue-500/20 text-blue-100 inline-flex items-center gap-2 hover:bg-blue-500/30 transition"
                                    >
                                        <span>
                                            {companyData.activeSubscription
                                                ? companyData.activeSubscription.planName
                                                : "No active plan"}
                                        </span>
                                        {companyData.activeSubscription && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                                                Active
                                            </span>
                                        )}
                                    </button>
                                    <Button
                                        onClick={() => setShowSubscriptionModal(true)}
                                        className="py-1 px-3 rounded-md text-xs font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white border-none transition-all duration-200 hover:-translate-y-0.5"
                                    >
                                        Upgrade
                                    </Button>
                                </div>
                                {companyData.activeSubscription?.endsAt && (
                                    <div className="text-[11px] text-slate-400">
                                        Valid until {formatDate(companyData.activeSubscription.endsAt)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Details Grid */}
                {!isEditing ? (
                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-md:gap-4">
                        {/* Location */}
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase">
                                Location
                            </label>
                            <div className="text-slate-200 text-[15px]">{companyData.location || 'Not specified'}</div>
                        </div>

                        {/* Website */}
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase">
                                Website
                            </label>
                            {companyData.website ? (
                                <a
                                    href={companyData.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 text-[15px] no-underline"
                                >
                                    {companyData.website}
                                </a>
                            ) : (
                                <div className="text-slate-200 text-[15px]">Not provided</div>
                            )}
                        </div>

                        {/* Contact Phone */}
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase">
                                Contact Phone
                            </label>
                            <div className="text-slate-200 text-[15px]">{companyData.contactPhone}</div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase">
                                Address
                            </label>
                            <div className="text-slate-200 text-[15px]">{companyData.address}</div>
                        </div>

                        {/* Tax ID */}
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase">
                                Tax ID
                            </label>
                            <div className="text-slate-200 text-[15px]">{companyData.taxId}</div>
                        </div>

                        {/* Employees */}
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase">
                                Number of Employees
                            </label>
                            <div className="text-slate-200 text-[15px]">{companyData.numberOfEmployees}</div>
                        </div>

                        {/* Founded */}
                        {companyData.founded && (
                            <div>
                                <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase">
                                    Founded
                                </label>
                                <div className="text-slate-200 text-[15px]">{companyData.founded}</div>
                            </div>
                        )}

                        {/* Description - Full Width */}
                        {companyData.description && (
                            <div className="col-span-2 max-md:col-span-1">
                                <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase">
                                    Description
                                </label>
                                <div className="text-slate-200 text-[15px] max-md:text-sm leading-relaxed break-words">{companyData.description}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSave}>
                        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5 max-md:gap-4">
                            <Input
                                label="Company Name"
                                type="text"
                                value={formData.companyName || ''}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                required
                                className={inputClassName}
                                labelClassName={labelClassName}
                                wrapperClassName={wrapperClassName}
                            />

                            <Input
                                label="Location"
                                type="text"
                                value={formData.location || ''}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                                className={inputClassName}
                                labelClassName={labelClassName}
                                wrapperClassName={wrapperClassName}
                            />

                            <Input
                                label="Website"
                                type="text"
                                value={formData.website || ''}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://"
                                required
                                className={inputClassName}
                                labelClassName={labelClassName}
                                wrapperClassName={wrapperClassName}
                            />

                            <Input
                                label="Contact Phone"
                                type="text"
                                value={formData.contactPhone || ''}
                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                required
                                className={inputClassName}
                                labelClassName={labelClassName}
                                wrapperClassName={wrapperClassName}
                            />

                            <Input
                                label="Contact Email"
                                type="email"
                                value={formData.contactEmail || ''}
                                disabled
                                className={`${inputClassName} opacity-70 cursor-not-allowed`}
                                labelClassName={labelClassName}
                                wrapperClassName={wrapperClassName}
                            />

                            <Input
                                label="Contact Person"
                                type="text"
                                value={formData.contactPerson || ''}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                required
                                className={inputClassName}
                                labelClassName={labelClassName}
                                wrapperClassName={wrapperClassName}
                            />

                            {/* Address: label left on desktop, above on mobile */}
                            <div className="hidden md:flex md:items-center">
                                <span className={labelClassName}>Address</span>
                            </div>
                            <div className="md:col-start-2">
                                <Input
                                    label="Address"
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    className={inputClassName}
                                    labelClassName={`${labelClassName} md:hidden`}
                                    wrapperClassName={wrapperClassName}
                                />
                            </div>

                            {/* Number of Employees: label left on desktop, above on mobile */}
                            <div className="hidden md:flex md:items-center">
                                <span className={labelClassName}>Number of Employees</span>
                            </div>
                            <div className="md:col-start-2">
                                <label className={`${labelClassName} md:hidden`}>Number of Employees</label>
                                <select
                                    value={formData.numberOfEmployees || ''}
                                    onChange={(e) => setFormData({ ...formData, numberOfEmployees: e.target.value })}
                                    required
                                    className={inputClassName}
                                >
                                    <option value="">Select range</option>
                                    <option value="1-10">1-10</option>
                                    <option value="10-50">10-50</option>
                                    <option value="50-100">50-100</option>
                                    <option value="100+">100+</option>
                                </select>
                            </div>

                            {/* Tax ID: label left on desktop, above on mobile */}
                            <div className="hidden md:flex md:items-center">
                                <span className={labelClassName}>Tax ID</span>
                            </div>
                            <div className="md:col-start-2">
                                <Input
                                    label="Tax ID"
                                    type="text"
                                    value={formData.taxId || ''}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    required
                                    className={inputClassName}
                                    labelClassName={`${labelClassName} md:hidden`}
                                    wrapperClassName={wrapperClassName}
                                />
                            </div>

                        </div>

                        <div className="flex flex-wrap gap-3 max-md:gap-2 mt-6 max-md:mt-4 justify-end max-md:justify-stretch">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleCancel}
                                className="bg-transparent text-slate-400 border border-slate-600 py-2.5 px-6 max-md:w-full rounded-lg text-sm font-semibold hover:bg-white/5 hover:border-slate-500"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none py-2.5 px-6 max-md:w-full rounded-lg text-sm font-semibold disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Subscriptions (single table: pending first, then history) */}
            <div className="mt-8">
                   

                    {totalSubscriptionRows > 0 ? (
                        <>
                            <Table<ICompanySubscriptionView>
                                columns={subscriptionColumns}
                                data={subscriptionRowsPage}
                                rowKey={(sub) => sub.id}
                                emptyMessage=""
                            />

                            {subscriptionsTotalPages > 1 && (
                                <Pagination
                                    page={subscriptionsPage}
                                    totalPages={subscriptionsTotalPages}
                                    onPageChange={(page) => {
                                        if (page < subscriptionsPage) prevSubscriptionsPage();
                                        if (page > subscriptionsPage) nextSubscriptionsPage();
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <div className="px-6 py-6 text-sm text-slate-400">
                            No pending or past subscriptions.
                        </div>
                    )}
                
            </div>

            {/* Subscription Modal */}
            {showSubscriptionModal && (
                <div
                    className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-4 max-md:p-2"
                    onClick={() => setShowSubscriptionModal(false)}
                >
                    <div
                        className="bg-slate-900 rounded-2xl max-md:rounded-xl max-w-[1000px] w-full max-md:max-w-[calc(100vw-1rem)] max-h-[90vh] overflow-auto border border-slate-700 p-8 max-md:p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-8 max-md:mb-6">
                            <div className="min-w-0 flex-1">
                                <h2 className="m-0 text-slate-50 text-[28px] max-md:text-xl font-bold">Choose Your Plan</h2>
                                <p className="mt-2 mb-0 text-slate-400 text-sm max-md:text-xs">
                                    Select the perfect plan for your hiring needs
                                </p>
                                {companyData.activeSubscription && (
                                    <div className="mt-3 inline-flex flex-wrap items-center gap-2 text-xs">
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 font-semibold">
                                            Current: {companyData.activeSubscription.planName}
                                        </span>
                                        <span className="text-slate-400">
                                            Valid until {formatDate(companyData.activeSubscription.endsAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={() => setShowSubscriptionModal(false)}
                                variant="secondary"
                                className="bg-none border-none text-slate-400 text-[32px] max-md:text-2xl p-0 w-10 h-10 max-md:w-8 max-md:h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-slate-800 hover:text-slate-50 shrink-0 ml-2"
                            >
                                ×
                            </Button>
                        </div>

                       {/* Subscription Plans */}
                    {/* Subscription Plans */}
                        <div className="grid gap-6 max-md:gap-5 max-md:grid-cols-1 grid-cols-3">
                        {subscription
                            ?.filter((plan) => plan.isActive)
                            .map((plan, index) => {
                            const isCurrentPlan = !!activePlanId && plan.id === activePlanId;

                            return (
                                <div
                                key={plan.id || index}
                                className={`relative rounded-2xl border p-7 max-md:p-6 min-h-[260px] ${
                                    isCurrentPlan
                                        ? "border-emerald-500/60 bg-slate-900/80 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                                        : "border-slate-700 bg-slate-900/70"
                                }`}
                                >
                                {isCurrentPlan && (
                                    <span className="absolute top-4 right-4 z-10 bg-emerald-500/20 text-emerald-200 text-[11px] px-3 py-1 rounded-full tracking-wide uppercase border border-emerald-500/30">
                                        Current plan
                                    </span>
                                )}

                                {/* Plan Name */}
                                <h3 className="text-lg font-semibold text-slate-50 mb-1.5">
                                    {plan.name}
                                </h3>

                                {/* Duration badge */}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-200 mb-4">
                                    {plan.duration}
                                </span>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-emerald-400">
                                    ₹{plan.price}
                                    </span>
                                    <span className="text-slate-400 text-sm ml-1">/ {plan.duration}</span>
                                </div>

                                {/* Features */}
                                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-2">
                                    Benefits
                                </div>
                                <ul className="space-y-2.5 mb-7 text-sm text-slate-200">
                                    {/* Interview Feature */}
                                    <li className="flex items-center">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                                    {plan.interviewUnlimited
                                        ? "Unlimited Interviews"
                                        : `${plan.interviewLimit} Interviews`}
                                    </li>

                                    {/* Job Posting Feature */}
                                    <li className="flex items-center">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-3"></span>
                                    {plan.jobUnlimited
                                        ? "Unlimited Job Posts"
                                        : `${plan.jobPostLimit} Job Posts`}
                                    </li>

                                    {/* AI Feature */}
                                    <li className="flex items-center">
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full mr-3 ${
                                        plan.hasAI ? "bg-violet-400" : "bg-slate-600"
                                        }`}
                                    ></span>
                                    {plan.hasAI ? "AI features included" : "No AI access"}
                                    </li>
                                </ul>

                                {/* Button */}
                                <Button
                                    type="button"
                                    disabled={!plan.isActive || isStartingPayment || isCurrentPlan}
                                    onClick={async () => {
                                        try {
                                            await handleChoosePlan(plan);
                                            setIsCheckoutOpen(true);
                                        } catch (err) {
                                            const message =
                                                err instanceof Error ? err.message : String(err);
                                            setPaymentResult({
                                                open: true,
                                                status: "failed",
                                                title: "Failed to start payment",
                                                message,
                                            });
                                        }
                                    }}
                                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition border ${
                                        isCurrentPlan
                                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none"
                                            : "bg-slate-800 text-slate-100 border-slate-600 hover:bg-slate-700"
                                    } ${!plan.isActive ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                    {isCurrentPlan
                                        ? "Current Plan"
                                        : isStartingPayment && selectedPlan?.id === plan.id
                                            ? "Starting..."
                                            : "Choose Plan"}
                                </Button>
                                </div>
                            );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm activation modal */}
            {confirmActivateSub && (
                <div className="fixed inset-0 z-[1150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl shadow-black/60 overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-slate-50 m-0">
                                Activate pending plan?
                            </h3>
                            <p className="mt-2 text-sm text-slate-300">
                                This will immediately expire your current active subscription
                                (if any) and replace it with{" "}
                                <span className="font-semibold text-emerald-300">
                                    {confirmActivateSub.planName}
                                </span>{" "}
                                scheduled from {formatDate(confirmActivateSub.startAt)} to{" "}
                                {formatDate(confirmActivateSub.endsAt)}.
                            </p>
                        </div>
                        <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-800 bg-slate-950/80">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setConfirmActivateId(null)}
                                className="bg-slate-800/80 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:text-slate-100 hover:border-slate-500 py-2.5 px-5 rounded-xl text-sm font-semibold transition"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                disabled={subscriptionActionLoadingId === confirmActivateSub.id}
                                onClick={async () => {
                                    await activatePendingNow(confirmActivateSub.id);
                                    setConfirmActivateId(null);
                                }}
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none py-2.5 px-6 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30 hover:opacity-95 disabled:opacity-60 disabled:shadow-none transition"
                            >
                                {subscriptionActionLoadingId === confirmActivateSub.id
                                    ? "Activating..."
                                    : "Yes, activate now"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isCheckoutOpen && clientSecret && (
  <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CompanyPaymentCheckout
        clientSecret={clientSecret}
        selectedPlan={selectedPlan}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={async (message) => {
          setPaymentResult({
            open: true,
            status: "success",
            title: "Payment successful",
            message,
          });
          await fetchProfile({ page: 1 }); // refresh active/pending/history
        }}
      />
    </Elements>
  </div>
)}

            {paymentResult.open && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="dv-pop bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl max-w-md w-full shadow-2xl shadow-black/50 border border-slate-600/80 overflow-hidden">
                        <div className="px-6 pt-7 pb-6 text-center">
                            <div
                                className={`mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center ${
                                    paymentResult.status === "success"
                                        ? "bg-emerald-500/15 border border-emerald-500/30"
                                        : "bg-red-500/10 border border-red-500/30"
                                }`}
                            >
                                {paymentResult.status === "success" ? (
                                    <svg width="34" height="34" viewBox="0 0 52 52" className="text-emerald-400" fill="none" aria-hidden>
                                        <path
                                            d="M14 27.5l8 8L38 19"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="dv-stroke"
                                        />
                                    </svg>
                                ) : (
                                    <svg width="34" height="34" viewBox="0 0 52 52" className="text-red-400" fill="none" aria-hidden>
                                        <path
                                            d="M16 16l20 20"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            className="dv-stroke"
                                        />
                                        <path
                                            d="M36 16L16 36"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            className="dv-stroke"
                                        />
                                    </svg>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-slate-50">{paymentResult.title}</h3>
                            {paymentResult.message && (
                                <p className="mt-2 text-slate-400 text-sm">{paymentResult.message}</p>
                            )}
                        </div>

                        <div className="px-6 pb-6 pt-2 flex gap-3 justify-center border-t border-slate-700/80">
                            {paymentResult.status === "failed" && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setPaymentResult((p) => ({ ...p, open: false }));
                                        setIsCheckoutOpen(true);
                                    }}
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none py-2.5 px-6 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30 hover:opacity-95 transition"
                                >
                                    Try again
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    const shouldRefresh = paymentResult.status === "success";
                                    setPaymentResult((p) => ({ ...p, open: false }));
                                    if (shouldRefresh) {
                                        void (async () => {
                                            await fetchProfile({ page: 1, limit: 2 });
                                        })();
                                    }
                                }}
                                className="bg-slate-800/80 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:text-slate-100 hover:border-slate-500 py-2.5 px-6 rounded-xl text-sm font-semibold transition"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}  
        </div>
    );
};

export default CompanyProfilePage;
