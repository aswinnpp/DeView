import { Input, Button } from '../../components/common';
import { useCompanyApprovalForm } from '../../hooks/company';

const formInputClass = "w-full py-3 px-4 bg-[rgba(15,23,42,0.8)] border border-[rgba(71,85,105,0.5)] rounded-[10px] text-[#e2e8f0] text-sm transition-all duration-200 box-border focus:outline-none focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] placeholder:text-[#64748b]";
const formLabelClass = "block mb-2 text-[13px] font-semibold text-[#cbd5e1]";

const CompanyApprovalFormPage = () => {
    const {
        loading,
        error,
        form,
        docs,
        documentTypes,
        submit,
    } = useCompanyApprovalForm();

    const { register, formState: { errors } } = form;
    const { remove, getDocumentCount, getRequiredDocCount, getUploadedDoc, isDocUploading, handleFileUpload } = docs;

    return (
        <div className="min-h-screen bg-linear-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-[#e2e8f0]">
            <header className="bg-[rgba(15,23,42,0.8)] backdrop-blur-[12px] border-b border-[rgba(99,102,241,0.2)] py-5 px-10 sticky top-0 z-[100] max-md:py-4 max-md:px-5">
                <div className="max-w-[900px] mx-auto flex justify-between items-center max-md:flex-col max-md:gap-4 max-md:items-start">
                    <div className="flex items-center gap-3">
                        <div className="text-base font-extrabold text-white bg-linear-to-br from-[#6366f1] to-[#8b5cf6] py-3 px-3.5 rounded-xl tracking-wider">CO</div>
                        <h1 className="m-0 text-2xl font-bold bg-linear-to-br from-[#f8fafc] to-[#cbd5e1] bg-clip-text text-transparent">Company Onboarding</h1>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 max-md:w-full max-md:items-stretch">
                        <span className="text-xs text-[#94a3b8] font-semibold">Documents: {getDocumentCount()}/{documentTypes.length}</span>
                        <div className="w-[120px] h-1.5 bg-[rgba(100,116,139,0.3)] rounded-sm overflow-hidden max-md:w-full">
                            <div
                                className="h-full bg-linear-to-r from-[#6366f1] to-[#10b981] rounded-sm transition-all duration-300"
                                style={{ width: `${(getDocumentCount() / documentTypes.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="py-10 px-10 max-w-[900px] mx-auto max-md:py-5 max-md:px-5">
                <div className="bg-[rgba(30,41,59,0.6)] backdrop-blur-[12px] border border-[rgba(99,102,241,0.15)] rounded-[20px] p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-md:p-6">
                    <div className="mb-8 text-center">
                        <h2 className="m-0 mb-3 text-[28px] font-bold text-white">Company Verification</h2>
                        <p className="m-0 text-[#94a3b8] text-[15px] leading-relaxed">Please provide your company details and upload required documents for verification.
                            Our team will review your application within 2-3 business days.</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2.5 bg-[rgba(220,38,38,0.15)] border border-[rgba(220,38,38,0.3)] text-[#fca5a5] py-3.5 px-[18px] rounded-[10px] mb-6 text-sm">
                            <span className="text-lg">!</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-8">
                        {/* Company Information Section */}
                        <section className="bg-[rgba(15,23,42,0.5)] border border-[rgba(71,85,105,0.3)] rounded-2xl p-6">
                            <h3 className="flex items-center gap-2.5 m-0 mb-5 text-lg font-bold text-[#f1f5f9]">
                                <span className="flex items-center justify-center w-7 h-7 bg-linear-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg text-sm font-bold text-white">1</span>
                                Company Information
                            </h3>

                            <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                                <Input
                                    type="text"
                                    label="Company Name"
                                    className={formInputClass}
                                    labelClassName={formLabelClass}
                                    error={errors.companyName?.message}
                                    wrapperClassName="col-span-full flex flex-col gap-1.5"
                                    {...register('companyName')}
                                />

                                <Input
                                    type="text"
                                    label="Registered Address"
                                    className={formInputClass}
                                    labelClassName={formLabelClass}
                                    error={errors.address?.message}
                                    wrapperClassName="col-span-full flex flex-col gap-1.5"
                                    {...register('address')}
                                />

                                <Input
                                    type="text"
                                    label="GST Number / Tax ID *"
                                    className={formInputClass}
                                    labelClassName={formLabelClass}
                                    placeholder="e.g., 29ABCDE1234F1Z5"
                                    error={errors.taxId?.message}
                                    wrapperClassName="flex flex-col gap-1.5"
                                    {...register('taxId')}
                                />

                                <div className="flex flex-col gap-1.5">
                                    <label className="block mb-2 text-[13px] font-semibold text-[#cbd5e1]">Number of Employees *</label>
                                    <select
                                        className="w-full py-3 px-4 bg-[rgba(15,23,42,0.8)] border border-[rgba(71,85,105,0.5)] rounded-[10px] text-[#e2e8f0] text-sm transition-all duration-200 box-border cursor-pointer focus:outline-none focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] [&_option]:bg-[#1e293b] [&_option]:text-[#e2e8f0]"
                                        {...register('numberOfEmployees')}
                                    >
                                        <option value="1-10">1-10 Employees</option>
                                        <option value="10-50">10-50 Employees</option>
                                        <option value="50-100">50-100 Employees</option>
                                        <option value="100-500">100-500 Employees</option>
                                        <option value="500+">500+ Employees</option>
                                    </select>
                                    {errors.numberOfEmployees && (
                                        <span className="text-[#f87171] text-sm">{errors.numberOfEmployees.message}</span>
                                    )}
                                </div>

                                <Input
                                    type="url"
                                    label="Company Website"
                                    className={formInputClass}
                                    labelClassName={formLabelClass}
                                    placeholder="https://www.yourcompany.com"
                                    error={errors.website?.message}
                                    wrapperClassName="col-span-full flex flex-col gap-1.5"
                                    {...register('website')}
                                />
                            </div>
                        </section>

                        {/* Contact Information Section */}
                        <section className="bg-[rgba(15,23,42,0.5)] border border-[rgba(71,85,105,0.3)] rounded-2xl p-6">
                            <h3 className="flex items-center gap-2.5 m-0 mb-5 text-lg font-bold text-[#f1f5f9]">
                                <span className="flex items-center justify-center w-7 h-7 bg-linear-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg text-sm font-bold text-white">2</span>
                                Contact Information
                            </h3>

                            <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                                <Input
                                    type="text"
                                    label="Authorized Contact Person *"
                                    className={formInputClass}
                                    labelClassName={formLabelClass}
                                    placeholder="Full Name"
                                    error={errors.contactPerson?.message}
                                    wrapperClassName="flex flex-col gap-1.5"
                                    {...register('contactPerson')}
                                />

                                <Input
                                    type="email"
                                    label="Business Email *"
                                    className={formInputClass}
                                    labelClassName={formLabelClass}
                                    placeholder="contact@company.com"
                                    error={errors.contactEmail?.message}
                                    wrapperClassName="flex flex-col gap-1.5"
                                    {...register('contactEmail')}
                                />

                                <Input
                                    type="tel"
                                    label="Contact Phone *"
                                    className={formInputClass}
                                    labelClassName={formLabelClass}
                                    placeholder="+91-9876543210"
                                    error={errors.contactPhone?.message}
                                    wrapperClassName="flex flex-col gap-1.5"
                                    {...register('contactPhone')}
                                />
                            </div>
                        </section>

                        {/* Documents Section */}
                        <section className="bg-[rgba(15,23,42,0.3)] border border-[rgba(71,85,105,0.3)] rounded-2xl p-6">
                            <h3 className="flex items-center gap-2.5 m-0 mb-5 text-lg font-bold text-[#f1f5f9]">
                                <span className="flex items-center justify-center w-7 h-7 bg-linear-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg text-sm font-bold text-white">3</span>
                                Verification Documents
                                <span className="ml-auto bg-[rgba(99,102,241,0.2)] text-[#a5b4fc] py-1 px-2.5 rounded-xl text-[11px] font-semibold">{getRequiredDocCount()} Required</span>
                            </h3>
                            <p className="-mt-3 mb-5 text-[#64748b] text-[13px]">
                                Upload clear, legible copies of the following documents. Accepted formats: PDF, JPG, PNG (Max 5MB each)
                            </p>
                            {errors.documents && (
                                <p className="text-[#f87171] text-sm mb-4">{errors.documents.message}</p>
                            )}

                            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                {documentTypes.map((docType: { key: string; label: string; description: string; required: boolean }, index: number) => {
                                    const uploadedDoc = getUploadedDoc(docType.key);
                                    const isUploading = isDocUploading(docType.key);

                                    return (
                                        <div
                                            key={docType.key}
                                            className={`rounded-[14px] p-[18px] transition-all duration-200 border ${uploadedDoc
                                                ? 'border-[rgba(16,185,129,0.5)] bg-[rgba(16,185,129,0.05)]'
                                                : 'border-[rgba(71,85,105,0.3)] bg-[rgba(30,41,59,0.5)]'
                                                } hover:border-[rgba(99,102,241,0.4)] hover:-translate-y-0.5`}
                                        >
                                            <div className="flex gap-3 mb-3.5">
                                                <span className="flex items-center justify-center w-8 h-8 bg-linear-to-br from-[#334155] to-[#475569] rounded-[10px] text-sm font-bold text-[#e2e8f0] shrink-0">{index + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="m-0 mb-1 text-sm font-semibold text-[#f1f5f9] flex items-center gap-1">
                                                        {docType.label}
                                                        {docType.required && <span className="text-[#f87171] text-sm">*</span>}
                                                    </h4>
                                                    <p className="m-0 text-xs text-[#64748b] leading-snug">{docType.description}</p>
                                                </div>
                                            </div>

                                            <div className="min-h-[50px]">
                                                {isUploading ? (
                                                    <div className="flex items-center justify-center gap-2.5 py-3.5 bg-[rgba(99,102,241,0.1)] rounded-[10px] text-[#a5b4fc] text-[13px]">
                                                        <div className="w-[18px] h-[18px] border-2 border-[rgba(99,102,241,0.3)] border-t-[#6366f1] rounded-full animate-spin" />
                                                        <span>Uploading...</span>
                                                    </div>
                                                ) : uploadedDoc ? (
                                                    <div className="flex items-center justify-between py-3 px-3.5 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] rounded-[10px]">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="text-[#10b981] text-base font-bold">✓</span>
                                                            <span className="text-[13px] font-medium text-[#6ee7b7] whitespace-nowrap overflow-hidden text-ellipsis">{uploadedDoc.fileName}</span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="danger"
                                                            className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold p-0 min-w-0"
                                                            onClick={() => remove(docType.key)}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <label className="block cursor-pointer">
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => handleFileUpload(docType.key, e)}
                                                            className="hidden"
                                                        />
                                                        <div className="flex items-center justify-center gap-2 py-3.5 bg-[rgba(99,102,241,0.1)] border-2 border-dashed border-[rgba(99,102,241,0.3)] rounded-[10px] transition-all duration-200 hover:bg-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.5)]">
                                                            <span className="text-lg font-bold text-[#a5b4fc]">↑</span>
                                                            <span className="text-[13px] font-semibold text-[#a5b4fc]">Click to upload</span>
                                                        </div>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Submit Section */}
                        <div className="pt-4">
                            <div className="flex items-start gap-3 bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] rounded-xl p-4 mb-6">
                                <span className="flex items-center justify-center w-6 h-6 bg-[rgba(59,130,246,0.2)] rounded-full text-sm font-bold text-[#60a5fa] shrink-0">i</span>
                                <p className="m-0 text-[13px] text-[#94a3b8] leading-relaxed">By submitting this form, you confirm that all information provided is accurate and the documents are authentic.
                                    False information may lead to rejection and legal action.</p>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-4 px-8 text-base font-bold rounded-xl flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="w-[18px] h-[18px] border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                                        Submitting Application...
                                    </>
                                ) : (
                                    'Submit for Verification'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CompanyApprovalFormPage;
