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
                    <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center text-[#f87171] font-bold">
                        !
                    </div>

                    <div>
                        <h3 className="m-0 text-xl text-slate-100">
                            Reject Application
                        </h3>
                        <p className="mt-1 mb-0 text-slate-400 text-sm">
                            {companyName}
                        </p>
                    </div>
                </div>

                <form onSubmit={rejectForm.handleSubmit(onSubmit)}>

                    <p className="text-slate-400 text-sm mb-4">
                        Please provide a detailed rejection reason.
                    </p>

                    <textarea
                        {...rejectForm.register("reason")}
                        rows={4}
                        placeholder="Explain rejection..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white mb-2"
                    />

                    {rejectForm.formState.errors.reason && (
                        <p className="text-red-400 text-sm mb-3">
                            {rejectForm.formState.errors.reason.message}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="danger"
                            disabled={rejectForm.formState.isSubmitting}
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
