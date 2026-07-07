import { User, UserUpdate } from "@/types/user.type";
import { api } from "./index";

export const userApi = {
  getProfile: async (token: string): Promise<User> => {
    return await api.get<User>("/users/me", { params: { token } });
  },

  updateProfile: async (token: string, data: UserUpdate): Promise<User> => {
    return await api.put<User>("/users/me", data, { params: { token } });
  },

  getAllUsers: async (token: string): Promise<User[]> => {
    return await api.get<User[]>("/users/", { params: { token } });
  },

  changeUserRole: async (
    token: string,
    userId: number,
    isAdmin: boolean,
  ): Promise<User> => {
    return await api.patch<User>(`/users/${userId}/role`, null, {
      params: { token, is_admin: isAdmin },
    });
  },

  deleteUser: async (token: string, userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`, { params: { token } });
  },
};
