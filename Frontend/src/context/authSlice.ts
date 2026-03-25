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
}

const getStoredUser = (): IUser | null => {
  
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  
  return null;
};

const storedUser = getStoredUser();

const initialState: IAuthState = {
  user: storedUser,
  isAuthenticated: storedUser !== null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export const selectUser = (state: { auth: IAuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: IAuthState }) => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: IAuthState }) => state.auth.user?.role ?? null;

export default authSlice.reducer;
export type { IAuthState };
