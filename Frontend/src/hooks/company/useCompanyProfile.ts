import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api, extractApiError } from "../../api/axios";
import { logout } from "../../context/authSlice";
import type { AppDispatch } from "../../context/store";
import { authService } from "../../services/auth.service";
import { APP_ROUTES } from "../../constants/routes";

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
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    
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



    const handleLogout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (err) {
            setError(extractApiError(err));
        } finally {
            dispatch(logout());
            navigate(APP_ROUTES.LOGIN, { replace: true });
        }
    }, [dispatch, navigate]);
    

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
