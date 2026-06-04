import { useState, useCallback, useEffect } from "react";
import { api, extractApiError } from "../../api/axios";
import { useLogout } from "../auth/useLogout";

export interface ICompanyProfileData {
    id?: string;
    userId: string;
    companyName: string;
    logoUrl?: string;
    industry?: string;
    location?: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    taxId: string;
    website?: string;
    numberOfEmployees: string;
    founded?: string;
    description?: string;
    activeSubscription?: ICompanySubscriptionView | null;
    subscriptions?: {
        items: ICompanySubscriptionView[];
        total: number;
        page: number;
        limit: number;
        pendingTotal: number;
        historyTotal: number;
    };
}

export interface ICompanySubscriptionView {
    id: string;
    planId: string;
    planName: string;
    price: number;
    duration: 'Monthly' | 'Quarterly' | 'Annual';
    startAt: string;
    endsAt: string;
    status: 'Active' | 'Pending' | 'Expired';
}


export function useCompanyProfile() {
    const { logout: handleLogout } = useLogout();

    const [companyData, setCompanyData] = useState<ICompanyProfileData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<ICompanyProfileData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch company profile
    const fetchProfile = useCallback(async (opts?: { page?: number; limit?: number; silent?: boolean }) => {
        try {
            if (!opts?.silent) {
                setIsLoading(true);
            }
            setError(null);
            const response = await api.get<{ data: ICompanyProfileData }>('/company/profile', {
                params: {
                    page: opts?.page ?? 1,
                    limit: opts?.limit ?? 4,
                },
            });
            if (response.data?.data) {
                setCompanyData(response.data.data);
                setFormData(response.data.data);
            }
        } catch (err) {
            setError(extractApiError(err));
        } finally {
            if (!opts?.silent) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        void fetchProfile();
    }, [fetchProfile]);


    const updateProfile = useCallback(async (data: Partial<ICompanyProfileData>) => {
        try {
            setIsSaving(true);

            // Only send fields that the backend schema accepts
            const payload = {
                companyName: data.companyName,
                location: data.location,
                address: data.address,
                contactPerson: data.contactPerson,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                taxId: data.taxId,
                website: data.website,
                numberOfEmployees: data.numberOfEmployees,
                logoUrl: data.logoUrl,
            };

            await api.put('/company/profile', payload);
            await fetchProfile();
            setIsEditing(false);
        } catch (err) {
            throw extractApiError(err);
        } finally {
            setIsSaving(false);
        }
    }, [fetchProfile]);

console.log(companyData);


    return {
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
    };
}
