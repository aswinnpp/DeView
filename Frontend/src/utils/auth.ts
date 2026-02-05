// ===========================================
// AUTH UTILITIES
// Simple helper functions for authentication
// ===========================================

// ===========================================
// TOKEN MANAGEMENT
// ===========================================

/**
 * Get the access token from storage
 */
export const getAuthToken = (): string | null => {
    // Check localStorage first
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        return accessToken;
    }

    // Check sessionStorage as fallback
    const sessionToken = sessionStorage.getItem('accessToken');
    return sessionToken;
};

/**
 * Save the access token to storage
 */
export const setAuthToken = (token: string): void => {
    localStorage.setItem('accessToken', token);
};

/**
 * Remove the access token from storage
 */
export const removeAuthToken = (): void => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
};

// ===========================================
// REFRESH TOKEN MANAGEMENT
// ===========================================

/**
 * Get the refresh token from storage
 */
export const getRefreshToken = (): string | null => {
    return localStorage.getItem('refreshToken');
};

/**
 * Save the refresh token to storage
 */
export const setRefreshToken = (token: string): void => {
    localStorage.setItem('refreshToken', token);
};

/**
 * Remove the refresh token from storage
 */
export const removeRefreshToken = (): void => {
    localStorage.removeItem('refreshToken');
};

// ===========================================
// USER DATA MANAGEMENT
// ===========================================

/**
 * Get user data from storage
 */
export const getUser = (): { id: string; fullName: string; email: string; role: string } | null => {
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch {
            return null;
        }
    }
    return null;
};

/**
 * Save user data to storage
 */
export const setUser = (user: { id: string; fullName: string; email: string; role: string }): void => {
    localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Remove user data from storage
 */
export const removeUser = (): void => {
    localStorage.removeItem('user');
};

// ===========================================
// AUTHENTICATION STATUS
// ===========================================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return getAuthToken() !== null;
};

/**
 * Get user role from token
 */
export const getUserRole = (): string | null => {
    const token = getAuthToken();
    if (!token) {
        return null;
    }

    // Decode JWT token to get role
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        return decoded.role || null;
    } catch {
        return null;
    }
};

// ===========================================
// LOGOUT
// ===========================================

/**
 * Clear all auth data (logout)
 */
export const clearAuth = (): void => {
    removeAuthToken();
    removeRefreshToken();
    removeUser();
    localStorage.removeItem('profileCompletion');
    sessionStorage.clear();
};

// ===========================================
// PROFILE COMPLETION
// ===========================================

/**
 * Get profile completion percentage from storage
 */
export const getProfileCompletion = (): number | null => {
    const value = localStorage.getItem('profileCompletion');
    if (value) {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
    }
    return null;
};

/**
 * Save profile completion percentage to storage
 */
export const setProfileCompletion = (percentage: number): void => {
    localStorage.setItem('profileCompletion', percentage.toString());
};

// ===========================================
// EXPORTS FOR CONVENIENCE
// ===========================================

export default {
    getAuthToken,
    setAuthToken,
    removeAuthToken,
    getRefreshToken,
    setRefreshToken,
    removeRefreshToken,
    getUser,
    setUser,
    removeUser,
    isAuthenticated,
    getUserRole,
    clearAuth,
    getProfileCompletion,
    setProfileCompletion,
};
