import { useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminApprovalService } from "../../services/adminApproval.service";
import { extractApiError } from "../../api/axios";
import {
    rejectCompanyRequestBodySchema,
    type RejectCompanyRequestBody,
} from "@shared/contracts/companyApproval/admin";

export function useRejectCompanyModal(
    companyId: string,
    onSuccess: () => void
) {
    const rejectForm = useForm<RejectCompanyRequestBody>({
        resolver: zodResolver(rejectCompanyRequestBodySchema),
        defaultValues: {
            reason: "",
        },
    });

    const onSubmit: SubmitHandler<RejectCompanyRequestBody> = useCallback(
        async (values) => {
            try {
                await adminApprovalService.reject(companyId, values);

                rejectForm.reset({ reason: "" });

                // Notify parent only after API success
                onSuccess();
            } catch (err) {
                console.error("Reject failed:", extractApiError(err));
            }
        },
        [companyId, onSuccess, rejectForm]
    );

    return {
        rejectForm,
        onSubmit,
    };
}
