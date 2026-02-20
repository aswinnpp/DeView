import { useCompanyProfile } from "../../hooks/company";
import { Button, Input } from "../../components/common";

const CompanyProfilePage = () => {
    const {
        companyData,
        formData,
        setFormData,
        isEditing,
        setIsEditing,
        showSubscriptionModal,
        setShowSubscriptionModal,
        subscriptionPlans,
        isLoading,
        error,
        isSaving,
        subscriptionLoading,
        updateProfile,
        handleLogout,
    } = useCompanyProfile();


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
        <div className="text-slate-200 font-['Inter',sans-serif] pb-[60px] p-0">
            {/* Header */}
            <header className="mb-6">
                <div className="flex justify-between items-end gap-4">
                    <div>
                        <h2 className="m-0 text-[32px] font-bold text-slate-50">Company Profile</h2>
                        <p className="mt-2 mb-0 text-slate-400 text-sm">
                            Manage your company information and settings
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {!isEditing && (
                            <>
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none py-3 px-6 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleLogout}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white border-none py-3 px-6 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5"
                                >
                                    Logout
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Profile Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8">
                {/* Company Header with Avatar */}
                <div className="flex items-start gap-6 mb-8">
                    {/* Avatar */}
                    <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-5xl font-bold text-white shrink-0 shadow-[0_8px_24px_rgba(99,102,241,0.3)]">
                        {companyData.companyName.charAt(0)}
                    </div>

                    {/* Company Info */}
                    <div className="flex-1">
                        <h3 className="m-0 mb-2 text-[28px] font-bold text-slate-50">
                            {companyData.companyName}
                        </h3>
                        <p className="m-0 mb-4 text-slate-400 text-sm">
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
                    <div className="grid grid-cols-2 gap-6">
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
                            <div className="col-span-2">
                                <label className="block text-xs text-slate-500 mb-2 font-semibold uppercase">
                                    Description
                                </label>
                                <div className="text-slate-200 text-[15px] leading-relaxed">{companyData.description}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSave}>
                        <div className="grid grid-cols-2 gap-5">
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

                            <div className="col-span-2">
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

                        <div className="flex gap-3 mt-6 justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleCancel}
                                className="bg-transparent text-slate-400 border border-slate-600 py-2.5 px-6 rounded-lg text-sm font-semibold hover:bg-white/5 hover:border-slate-500"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none py-2.5 px-6 rounded-lg text-sm font-semibold disabled:opacity-50"
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
                    className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-5"
                    onClick={() => setShowSubscriptionModal(false)}
                >
                    <div
                        className="bg-slate-900 rounded-2xl max-w-[1000px] w-full max-h-[90vh] overflow-auto border border-slate-700 p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="m-0 text-slate-50 text-[28px] font-bold">Choose Your Plan</h2>
                                <p className="mt-2 mb-0 text-slate-400 text-sm">
                                    Select the perfect plan for your hiring needs
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowSubscriptionModal(false)}
                                variant="secondary"
                                className="bg-none border-none text-slate-400 text-[32px] p-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-slate-800 hover:text-slate-50"
                            >
                                ×
                            </Button>
                        </div>

                        {/* Subscription Plans */}
                        <div className={`grid gap-6 ${subscriptionPlans.length === 3 ? 'grid-cols-3' : subscriptionPlans.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {subscriptionPlans.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-slate-500">
                                    No subscription plans available at the moment.
                                </div>
                            ) : (
                                subscriptionPlans
                                    .filter(plan => plan.status === 'Active')
                                    .map((plan, index) => {
                                        const isCurrentPlan = companyData?.subscription?.toLowerCase() === plan.name.toLowerCase();
                                        const isPopular = index === 1 && subscriptionPlans.length >= 3;

                                        return (
                                            <div
                                                key={plan.id}
                                                className={`${isPopular ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-indigo-500 shadow-[0_0_0_1px_#6366f1,0_10px_30px_rgba(99,102,241,0.15)]' : 'bg-slate-800 border border-slate-700'} rounded-xl p-6 flex flex-col relative`}
                                            >
                                                {isPopular && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-extrabold py-1 px-3 rounded-full tracking-wider">
                                                        POPULAR
                                                    </div>
                                                )}
                                                <h3 className="m-0 mb-2 text-[20px] font-bold text-slate-50">
                                                    {plan.name}
                                                </h3>
                                                <div className="mb-6">
                                                    <span className="text-[36px] font-extrabold text-slate-50">
                                                        {plan.price}
                                                    </span>
                                                    <span className="text-base text-slate-500">/{plan.duration.toLowerCase()}</span>
                                                </div>
                                                <div className="flex-1 flex flex-col gap-3 mb-6">
                                                    {plan.features.map((feature: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                                                            <span className="text-green-500">✓</span> {feature}
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button
                                                    
                                                    disabled={isCurrentPlan || subscriptionLoading}
                                                    className={`w-full py-3 rounded-lg font-semibold border-none text-white text-sm ${isCurrentPlan ? 'bg-slate-700 cursor-not-allowed' : isPopular ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_4px_12px_rgba(99,102,241,0.3)]' : 'bg-slate-600'} ${subscriptionLoading ? 'opacity-70' : ''}`}
                                                >
                                                    {subscriptionLoading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : `Select ${plan.name}`}
                                                </Button>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyProfilePage;
