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
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.85)] backdrop-blur-[8px] flex items-center justify-center z-[1100] p-4 max-md:p-2">
            <div className="bg-linear-to-b from-[#1e293b] to-[#0f172a] rounded-2xl max-md:rounded-xl p-8 max-md:p-5 max-w-[500px] w-full max-md:max-w-[calc(100vw-1rem)] border border-[rgba(239,68,68,0.2)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">

                <div className="flex items-center gap-3 max-md:gap-2 mb-5 max-md:mb-4">
                    <div className="w-12 h-12 max-md:w-10 max-md:h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-[#f87171] font-bold shrink-0">
                        !
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="m-0 text-xl max-md:text-lg text-slate-100">
                            Reject Application
                        </h3>
                        <p className="mt-1 mb-0 text-slate-400 text-sm max-md:text-xs truncate">
                            {companyName}
                        </p>
                    </div>
                </div>

                <form onSubmit={rejectForm.handleSubmit(onSubmit)}>

                    <p className="text-slate-400 text-sm max-md:text-xs mb-4 max-md:mb-3">
                        Please provide a detailed rejection reason.
                    </p>

                    <textarea
                        {...rejectForm.register("reason")}
                        rows={4}
                        placeholder="Explain rejection..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 max-md:p-2.5 text-white mb-2 max-md:text-sm resize-none"
                    />

                    {rejectForm.formState.errors.reason && (
                        <p className="text-red-400 text-sm max-md:text-xs mb-3">
                            {rejectForm.formState.errors.reason.message}
                        </p>
                    )}

                    <div className="flex flex-wrap justify-end gap-3 max-md:gap-2 mt-6 max-md:mt-4 max-md:flex-col">
                        <Button type="button" variant="secondary" onClick={onClose} className="max-md:w-full">
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="danger"
                            disabled={rejectForm.formState.isSubmitting}
                            className="max-md:w-full"
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
