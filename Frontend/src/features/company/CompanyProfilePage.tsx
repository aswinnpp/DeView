import { useState } from "react";
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { useCompanyProfile } from "../../hooks/company";
import { Button, Input } from "../../components/common";
import type { SubscriptionPlan } from "../../services/adminSubscription.service";
import { companySubscriptionService } from "../../services/companySubscription.service";

const CompanyProfilePage = () => {
    const {
        companyData,
        formData,
        setFormData,
        isEditing,
        setIsEditing,
        showSubscriptionModal,
        setShowSubscriptionModal,
        subscription,
        isLoading,
        error,
        isSaving,
        updateProfile,
        handleLogout,
        fetchProfile,
    } = useCompanyProfile();

    const stripe = useStripe();
    const elements = useElements();

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isStartingPayment, setIsStartingPayment] = useState(false);
    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [postalCode, setPostalCode] = useState("");
    const [paymentResult, setPaymentResult] = useState<{
        open: boolean;
        status: "success" | "failed";
        title: string;
        message?: string;
    }>({ open: false, status: "success", title: "" });

    const stripeElementStyle = {
        base: {
            fontSize: "16px",
            color: "#f1f5f9",
            fontWeight: "500" as const,
            fontFamily: "system-ui, -apple-system, sans-serif",
            "::placeholder": { color: "#94a3b8" },
            ":-webkit-autofill": { color: "#f1f5f9" },
        },
        invalid: {
            color: "#f87171",
            iconColor: "#f87171",
        },
    };


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

    const handleChoosePlan = async (plan: SubscriptionPlan) => {
        try {
            setIsStartingPayment(true);
            setSelectedPlan(plan);
            setPaymentError(null);

            const response = await companySubscriptionService.createPaymentIntent(plan.id);
            const secret = response.data.clientSecret;

            setClientSecret(secret);
            setPostalCode("");
            setIsCheckoutOpen(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to start payment";
            setPaymentError(message);
        } finally {
            setIsStartingPayment(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!stripe || !elements || !clientSecret) return;

        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) return;

        setIsConfirmingPayment(true);
        setPaymentError(null);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardNumberElement,
                billing_details: {
                    address: { postal_code: postalCode.trim() || undefined },
                },
            },
        });

        if (error) {
            const message = error.message || "Payment failed";
            setPaymentError(message);
            setIsConfirmingPayment(false);
            setIsCheckoutOpen(false);
            setPaymentResult({
                open: true,
                status: "failed",
                title: "Payment failed",
                message,
            });
            return;
        }

        if (paymentIntent?.status === "succeeded") {
            setIsCheckoutOpen(false);
            setPaymentResult({
                open: true,
                status: "success",
                title: "Payment successful",
                message: "Your plan will be activated shortly.",
            });

            window.setTimeout(() => {
                fetchProfile().catch(() => {});
            }, 1500);

            window.setTimeout(() => {
                setPaymentResult((prev) => ({ ...prev, open: false }));
            }, 2500);
        } else {
            const status = paymentIntent?.status ? `Status: ${paymentIntent.status}` : "Payment not completed";
            setIsCheckoutOpen(false);
            setPaymentResult({
                open: true,
                status: "failed",
                title: "Payment not completed",
                message: status,
            });
        }

        setIsConfirmingPayment(false);
    };

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

    return (
        <div className="text-slate-200 font-['Inter',sans-serif] pb-[60px] max-md:pb-12 p-0">
            {/* Header */}
            <header className="mb-6 max-md:mb-4">
                <div className="flex flex-wrap justify-between items-end gap-4 max-md:flex-col max-md:items-start">
                    <div className="min-w-0 flex-1">
                        <h2 className="m-0 text-[32px] max-md:text-[24px] font-bold text-slate-50">Company Profile</h2>
                        <p className="mt-2 mb-0 text-slate-400 text-sm max-md:text-xs">
                            Manage your company information and settings
                        </p>
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
                                <div className="flex gap-2 items-center">
                                    <span className="py-1 px-3 rounded-md text-[13px] font-semibold bg-blue-500/20 inline-block" style={{ }}>
                                       
                                    </span>
                                    <Button
                                        onClick={() => setShowSubscriptionModal(true)}
                                        className="py-1 px-3 rounded-md text-xs font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white border-none transition-all duration-200 hover:-translate-y-0.5"
                                    >
                                        Upgrade
                                    </Button>
                                </div>
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
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                required
                                className={inputClassName}
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

                            <div className="col-span-2 max-md:col-span-1">
                                <Input
                                    label="Address"
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    className={inputClassName}
                                    labelClassName={labelClassName}
                                    wrapperClassName={wrapperClassName}
                                />
                            </div>

                            <Input
                                label="Tax ID"
                                type="text"
                                value={formData.taxId || ''}
                                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                required
                                className={inputClassName}
                                labelClassName={labelClassName}
                                wrapperClassName={wrapperClassName}
                            />

                            <div>
                                <label className={labelClassName}>Number of Employees</label>
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

                        {/* Industry */}
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase">
                                Industry
                            </label>
                            <div className="text-slate-200 text-[15px]">{companyData.industry || 'Not specified'}</div>
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
                            const isPopular = index === 1; // example highlight middle plan

                            return (
                                <div
                                key={plan.id || index}
                                className={`relative rounded-2xl border p-7 max-md:p-6 min-h-[260px] ${
                                    isPopular
                                    ? "border-indigo-500 bg-slate-900/80 shadow-[0_0_0_1px_rgba(129,140,248,0.5)]"
                                    : "border-slate-700 bg-slate-900/70"
                                }`}
                                >
                                {/* Popular Badge */}
                                {isPopular && (
                                    <span className="absolute top-4 right-4 bg-indigo-500 text-white text-[11px] px-3 py-1 rounded-full tracking-wide uppercase">
                                    Most Popular
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
                                    disabled={!plan.isActive || isStartingPayment}
                                    onClick={() => handleChoosePlan(plan)}
                                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition border ${
                                        isPopular
                                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none hover:opacity-90"
                                            : "bg-slate-800 text-slate-100 border-slate-600 hover:bg-slate-700"
                                    } ${!plan.isActive ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                    {isStartingPayment && selectedPlan?.id === plan.id ? "Starting..." : "Choose Plan"}
                                </Button>
                                </div>
                            );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {isCheckoutOpen && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl max-w-md w-full shadow-2xl shadow-black/50 border border-slate-600/80 overflow-hidden">
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-slate-700/80">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-50">
                                        Complete payment
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-0.5">
                                        Enter your card details below
                                    </p>
                                </div>
                            </div>
                            {selectedPlan && (
                                <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-800/60 px-4 py-3 border border-slate-700/60">
                                    <span className="text-slate-300 text-sm font-medium">{selectedPlan.name}</span>
                                    <span className="text-emerald-400 font-bold">₹{selectedPlan.price}</span>
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            {paymentError && (
                                <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-300 text-sm">
                                    <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>{paymentError}</span>
                                </div>
                            )}
                            <label className="block text-slate-400 text-[13px] font-semibold uppercase tracking-wide mb-2">
                                Card number
                            </label>
                            <div className="rounded-xl border border-slate-600 bg-slate-800/50 p-3 mb-4 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                                <CardNumberElement options={{ style: stripeElementStyle }} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-slate-400 text-[13px] font-semibold uppercase tracking-wide mb-2">
                                        Expiry
                                    </label>
                                    <div className="rounded-xl border border-slate-600 bg-slate-800/50 p-3 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                                        <CardExpiryElement options={{ style: stripeElementStyle }} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[13px] font-semibold uppercase tracking-wide mb-2">
                                        CVC
                                    </label>
                                    <div className="rounded-xl border border-slate-600 bg-slate-800/50 p-3 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                                        <CardCvcElement options={{ style: stripeElementStyle }} />
                                    </div>
                                </div>
                            </div>

                            <label className="block text-slate-400 text-[13px] font-semibold uppercase tracking-wide mb-2">
                                ZIP / Postal code
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 400001"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all mb-4"
                            />
                            <p className="mt-3 text-slate-500 text-xs flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Your card details are secured by Stripe and never stored on our servers.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6 pt-2 flex gap-3 justify-end border-t border-slate-700/80">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsCheckoutOpen(false)}
                                className="bg-slate-800/80 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:text-slate-100 hover:border-slate-500 py-2.5 px-5 rounded-xl text-sm font-semibold transition"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmPayment}
                                disabled={!stripe || !elements || isConfirmingPayment}
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none py-2.5 px-6 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30 hover:opacity-95 disabled:opacity-50 disabled:shadow-none transition"
                            >
                                {isConfirmingPayment ? "Processing…" : "Pay now"}
                            </Button>
                        </div>
                    </div>
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
                                        setPaymentError(null);
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
                                onClick={() => setPaymentResult((p) => ({ ...p, open: false }))}
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
