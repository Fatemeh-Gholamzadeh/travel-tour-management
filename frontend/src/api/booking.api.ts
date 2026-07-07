import {
  Booking,
  BookingCreate,
  StatusUpdateResponse,
} from "@/types/booking.type";
import { api } from "./index";

export const bookingsApi = {
  create: async (data: BookingCreate): Promise<Booking> => {
    return await api.post<Booking>("/bookings/", data);
  },

  getMyBookings: async (): Promise<Booking[]> => {
    return await api.get<Booking[]>("/bookings/");
  },

  getAllBookings: async (): Promise<Booking[]> => {
    return await api.get<Booking[]>("/bookings/admin");
  },

  updateStatus: async (
    id: number,
    status: string,
    payment_status?: string,
  ): Promise<StatusUpdateResponse> => {
    return await api.patch<StatusUpdateResponse>(
      `/bookings/${id}/status`,
      null,
      {
        params: { status, payment_status },
      },
    );
  },
};

export type { Booking };
