import { api } from "./index";

export interface DashboardStats {
  active_tours: number;
  total_bookings: number;
  today_bookings: number;
  popular_destinations: { destination: string; count: number }[];
  monthly_revenue: number;
  total_revenue: number;
}

export const dashboardApi = {
  getStats: async (token: string): Promise<DashboardStats> => {
    return await api.get<DashboardStats>("/dashboard/stats", {
      params: { token },
    });
  },
};
