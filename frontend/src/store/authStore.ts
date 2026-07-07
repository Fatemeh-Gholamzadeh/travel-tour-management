import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/user.type";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (token: string, user: User) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      setUser: (user: User) =>
        set({
          user,
        }),

      setLoading: (loading: boolean) =>
        set({
          isLoading: loading,
        }),

      logout: () => {
        localStorage.removeItem("access_token");
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        window.location.href = "/login";
      },

      clearAuth: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
