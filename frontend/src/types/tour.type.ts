export interface Tour {
  id: number;
  name: string;
  destination: string;
  description: string;
  start_date: string;
  end_date: string;
  price: number;
  capacity: number;
  available_seats: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
}

export interface TourCreate {
  name: string;
  destination: string;
  description: string;
  start_date: string;
  end_date: string;
  price: number;
  capacity: number;
  is_active?: boolean;
  image_url?: string;
}

export interface TourUpdate extends Partial<TourCreate> {
  id: number;
}

export interface TourFilters {
  min_price?: number;
  max_price?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ToursResponse {
  tours: Tour[];
  total: number;
  page: number;
  total_pages: number;
  limit: number;
}
