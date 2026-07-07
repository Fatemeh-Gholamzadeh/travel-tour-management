import { api } from "./index";
import type {
  UserLogin,
  UserCreate,
  AuthResponse,
  User,
} from "../types/user.type";

export const authApi = {
  login: async (credentials: UserLogin): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    if (response.access_token) {
      api.setToken(response.access_token);
    }
    return response;
  },

  register: async (userData: UserCreate): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    if (response.access_token) {
      api.setToken(response.access_token);
    }
    return response;
  },

  logout: (): void => {
    api.removeToken();
    window.location.href = "/login";
  },

  getCurrentUser: async (): Promise<User> => {
    const token = api.getToken();
    if (!token) throw new Error("No token");
    return await api.get<User>("/auth/me", { params: { token } });
  },
};
