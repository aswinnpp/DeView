import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api, extractApiError } from "../../api/axios";
import { logout } from "../../context/authSlice";
import type { AppDispatch } from "../../context/store";
import { authService } from "../../services/auth.service";
import { companySubscriptionService } from "../../services/companySubscription.service";
import type { SubscriptionPlan } from "../../services/adminSubscription.service";
import { APP_ROUTES } from "../../constants/routes";

export interface ICompanyProfileData {
    id?: string;
    userId: string;
    companyName: string;
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
    subscription: string;
}


export function useCompanyProfile() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    
    const [companyData, setCompanyData] = useState<ICompanyProfileData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [subscription, setSubscription] = useState<SubscriptionPlan[]>([]);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [formData, setFormData] = useState<Partial<ICompanyProfileData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch company profile
    const fetchProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get<{ data: ICompanyProfileData }>('/company/profile');
            if (response.data?.data) {
                setCompanyData(response.data.data);
                setFormData(response.data.data);
            }
        } catch (err) {
            setError(extractApiError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);


    // Update profile
    const updateProfile = useCallback(async (data: Partial<ICompanyProfileData>) => {
        try {
            setIsSaving(true);
            await api.put('/company/profile', { data });
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

    const fetchSubscribtion = useCallback(async () => {
        try {
            const { data } = await companySubscriptionService.listActive();
            setSubscription(data.data);
        } catch (err) {
            setError(extractApiError(err));
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        fetchSubscribtion();
    }, [fetchSubscribtion]);

   

   
  
    return {
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
    };
}
