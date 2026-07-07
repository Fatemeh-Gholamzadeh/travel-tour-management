export interface Booking {
  id: number;
  user_id: number;
  user_name: string;
  tour_id: number;
  tour_name: string;
  destination: string;
  booking_date: string;
  number_of_tickets: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  payment_status: "unpaid" | "paid" | "refunded";
  special_requests?: string;
}

export interface BookingCreate {
  tour_id: number;
  number_of_tickets: number;
  special_requests?: string;
}

export interface BookingUpdate {
  status?: "pending" | "confirmed" | "cancelled";
  payment_status?: "unpaid" | "paid" | "refunded";
}

export interface StatusUpdateResponse {
  message: string;
}
