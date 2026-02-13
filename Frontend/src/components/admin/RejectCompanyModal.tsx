import { useRejectCompanyModal } from "../../hooks/admin";
import { Button } from "../common";

type RejectCompanyModalProps = {
    companyId: string;
    companyName: string;
    onClose: () => void;
    onSuccess: () => void;
};

const RejectCompanyModal = ({
    companyId,
    companyName,
    onClose,
    onSuccess,
}: RejectCompanyModalProps) => {
    const { rejectForm, onSubmit } = useRejectCompanyModal(companyId, onSuccess);

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.85)] backdrop-blur-[8px] flex items-center justify-center z-[1100] p-5">
            <div className="bg-linear-to-b from-[#1e293b] to-[#0f172a] rounded-2xl p-8 max-w-[500px] w-full border border-[rgba(239,68,68,0.2)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(239,68,68,0.15)] flex items-center justify-center text-base font-bold text-[#f87171]">
                        !
                    </div>
                    <div>
                        <h3 className="m-0 text-xl text-[#f1f5f9]">Reject Application</h3>
                        <p className="mt-1 mb-0 text-[#94a3b8] text-[13px]">
                            {companyName}
                        </p>
                    </div>
                </div>

                <form onSubmit={rejectForm.handleSubmit(onSubmit)}>
                    <p className="m-0 mb-4 text-[#94a3b8] text-sm leading-relaxed">
                        Please provide a detailed reason for rejection. This will be sent to the company for their reference.
                    </p>

                    <textarea
                        {...rejectForm.register("reason")}
                        placeholder="e.g., Documents are unclear, Tax ID doesn't match company name, Missing required documents..."
                        rows={4}
                        className="w-full bg-[rgba(15,23,42,0.8)] border border-[rgba(71,85,105,0.5)] rounded-[10px] p-3.5 text-[#e2e8f0] text-sm box-border font-[inherit] resize-y mb-2 focus:outline-none focus:border-[#6366f1]"
                    />
                    {rejectForm.formState.errors.reason && (
                        <p className="m-0 mb-4 text-[#f87171] text-sm">{rejectForm.formState.errors.reason.message}</p>
                    )}

                    <div className="flex gap-3 justify-end mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="py-3 px-6 rounded-[10px] font-semibold text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            disabled={rejectForm.formState.isSubmitting}
                            className="py-3 px-6 rounded-[10px] font-semibold text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Confirm Rejection
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectCompanyModal;
