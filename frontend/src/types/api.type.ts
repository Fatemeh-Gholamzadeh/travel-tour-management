export interface ApiResponse<T = Record<string, unknown>> {
  data: T;
  message?: string;
  status: "success" | "error";
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}
