import { api } from "./index";
import type {
  Tour,
  TourCreate,
  TourUpdate,
  TourFilters,
  ToursResponse,
} from "../types/tour.type";

export const toursApi = {
  getAll: async (filters?: TourFilters): Promise<ToursResponse> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const url = `/tours/?${params.toString()}`;
    console.log("🔍 Fetching tours with URL:", url);

    try {
      const response = await api.get<ToursResponse>(url);
      return response;
    } catch (error) {
      console.error("❌ Error fetching tours:", error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Tour> => {
    return await api.get<Tour>(`/tours/${id}`);
  },

  create: async (data: TourCreate): Promise<Tour> => {
    return await api.post<Tour>("/tours/", data);
  },

  update: async (id: number, data: Omit<TourUpdate, "id">): Promise<Tour> => {
    return await api.put<Tour>(`/tours/${id}`, data);
  },

  patch: async (
    id: number,
    data: Partial<Omit<TourUpdate, "id">>,
  ): Promise<Tour> => {
    return await api.patch<Tour>(`/tours/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tours/${id}`);
  },

  toggleStatus: async (id: number, isActive: boolean): Promise<Tour> => {
    return await api.patch<Tour>(`/tours/${id}/status`, {
      is_active: isActive,
    });
  },
};
