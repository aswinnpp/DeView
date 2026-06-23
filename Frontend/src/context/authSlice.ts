import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { safeParseForKey, setStorageJson } from "../utils/safeStorage";

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  companyId?: string;
}

interface IAuthState {
  adminUser: IUser | null;
  normalUser: IUser | null;
  isAuthenticated: boolean;
}

const ADMIN_STORAGE_KEY = "adminUser";
const USER_STORAGE_KEY = "userUser";

const getStoredAdmin = (): IUser | null => {
  const userStr = localStorage.getItem(ADMIN_STORAGE_KEY);

  const parsedUser = safeParseForKey<IUser>(
    ADMIN_STORAGE_KEY,
    userStr
  );

  if (parsedUser && typeof parsedUser === "object") {
    return parsedUser;
  }

  return null;
};

const getStoredUser = (): IUser | null => {
  const userStr = localStorage.getItem(USER_STORAGE_KEY);

  const parsedUser = safeParseForKey<IUser>(
    USER_STORAGE_KEY,
    userStr
  );

  if (parsedUser && typeof parsedUser === "object") {
    return parsedUser;
  }

  return null;
};

const storedAdmin = getStoredAdmin();
const storedUser = getStoredUser();

const initialState: IAuthState = {
  adminUser: storedAdmin,
  normalUser: storedUser,
  isAuthenticated: !!storedAdmin || !!storedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAdminUser: (state, action: PayloadAction<IUser>) => {
      state.adminUser = action.payload;
      state.isAuthenticated = true;

      setStorageJson(
        ADMIN_STORAGE_KEY,
        action.payload
      );
    },

    setNormalUser: (state, action: PayloadAction<IUser>) => {
      state.normalUser = action.payload;
      state.isAuthenticated = true;

      setStorageJson(
        USER_STORAGE_KEY,
        action.payload
      );
    },

    logoutAdmin: (state) => {
      state.adminUser = null;

      localStorage.removeItem(
        ADMIN_STORAGE_KEY
      );

      state.isAuthenticated =
        state.normalUser !== null;
    },

    logoutUser: (state) => {
      state.normalUser = null;

      localStorage.removeItem(
        USER_STORAGE_KEY
      );

      state.isAuthenticated =
        state.adminUser !== null;
    },
  },
});

export const {
  setAdminUser,
  setNormalUser,
  logoutAdmin,
  logoutUser,
} = authSlice.actions;

export const selectAdminUser = (
  state: { auth: IAuthState }
) => state.auth.adminUser;

export const selectNormalUser = (
  state: { auth: IAuthState }
) => state.auth.normalUser;

export const selectIsAuthenticated = (
  state: { auth: IAuthState }
) => state.auth.isAuthenticated;

export default authSlice.reducer;

export type { IAuthState };