import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  companyId?: string;
}

interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Helper to get initial user from localStorage
const getStoredUser = (): IUser | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch {
    console.error("Failed to parse stored user");
  }
  return null;
};

// Helper to check if token exists
const hasToken = (): boolean => {
  return !!(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));
};

// Initialize state from localStorage
const storedUser = getStoredUser();
const initialState: IAuthState = {
  user: storedUser,
  isAuthenticated: storedUser !== null && hasToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set user (used after login/register)
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      // Persist to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    // Update user partially (e.g., profile updates)
    updateUser: (state, action: PayloadAction<Partial<IUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Logout - clear everything
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      // Clear from storage
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      sessionStorage.removeItem("accessToken");
    },

    // Hydrate from storage (useful for app initialization)
    hydrateFromStorage: (state) => {
      const user = getStoredUser();
      const authenticated = user !== null && hasToken();
      state.user = user;
      state.isAuthenticated = authenticated;
    },

    // Legacy actions (keeping for backward compatibility)
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<IUser>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<IUser>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  updateUser,
  setLoading,
  setError,
  logout,
  hydrateFromStorage,
  registerStart,
  registerSuccess,
  registerFailure,
  loginStart,
  loginSuccess,
  loginFailure,
} = authSlice.actions;

// Selectors for easy access
export const selectUser = (state: { auth: IAuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: IAuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: IAuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: IAuthState }) => state.auth.error;
export const selectUserRole = (state: { auth: IAuthState }) => state.auth.user?.role ?? null;

export default authSlice.reducer;
export type { IAuthState };
