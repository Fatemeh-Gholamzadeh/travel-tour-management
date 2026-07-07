export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface UserUpdate {
  full_name?: string;
  phone?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
