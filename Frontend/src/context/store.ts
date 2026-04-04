import { configureStore, type Middleware } from "@reduxjs/toolkit";
import authReducer, { logout } from "./authSlice";
import { clearAuthTokens } from "../utils/authTokens";

const clearTokensOnLogout: Middleware = () => (next) => (action) => {
  if (logout.match(action)) {
    clearAuthTokens();
  }
  return next(action);
};

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(clearTokensOnLogout),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

